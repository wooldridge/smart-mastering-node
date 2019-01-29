const sm = require('../lib/sm'),
      testUtils = require('../test/test-utils');

// Run example as a Mocha test: mocha match-test.js

// 1. SET UP SMART MASTERING NODE CLIENT
let client = sm.createClient({
  host: 'localhost',
  port: 8800,
  database: 'minimal-smart-mastering-content',
  modules: 'minimal-smart-mastering-modules',
  server: 'minimal-smart-mastering',
  user: 'admin',
  password: 'admin'
});

// 2. CREATE SAMPLE DOCUMENTS TO BE LOADED
let props = [
  // /doc1.json
  { 'fname': 'Richard', 'mname': 'M', 'lname': 'Logic', 'addr': '1 Main St.' },
  // /doc2.json
  { 'fname': 'Richard', 'mname': '', 'lname': 'Logic', 'addr': '1 Main St.' },
  // /doc3.json
  { 'fname': 'Ricardo', 'mname': '', 'lname': 'Logic', 'addr': '1 Main St.' },
  // /doc4.json
  { 'fname': 'Mary', 'mname': 'Beth', 'lname': 'Jones', 'addr': '2 Elm St.' }
];

let docs = testUtils.createDocuments(props);

// 3. BUILD MATCH OPTIONS
let myMatchOptions = sm.createMatchOptions()
  .exact({ propertyName: 'fname', weight: 4 })
  .exact({ propertyName: 'mname', weight: 1 })
  .exact({ propertyName: 'lname', weight: 2 })
  .exact({ propertyName: 'addr', weight: 1 })
  .threshold({ above: 2, label: 'Possible Match', action: 'notify' })
  .threshold({ above: 5, label: 'Definitive Match', action: 'merge' });

myMatchOptions = JSON.stringify(myMatchOptions);

describe('Match Test', function () {

  // Write sample docs
  before((done) => {
    client.mlClient.documents.write(docs)
    .result((res) => {
      done();
    });
  });

  // 4. RUN A MATCH
  it('should run a Smart Mastering match', () => {
    return client.match.run({
      uri: '/doc1.json',
      matchOptions: myMatchOptions
    })
    .then((result) => {
      // 5. REVIEW THE RESULTS
      console.log(result);
    })
  });

  // Remove sample docs
  after((done) => {
    client.mlClient.documents.remove(docs.map((doc) => {return doc.uri}))
    .result((res) => {
      done();
    });
  });

});
