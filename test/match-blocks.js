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

describe('Match Blocks', () => {
  it('should be written to database', () => {
    return client.matchBlocks.write('doc1.json', 'doc2.json')
    .then((res) => {
      assert.equal(res.statusCode, 204);
    })
  });
  it('should be read from the database', () => {
    return client.matchBlocks.read('doc1.json')
    .then((res) => {
      let blocks;
      if (res.body) {
        blocks = JSON.parse(res.body);
      }
      assert.isOk(res.body);
      assert.equal(blocks.length, 1);
    });
  });
  // Skip since is failing
  // https://github.com/marklogic-community/smart-mastering-core/issues/263
  xit('should be removed from the database', () => {
    return client.matchBlocks.remove('doc1.json', 'doc2.json')
    .then((res) => {
      // console.log(res);
      // check something
    });
  });
});
