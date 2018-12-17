const config = require('../config'),
      chai = require('chai'),
      marklogic = require('marklogic'),
      mergeOptions = require('../lib/merge-options'),
      fs = require('fs');

const assert = chai.assert;

const testOptionsJSON = fs.readFileSync(config.path + 'test/data/options/test-merge-options.json').toString('utf8');
const testOptionsXML = fs.readFileSync(config.path + 'test/data/options/test-merge-options.xml').toString('utf8');

const db = marklogic.createDatabaseClient({
  host: config.host,
  user: config.auth.user,
  password: config.auth.pass,
  port: config.server.port
});

// before((done) => {
//   db.documents.removeAll({collection:'mdm-options'})
//   .result((res) => {
//     done();
//   });
// });

// after((done) => {
//   db.documents.removeAll({collection:'mdm-options'})
//   .result((res) => {
//     done();
//   });
// });

describe('Merge Options', () => {
  it('should be written to database as JSON', () => {
    return mergeOptions.write('merge-options-json', testOptionsJSON)
    .then((res) => {
      assert.equal(res.statusCode, 204);
    })
  });
  it('should be written to database as XML', () => {
    return mergeOptions.write('merge-options-xml', testOptionsXML)
    .then((res) => {
      assert.equal(res.statusCode, 204);
    })
  });
  it('should be read from the database', () => {
    return mergeOptions.read('merge-options-xml')
    .then((res) => {
      let opts;
      if (res.body) {
        // options written as XML come back as JSON
        opts = JSON.parse(res.body);
      }
      assert.isOk(res.body);
      assert.isOk(opts.options);
    });
  });
  it('should be listed from the database', () => {
    return mergeOptions.list()
    .then((res) => {
      let opts;
      if (res.body) {
        opts = JSON.parse(res.body);
      }
      assert.isOk(res.body);
      assert.equal(opts[0], 'merge-options-json');
    });
  });
  it('should be removed from the database', () => {
    return mergeOptions.remove('merge-options-json')
    .then((res) => {
      assert.equal(res, true);
    });
  });
});
