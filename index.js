const config = require('config');
const exitHook = require('async-exit-hook');
const { Client } = require('pg');

const {
    copySchema,
    cleanTempDb,
    migrateData,
    migrateTempDb
} = require('./lib');

/*
 * So many options exist for ETL of data, including ETL frameworks,
 * automated tools etc.
 *
 * This is a bare-bones ETL which also transforms data on ingress.
 *
 * In Production and working with large data sets, this would more
 * likely work by exporting CSV data, manipulating and then re-uploading
 * (host postgres server requires SCP)
 *
 * This workflow avoids putting sensitive data down anywhere between ETL
 */
async function run() {
    console.log('Running UAT restore');

    console.log(' - Load Schema');
    const tmpDbName = await copySchema(
        config.data.source,
        config.data.target
    );

    const tempPg = new Client({ ...config.data.target.cxn, database: tmpDbName });
    await tempPg.connect();

    exitHook(async (done) => {
        console.log('Cleanup...');
        try {
            await cleanTempDb(config.data.target.cxn, tmpDbName);
            tempPg.end();
        } catch (err) {
            console.log('Cleanup failed', err);
        }
        console.log('Cleanup complete');
        done();
    });

    console.log(' - Load Data');
    await migrateData(
        config.data.source, tempPg, config.data.target, tmpDbName, config.transform
    );

    console.log('- Migrate Temporary DB');
    await tempPg.end();
    await migrateTempDb(
        config.data.target.cxn, tmpDbName, config.data.target.database
    );
}

if (!module.parent) {
    run().catch(
        err => console.error('UAT Failed', err)
    );
}

module.exports = {
    run
};
