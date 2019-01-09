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

const orgMatchOptionsXML = fs.readFileSync(config.path + 'test/data/options/org-match-options.xml').toString('utf8');
const orgMergeOptionsXML = fs.readFileSync(config.path + 'test/data/options/org-merge-options.xml').toString('utf8');
const testMatchOptionsJSON = fs.readFileSync(config.path + 'test/data/options/test-match-options.json').toString('utf8');
const testMergeOptionsJSON = fs.readFileSync(config.path + 'test/data/options/test-merge-options.json').toString('utf8');
const testMatchOptionsXML = fs.readFileSync(config.path + 'test/data/options/test-match-options.xml').toString('utf8');
const testMergeOptionsXML = fs.readFileSync(config.path + 'test/data/options/test-merge-options.xml').toString('utf8');
//const testQuery = fs.readFileSync(config.path + 'test-query.xqy').toString('utf8');

const path = config.path + 'test/data/documents/json/';
// const docs = [
//   {
//     uri: 'doc1.json',
//     content: fs.readFileSync(path + 'doc2.json'),
//     collections: ['mdm-content', 'Source1']
//   },
//   {
//     uri: 'doc2.json',
//     content: fs.readFileSync(path + 'doc2.json'),
//     collections: ['mdm-content', 'Source2']
//   }
// ]

// const docs = [
//   {
//     uri: 'org1.json',
//     content: fs.readFileSync(path + 'org1.json'),
//     collections: ['mdm-content', 'Source1']
//   },
//   {
//     uri: 'orgA.json',
//     content: fs.readFileSync(path + 'orgA.json'),
//     collections: ['mdm-content', 'Source2']
//   }
// ]

// before((done) => {
//   client.mlClient.documents.write(docs)
//   .result((res) => {
//     return client.matchOptions.write('org-match-options', orgMatchOptionsXML);
//   })
//   .then((res) => {
//     return client.mergeOptions.write('org-merge-options', orgMergeOptionsXML);
//   })
//   .then((res) => {
//     done();
//   });
// });


let props = [['foo', 'bar', 'baz'],['foo', 'bar', 'bla'],
             ['foo', 'ble', 'bla'],['blo', 'ble', 'bla']];

let ids = [ '3de1a1f9-9df6-46c4-ad47-effaec802582',
            '4de1a1f9-9df6-46c4-ad47-effaec802582',
            '5de1a1f9-9df6-46c4-ad47-effaec802582',
            '6de1a1f9-9df6-46c4-ad47-effaec802582' ];

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
        id: ids[i],
        sources: [
          {
            name: '/test/source' + ((i % 2) + 1) +
              '/match-merge-doc' + (i+1) + '.json',
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
        { namespace: "", localname: "prop2", name: "prop2" }
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
        propertyName: "prop2",
        maxValues: "1",
        sourceWeights: [
          { source: { name: "source1", weight: "100" } },
          { source: { name: "source2", weight: "10" } }
        ]
      }
    ]
  }
};
optionsMerge = JSON.stringify(optionsMerge);

before((done) => {
  client.mlClient.documents.write(docs)
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

// after((done) => {
//   client.mlClient.documents.remove(['docA.xml', 'docB.xml'])
//   .result((res) => {
//     return client.mergeOptions.remove('merge-options-xml');
//   })
//   .then((res) => {
//     done();
//   });
// });

describe('Match and Merge', () => {
  // Returns error, details sent to ryanjdew 2019-01-08
  xit('should be run with URIs', () => {
    let options = {
      uris: ['/match-merge-doc1.json', '/match-merge-doc2.json'],
      optionsName: 'merge-options'
    }
    return client.matchMerge.run(options)
    .then((res) => {
      console.log(res.body);
      // assert.isNotEmpty(res.body.results);
    })
  });
  xit('should be run with URIs', () => {
    let options = {
      uris: ['org1.json', 'orgA.json'],
      optionsName: 'org-merge-options'
    }
    return client.matchMerge.run(options)
    .then((res) => {
      console.log(res);
      // assert.isNotEmpty(res.body.results);
    })
  });
  xit('should be run with a collector', () => {
    let options = {
      collectorName: 'collect',
      collectorNs: 'http://marklogic.com/smart-mastering/collector',
      collectorAt: '/com.marklogic.smart-mastering/collector.xqy',
      optionsName: 'org-merge-options'
    }
    return client.matchMerge.run(options)
    .then((res) => {
      console.log(res.body);
      // assert.isNotEmpty(res.body.results);
    })
  });
  xit('should be run with a query', () => {
    let options = {
      uris: ['docA.xml', 'docB.xml'],
      optionsName: 'merge-options-xml',
      query: testQuery
    }
    return client.matchMerge.run(options)
    .then((res) => {
      console.log(res);
      // assert.isNotEmpty(res.body.results);
    })
  });
});
