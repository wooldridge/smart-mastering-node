const request = require('request');

/**
 * Provides functions to manage entity services information.
 * @namespace entityServices
 */
function EntityServices(client) {
  if (!(this instanceof EntityServices)) {
    return new EntityServices(client);
  }
  this.client = client;
  this.uriPrefix = client.uriPrefix;
}

/**
 * Lists entity services descriptors.
 * @method entityServices#list
 * @returns {Promise} TBD
 */
EntityServices.prototype.list = function listEntityServices() {
  return new Promise((resolve, reject) => {
    let opts = {
      method: 'GET',
      uri: this.uriPrefix + '/v1/resources/sm-entity-services',
      auth: this.client.auth
    };
    request(opts, (err, res) => {
      if (err) reject(err);
      resolve(res);
    })
  });
}

module.exports = EntityServices;
