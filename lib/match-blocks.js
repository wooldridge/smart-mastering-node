const config = require('../config'),
      request = require('request');

const uriPrefix = 'http://' + config.host + ':' + config.server.port;

/**
 * Provides functions to manage match blocks.
 * @namespace matchBlocks
 */
function MatchBlocks(options = {}) {
  if (!(this instanceof MatchBlocks)) {
    return new MatchBlocks(options);
  }
}

/**
 * Reads match blocks for a document.
 * @method matchBlocks#read
 * @param {string} uri URI for the document
 * @returns {Promise} URIs of the documents to which the
 * document has a block as a JSON array
 */
MatchBlocks.prototype.read = function readBlocks(name) {
  return new Promise((resolve, reject) => {
    var options = {
      method: 'GET',
      uri: uriPrefix + '/v1/resources/sm-block-match?rs:uri=' + name,
      auth: config.auth
    };
    request(options, (err, res) => {
      if (err) reject(err);
      resolve(res);
    })
  });
}

/**
 * Removes a match block between two documents.
 * @method matchBlocks#remove
 * @param {string} uri1 URI of the first document
 * @param {string} uri2 URI of the second document
 * @returns {Promise} True if removed, false otherwise
 */
MatchBlocks.prototype.remove = function removeBlock(uri1, uri2) {
  return new Promise((resolve, reject) => {
    var options = {
      method: 'DELETE',
      uri: uriPrefix + '/v1/resources/sm-block-match?rs:uri1=' + uri1 + '&rs:uri2=' + uri2,
      auth: config.auth
    };
    request(options, (err, res) => {
      if (err) reject(err);
      resolve(res);
    })
  });
}

/**
 * Writes a match block between two documents.
 * @method matchBlocks#write
 * @param {string} uri1 URI of the first document
 * @param {string} uri2 URI of the second document
 * @returns {Promise} An HTTP response message
 */
MatchBlocks.prototype.write = function writeBlock(uri1, uri2) {
  return new Promise((resolve, reject) => {
    var options = {
      method: 'POST',
      uri: uriPrefix + '/v1/resources/sm-block-match?rs:uri1=' + uri1 + '&rs:uri2=' + uri2,
      json: true,
      body: {},
      auth: config.auth
    };
    request(options, (err, res) => {
      if (err) reject(err);
      resolve(res);
    })
  });
}

module.exports = new MatchBlocks();
