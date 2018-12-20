const request = require('request');

/**
 * Provides functions to manage notifications.
 * @namespace notifications
 */
function Notifications(client) {
  if (!(this instanceof Notifications)) {
    return new Notifications(client);
  }
  this.client = client;
  this.uriPrefix = client.uriPrefix;
}

/**
 * Lists all notifications.
 * @method notifications#list
 * @param {Object} options Notification options
 * @param {number} [options.start] Starting index of notifications,
 * defaults to 1
 * @param {number} [options.pageLength] Number of notifications to
 * return; defaults to 10.
 * @param {Object} [options.extracts] Object of names/QNames
 * pairs specifying values to extract from the notifictions,
 * for example: `{ "firstName": "PersonFirstName" }`
 * @returns {Promise} Notifications
 */
Notifications.prototype.list = function listNotifications(options = {}) {
  return new Promise((resolve, reject) => {
    let params = [];
    if (options.start) params.push('rs:start=' + options.start);
    if (options.pageLength) params.push('rs:pageLength=' + options.pageLength);
    let opts = {
      uri: this.uriPrefix + '/v1/resources/sm-notifications?' + params.join('&'),
      auth: this.client.auth
    }
    if (!options.extracts) {
      opts.method = 'GET';
    } else {
      opts.method = 'POST';
      opts.json = true;
      opts.body = options.extracts;
    }
    request(opts, (err, res) => {
      if (err) reject(err);
      resolve(res);
    })
  });
}

/**
 * Removes a notification.
 * @method notifications#remove
 * @param {string} uri URI of the notification
 * @returns {Promise} TBD
 */
Notifications.prototype.remove = function removeNotification(uri) {
  return new Promise((resolve, reject) => {
    let opts = {
      method: 'DELETE',
      uri: this.uriPrefix + '/v1/resources/sm-notifications?rs:uri=' + uri,
      auth: this.client.auth
    };
    request(opts, (err, res) => {
      if (err) reject(err);
      resolve(res);
    })
  });
}

/**
 * Updates the status of notifications.
 * @method notifications#update
 * @param {Array.string} uris Array of notification URIs to update
 * @param {string} status Status of "read" or "unread"
 * @returns {Promise} TBD
 */
Notifications.prototype.update = function updateNotifications(uris, status) {
  return new Promise((resolve, reject) => {
    let body = {
      uris: uris,
      status: status
    }
    let opts = {
      method: 'PUT',
      uri: this.uriPrefix + '/v1/resources/sm-notifications',
      json: true,
      body: body,
      auth: this.client.auth
    };
    request(opts, (err, res) => {
      if (err) reject(err);
      resolve(res);
    })
  });
}

module.exports = Notifications;
