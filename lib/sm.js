const marklogic      = require('marklogic'),
      Dictionaries   = require('./dictionaries'),
      EntityServices = require('./entity-services'),
      History        = require('./history'),
      Match          = require('./match'),
      MatchBlocks    = require('./match-blocks'),
      MatchMerge     = require('./match-merge'),
      MatchOptions   = require('./match-options'),
      MergeOptions   = require('./merge-options'),
      Notifications  = require('./notifications');

/**
 * Provides functions to manage mastering.
 * @namespace mastering
 */

/**
 * Creates a client to execute mastering tasks such as matches, merges,
 * and creation of options.
 * @function mastering#createClient
 * @param {string} [host=localhost] Host with the mastering REST server
 * @param {number} [port=8800] Port for the REST server
 * @param {string} [database=minimal-smart-mastering-content] Name of the content database
 * @param {string} [modules=minimal-smart-mastering-modules] Name of the modules database
 * @param {string} [server=minimal-smart-mastering] Name of the modules database
 * @param {string} user User with permission to executing mastering tasks
 * @param {string} password Password for the user
 * @returns {Object} Client for executing mastering tasks as the user
 */
function SmartMasteringClient(inputParams) {
  if (!(this instanceof SmartMasteringClient)) {
    return new SmartMasteringClient(inputParams);
  }

  if (inputParams == null) {
    throw new Error('no connection parameters');
  }

  let connectionParams = {};
  var keys = ['host', 'port', 'database', 'modules',
    'server', 'user', 'password'];
  for (var i=0; i < keys.length; i++) {
    var key = keys[i];
    var value = inputParams[key];
    if (value != null) {
      connectionParams[key] = value;
    } else if (key === 'host') {
      connectionParams.host = 'localhost';
    } else if (key === 'port') {
      connectionParams.port = 8800;
    } else if (key === 'database') {
      connectionParams.database = 'minimal-smart-mastering-content';
    } else if (key === 'modules') {
      connectionParams.modules = 'minimal-smart-mastering-modules';
    } else if (key === 'server') {
      connectionParams.server = 'minimal-smart-mastering';
    }
  }

  if (connectionParams.user == null || connectionParams.password == null) {
    throw new Error('cannot create client without user or password for '+
      connectionParams.host +' host and '+
      connectionParams.port +' port'
      );
  }

  this.connectionParams = connectionParams;
  // convenience for request REST calls
  this.auth = {
    "user": connectionParams.user,
    "pass": connectionParams.password,
    "sendImmediately": false
  };

  this.mlClient = marklogic.createDatabaseClient({
    host: connectionParams.host,
    port: connectionParams.port,
    user: connectionParams.user,
    password: connectionParams.password
  });

  this.matchOptions   = MatchOptions(this);
  this.mergeOptions   = MergeOptions(this);
  // this.match          = Match(this);
  this.matchBlocks    = MatchBlocks(this);
  // this.notifications  = Notifications(this);
  // this.matchMerge     = MatchMerge(this);
  // this.history        = History(this);
  // this.dictionaries   = Dictionaries(this);
  // this.entityServices = EntityServices(this);
}

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
    createClient: SmartMasteringClient,
    //matchOptions: MatchOptions,
    //mergeOptions: MergeOptions,
    match: Match,
    //matchBlocks: MatchBlocks,
    notifications: Notifications,
    matchMerge: MatchMerge,
    history: History,
    dictionaries: Dictionaries,
    entityServices: EntityServices,
    readStats: readStats
};

