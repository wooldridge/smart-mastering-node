const chai = require('chai'),
      moment = require('moment'),
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

let props = [['foo1', 'bar1'],['foo2', 'bar2']];

let docs = props.map(function(p, i) {
  let content = {
    envelope: {
      instance: {
        test: {
            prop1: p[0],
            prop2: p[1],
            prop3: p[2]
        },
        info: { title: 'test', version: '0.0.1' }
      },
      headers: {
        id: i,
        sources: [
          {
            name: 'source' + (i + 1),
            dateTime: moment().add(i, 'days').format(),
            user: "mdm-admin"
          }
      ]
      },
      triples: [],
      attachments: {
        test: {
            prop1: p[0],
            prop2: p[1],
            prop3: p[2]
        }
      }
    }
  };
  return {
    uri: '/merge-doc' + (i+1) + '.json',
    collections: ['mdm-content', 'source' + (i + 1)],
    content: content
  };
});

let optionsJSON = {
  options: {
    propertyDefs: {
      properties: [
        { namespace: "", localname: "prop1", name: "prop1" },
        { namespace: "", localname: "prop2", name: "prop2" }
      ]
    },
    merging: [
      {
        propertyName: "prop1",
        maxValues: "1",
        sourceWeights: [
          { source: { name: "source1", weight: "10" } },
          { source: { name: "source2", weight: "100" } }
        ]
      },
      {
        propertyName: "prop2",
        maxValues: "1",
        sourceWeights: [
          { source: { name: "source1", weight: "100" } },
          { source: { name: "source2", weight: "10" } }
        ]
      }
    ]
  }
};
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
    client.mlClient.documents.write(docs)
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
    client.mlClient.documents.remove(['/merge-doc1.json', '/merge-doc2.json'])
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
      uris: ['/merge-doc1.json', '/merge-doc2.json'],
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

  xit('should be run with options content JSON previewed', () => {
    let options = {
      uris: ['/merge-doc1.json', '/merge-doc2.json'],
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
      uris: ['/merge-doc1.json', '/merge-doc2.json'],
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
      uris: ['/merge-doc1.json', '/merge-doc2.json'],
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
