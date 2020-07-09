const { copySchema, cleanupTempDb, migrateTempDb } = require('./database');
const { migrateData } = require('./transform');

module.exports = {
    copySchema,
    cleanupTempDb,
    migrateTempDb,
    migrateData
};
