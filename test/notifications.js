const chai = require('chai'),
      moment = require('moment'),
      parseXML = require('xml2js').parseString,
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

let props = [['foo', 'bar', 'baz'], ['foo', 'blo', 'blu'],
             ['faa', 'bor', 'boz'], ['faa', 'ble', 'bla']];

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
            name: '/test/source' + ((i % 2) + 1) +
              '/doc' + (i+1) + '.json',
            dateTime: moment().add(i, 'days').format(),
            user: "mdm-rest-admin"
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
    uri: '/doc' + (i+1) + '.json',
    collections: ['mdm-content', 'source' + (i + 1)],
    content: content
  };
});

let optionsMatch = {
  options: {
    dataFormat: "json",
    propertyDefs: {
      property: [
        { namespace: "", localname: "prop1", name: "prop1" },
        { namespace: "", localname: "prop2", name: "prop2" },
        { namespace: "", localname: "prop3", name: "prop3" }
      ]
    },
    algorithms: {},
    scoring: {
      add: [
        { propertyName: "prop1", weight: "4" },
        { propertyName: "prop2", weight: "2" },
        { propertyName: "prop3", weight: "1" }
      ],
      expand: [],
      reduce: []
    },
    actions: {},
    thresholds: {
      threshold: [
        { above: "1", label: "Possible Match" },
        { above: "3", label: "Likely Match", action: "notify" },
        { above: "5", label: "Definitive Match", action: "merge" }
      ]
    },
    tuning: { maxScan: "200" }
  }
}
optionsMatch = JSON.stringify(optionsMatch);

let optionsMerge = {
  options: {
    matchOptions: "match-options",
    propertyDefs: {
      properties: [
        { namespace: "", localname: "prop1", name: "prop1" },
        { namespace: "", localname: "prop3", name: "prop3" }
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
        propertyName: "prop3",
        maxValues: "1",
        sourceWeights: [
          { source: { name: "source1", weight: "10" } },
          { source: { name: "source2", weight: "100" } }
        ]
      }
    ]
  }
};
optionsMerge = JSON.stringify(optionsMerge);

let notificationURI = '';

describe('Notifications', () => {

  before((done) => {
    client.matchOptions.write('match-options', optionsMatch)
    .then((res) => {
      return client.mergeOptions.write('merge-options', optionsMerge);
    })
    .then((res) => {
      return client.mlClient.documents.write(docs);
    })
    .then((res) => {
      done();
    });
  });

  after((done) => {
    client.matchOptions.remove('match-options')
    .then((res) => {
      return client.mergeOptions.remove('merge-options');
    })
    .then((res) => {
      return client.mlClient.documents.removeAll({collection: 'mdm-content'});
    })
    .then((res) => {
      return client.mlClient.documents.removeAll({collection: 'mdm-notification'});
    })
    .then((res) => {
      done();
    });
  });

  it('should be created', (done) => {
    let options = {
      uris: ['/doc1.json', '/doc2.json', '/doc3.json', '/doc4.json'],
      optionsName: 'merge-options'
    };
    client.matchMerge.run(options)
    .then((res) => {
      // TODO test multipart response
      done();
      // TODO the below works for a response with 1 notification
      // parseXML(res, function (err, result) {
      //   assert.property(result, 'sm:notification');
      //   done();
      // })
    });
  });

  it('should be listed', () => {
    return client.notifications.list()
    .then((res) => {
      assert.property(res, 'notifications');
      assert.equal(res.total, 2);
      // For later updating and removal
      notificationURIs = res.notifications.map((notif) => {
        return notif.meta.uri;
      });
    })
  });

  it('should be listed using extracts', () => {
    let opts = {
      extracts: { "prop": "prop1" }
    }
    return client.notifications.list(opts)
    .then((res) => {
      assert.property(res, 'notifications');
      assert.equal(res.total, 2);
      assert.equal(res.notifications.length, 2);
      assert.property(res.notifications[0], 'uris');
      assert.property(res.notifications[0], 'extractions');
      // TODO extraction values appear incorrect ('foofoo')
    })
  });

  it('should be listed using paging', () => {
    let opts = {
      start: 2,
      pageLength: 1
    }
    return client.notifications.list(opts)
    .then((res) => {
      assert.property(res, 'notifications');
      assert.equal(res.total, 2);
      // only returns 1 due to paging
      assert.equal(res.notifications.length, 1);
    })
  });

  it('should have status updated', () => {
    return client.notifications.update([notificationURIs], 'read')
    .then((res) => {
      assert.isEmpty(res);
    })
  });

  it('should have updated status', () => {
    return client.notifications.list()
    .then((res) => {
      assert.equal(res.notifications[0].meta.status, 'read');
    })
  });

  it('should be removed', () => {
    return client.notifications.remove(notificationURIs[0])
    .then((res) => {
      assert.isEmpty(res);
    })
  });

  it('should not be listed after removal', () => {
    return client.notifications.list()
    .then((res) => {
      assert.property(res, 'notifications');
      // total has decreased from 2 to 1
      assert.equal(res.total, 1);
    })
  });

});
