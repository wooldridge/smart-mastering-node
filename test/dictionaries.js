const chai = require('chai'),
      sm = require('../lib/sm');

const assert = chai.assert;

let client = sm.createClient({
  host: 'localhost',
  port: 8800,
  database: 'minimal-smart-mastering-content',
  modules: 'minimal-smart-mastering-modules',
  server: 'minimal-smart-mastering',
  user: 'admin',
  password: 'admin'
});

before((done) => {
  // Create dictionaries
  done();
});

describe('Dictionaries', () => {
  xit('should be listed', () => {
    return client.dictionaries.list()
    .then((res) => {
      // TODO
    })
  });
});
