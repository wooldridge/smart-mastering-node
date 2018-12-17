const MatchOptions = require('./match-options'),
      MergeOptions = require('./merge-options'),
      Match = require('./match'),
      MatchBlocks = require('./match-blocks'),
      Notifications = require('./notifications'),
      MatchMerge = require('./match-merge'),
      History = require('./history'),
      Dictionaries = require('./dictionaries'),
      EntityServices = require('./entity-services');

/**
 * Provides functions to manage mastering.
 * @namespace mastering
 */

/**
 * Read statistic about mastering data.
 * @method mastering#readStats
 * @returns {Promise} TBD
 */
function readStats() {
  return new Promise((resolve, reject) => {
    var options = {
      method: 'GET',
      uri: uriPrefix + '/v1/resources/mastering-stats',
      auth: config.auth
    };
    request(options, (err, res) => {
      if (err) reject(err);
      resolve(res);
    })
  });
}

module.exports = {
    matchOptions: MatchOptions,
    mergeOptions: MergeOptions,
    match: Match,
    matchBlocks: MatchBlocks,
    notifications: Notifications,
    matchMerge: MatchMerge,
    history: History,
    dictionaries: Dictionaries,
    entityServices: EntityServices,
    readStats: readStats
};

