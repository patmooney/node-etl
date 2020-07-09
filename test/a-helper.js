const chai = require('chai');
const spies = require('chai-spies');
const mockery = require('mockery');
const cap = require('chai-as-promised')

chai.use(spies);
chai.use(cap);
global.chai = chai;
global.mockery = mockery;
global.expect = chai.expect;
