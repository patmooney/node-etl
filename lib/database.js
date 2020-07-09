const { spawn } = require('child_process');
const tmp = require('tmp-promise');

module.exports = {
    copySchema,
    cleanTempDb,
    migrateTempDb,
    dumpData,
    restoreData
};

/**
 * As we will be modifying data in transit to reduce duplicating sensitive data
 * we will need to restore the DB first and then the data following.
 * Here we setup a new empty DB from a source to a target (temp) DB
 * @param {Object} sourceConfig
 * @param {Object} targetConfig
 */
async function copySchema(sourceConfig, targetConfig) {
    const file = await tmp.file();
    const tempDbName = await createTempDb(targetConfig);
    try {
        await dumpSchema(sourceConfig, file.path);
        await restoreSchema(targetConfig, tempDbName, file.path);
    } catch(err) {
        console.error(`Schema migration failed, tmpDb: ${tempDbName}`, err);
        console.log('Attempting to cleanup tmpdb');
        await cleanTempDb(targetConfig.cxn, tempDbName);
        throw err;
    }

    return tempDbName;
}

/**
 * Because node-based solutions are ott, use tried and trusted
 * pg_dump to extract the current schema from source
 * @param {Object} pgConfig
 * @param {string} dbName
 * @param {string} path
 * @returns {Promise<string>} - output path
 */
function dumpSchema(pgConfig, path) {
    const args = [
        '--dbname', pgArgs(pgConfig.cxn, pgConfig.database),
        '-f', path, '-s'
    ];

    console.log(' - Dump schema');
    return runCmd('pg_dump', args)
        .then(() => path);
}

/**
 * The data should be fully realised within a separate DB
 * before removing UAT DB.
 * @param {Object} pgConfig
 * @returns {Promise<string>} - tempDbName
 */
function createTempDb(pgConfig) {
    const tempDbName = `tmp_${Date.now()}`;
    console.log(` - Creating temporary DB: ${tempDbName}`);
    return runCmd('psql', [pgArgs(pgConfig.cxn), '-c', `CREATE DATABASE ${tempDbName}`])
        .then(() => tempDbName);
}


/**
 * From our freshly dumped schema files based on the prod (source)
 * db.
 * @param {Object} pgConfig
 * @param {string} tempDbName
 * @param {string} path
 * @returns {Promise<tempDbName>}
 */
function restoreSchema(pgConfig, tempDbName, path) {
    const args = [
        pgArgs(pgConfig.cxn, tempDbName),
        '-f', path
    ];

    console.log(' - Restore schema to temp db');
    return runCmd('psql', args)
        .then(() => tempDbName);
}

/**
 * Because the psql CLI finds URI a more agreeable means to
 * set CXN parameters
 * @param {Object} pgConfig
 * @param {string} [dbName]
 * @returns {string} uri
 */
function pgArgs(pgConfig, dbName) {
    return `postgresql://${pgConfig.user}:${pgConfig.password}@${pgConfig.host}:${pgConfig.port}${dbName ? '/' + dbName : ''}`;
}

/**
 * Promisify the node child process spawn to control
 * flow and catch errors.
 * @param {string} cmd
 * @param {string[]} args
 * @returns {Promise}
 */
function runCmd(cmd, args) {
    return new Promise(
        (resolve, reject) => {
            const exec = spawn(cmd, args)
            exec.stderr.on('data', data => console.error(data.toString()));
            exec.on('close', code => code ? reject() : resolve());
            exec.on('error', (err) => reject(err));
        }
    );
}

/**
 * AKA drop a database using the psql CLI
 * @param {Object} pgConfig
 * @param {string} tempDbName
 */
function cleanTempDb(pgConfig, tempDbName) {
    return runCmd('psql', [pgArgs(pgConfig), '-c', `DROP DATABASE IF EXISTS ${tempDbName}`]);
}

/**
 * Copy data directly to a local csv
 * @param {Object} pgConfig
 * @param {string} dbName
 * @param {string} tableName
 * @param {string} path
 */
function dumpData(pgConfig, dbName, tableName, path) {
    return runCmd(
        'psql',
        [pgArgs(pgConfig, dbName),
        '-c', "\\copy (SELECT * FROM "+tableName+") TO '"+path+"' WITH csv HEADER"]
    );
}

/**
 * Restore data directly from a local csv
 * @param {Object} pgConfig
 * @param {string} dbName
 * @param {string} tableName
 * @param {string} path
 */
function restoreData(pgConfig, dbName, tableName, path) {
    return runCmd(
        'psql',
        [pgArgs(pgConfig, dbName),
            '-c', "\\copy "+tableName+" FROM '"+path+"'WITH csv HEADER"]
    );
}

/**
 * Our temporary DB is ready to be promoted, drop old
 * UAT db and replace with new shiny
 * @param {Object} pgConfig
 * @param {string} tempDbName
 * @param {string} targetDbName
 */
async function migrateTempDb(pgConfig, tempDbName, targetDbName) {
    await cleanTempDb(pgConfig, targetDbName);
    return runCmd('psql', [pgArgs(pgConfig), '-c', `ALTER DATABASE ${tempDbName} RENAME TO ${targetDbName}`]);
}
