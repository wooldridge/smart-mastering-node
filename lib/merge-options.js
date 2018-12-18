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
 * Provides functions to manage merge options.
 * @namespace mergeOptions
 */
function MergeOptions(client) {
  if (!(this instanceof MergeOptions)) {
    return new MergeOptions(client);
  }
  this.mlClient = marklogic.createDatabaseClient({
    host: client.connectionParams.host,
    port: client.connectionParams.port,
    user: client.connectionParams.user,
    password: client.connectionParams.password
  });
}

/**
 * Lists all merge options.
 * @method mergeOptions#list
 * @returns {Promise} Merge options names as a JSON array
 */
MergeOptions.prototype.list = function listOptions() {
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

/**
 * Reads merge options.
 * @method mergeOptions#read
 * @param {string} name A name for the merge options
 * @returns {Promise} A merge options as a JSON string
 */
MergeOptions.prototype.read = function readOptions(name) {
  return new Promise((resolve, reject) => {
    var options = {
      method: 'GET',
      uri: uriPrefix + '/v1/resources/sm-merge-options?rs:name=' + name,
      auth: config.auth
    };
    request(options, (err, res) => {
      if (err) reject(err);
      resolve(res);
    })
  });
}

/**
 * Removes merge options.
 * @method mergeOptions#remove
 * @param {string} name A name for the merge options
 * @returns {Promise} True if removed, false otherwise
 */
MergeOptions.prototype.remove = function removeOptions(name) {
  return new Promise((resolve, reject) => {
    let uri =
      '/com.marklogic.smart-mastering/options/merging/'+ name + '.xml';
    this.mlClient.documents.remove(uri)
    .result((res) => {
      resolve(res.removed);
    });
  });
}

/**
 * Writes merge options.
 * @method mergeOptions#write
 * @param {string} name A name for the merge options
 * @param {string} mergeOptions Merge options as a JSON or XML string
 * @returns {Promise} An HTTP response message
 */
MergeOptions.prototype.write = function writeOptions(name, mergeOptions) {
  return new Promise((resolve, reject) => {
    let contentType = isJSON(mergeOptions) ?
      'application/json' : 'application/xml';
    let options = {
      method: 'PUT',
      uri: uriPrefix + '/v1/resources/sm-merge-options?rs:name=' + name,
      headers: {
        'Content-type': contentType
      },
      body: mergeOptions,
      auth: config.auth
    };
    request(options, (err, res) => {
      if (err) reject(err);
      resolve(res);
    })
  });
}

module.exports = MergeOptions;
