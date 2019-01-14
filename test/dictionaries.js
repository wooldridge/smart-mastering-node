const chai = require('chai'),
      sm = require('../lib/sm');

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

let dictOptions = `
{
  "options": {
    "dataFormat": "json",
    "propertyDefs": {
      "property": [{ "namespace": "", "localname": "foo", "name": "foo" }]
    },
    "algorithms": {
      "algorithm": [
        {
         "name": "dbl-metaphone",
         "namespace": "http://marklogic.com/smart-mastering/algorithms",
         "function": "double-metaphone",
         "at": "/com.marklogic.smart-mastering/algorithms/double-metaphone.xqy"
        }
      ]
    },
    "scoring": {
      "add": [],
      "expand": [
        {
         "propertyName": "foo",
         "algorithmRef": "dbl-metaphone",
         "weight": "2",
         "dictionary": "/mdm/config/dictionaries/foo-dict.xml",
         "distance-threshold": 20,
         "collation": "http://marklogic.com/collation/codepoint"
        }
      ]
    },
    "actions": {},
    "thresholds": {
      "threshold": []
    }
  }
}
`;

describe('Dictionaries', () => {

  before((done) => {
    client.matchOptions.write('options-with-dict', dictOptions)
    .then((res) => {
      done();
    });
  });

  after((done) => {
    client.mlClient.documents.remove([
      '/mdm/config/dictionaries/foo-dict.xml',
      '/com.marklogic.smart-mastering/options/algorithms/options-with-dict.xml'
    ])
    .result((res) => {
      done();
    });
  });

  it('should be listed', () => {
    return client.dictionaries.list()
    .then((res) => {
      assert.isOk(res['availableDictionaries']['/mdm/config/dictionaries/foo-dict.xml']);
    })
  });

});
