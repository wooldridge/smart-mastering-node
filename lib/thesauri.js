const request = require('request');

/**
 * Provides functions to manage thesauri.
 * @namespace thesauri
 */
function Thesauri(client) {
  if (!(this instanceof Thesauri)) {
    return new Thesauri(client);
  }
  this.client = client;
  this.uriPrefix = client.uriPrefix;
}

/**
 * Lists all thesauri.
 * @method thesauri#list
 * @returns {Promise} Object with dictionary information
 */
Thesauri.prototype.list = function listThesauri() {
  return new Promise((resolve, reject) => {
    var options = {
      method: 'GET',
      uri: this.uriPrefix + '/v1/resources/sm-thesauri',
      json: true,
      auth: this.client.auth
    };
    request(options, (err, res) => {
      if (err) reject(err);
      resolve(res.body);
    })
  });
}

/**
 * Remove a thesaurus from the content database.
 * @method thesauri#remove
 * @param {string} name Name of the thesaurus. Example:
 * "first-name-thesaurus.xml"
 * @returns {Promise} TBD
 */
Thesauri.prototype.remove = function writeThesaurus(name) {
  return new Promise((resolve, reject) => {
    let uri = '/mdm/config/thesauri/'+ name;
    this.client.mlClient.documents.remove(uri)
    .result((res) => {
      resolve(res);
    });
  });
}

/**
 * Write a thesaurus to the content database.
 * @method thesauri#write
 * @param {string} name Name of the thesaurus. Example:
 * "first-name-thesaurus.xml"
 * @param {string} thesaurus Thesaurus content as a JSON or XML string
 * @returns {Promise} Object with information about the thesaurus
 */
Thesauri.prototype.write = function writeThesaurus(name, thesaurus) {
  return new Promise((resolve, reject) => {
    this.client.mlClient.documents.write({
      uri: '/mdm/config/thesauri/'+ name,
      content: thesaurus,
      collections: ['mdm-thesauri', 'mdm-configuration']
    })
    .result((res) => {
      resolve(res);
    });
  });
}

module.exports = Thesauri;
