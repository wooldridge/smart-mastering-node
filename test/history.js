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

// TODO run operations that will create a testable history

describe('History', () => {
  xit('should be read for a document', () => {
    return client.history.read('docA.xml')
    .then((res) => {
      console.log(res);
      // assert.isNotEmpty(res.body.results);
    })
  });
  xit('should be read for the properties of a document', () => {
    return client.history.readProps('docA.xml', ['PersonSurName', 'PersonGivenName'])
    .then((res) => {
      console.log(res);
      // assert.isNotEmpty(res.body.results);
    })
  });
});
