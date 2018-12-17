const config = require('../config'),
      chai = require('chai'),
      marklogic = require('marklogic'),
      matchOptions = require('../lib/match-options'),
      fs = require('fs');

const assert = chai.assert;

const testOptionsJSON = fs.readFileSync(config.path + 'test/data/options/test-match-options.json').toString('utf8');
const testOptionsXML = fs.readFileSync(config.path + 'test/data/options/test-match-options.xml').toString('utf8');

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

describe('Match Options', () => {
  it('should be written to database as JSON', () => {
    return matchOptions.write('match-options-json', testOptionsJSON)
    .then((res) => {
      assert.equal(res.statusCode, 204);
    })
  });
  it('should be written to database as XML', () => {
    return matchOptions.write('match-options-xml', testOptionsXML)
    .then((res) => {
      assert.equal(res.statusCode, 204);
    })
  });
  it('should be read from the database', () => {
    return matchOptions.read('match-options-xml')
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
    return matchOptions.list()
    .then((res) => {
      let opts;
      if (res.body) {
        opts = JSON.parse(res.body);
      }
      assert.isOk(res.body);
      assert.equal(opts[0], 'match-options-json');
    });
  });
  it('should be removed from the database', () => {
    return matchOptions.remove('match-options-json')
    .then((res) => {
      assert.equal(res, true);
    });
  });
});
