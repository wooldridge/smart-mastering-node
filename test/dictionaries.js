const config = require('../config'),
      chai = require('chai'),
      marklogic = require('marklogic'),
      dictionaries = require('../lib/dictionaries'),
      fs = require('fs');

const assert = chai.assert;

const db = marklogic.createDatabaseClient({
  host: config.host,
  user: config.auth.user,
  password: config.auth.pass,
  port: config.server.port
});

before((done) => {
  // Create dictionaries
  done();
});

describe('Dictionaries', () => {
  xit('should be listed', () => {
    return dictionaries.list()
    .then((res) => {
      // TODO
    })
  });
});
