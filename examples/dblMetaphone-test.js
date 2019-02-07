const sm = require('../lib/sm'),
      testUtils = require('../test/test-utils');

// Run example as a Mocha test: mocha dblMetaphone-test.js
//
// TODO this example is not working, unable to get
// dblMetaphone-based matches

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
  { 'prop': 'Indefatigable' },
  // /doc2.json
  { 'prop': 'Indefinite' },
  // /doc3.json
  { 'prop': 'Indefatigables' },
  // /doc4.json
  { 'prop': 'Undefeated' },
  // /doc5.json
  { 'prop': 'Indefatigable' }
];

let docs = testUtils.createDocuments(props);

let myDblMetaphoneOptions = sm.createMatchOptions()
  .exact({ propertyName: 'prop', weight: 4 })
  .dblMetaphone({
      propertyName: 'prop',
      weight: 2,
      dictionary: 'test.xml',
      threshold: 1,
      collation: 'http://marklogic.com/collation/codepoint'
    })
  .threshold({ above: 1, label: 'Possible Match', action: 'notify' })
  .threshold({ above: 3, label: 'Definitive Match', action: 'merge' });

myDblMetaphoneOptions = JSON.stringify(myDblMetaphoneOptions);

describe('DblMetaphone Test', function () {

  before((done) => {
    client.mlClient.documents.write(docs)
    .result((res) => {
      return client.matchOptions.write('match-options', myDblMetaphoneOptions);
    })
    .then((res) => {
      done();
    })
  });

  it('should run a match with a dblMetaphone option', () => {
    return client.match.run({
      uri: '/doc1.json',
      optionsName: 'match-options'
    })
    .then((result) => {
      console.log(result);
    })
  });

  after((done) => {
    client.mlClient.documents.remove(docs.map((doc) => {return doc.uri}))
    .result((res) => {
      return client.matchOptions.remove('match-options');
    })
    .then((res) => {
      return client.mlClient.documents.removeAll({collection: 'mdm-dictionary'});
    })
    .then((res) => {
      done();
    })
  });

});
