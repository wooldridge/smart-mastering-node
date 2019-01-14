const config = require('../config'),
      chai = require('chai'),
      marklogic = require('marklogic'),
      moment = require('moment'),
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

// TODO move sample data creation to utility functions that can
// be used by all tests.

let props = [['foo', 'bar', 'baz'],['foo', 'bar', 'bla']];//,
             //['foo', 'ble', 'bla'],['blo', 'ble', 'bla']];

let docs = props.map(function(p, i) {
  let content = {
    envelope: {
      instance: {
        test: {
            prop1: p[0],
            prop2: p[1],
            prop3: p[2]
        },
        info: { title: 'test', version: '0.0.1' }
      },
      headers: {
        id: i,
        sources: [
          {
            name: '/test/source' + ((i % 2) + 1) +
              '/doc' + (i+1) + '.json',
            dateTime: moment().add(i, 'days').format(),
            user: "mdm-rest-admin"
          }
      ]
      },
      triples: [],
      attachments: {
        test: {
            prop1: p[0],
            prop2: p[1],
            prop3: p[2]
        }
      }
    }
  };
  return {
    uri: '/match-merge-doc' + (i+1) + '.json',
    collections: ['mdm-content', 'source' + (i + 1)],
    content: content
  };
});

let optionsMatch = {
  options: {
    dataFormat: "json",
    propertyDefs: {
      property: [
        { namespace: "", localname: "prop1", name: "prop1" },
        { namespace: "", localname: "prop2", name: "prop2" },
        { namespace: "", localname: "prop3", name: "prop3" }
      ]
    },
    algorithms: {},
    scoring: {
      add: [
        { propertyName: "prop1", weight: "4" },
        { propertyName: "prop2", weight: "2" },
        { propertyName: "prop3", weight: "1" }
      ],
      expand: [],
      reduce: []
    },
    actions: {},
    thresholds: {
      threshold: [
        { above: "1", label: "Possible Match" },
        { above: "3", label: "Likely Match", action: "notify" },
        { above: "5", label: "Definitive Match", action: "merge" }
      ]
    },
    tuning: { maxScan: "200" }
  }
}
optionsMatch = JSON.stringify(optionsMatch);

let optionsMerge = {
  options: {
    matchOptions: "match-options",
    propertyDefs: {
      properties: [
        { namespace: "", localname: "prop1", name: "prop1" },
        { namespace: "", localname: "prop3", name: "prop3" }
      ]
    },
    merging: [
      {
        propertyName: "prop1",
        maxValues: "1",
        sourceWeights: [
          { source: { name: "source1", weight: "10" } },
          { source: { name: "source2", weight: "100" } }
        ]
      },
      {
        propertyName: "prop3",
        maxValues: "1",
        sourceWeights: [
          { source: { name: "source1", weight: "10" } },
          { source: { name: "source2", weight: "100" } }
        ]
      }
    ]
  }
};
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
    client.mlClient.documents.write(docs)
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
    client.mlClient.documents.remove(docs.map((doc) => {return doc.uri}))
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
      uris: ['/match-merge-doc1.json', '/match-merge-doc2.json'],
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
      uris: ['/match-merge-doc1.json', '/match-merge-doc2.json'],
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
      uris: ['/match-merge-doc1.json', '/match-merge-doc2.json'],
      optionsName: 'merge-options',
      query: queryNoMatches
    }
    return client.matchMerge.run(options)
    .then((res) => {
      assert.equal(res, undefined);
    })
  });

});
