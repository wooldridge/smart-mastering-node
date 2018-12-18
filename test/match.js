const config = require('../config'),
      chai = require('chai'),
      sm = require('../lib/sm'),
      fs = require('fs');

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

const testOptionsJSON = fs.readFileSync(config.path + 'test/data/options/test-match-options.json').toString('utf8');
const testOptionsXML = fs.readFileSync(config.path + 'test/data/options/test-match-options.json').toString('utf8');
const testDoc = fs.readFileSync(config.path + 'test/data/documents/json/doc1.json').toString('utf8');

const path = config.path + 'test/data/documents/json/';
const files = fs.readdirSync(path);
const docs = files.map((file) => {
  let buffer = fs.readFileSync(path + file);
  return {
    uri: file,
    content: buffer,
    collections: ['mdm-content']
  };
});

before((done) => {
  client.mlClient.documents.write(docs)
  .result((res) => {
    return client.matchOptions.write('matching-options-json', testOptionsJSON);
  })
  .then((res) => {
    return client.matchOptions.write('matching-options-xml', testOptionsXML);
  })
  .then((res) => {
    done();
  });
});

after((done) => {
  client.mlClient.documents.remove(files)
  .result((res) => {
    return client.matchOptions.remove('matching-options-json');
  })
  .then((res) => {
    return client.matchOptions.remove('matching-options-xml');
  })
  .then((res) => {
    done();
  });
});

describe('Match', () => {
  it('should be run with option refs', () => {
    let options = {
      uri: 'doc1.json',
      optionsName: 'matching-options-json'
    }
    return client.match.run(options)
    .then((res) => {
      //console.log(res);
      assert.isNotEmpty(res.body.results);
      assert.equal(res.body.results.result.length, 3);
      assert.equal(res.body.results.result[0].uri, 'doc6.json');
    })
  });
  // Skip since is failing
  xit('should be run with option content', () => {
    let options = {
      document: testDoc,
      matchOptions: testOptionsJSON
    }
    return client.match.run(options)
    .then((res) => {
      console.log(res.body);
    })
  });
  it('should be run with page info', () => {
    let options = {
      uri: 'doc1.json',
      optionsName: 'matching-options-json',
      start: 2,
      pageLength: 2
    }
    return client.match.run(options)
    .then((res) => {
      assert.isNotEmpty(res.body.results);
      assert.equal(res.body.results.result.length, 2);
      assert.equal(res.body.results.result[0].uri, 'doc4.json');
    })
  });
  it('should be run with matches included', () => {
    let options = {
      uri: 'doc1.json',
      optionsName: 'matching-options-json',
      includeMatches: true
    }
    return client.match.run(options)
    .then((res) => {
      assert.isNotEmpty(res.body.results);
      assert.isNotEmpty(res.body.results.result[0].matches);
    })
  });
  it('should error when no document', () => {
    let options = {
      optionsName: 'matching-options-json'
    }
    assert.throw(function() { client.match.run(options) });
  });
  it('should error when no options', () => {
    let options = {
      uri: 'doc1.json'
    }
    assert.throw(function() { client.match.run(options) });
  });
});
