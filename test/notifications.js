const chai = require('chai'),
      moment = require('moment'),
      parseXML = require('xml2js').parseString,
      sm = require('../lib/sm'),
      fs = require('fs'),
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
  { 'prop1': 'foo', 'prop2': 'blo', 'prop3': 'blu' },
  // /doc3.json
  { 'prop1': 'faa', 'prop2': 'bor', 'prop3': 'boz' },
  // /doc4.json
  { 'prop1': 'faa', 'prop2': 'ble', 'prop3': 'bla' },
]);

let optionsMatch = sm.createMatchOptions()
  .exact({ propertyName: 'prop1', weight: 4 })
  .exact({ propertyName: 'prop2', weight: 2 })
  .exact({ propertyName: 'prop3', weight: 1 })
  .threshold({ above: 1, label: 'Possible Match' })
  .threshold({ above: 3, label: 'Likely Match', action: 'notify' })
  .threshold({ above: 5, label: 'Definitive Match', action: 'merge' });

optionsMatch = JSON.stringify(optionsMatch);

let optionsMerge = sm.createMergeOptions();
optionsMerge.matchOptions("match-options")
  .merge({
    propertyName: 'prop1',
    maxValues: 1,
    sourceWeights: [
      optionsMerge.sourceWeight("source1", 10),
      optionsMerge.sourceWeight("source2", 100),
    ] })
  .merge({
    propertyName: 'prop3',
    maxValues: 1,
    sourceWeights: [
      optionsMerge.sourceWeight("source1", 10),
      optionsMerge.sourceWeight("source2", 100),
    ] });

optionsMerge = JSON.stringify(optionsMerge);

let notificationURI = '';

describe('Notifications', () => {

  before((done) => {
    client.matchOptions.write('match-options', optionsMatch)
    .then((res) => {
      return client.mergeOptions.write('merge-options', optionsMerge);
    })
    .then((res) => {
      return client.mlClient.documents.write(testDocs);
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
