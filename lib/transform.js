const tmp = require('tmp-promise');
const csvParser = require('csv-parser');
const csvWriter = require('csv-write-stream');
const fs = require('fs');
const faker = require('faker');

const { dumpData, restoreData } = require('./database');

module.exports = {
    migrateData
};

/**
 * Here we start coping the content of our source DB and applying
 * any transformations (in this example it is just faker).
 * @param {Client} source
 * @param {Client} target
 * @param {string} targetDb
 * @param {Object} config
 * @returns {Promise}
 */
async function migrateData(sourceConfig, target, targetConfig, targetDb, config) {
    const tables = await getTableList(target);
    if (!tables.length) {
        throw new Error('No tables found in the temp schema');
    }
    for (let table of tables) {
        const transform = getTransform(config[table]);
        const [srcFile, toFile] = await Promise.all([tmp.file(), tmp.file()]);
        await dumpData(sourceConfig.cxn, sourceConfig.database, table, srcFile.path);
        await transformData(srcFile.path, toFile.path, transform);
        await restoreData(targetConfig.cxn, targetDb, table, toFile.path);
    }
}

function transformData(fromCsv, toCsv, transform) {
    return new Promise(
        (resolve, reject) => {
            const writer = csvWriter();
            writer.pipe(fs.createWriteStream(toCsv));
            fs.createReadStream(fromCsv)
                .pipe(csvParser())
                .on('data', d => writer.write(transform(d)))
                .on('end', () => { writer.end(); resolve() });
        }
    );
}

/**
 * Various transforms may or may not exist, here we build a function which
 * rows can be piped through and modified appropriately
 * @param {Object} config
 */
function getTransform(config = {}) {
    return function (row) {
        const transforms = Object.entries(config);
        if (transforms.length) {
            return {
                ...row,
                ...transforms.reduce(
                    (acc, transform) => ({ ...acc, [transform[0]]: faker.fake(transform[1]) }),
                    {}
                )
            }
        }
        return row;
    }
}

/**
 * So we know which tables to migrate, fetch a list from our new temp db schema
 * @param {Client} target
 * @returns {Promise<string[]>}
 */
function getTableList(target) {
    return target.query(
        `SELECT table_name FROM information_schema.tables WHERE table_schema='public'`
    )
    .then(res => res.rows.map(row => row.table_name));
}
