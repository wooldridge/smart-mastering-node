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

const testOptionsXML = fs.readFileSync(config.path + 'test/data/options/org-merge-options.xml').toString('utf8');

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
  client.mlClient.documents.write(docs)
  .result((res) => {
    return client.mergeOptions.write('org-merge-options', testOptionsXML);
  })
  .then((res) => {
    done();
  });
});

// after((done) => {
//   client.mlClient.documents.remove(['doc1.json', 'doc2.json'])
//   .result((res) => {
//     return client.mergeOptions.remove('merge-options2');
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
    return client.merge.run(options)
    .then((res) => {
      //console.log(res);
      // assert.isNotEmpty(res.body.results);
    })
  });
  xit('should be restored', () => {
    return client.match.restore('docA.xml', true)
    .then((res) => {
      console.log(res.body);
      // assert.isNotEmpty(res.body.results);
    })
  });
});
