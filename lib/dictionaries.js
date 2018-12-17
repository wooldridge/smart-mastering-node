const config = require('../config'),
      request = require('request');

const uriPrefix = 'http://' + config.host + ':' + config.server.port;

/**
 * Provides functions to manage dictionaries.
 * @namespace dictionaries
 */
function Dictionaries(options = {}) {
  if (!(this instanceof Dictionaries)) {
    return new Dictionaries(options);
  }
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
      uri: uriPrefix + '/v1/resources/sm-merge-option-names',
      auth: config.auth
    };
    request(options, (err, res) => {
      if (err) reject(err);
      resolve(res);
    })
  });
}

module.exports = new Dictionaries();
