const config = require('../config'),
      chai = require('chai'),
      marklogic = require('marklogic'),
      mergeOptions = require('../lib/merge-options'),
      merge = require('../lib/merge'),
      fs = require('fs');

const assert = chai.assert;

const testOptionsXML = fs.readFileSync(config.path + 'test/data/options/org-merge-options.xml').toString('utf8');

const db = marklogic.createDatabaseClient({
  host: config.host,
  user: config.auth.user,
  password: config.auth.pass,
  port: config.server.port
});

const path = config.path + 'test/data/documents/json/';
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
  db.documents.write(docs)
  .result((res) => {
    return mergeOptions.write('org-merge-options', testOptionsXML);
  })
  .then((res) => {
    done();
  });
});

// after((done) => {
//   db.documents.remove(['doc1.json', 'doc2.json'])
//   .result((res) => {
//     return mergeOptions.remove('merge-options2');
//   })
//   .then((res) => {
//     done();
//   });
// });

describe('Merge', () => {
  xit('should be run with options ref', () => {
    let options = {
      uris: ['org1.json', 'orgA.json'],
      optionsName: 'org-merge-options',
      preview: true
    }
    return merge.run(options)
    .then((res) => {
      //console.log(res);
      // assert.isNotEmpty(res.body.results);
    })
  });
  xit('should be restored', () => {
    return match.restore('docA.xml', true)
    .then((res) => {
      console.log(res.body);
      // assert.isNotEmpty(res.body.results);
    })
  });
});
