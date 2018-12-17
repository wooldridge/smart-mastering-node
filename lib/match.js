const config = require('../config'),
      request = require('request');

const uriPrefix = 'http://' + config.host + ':' + config.server.port;

/**
 * Provides functions to match documents.
 * @namespace match
 */
function Match(options = {}) {
  if (!(this instanceof Match)) {
    return new Match(options);
  }
}

/**
 * Identifies matches for a document.
 * @method match#run
 * @param {Object} options Match options
 * @param {string} options.uri URI of the document
 * @param {string} options.optionsName Name of match options
 * @param {number} [options.start] Starting index of matches, defaults to 1
 * @param {number} [options.pageLength] Number of potential matches to
 * return; if not provided, the matching options’ max-scan value will be
 * used. If there is no max-scan value, defaults to 20.
 * @param {string} [options.includeMatches] Whether to include, for each
 * potential match, the list of properties that were good matches.
 * Defaults to false.
 * @param {string} [options.document] Document content. An alternative to
 * specifying a URI.
 * @param {string} [options.matchOptions] Match options. An alternative to
 * specifying a match options name.
 * @returns {Promise} Potential matches as a JSON array of objects
 */
Match.prototype.run = function runMatch(options) {
  if (!options.uri && !options.document) {
    throw new Error('must specify URI or content of document to match');
  }
  if (!options.optionsName && !options.matchOptions) {
    throw new Error('must include match options or specify by name');
  }
  let body = {};
  if (options.document) body.document = options.document;
  if (options.matchOptions) body.options = options.matchOptions;
  return new Promise((resolve, reject) => {
    let params = [];
    if (options.uri) params.push('rs:uri=' + options.uri);
    if (options.optionsName) params.push('rs:options=' + options.optionsName);
    if (options.start) params.push('rs:start=' + options.start);
    if (options.pageLength) params.push('rs:pageLength=' + options.pageLength);
    if (options.includeMatches) params.push('rs:includeMatches=' + options.includeMatches);
    let opts = {
      method: 'POST',
      uri: uriPrefix + '/v1/resources/sm-match?' + params.join('&'),
      json: true,
      body: body,
      auth: config.auth
    };
    request(opts, (err, res) => {
      if (err) reject(err);
      resolve(res);
    })
  });
}

module.exports = new Match();
