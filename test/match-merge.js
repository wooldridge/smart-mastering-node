const chai = require('chai'),
      marklogic = require('marklogic'),
      moment = require('moment'),
      sm = require('../lib/sm'),
      fs = require('fs'),
      testUtils = require('./test-utils');

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

let testDocs = testUtils.createDocuments([
  // /doc1.json
  { 'prop1': 'foo', 'prop2': 'bar', 'prop3': 'baz' },
  // /doc2.json
  { 'prop1': 'foo', 'prop2': 'bar', 'prop3': 'bla' }
]);

let optionsMatch = sm.createMatchOptions()
  .exact({ propertyName: 'prop1', weight: 4 })
  .exact({ propertyName: 'prop2', weight: 2 })
  .exact({ propertyName: 'prop3', weight: 1 })
  .threshold({ above: 1, label: 'Possible Match' })
  .threshold({ above: 3, label: 'Likely Match', action: 'notify' })
  .threshold({ above: 5, label: 'Definitive Match', action: 'merge' });

optionsMatch = JSON.stringify(optionsMatch);

let optionsMerge = sm.createMergeOptions();
optionsMerge.matchOptions('match-options');
optionsMerge.merge({
    propertyName: 'prop1',
    maxValues: 1,
    sourceWeights: [
      optionsMerge.sourceWeight("source1", 10),
      optionsMerge.sourceWeight("source2", 100),
    ] })
  .merge({
    propertyName: 'prop3',
    maxValues: 1,
    sourceWeights: [
      optionsMerge.sourceWeight("source1", 100),
      optionsMerge.sourceWeight("source2", 10),
    ] });

optionsMerge = JSON.stringify(optionsMerge);

// Serializing queries as JSON:
// https://docs.marklogic.com/guide/search-dev/cts_query#id_29308

// Query that returns docs
let queryMatches = {
  wordQuery: {
    text: ["foo"],
    options: ["lang=en"]
  }
};
queryMatches = JSON.stringify(queryMatches);

// Query that doesn't return docs
let queryNoMatches = {
  wordQuery: {
    text: ["nothing"],
    options: ["lang=en"]
  }
};
queryNoMatches = JSON.stringify(queryNoMatches);

/**
 * Note bug:
 * https://github.com/marklogic-community/smart-mastering-core/issues/271
 * When fixed, update to test merges and notifications together.
 */
describe('Match and Merge', () => {

  before((done) => {
    client.mlClient.documents.removeAll({collection: 'mdm-content'})
    .result((res) => {
      return client.matchOptions.write('match-options', optionsMatch);
    })
    .then((res) => {
      return client.mergeOptions.write('merge-options', optionsMerge);
    })
    .then((res) => {
      done();
    });
  });

  beforeEach((done) => {
    client.mlClient.documents.write(testDocs)
    .result((res) => {
      done();
    });
  });

  after((done) => {
    client.matchOptions.remove('match-options')
    .then((res) => {
      return client.mergeOptions.remove('merge-options');
    })
    .then((res) => {
      done();
    });
  });

  afterEach((done) => {
    client.mlClient.documents.remove(testDocs.map((doc) => {return doc.uri}))
    .result((res) => {
      return client.mlClient.documents.removeAll({collection: 'mdm-auditing'});
    })
    .then((res) => {
      return client.mlClient.documents.removeAll({collection: 'mdm-merged'});
    })
    .then((res) => {
      done();
    });
  });

  it('should be run with URIs', () => {
    let options = {
      uris: ['/doc1.json', '/doc2.json'],
      optionsName: 'merge-options'
    }
    return client.matchMerge.run(options)
    .then((res) => {
      assert.property(res, 'envelope');
      let headers = res.envelope.headers;
      assert.property(headers, 'sources');
      assert.property(headers, 'merges');
    });
  });

  it('should be run with a collector', () => {
    let options = {
      collectorName: 'collect',
      collectorNs: 'http://marklogic.com/smart-mastering/collector',
      collectorAt: '/com.marklogic.smart-mastering/collector.xqy',
      optionsName: 'merge-options'
    }
    return client.matchMerge.run(options)
    .then((res) => {
      assert.property(res, 'envelope');
      let headers = res.envelope.headers;
      assert.property(headers, 'sources');
      assert.property(headers, 'merges');
    })
  });

  it('should be run with a query and return matches', () => {
    let options = {
      uris: ['/doc1.json', '/doc2.json'],
      optionsName: 'merge-options',
      query: queryMatches
    }
    return client.matchMerge.run(options)
    .then((res) => {
      assert.property(res, 'envelope');
      let headers = res.envelope.headers;
      assert.property(headers, 'sources');
      assert.property(headers, 'merges');
    })
  });

  it('should be run with a query and not return matches', () => {
    let options = {
      uris: ['/doc1.json', '/doc2.json'],
      optionsName: 'merge-options',
      query: queryNoMatches
    }
    return client.matchMerge.run(options)
    .then((res) => {
      assert.equal(res, undefined);
    })
  });

});
