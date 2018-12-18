const request = require('request');

/**
 * Provides functions to manage dictionaries.
 * @namespace dictionaries
 */
function Dictionaries(client) {
  if (!(this instanceof Dictionaries)) {
    return new Dictionaries(client);
  }
  this.client = client;
  this.uriPrefix = client.uriPrefix;
}

/**
 * Lists all dictionaries.
 * @method dictionaries#list
 * @returns {Promise} Dictionaries
 */
Dictionaries.prototype.list = function listNotifications(options = {}) {
  return new Promise((resolve, reject) => {
    var options = {
      method: 'GET',
      uri: this.uriPrefix + '/v1/resources/sm-dictionaries',
      auth: this.client.auth
    };
    request(options, (err, res) => {
      if (err) reject(err);
      resolve(JSON.parse(res.body));
    })
  });
}

module.exports = Dictionaries;
