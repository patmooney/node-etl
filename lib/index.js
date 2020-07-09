const { copySchema, cleanTempDb, migrateTempDb } = require('./database');
const { migrateData } = require('./transform');

module.exports = {
    copySchema,
    cleanTempDb,
    migrateTempDb,
    migrateData
};
