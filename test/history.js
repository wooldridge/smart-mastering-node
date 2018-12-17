const config = require('../config'),
      chai = require('chai'),
      marklogic = require('marklogic'),
      mergeOptions = require('../lib/merge-options'),
      history = require('../lib/history'),
      fs = require('fs');

const assert = chai.assert;

// TODO run operations that will create a testable history

describe('History', () => {
  xit('should be read for a document', () => {
    return history.read('docA.xml')
    .then((res) => {
      console.log(res);
      // assert.isNotEmpty(res.body.results);
    })
  });
  xit('should be read for the properties of a document', () => {
    return history.readProps('docA.xml', ['PersonSurName', 'PersonGivenName'])
    .then((res) => {
      console.log(res);
      // assert.isNotEmpty(res.body.results);
    })
  });
});
