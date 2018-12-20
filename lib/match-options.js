const request = require('request');

function isJSON(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

/**
 * Provides functions to manage match options.
 * @namespace matchOptions
 */
function MatchOptions(client) {
  if (!(this instanceof MatchOptions)) {
    return new MatchOptions(client);
  }
  this.client = client;
  this.uriPrefix = client.uriPrefix;
}

/**
 * Lists all match options.
 * @method matchOptions#list
 * @returns {Promise} Match options names as an array
 */
MatchOptions.prototype.list = function listOptions() {
  return new Promise((resolve, reject) => {
    let opts = {
      method: 'GET',
      uri: this.uriPrefix + '/v1/resources/sm-match-option-names',
      json: true,
      auth: this.client.auth
    };
    request(opts, (err, res) => {
      if (err) reject(err);
      resolve(res.body);
    })
  });
}

/**
 * Reads match options.
 * @method matchOptions#read
 * @param {string} name A name for the match options
 * @returns {Promise} Object of match options
 */
MatchOptions.prototype.read = function readOptions(name) {
  return new Promise((resolve, reject) => {
    let opts = {
      method: 'GET',
      uri: this.uriPrefix + '/v1/resources/sm-match-options?rs:name=' + name,
      json: true,
      auth: this.client.auth
    };
    request(opts, (err, res) => {
      if (err) reject(err);
      resolve(res.body);
    })
  });
}

/**
 * Removes match options.
 * @method matchOptions#remove
 * @param {string} name A name for the match options
 * @returns {Promise} True if removed, false otherwise
 */
MatchOptions.prototype.remove = function removeOptions(name) {
  return new Promise((resolve, reject) => {
    let uri =
      '/com.marklogic.smart-mastering/options/algorithms/'+ name + '.xml';
    this.client.mlClient.documents.remove(uri)
    .result((res) => {
      resolve(res.removed);
    });
  });
}

/**
 * Writes match options.
 * @method matchOptions#write
 * @param {string} name A name for the match options
 * @param {string} matchOptions Match options as a JSON or XML string
 * @returns {Promise} An HTTP response message
 */
MatchOptions.prototype.write = function writeOptions(name, matchOptions) {
  return new Promise((resolve, reject) => {
    let contentType = isJSON(matchOptions) ?
      'application/json' : 'application/xml';
    let options = {
      method: 'PUT',
      uri: this.uriPrefix + '/v1/resources/sm-match-options?rs:name=' + name,
      headers: {
        'Content-type': contentType
      },
      body: matchOptions,
      auth: this.client.auth
    };
    request(options, (err, res) => {
      if (err) reject(err);
      resolve(res);
    })
  });
}

module.exports = MatchOptions;
