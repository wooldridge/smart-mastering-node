const marklogic      = require('marklogic')
      request        = require('request'),
      Dictionaries   = require('./dictionaries'),
      EntityServices = require('./entity-services'),
      History        = require('./history'),
      Match          = require('./match'),
      Merge          = require('./merge'),
      MatchBlocks    = require('./match-blocks'),
      MatchMerge     = require('./match-merge'),
      MatchOptions   = require('./match-options'),
      MergeOptions   = require('./merge-options'),
      Notifications  = require('./notifications');
      Thesauri       = require('./thesauri');

/**
 * Provides functions to manage mastering.
 * @namespace mastering
 */

/**
 * A client object configured to match, merge, and perform other
 * mastering operations as a user. The client object is
 * created by the {@link mastering.createClient} function.
 * @namespace SmartMasteringClient
 */

/**
 * Creates a client to execute mastering tasks such as matches, merges,
 * and creation of options.
 * @function mastering#createClient
 * @param {Object} inputParams Connection parameters for Smart Mastering
 * @param {string} [inputParams.host=localhost] Host with the mastering REST server
 * @param {number} [inputParams.port=8800] Port for the REST server
 * @param {string} [inputParams.database=minimal-smart-mastering-content] Name of the content database
 * @param {string} [inputParams.modules=minimal-smart-mastering-modules] Name of the modules database
 * @param {string} [inputParams.server=minimal-smart-mastering] Name of the modules database
 * @param {string} inputParams.user User with permission to executing mastering tasks
 * @param {string} inputParams.password Password for the user
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
  this.uriPrefix = 'http://' + connectionParams.host +
    ':' + connectionParams.port;

  this.mlClient = marklogic.createDatabaseClient({
    host: connectionParams.host,
    port: connectionParams.port,
    user: connectionParams.user,
    password: connectionParams.password
  });

  this.matchOptions   = MatchOptions(this);
  this.mergeOptions   = MergeOptions(this);
  this.match          = Match(this);
  this.merge          = Merge(this);
  this.matchBlocks    = MatchBlocks(this);
  this.notifications  = Notifications(this);
  this.matchMerge     = MatchMerge(this);
  this.history        = History(this);
  this.dictionaries   = Dictionaries(this);
  this.entityServices = EntityServices(this);
  this.thesauri       = Thesauri(this);
}

/**
 * Read statistics about a mastering project.
 * @method SmartMasteringClient#readStats
 * @returns {Promise} Object of mastering statistics
 */
SmartMasteringClient.prototype.readStats = function readMasteringStats() {
  return new Promise((resolve, reject) => {
    var options = {
      method: 'GET',
      uri: this.uriPrefix + '/v1/resources/mastering-stats',
      json: true,
      auth: this.auth
    };
    request(options, (err, res) => {
      if (err) reject(err);
      resolve(res.body);
    })
  });
}

module.exports = {
    createClient: SmartMasteringClient
};

