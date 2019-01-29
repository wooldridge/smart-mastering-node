/**
 * Provides functions to create match options.
 * @namespace matchBuilder
 */
function MatchBuilder() {
  if (!(this instanceof MatchBuilder)) {
    return new MatchBuilder();
  }
  this.options = { dataFormat: "json" };
  this.options.propertyDefs = {};
  this.options.propertyDefs.property = [];
  this.options.algorithms = {};
  this.options.algorithms.algorithm = [];
  this.options.collections = {};
  this.options.collections.content = [];
  this.options.scoring = {};
  this.options.scoring.add = [];
  this.options.scoring.expand = [];
  this.options.scoring.reduce = [];
  this.options.actions = {};
  this.options.actions.action = {};
  this.options.thresholds = {};
  this.options.thresholds.threshold = [];
  this.options.tuning = {};
}

function addPropertyDef(propertyName, that) {
  let exists = that.options.propertyDefs.property.some(function (prop) {
    return prop.name === propertyName;
  });
  if (!exists) {
    that.options.propertyDefs.property.push({
      namespace: '',
      localname: propertyName,
      name: propertyName
    })
  }
}

/**
 * Adds weight based on an exact match of property values.
 * @method matchBuilder#exact
 * @param {Object} options Options for the add scoring option
 * @param {string} options.propertyName Name of the property
 * @param {number} options.weight Weight to add
 * @returns {matchBuilder.BuiltOptions} Built match options
 */
MatchBuilder.prototype.exact = function exactMatch(options) {
  if (!options.propertyName) {
    throw new Error('A property name is required.');
  } else if (!options.weight) {
    throw new Error('A weight is required.');
  }
  addPropertyDef(options.propertyName, this);
  let opts = {
    propertyName: options.propertyName,
    weight: options.weight
  };
  this.options.scoring.add.push(opts);
  return this;
}

/**
 * Adds weight based on a match from a thesaurus synonym lookup.
 * @method matchBuilder#thesaurus
 * @param {Object} options Options for the thesaurus scoring
 * @param {string} options.propertyName Name of the property
 * @param {number} options.weight Weight to add
 * @param {string} options.thesaurus URI of thesaurus
 * @param {string} [options.filter] Optional filter, see
 * https://docs.marklogic.com/thsr:expand
 * @returns {matchBuilder.BuiltOptions} Built match options
 */
MatchBuilder.prototype.thesaurus = function thesaurusMatch(options) {
  let required = ['propertyName', 'weight', 'thesaurus'];
  required.forEach((req) => {
    if (!options[req]) {
      throw new Error('A ' + req + ' option is required.');
    }
  })
  addPropertyDef(options.propertyName, this);
  // Add algorithm reference
  if (!this.options.algorithms.algorithm.some(function (alg) {
    alg.function === 'thesaurus';
  })) {
    this.options.algorithms.algorithm.push({
      name: 'thesaurus',
      namespace: 'http://marklogic.com/smart-mastering/algorithms',
      function: 'thesaurus',
      at: '/com.marklogic.smart-mastering/algorithms/thesaurus.xqy'
    })
  }
  let opts = {
    algorithmRef: 'thesaurus',
    propertyName: options.propertyName,
    weight: options.weight,
    thesaurus: options.thesaurus
  };
  if (options.filter) opts.filter = options.filter;
  this.options.scoring.expand.push(opts);
  return this;
}

/**
 * Adds weight based on double-metaphone string similarity. This is
 * determined from a dictionary generated from current content in
 * the database. There must be a range index on the associated property.
 * @method matchBuilder#dblMetaphone
 * @param {Object} options Options for the string similarity scoring
 * @param {string} options.propertyName Name of the property
 * @param {number} options.weight Weight to add
 * @param {string} options.dictionary URI of dictionary
 * @param {string} options.threshold Similarity distance threshold
 * @param {string} options.collation Collation of the range index
 * @returns {matchBuilder.BuiltOptions} Built match options
 */
MatchBuilder.prototype.dblMetaphone = function dblMetaphoneMatch(options) {
  let required = ['propertyName', 'weight', 'dictionary',
    'threshold', 'collation'];
  required.forEach((req) => {
    if (!options[req]) {
      throw new Error('A ' + req + ' option is required.');
    }
  })
  addPropertyDef(options.propertyName, this);
  // Add algorithm reference
  if (!this.options.algorithms.algorithm.some(function (alg) {
    alg.function === 'double-metaphone';
  })) {
    this.options.algorithms.algorithm.push({
      name: 'dbl-metaphone',
      namespace: 'http://marklogic.com/smart-mastering/algorithms',
      function: 'double-metaphone',
      at: '/com.marklogic.smart-mastering/algorithms/double-metaphone.xqy'
    })
  }
  let opts = {
    algorithmRef: 'dbl-metaphone',
    propertyName: options.propertyName,
    weight: options.weight,
    dictionary: options.dictionary,
    distanceThreshold: options.threshold,
    collation: options.collation
  };
  this.options.scoring.expand.push(opts);
  return this;
}

/**
 * Adjusts weight based on a zip code comparison. It works in conjunction
 * with an existing {@link matchBuilder#exact} definition for the zip code.
 * @method matchBuilder#zip
 * @param {Object} options Options for the zip code scoring
 * @param {string} options.propertyName Name of the property
 * @param {number} options.weight5 For a 5-digit zip code, the weight to add
 * if it shares the first 5 digits of a 9-digit zip code.
 * @param {string} options.weight9 For a 9-digit zip code, the weight to assign
 * if it shares the first 5 digits of a 5-digit zip code.
 * @returns {matchBuilder.BuiltOptions} Built match options
 */
MatchBuilder.prototype.zip = function zipMatch(options) {
  let required = ['propertyName', 'weight5', 'weight9'];
  required.forEach((req) => {
    if (!options[req]) {
      throw new Error('A ' + req + ' option is required.');
    }
  })
  addPropertyDef(options.propertyName, this);
  // Add algorithm reference
  if (!this.options.algorithms.algorithm.some(function (alg) {
    alg.function === 'zip-match';
  })) {
    this.options.algorithms.algorithm.push({
      name: 'zip-code',
      namespace: 'http://marklogic.com/smart-mastering/algorithms',
      function: 'zip-match',
      at: '/com.marklogic.smart-mastering/algorithms/zip.xqy'
    })
  }
  let opts = {
    algorithmRef: 'zip-code',
    propertyName: options.propertyName,
    zip: [
      { origin: 5, weight: options.weight5 },
      { origin: 9, weight: options.weight9 }
    ]
  };
  this.options.scoring.expand.push(opts);
  return this;
}

/**
 * Reduces weight based on exact property matches in a document.
 * @method matchBuilder#reduce
 * @param {Object} options Options for the reduction
 * @param {Array.string} options.propertyNames An array of property
 * names that must all match.
 * @param {number} options.weight The weight reduction.
 * @returns {matchBuilder.BuiltOptions} Built match options
 */
MatchBuilder.prototype.reduce = function reduceMatch(options) {
  let required = ['propertyNames', 'weight'];
  required.forEach((req) => {
    if (!options[req]) {
      throw new Error('A ' + req + ' option is required.');
    }
  })
  addPropertyDef(options.propertyName, this);
  // Add algorithm reference
  if (!this.options.algorithms.algorithm.some(function (alg) {
    alg.function === 'zip-match';
  })) {
    this.options.algorithms.algorithm.push({
      name: 'std-reduce',
      function: 'standard-reduction'
    })
  }
  let opts = {
    algorithmRef: 'std-reduce',
    weight: options.weight,
    allMatch: {
      property: options.propertyNames
    }
  };
  this.options.scoring.reduce.push(opts);
  return this;
}

/**
 * Specifies collections to determine the scope of the dataset
 * being matched. If multiple collections are specified, the
 * dataset is restricted to an intersection of those collections.
 * @method matchBuilder#collections
 * @param {Array.string} names An array of collection names
 * @returns {matchBuilder.BuiltOptions} Built match options
 */
MatchBuilder.prototype.collections = function collectionsMatch(names) {
  if (!names) {
    throw new Error('A names value is required.');
  }
  this.options.collections.content = names;
  return this;
}

/**
 * Builds a threshold option that executes an action based on weight.
 * @method matchBuilder#threshold
 * @param {Object} options Options for the threshold
 * @param {number} options.above Weight value above which the action
 * is executed.
 * @param {string} options.label A description of the threshold.
 * @param {string} [options.action] Name of the action to execute.
 * @returns {matchBuilder.BuiltOptions} Built match options
 */
MatchBuilder.prototype.threshold = function thresholdMatch(options) {
  if (!options.above) {
    throw new Error('An above value is required.');
  } else if (!options.label) {
    throw new Error('A label is required.');
  }
  let opts = {
    above: options.above,
    label: options.label
  };
  if (options.action) opts.action = options.action;
  this.options.thresholds.threshold.push(opts);
  return this;
}

/**
 * Specifies the maximum number of potential matches to process.
 * @method matchBuilder#maxScan
 * @param {number} value The maximum number of potential matches.
 * @returns {matchBuilder.BuiltOptions} Built match options
 */
MatchBuilder.prototype.maxScan = function maxScanMatch(value) {
  if (!value) {
    throw new Error('A value parameter is required.');
  }
  this.options.tuning.maxScan = value;
  return this;
}

module.exports = MatchBuilder;
