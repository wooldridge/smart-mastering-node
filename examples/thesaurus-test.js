const sm = require('../lib/sm'),
      testUtils = require('../test/test-utils'),
      fs = require('fs');

// Run example as a Mocha test: mocha match-test.js

let client = sm.createClient({
  host: 'localhost',
  port: 8800,
  database: 'minimal-smart-mastering-content',
  modules: 'minimal-smart-mastering-modules',
  server: 'minimal-smart-mastering',
  user: 'admin',
  password: 'admin'
});

let props = [
  // /doc1.json
  { 'fname': 'Mike' },
  // /doc2.json
  { 'fname': 'Michael' },
  // /doc3.json
  { 'fname': 'Ethel' },
  // /doc4.json
  { 'fname': 'Mike' }
];

let docs = testUtils.createDocuments(props);

let myThesaurus = fs.readFileSync('./data/thesauri/first-name-thesaurus.xml', 'utf8');

let myMatchThesaurusOptions = sm.createMatchOptions()
  .exact({ propertyName: 'fname', weight: 4 })
  .thesaurus({
      propertyName: 'fname',
      weight: 2,
      thesaurus: 'first-name-thesaurus.xml'
    })
  .threshold({ above: 1, label: 'Possible Match', action: 'notify' })
  .threshold({ above: 3, label: 'Definitive Match', action: 'merge' });

myMatchThesaurusOptions = JSON.stringify(myMatchThesaurusOptions);

describe('Thesaurus Test', function () {

  before((done) => {
    client.mlClient.documents.write(docs)
    .result((res) => {
      return client.thesauri.write('first-name-thesaurus.xml', myThesaurus);
    })
    .then((res) => {
      done();
    })
  });

  it('should run a match with a thesaurus option', () => {
    return client.match.run({
      uri: '/doc1.json',
      matchOptions: myMatchThesaurusOptions
    })
    .then((result) => {
      console.log(result);
    })
  });

  after((done) => {
    client.mlClient.documents.remove(docs.map((doc) => {return doc.uri}))
    .result((res) => {
      return client.thesauri.remove('first-name-thesaurus.xml');
    })
    .then((res) => {
      done();
    })
  });

});
