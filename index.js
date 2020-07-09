const config = require('config');
const { Client } = require('pg');
const exitHook = require('exit-hook');

const {
    copySchema,
    cleanTempDb,
    migrateData,
    migrateTempDb
} = require('./lib');

async function run() {
    console.log('Running UAT restore');

    const sourcePg = new Client(config.data.source.uri);
    const targetPg = new Client(config.data.target.uri);
    let tmpDbName;

    exitHook(async () => {
        await cleanTempDb(targetPg, tmpDbName);
        sourcePg.end();
        targetPg.end();
    });

    try {
        console.log(' - Connect');
        await Promise.all([sourcePg.connect(), targetPg.connect()]);

        console.log(' - Load Schema');
        const tmpDbName = await copySchema(
            config.data.source.uri,
            config.data.target.uri,
            config.data.source.dbName
        );

        console.log(' - Load Data');
        await migrateData(
            sourcePg, config.data.source.dbName, targetPg, tmpDbName
        );

        console.log('- Migrate Temporary DB');
        await migrateTempDb(
            targetDb, tmpDbName, config.data.target.dbName
        );
    } catch (err) {
        console.error('UAT Restore failed', err);
        process.exit(1);
    }
}

run();
