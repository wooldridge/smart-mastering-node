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

describe('Entity Services', () => {

  before((done) => {
    // Create entity services descriptors
    done();
  });

  xit('should list descriptors', () => {
    return client.entityServices.list()
    .then((res) => {
      // TODO
    })
  });

});
