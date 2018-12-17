const config = require('../config'),
      chai = require('chai'),
      marklogic = require('marklogic'),
      matchBlocks = require('../lib/match-blocks'),
      fs = require('fs');

const assert = chai.assert;

describe('Match Blocks', () => {
  it('should be written to database', () => {
    return matchBlocks.write('doc1.json', 'doc2.json')
    .then((res) => {
      assert.equal(res.statusCode, 204);
    })
  });
  it('should be read from the database', () => {
    return matchBlocks.read('doc1.json')
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
    return matchBlocks.remove('doc1.json', 'doc2.json')
    .then((res) => {
      // console.log(res);
      // check something
    });
  });
});
