const config = require('../config'),
      request = require('request');

const uriPrefix = 'http://' + config.host + ':' + config.server.port;

/**
 * Provides functions to manage thesauri.
 * @namespace thesauri
 */
function Thesauri(options = {}) {
  if (!(this instanceof Thesauri)) {
    return new Thesauri(options);
  }
}

/**
 * Lists all thesauri.
 * @method thesauri#list
 * @returns {Promise} TBD
 */
Thesauri.prototype.list = function listThesauri() {
  return new Promise((resolve, reject) => {
    var options = {
      method: 'GET',
      uri: uriPrefix + '/v1/resources/sm-thesauri',
      auth: config.auth
    };
    request(options, (err, res) => {
      if (err) reject(err);
      resolve(res);
    })
  });
}

module.exports = new Thesauri();
