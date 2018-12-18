const request = require('request');

/**
 * Provides functions to merge documents.
 * @namespace matchMerge
 */
function MatchMerge(client) {
  if (!(this instanceof MatchMerge)) {
    return new MatchMerge(client);
  }
  this.client = client;
  this.uriPrefix = client.uriPrefix;
}

/**
 * Performs matching and merging of documents in one transaction.
 * @method matchMerge#run
 * @param {Object} options Match and merge options
 * @param {Array.string} options.uris URIs of the documents to match and merge
 * @param {string} options.collectorName Local name of a function that will
 * return a list of URIs
 * @param {string} options.collectorNs Namespace of the collector function.
 * Skip this for JavaScript
 * @param {string} options.collectorAt URI in the modules database of a
 * library module that holds the collector function.
 * @param {string} options.optionsName Name of the merge options that
 * control how the document properties are combined.
 * @param {string} [options.query] Serialized query to filter the set documents
 * eligible for matching.
 * @returns {Promise} TBD
 */
MatchMerge.prototype.run = function runMatchMerge(options) {
  if (!options.uris && !options.collectorName) {
    throw new Error('A set of URIs or a collector is required.');
  }
  return new Promise((resolve, reject) => {
    let params = [];
    if (options.uris) {
      options.uris.forEach((uri) => {
        params.push('rs:uri=' + uri);
      });
    }
    if (options.collectorName) params.push('rs:collector-name=' + options.collectorName);
    if (options.collectorNs) params.push('rs:collector-ns=' + options.collectorNs);
    if (options.collectorAt) params.push('rs:collector-at=' + options.collectorAt);
    if (options.optionsName) params.push('rs:options=' + options.optionsName);
    if (options.query) params.push('rs:query=' + options.query);
    let opts = {
      method: 'POST',
      uri: this.uriPrefix + '/v1/resources/sm-match-and-merge?' + params.join('&'),
      json: true,
      body: '',
      auth: this.client.auth
    };
    request(opts, (err, res) => {
      if (err) reject(err);
      resolve(res);
    })
  });
}

module.exports = MatchMerge;
