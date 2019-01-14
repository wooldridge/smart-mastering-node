const chai = require('chai'),
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

describe('Notifications', () => {

  before((done) => {
    // Create notifications
    done();
  });

  xit('should be listed', () => {
    return client.notifications.list()
    .then((res) => {
      // TODO
    })
  });

  xit('should be listed using extracts', () => {
    let opts = {
      extracts: { "firstName": "PersonFirstName" }
    }
    return client.notifications.list(opts)
    .then((res) => {
      // TODO
    })
  });

  xit('should be listed using paging', () => {
    let opts = {
      start: 2,
      pageLength: 2
    }
    return client.notifications.list(opts)
    .then((res) => {
      // TODO
    })
  });

  xit('should be removed', () => {
    return client.notifications.remove('notif1')
    .then((res) => {
      // TODO
    })
  });

  xit('should be updated', () => {
    return client.notifications.remove(['notif2'], 'unread')
    .then((res) => {
      // TODO
    })
  });

});
