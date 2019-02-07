const chai = require('chai'),
      moment = require('moment'),
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
  { 'prop1': 'foo1', 'prop2': 'bar1' },
  // /doc2.json
  { 'prop1': 'foo2', 'prop2': 'bar2' }
]);

let optionsJSON = sm.createMergeOptions();
optionsJSON.merge({
    propertyName: 'prop1',
    maxValues: 1,
    sourceWeights: [
      optionsJSON.sourceWeight("source1", 10),
      optionsJSON.sourceWeight("source2", 100),
    ] })
  .merge({
    propertyName: 'prop2',
    maxValues: 1,
    sourceWeights: [
      optionsJSON.sourceWeight("source1", 100),
      optionsJSON.sourceWeight("source2", 10),
    ] });
optionsJSON = JSON.stringify(optionsJSON);

let optionsXML = `<?xml version="1.0" encoding="UTF-8"?>
<options xmlns="http://marklogic.com/smart-mastering/merging">
  <property-defs>
    <property namespace="" localname="prop1" name="prop1"/>
    <property namespace="" localname="prop2" name="prop2"/>
  </property-defs>
  <merging>
    <merge property-name="prop1" max-values="1">
      <source-weights>
        <source name="source1" weight="100"/>
        <source name="source2" weight="10"/>
      </source-weights>
    </merge>
    <merge property-name="prop2" max-values="1">
      <source-weights>
        <source name="source1" weight="10"/>
        <source name="source2" weight="100"/>
      </source-weights>
    </merge>
  </merging>
</options>
`;

let uriToRestore = '';

describe('Merge', () => {

  before((done) => {
    client.mlClient.documents.write(testDocs)
    .result((res) => {
      return client.mergeOptions.write('merging-options-json', optionsJSON);
    })
    .then((res) => {
      return client.mergeOptions.write('merging-options-xml', optionsXML);
    })
    .then((res) => {
      done();
    });
  });

  after((done) => {
    client.mlClient.documents.remove(['/doc1.json', '/doc2.json'])
    .result((res) => {
      return client.mergeOptions.remove('merging-options-json');
    })
    .then((res) => {
      return client.mergeOptions.remove('merging-options-xml');
    })
    .then((res) => {
      return client.mlClient.documents.removeAll({collection: 'mdm-auditing'});
    })
    .then((res) => {
      return client.mlClient.documents.removeAll({collection: 'mdm-merged'});
    })
    .then((res) => {
      done();
    });
  });

  it('should be run with options ref JSON previewed', () => {
    let options = {
      uris: ['/doc1.json', '/doc2.json'],
      optionsName: 'merging-options-json',
      preview: true
    }
    return client.merge.run(options)
    .then((res) => {
      let srcs = res.envelope.headers.sources;
      assert.equal(srcs[0].name, 'source1');
      let inst = res.envelope.instance;
      assert.equal(inst.test.prop1, 'foo2');
      assert.equal(inst.test.prop2, 'bar1');
    })
  });

  // TODO erroring with the following:
  // { errorResponse:
   // { statusCode: 500,
   //   status: 'Internal Server Error',
   //   messageCode: 'INTERNAL ERROR',
   //   message: 'XDMP-AS: (err:XPTY0004) $merge-options as item()? --
   //   Invalid coercion: (object-node{"options":object-node{"matchOptions":text{""},
   //   "propertyDefs":object-node{...}, ...}}, object-node{"matchOptions":text{""},
   //   "propertyDefs":object-node{"properties":array-node{...}, ...}, ...}) as item()? .
   //   See the MarkLogic server error log for further detail.' } }
  xit('should be run with options content JSON previewed', () => {
    let options = {
      uris: ['/doc1.json', '/doc2.json'],
      mergeOptions: optionsJSON,
      preview: true
    }
    return client.merge.run(options)
    .then((res) => {
      console.log(res);
      let srcs = res.envelope.headers.sources;
      assert.equal(srcs[0].name, 'source1');
      let inst = res.envelope.instance;
      assert.equal(inst.test.prop1, 'foo2');
      assert.equal(inst.test.prop2, 'bar1');
    })
  });

  it('should be run with options content XML previewed', () => {
    let options = {
      uris: ['/doc1.json', '/doc2.json'],
      mergeOptions: optionsXML,
      preview: true
    }
    return client.merge.run(options)
    .then((res) => {
      let srcs = res.envelope.headers.sources;
      assert.equal(srcs[0].name, 'source1');
      let inst = res.envelope.instance;
      assert.equal(inst.test.prop1, 'foo1');
      assert.equal(inst.test.prop2, 'bar2');
    })
  });

  it('should be run with options ref XML merged', () => {
    let options = {
      uris: ['/doc1.json', '/doc2.json'],
      optionsName: 'merging-options-xml',
      preview: false
    }
    return client.merge.run(options)
    .then((res) => {
      let srcs = res.envelope.headers.sources;
      assert.equal(srcs[0].name, 'source1');
      let inst = res.envelope.instance;
      assert.equal(inst.test.prop1, 'foo1');
      assert.equal(inst.test.prop2, 'bar2');
      uriToRestore = res.envelope.headers.id;
    })
  });

  // The following returns success but doesn't seem to do anything
  xit('should be restored', () => {
    return client.merge.restore(uriToRestore, false)
    .then((res) => {
      console.log(res);
    })
  });

});
