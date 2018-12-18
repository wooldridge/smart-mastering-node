const config = require('../config'),
      chai = require('chai'),
      marklogic = require('marklogic'),
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

// before((done) => {
//   client.mlClient.documents.write(docs)
//   .result((res) => {
//     return client.matchOptions.write('test-match-options', testMatchOptionsXML);
//   })
//   .then((res) => {
//     return client.mergeOptions.write('test-merge-options', testMergeOptionsXML);
//   })
//   .then((res) => {
//     done();
//   });
// });

const docs = [
  {
    uri: 'org1.json',
    content: fs.readFileSync(path + 'org1.json'),
    collections: ['mdm-content', 'Source1']
  },
  {
    uri: 'orgA.json',
    content: fs.readFileSync(path + 'orgA.json'),
    collections: ['mdm-content', 'Source2']
  }
]

before((done) => {
  client.mlClient.documents.write(docs)
  .result((res) => {
    return client.matchOptions.write('org-match-options', orgMatchOptionsXML);
  })
  .then((res) => {
    return client.mergeOptions.write('org-merge-options', orgMergeOptionsXML);
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
  xit('should be run with URIs', () => {
    let options = {
      uris: ['doc1.json', 'doc2.json'],
      optionsName: 'test-merge-options'
    }
    return client.matchMerge.run(options)
    .then((res) => {
      console.log(res.body);
      // assert.isNotEmpty(res.body.results);
    })
  });
  it('should be run with URIs', () => {
    let options = {
      uris: ['org1.json', 'orgA.json'],
      optionsName: 'org-merge-options'
    }
    return client.matchMerge.run(options)
    .then((res) => {
      //console.log(res.body);
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
