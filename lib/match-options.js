const config = require('../config'),
      request = require('request'),
      marklogic = require('marklogic');

const uriPrefix = 'http://' + config.host + ':' + config.server.port;

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
  this.mlClient = marklogic.createDatabaseClient({
    host: client.connectionParams.host,
    port: client.connectionParams.port,
    user: client.connectionParams.user,
    password: client.connectionParams.password
  });
}

/**
 * Lists all match options.
 * @method matchOptions#list
 * @returns {Promise} Match options names as a JSON array
 */
MatchOptions.prototype.list = function listOptions() {
  return new Promise((resolve, reject) => {
    var options = {
      method: 'GET',
      uri: uriPrefix + '/v1/resources/sm-match-option-names',
      auth: config.auth
    };
    request(options, (err, res) => {
      if (err) reject(err);
      resolve(res);
    })
  });
}

/**
 * Reads match options.
 * @method matchOptions#read
 * @param {string} name A name for the match options
 * @returns {Promise} A match options as a JSON string
 */
MatchOptions.prototype.read = function readOptions(name) {
  return new Promise((resolve, reject) => {
    var options = {
      method: 'GET',
      uri: uriPrefix + '/v1/resources/sm-match-options?rs:name=' + name,
      auth: config.auth
    };
    request(options, (err, res) => {
      if (err) reject(err);
      resolve(res);
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
    this.mlClient.documents.remove(uri)
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
      uri: uriPrefix + '/v1/resources/sm-match-options?rs:name=' + name,
      headers: {
        'Content-type': contentType
      },
      body: matchOptions,
      auth: config.auth
    };
    request(options, (err, res) => {
      if (err) reject(err);
      resolve(res);
    })
  });
}

module.exports = MatchOptions;
