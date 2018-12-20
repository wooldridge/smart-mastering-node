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
 * Provides functions to match documents.
 * @namespace match
 */
function Match(client) {
  if (!(this instanceof Match)) {
    return new Match(client);
  }
  this.client = client;
  this.uriPrefix = client.uriPrefix;
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
 * @param {string} [options.document] Document content as JSON. An
 * alternative to specifying a URI. XML not supported.
 * @param {string} [options.matchOptions] Match options as JSON. An
 * alternative to specifying a match options name. XML not supported.
 * @returns {Promise} Potential matches as an array of objects
 */
Match.prototype.run = function runMatch(options) {
  if (!options.uri && !options.document) {
    throw new Error('must specify document URI or document content');
  }
  if (!options.optionsName && !options.matchOptions) {
    throw new Error('must specify match options name or match options content');
  }
  let body = {};
  if (options.document) {
    if (isJSON(options.document)) {
      // wrap in document prop and convert back to string
      body.document = JSON.parse(options.document);
      body = JSON.stringify(body);
    } else {
      throw new Error('document content must be valid JSON');
    }
  } else if (options.matchOptions) {
    if (isJSON(options.matchOptions)) {
      body = options.matchOptions;
    } else {
      throw new Error('options content must be valid JSON');
    }
  } else {
    body = '';
  }
  return new Promise((resolve, reject) => {
    let params = [];
    if (options.uri) params.push('rs:uri=' + options.uri);
    if (options.optionsName) params.push('rs:options=' + options.optionsName);
    if (options.start) params.push('rs:start=' + options.start);
    if (options.pageLength) params.push('rs:pageLength=' + options.pageLength);
    if (options.includeMatches) params.push('rs:includeMatches=' + options.includeMatches);
    let opts = {
      method: 'POST',
      uri: this.uriPrefix + '/v1/resources/sm-match?' + params.join('&'),
      headers: {
        'Content-type': 'application/json'
      },
      body: body,
      auth: this.client.auth
    };
    request(opts, (err, res) => {
      if (err) reject(err);
      resolve(JSON.parse(res.body).results.result);
    })
  });
}

module.exports = Match;
