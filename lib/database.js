const { spawn } = require('child_process');
const tmp = require('tmp-promise');

module.exports = {
    copySchema,
    cleanTempDb
};

/**
 * As we will be modifying data in transit to reduce duplicating sensitive data
 * we will need to restore the DB first and then the data following.
 * Here we setup a new empty DB from a source to a target (temp) DB
 * @param {string} sourceUri
 * @param {string} targetUri
 * @param {string} dbName
 */
function copySchema(sourceUri, targetUri, dbName) {
    return tmp.dir({
        unsafeCleanup: true
    }).then(
        dir => dumpSchema(
            sourceUri,
            {
                '-F': 't', // tar
                '-f': dir.path // tmp dir for storing schema
            },
            dbName
        )
    ).then(
        path => restoreSchema(
            targetUri,
            {
                '-f': path
            },
            dbName
        )
    )
}

/**
 * Because node-based solutions are ott, use tried and trusted
 * pg_dump to extract the current schema from source
 * @param {string} uri
 * @param {string} dbName
 * @param {string} path
 */
function dumpSchema(uri, dumpOptions, dbName) {
    return new Promise(
        (resolve, reject) => {
            const dumpCmd = spawn('pg_dump', [uri, ...Object.entries(dumpOptions), dbName]);
            dumpCmd.stdout.on('data', console.log);
            dumpCmd.stderr.on('data', console.error);
            dumpCmd.on('close', code => code ? reject() : resolve(path));
        }
    );
}

function cleanTempDb(client, tmpDbName) {
    return client.query(`DROP DATABASE IF EXISTS ${tmpDbName}`);
}

async function migrateTempDb(client, tmpDbName, targetDbName) {
    await cleanTempDb(client, targetDbName);
    return client.query(`ALTER DATABASE ${tmpDbName} RENAME TO ${targetDbName}`);
}
