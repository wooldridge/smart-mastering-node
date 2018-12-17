const config = require('../config'),
      chai = require('chai'),
      marklogic = require('marklogic'),
      notifications = require('../lib/notifications'),
      fs = require('fs');

const assert = chai.assert;

const db = marklogic.createDatabaseClient({
  host: config.host,
  user: config.auth.user,
  password: config.auth.pass,
  port: config.server.port
});

before((done) => {
  // Create notifications
  done();
});

describe('Notifications', () => {
  xit('should be listed', () => {
    return notifications.list()
    .then((res) => {
      // TODO
    })
  });
  xit('should be listed using extracts', () => {
    let opts = {
      extracts: { "firstName": "PersonFirstName" }
    }
    return notifications.list(opts)
    .then((res) => {
      // TODO
    })
  });
  xit('should be listed using paging', () => {
    let opts = {
      start: 2,
      pageLength: 2
    }
    return notifications.list(opts)
    .then((res) => {
      // TODO
    })
  });
  xit('should be removed', () => {
    return notifications.remove('notif1')
    .then((res) => {
      // TODO
    })
  });
  xit('should be updated', () => {
    return notifications.remove(['notif2'], 'unread')
    .then((res) => {
      // TODO
    })
  });
});
