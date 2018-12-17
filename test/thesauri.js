const config = require('../config'),
      chai = require('chai'),
      marklogic = require('marklogic'),
      thesauri = require('../lib/thesauri'),
      fs = require('fs');

const assert = chai.assert;

const db = marklogic.createDatabaseClient({
  host: config.host,
  user: config.auth.user,
  password: config.auth.pass,
  port: config.server.port
});

before((done) => {
  // Create thesauri
  done();
});

describe('Thesauri', () => {
  xit('should be listed', () => {
    return thesauri.list()
    .then((res) => {
      // TODO
    })
  });
});
