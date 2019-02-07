const chai = require('chai'),
      sm = require('../lib/sm'),
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
  { 'prop1': 'foo', 'prop2': 'bar', 'prop3': 'bla' },
  // /doc3.json
  { 'prop1': 'foo', 'prop2': 'ble', 'prop3': 'bla' },
  // /doc4.json
  { 'prop1': 'blo', 'prop2': 'ble', 'prop3': 'bla' },
]);

let optionsJSON = sm.createMatchOptions()
  .exact({ propertyName: 'prop1', weight: 4 })
  .exact({ propertyName: 'prop2', weight: 2 })
  .exact({ propertyName: 'prop3', weight: 1 })
  .threshold({ above: 1, label: 'Possible Match' })
  .threshold({ above: 3, label: 'Likely Match', action: 'notify' })
  .threshold({ above: 5, label: 'Definitive Match', action: 'merge' });

let optionsXML = `<options xmlns="http://marklogic.com/smart-mastering/matcher">
  <property-defs>
    <property namespace="" localname="prop1" name="prop1"/>
    <property namespace="" localname="prop2" name="prop2"/>
    <property namespace="" localname="prop3" name="prop3"/>
  </property-defs>
  <algorithms>
  </algorithms>
  <scoring>
    <add property-name="prop1" weight="4"/>
    <add property-name="prop2" weight="2"/>
    <add property-name="prop3" weight="1"/>
  </scoring>
  <thresholds>
    <threshold above="1" label="Possible Match"/>
    <threshold above="3" label="Likely Match" action="notify"/>
    <threshold above="5" label="Definitive Match" action="merge"/>
  </thresholds>
  <tuning>
    <max-scan>200</max-scan>
  </tuning>
</options>`;

describe('Match', () => {

  before((done) => {
    client.mlClient.documents.removeAll({collection: 'mdm-content'})
    .result((res) => {
      return client.mlClient.documents.write(testDocs);
    })
    .then((res) => {
      return client.matchOptions.write('matching-options-json', JSON.stringify(optionsJSON));
    })
    .then((res) => {
      done();
    });
  });

  after((done) => {
    client.mlClient.documents.remove(testDocs.map((doc) => {return doc.uri}))
    .result((res) => {
      return client.matchOptions.remove('matching-options-json');
    })
    .then((res) => {
      done();
    });
  });

  it('should be run with document and options refs', () => {
    let opts = {
      uri: '/doc1.json',
      optionsName: 'matching-options-json'
    }
    return client.match.run(opts)
    .then((res) => {
      assert.isNotEmpty(res);
      assert.equal(res.length, 2);
      assert.equal(res[0].uri, '/doc2.json');
    })
  });

  it('should be run with document content and options ref', () => {
    let opts = {
      document: JSON.stringify(testDocs[3].content),
      optionsName: 'matching-options-json'
    }
    return client.match.run(opts)
    .then((res) => {
      assert.isNotEmpty(res);
      assert.equal(res.length, 3);
      assert.equal(res[0].uri, '/doc4.json');
    })
  });

  it('should be run with document ref and options content', () => {
    let opts = {
      uri: '/doc1.json',
      matchOptions: JSON.stringify(optionsJSON)
    }
    return client.match.run(opts)
    .then((res) => {
      assert.isNotEmpty(res);
      assert.equal(res.length, 2);
      assert.equal(res[0].uri, '/doc2.json');
    })
  });

  it('should be run with page info', () => {
    let opts = {
      uri: '/doc1.json',
      optionsName: 'matching-options-json',
      start: 2,
      pageLength: 1
    }
    return client.match.run(opts)
    .then((res) => {
      assert.isNotEmpty(res);
      assert.equal(res.length, 1);
      assert.equal(res[0].uri, '/doc3.json');
    })
  });

  it('should be run with matches included', () => {
    let opts = {
      uri: '/doc1.json',
      optionsName: 'matching-options-json',
      includeMatches: true
    }
    return client.match.run(opts)
    .then((res) => {
      assert.isNotEmpty(res);
      assert.isNotEmpty(res[0].matches);
    })
  });

  it('should error when no document', () => {
    let opts = {
      optionsName: 'matching-options-json'
    }
    assert.throw(function() { client.match.run(opts) });
  });

  it('should error when no options', () => {
    let opts = {
      uri: '/doc1.json'
    }
    assert.throw(function() { client.match.run(opts) });
  });

  it('should error when document content is not JSON', () => {
    let opts = {
      document: '<xml>foo</xml>',
      optionsName: 'matching-options-json'
    }
    assert.throw(function() { client.match.run(opts) });
  });

  it('should error when options content is not JSON', () => {
    let opts = {
      uri: '/doc1.json',
      matchOptions: '<xml>foo</xml>'
    }
    assert.throw(function() { client.match.run(opts) });
  });

});
