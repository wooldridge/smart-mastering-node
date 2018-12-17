const config = require('../config'),
      request = require('request');

const uriPrefix = 'http://' + config.host + ':' + config.server.port;

/**
 * Provides functions to manage entity services information.
 * @namespace entityServices
 */
function EntityServices(options = {}) {
  if (!(this instanceof EntityServices)) {
    return new EntityServices(options);
  }
}

/**
 * Lists entity services descriptors.
 * @method entityServices#list
 * @returns {Promise} TBD
 */
EntityServices.prototype.list = function listEntityServices() {
  return new Promise((resolve, reject) => {
    var options = {
      method: 'GET',
      uri: uriPrefix + '/v1/resources/sm-entity-services',
      auth: config.auth
    };
    request(options, (err, res) => {
      if (err) reject(err);
      resolve(res);
    })
  });
}

module.exports = new EntityServices();
