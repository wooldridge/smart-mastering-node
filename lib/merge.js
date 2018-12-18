const request = require('request');

/**
 * Provides functions to merge documents.
 * @namespace merge
 */
function Merge(client) {
  if (!(this instanceof Merge)) {
    return new Merge(client);
  }
  this.client = client;
  this.uriPrefix = client.uriPrefix;
}

/**
 * Performs merging of documents.
 * @method merge#run
 * @param {Object} options Merge options
 * @param {Array.string} options.uris URIs of the documents to merge
 * @param {string} options.optionsName Name of merge options
 * @param {boolean} [options.preview] If true, return the merged document
 * but do not persist it to the database. Defaults to false
 * @param {string} [options.mergeOptions] Merge options. An alternative to
 * specifying a match options name.
 * @returns {Promise} TBD
 */
Merge.prototype.run = function runMerge(options) {
  if (!options.optionsName && !options.mergeOptions) {
    throw new Error('must include merge options or specify by name');
  }
  let body = {};
  if (options.mergeOptions) body = options.matchOptions;
  return new Promise((resolve, reject) => {
    let params = [];
    if (options.uris) {
      options.uris.forEach((uri) => {
        params.push('rs:uri=' + uri);
      });
    }
    if (options.optionsName) params.push('rs:options=' + options.optionsName);
    if (options.preview) params.push('rs:preview=' + options.preview);
    let opts = {
      method: 'POST',
      uri: this.uriPrefix + '/v1/resources/sm-merge?' + params.join('&'),
      json: true,
      body: body,
      auth: this.client.auth
    };
    request(opts, (err, res) => {
      if (err) reject(err);
      resolve(res);
    })
  });
}

/**
 * Restores merged documents.
 * @method merge#restore
 * @param {string} uri URI of the merged document
 * @param {true} retainAuditTrail If true, the merged document
 * will be moved to an archive collection; if false, the merged
 * document will be deleted. Defaults to true.
 * @returns {Promise} TBD
 */
Merge.prototype.restore = function restoreMerge(uri, retainAuditTrail) {
  return new Promise((resolve, reject) => {
    let opts = {
      method: 'DELETE',
      uri: this.uriPrefix + '/v1/resources/sm-merge?rs:uri=' + uri + 'rs:retainAuditTrail=' + retainAuditTrail,
      auth: this.client.auth
    };
    request(opts, (err, res) => {
      if (err) reject(err);
      resolve(res);
    })
  });
}

module.exports = Merge;
