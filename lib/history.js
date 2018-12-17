const config = require('../config'),
      request = require('request');

const uriPrefix = 'http://' + config.host + ':' + config.server.port;

/**
 * Provides functions to view merge history.
 * @namespace history
 */
function History(options = {}) {
  if (!(this instanceof History)) {
    return new History(options);
  }
}

/**
 * Retrieve the merge history of a document.
 * @method history#read
 * @param {string} uri URI of a merged or source document
 * @returns {Promise} TBD
 */
History.prototype.read = function readHistory(uri) {
  return new Promise((resolve, reject) => {
    let opts = {
      method: 'GET',
      uri: uriPrefix + '/v1/resources/sm-history-document?rs:uri=' + uri,
      auth: config.auth
    };
    request(opts, (err, res) => {
      if (err) reject(err);
      resolve(res);
    })
  });
}

/**
 * Retrieve the merge history of the properties of a document.
 * @method history#readProps
 * @param {string} uri URI of a merged or source document
 * @param {Array.string} properties Property names. If none provided,
 * returns information for all available properties.
 * @returns {Promise} TBD
 */
History.prototype.readProps = function readPropsHistory(uri, properties = []) {
  return new Promise((resolve, reject) => {
    let params = [];
    if (options.properties) {
      options.properties.forEach((prop) => {
        params.push('rs:property=' + prop);
      });
    }
    let opts = {
      method: 'GET',
      uri: uriPrefix + '/v1/resources/sm-history-properties?rs:uri=' + uri + '&'  + params.join('&'),
      auth: config.auth
    };
    request(opts, (err, res) => {
      if (err) reject(err);
      resolve(res);
    })
  });
}

module.exports = new History();
