const config = require('../config'),
      chai = require('chai'),
      marklogic = require('marklogic'),
      entityServices = require('../lib/entity-services'),
      fs = require('fs');

const assert = chai.assert;

before((done) => {
  // Create entity services descriptors
  done();
});

describe('Entity Services', () => {
  xit('should list descriptors', () => {
    return entityServices.list()
    .then((res) => {
      // TODO
    })
  });
});
