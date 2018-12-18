const chai = require('chai'),
      sm = require('../lib/sm'),
      mergeOptions = require('../lib/merge-options'),
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

let testOptionsJSON = `
{
  "options": {
    "merging": [
      {
        "propertyName": "some-property",
        "sourceWeights": [
          { "source": { "name": "foo", "weight": "2" } }
        ]
      },
      {
        "propertyName": "foo",
        "maxValues": "1",
        "length": { "weight": "8" }
      }
    ]
  }
}
`;

let testOptionsXML = `
<options xmlns="http://marklogic.com/smart-mastering/merging">
  <merging xmlns="http://marklogic.com/smart-mastering/merging">
    <merge property-name="some-property" max-values="1">
      <source-weights>
        <source name="foo" weight="2"/>
      </source-weights>
    </merge>
    <merge property-name="foo" max-values="1">
      <length weight="8" />
    </merge>
  </merging>
</options>
`;

describe('Merge Options', () => {
  it('should be written to database as JSON', () => {
    return client.mergeOptions.write('merge-options-json', testOptionsJSON)
    .then((res) => {
      assert.equal(res.statusCode, 204);
    })
  });
  it('should be written to database as XML', () => {
    return client.mergeOptions.write('merge-options-xml', testOptionsXML)
    .then((res) => {
      assert.equal(res.statusCode, 204);
    })
  });
  it('should be read from the database', () => {
    return client.mergeOptions.read('merge-options-xml')
    .then((res) => {
      let opts;
      if (res.body) {
        // options written as XML come back as JSON
        opts = JSON.parse(res.body);
      }
      assert.isOk(res.body);
      assert.isOk(opts.options);
    });
  });
  it('should be listed from the database', () => {
    return client.mergeOptions.list()
    .then((res) => {
      let opts;
      if (res.body) {
        opts = JSON.parse(res.body);
      }
      assert.isOk(res.body);
      assert.equal(opts[0], 'merge-options-json');
    });
  });
  it('should be removed from the database JSON', () => {
    return client.mergeOptions.remove('merge-options-json')
    .then((res) => {
      assert.equal(res, true);
    });
  });
  it('should be removed from the database XML', () => {
    return client.mergeOptions.remove('merge-options-xml')
    .then((res) => {
      assert.equal(res, true);
    });
  });
});
