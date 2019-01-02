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
      assert.equal(res, true);
    })
  });
  it('should be read from the database', () => {
    return client.matchBlocks.read('doc1.json')
    .then((res) => {
      assert.isOk(res);
      assert.equal(res[0], 'doc2.json');
    });
  });
  it('should be removed from the database', () => {
    return client.matchBlocks.remove('doc1.json', 'doc2.json')
    .then((res) => {
      assert.equal(res, true);
    });
  });
  it('should be read and be empty after removal', () => {
    return client.matchBlocks.read('doc1.json')
    .then((res) => {
      assert.equal(res.length, 0);
    });
  });
  it('should not be removed after removal', () => {
    return client.matchBlocks.remove('doc1.json', 'doc2.json')
    .then((res) => {
      assert.equal(res, false);
    });
  });
});
