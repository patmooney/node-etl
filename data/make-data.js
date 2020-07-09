const faker = require('faker');

const nRecords = 31;

for (let i = 1; i <= nRecords; i++) {
    console.log(faker.fake(`\t(${i}, '{{name.firstName}}', '{{name.lastName}}', '{{address.streetAddress}} {{address.streetName}}, {{address.city}}'),`));
}
