const { to: copyTo } = require('pg-copy-streams');
const es = require('event-stream');

async function migrateData(source, srcDb, target, targetDb, config) {
    const tables = await getTableList(target, targetDb);
    for (let table in tables) {
        /*
        const transform = getTransform(config[table]);
        const stream = client.query(copyTo(`COPY (SELECT * FROM ${table} ORDER BY id ASC`) TO STDOUT`));
        stream
            .pipe(es.split())
            .pipe(process.stdout)
        */
        console.log(table);
    }
}

function getTableList(target, targetDb) {
    return target.query(
        `SELECT table_name FROM information_schema.tables WHERE table_schema='${targetDb}'`
    );
}
