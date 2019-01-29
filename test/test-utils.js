const request = require('request'),
      moment = require('moment');

/**
 * Provides utility functions for testing.
 * @ignore
 * @namespace testUtils
 */
function TestUtils() {
  if (!(this instanceof TestUtils)) {
    return new TestUtils();
  }
}

/**
 * Create documents in harmonized, enveloped format.
 * @ignore
 * @method testUtils#writeDocuments
 * @param {Object} props An object of name/value pairs
 * @returns {Object} An array of formatted objects
 */
TestUtils.prototype.createDocuments = function createDocumentsTest(props) {

  return props.map(function(p, i) {
    let content = {
      envelope: {
        instance: {
          test: p,
          info: { title: 'test', version: '0.0.1' }
        },
        headers: {
          id: i,
          sources: [
            {
              name: 'source' + (i + 1),
              dateTime: moment().add(i, 'days').format(),
              user: "mdm-admin"
            }
          ]
        },
        triples: [],
        attachments: {
          customer: p
        }
      }
    };
    return {
      uri: '/doc' + (i+1) + '.json',
      collections: ['mdm-content'],
      content: content
    };
  });

}

module.exports = TestUtils();
