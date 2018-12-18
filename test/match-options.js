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

let testOptionsJSON = `
{
  "options": {
    "dataFormat": "json",
    "propertyDefs": {
      "property": [
        { "namespace": "", "localname": "foo", "name": "foo" }
      ]
    },
    "algorithms": {},
    "scoring": {
      "add": [
        { "propertyName": "foo", "weight": "10" }
      ],
      "expand": [],
      "reduce": []
    },
    "actions": {},
    "thresholds": {
      "threshold": [
        { "above": "5", "label": "Definitive Match", "action": "merge" }
      ]
    },
    "tuning": { "maxScan": "200" }
  }
}
`;

let testOptionsXML = `
<options xmlns="http://marklogic.com/smart-mastering/matcher">
  <property-defs>
    <property namespace="" localname="bar" name="bar"/>
  </property-defs>
  <algorithms>
  </algorithms>
  <scoring>
    <add property-name="bar" weight="5"/>
  </scoring>
  <thresholds>
    <threshold above="10" label="Definitive Match" action="merge"/>
  </thresholds>
  <tuning>
    <max-scan>200</max-scan>
  </tuning>
</options>
`;

describe('Match Options', () => {
  it('should be written to database as JSON', () => {
    return client.matchOptions.write('match-options-json', testOptionsJSON)
    .then((res) => {
      assert.equal(res.statusCode, 204);
    })
  });
  it('should be written to database as XML', () => {
    return client.matchOptions.write('match-options-xml', testOptionsXML)
    .then((res) => {
      assert.equal(res.statusCode, 204);
    })
  });
  it('should be read from the database', () => {
    return client.matchOptions.read('match-options-xml')
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
    return client.matchOptions.list()
    .then((res) => {
      let opts;
      if (res.body) {
        opts = JSON.parse(res.body);
      }
      assert.isOk(res.body);
      assert.equal(opts[0], 'match-options-json');
    });
  });
  it('should be removed from the database JSON', () => {
    return client.matchOptions.remove('match-options-json')
    .then((res) => {
      assert.equal(res, true);
    });
  });
  it('should be removed from the database XML', () => {
    return client.matchOptions.remove('match-options-xml')
    .then((res) => {
      assert.equal(res, true);
    });
  });
});
