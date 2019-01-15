/**
 * Provides functions to create merge options.
 * @namespace mergeBuilder
 */
function MergeBuilder() {
  if (!(this instanceof MergeBuilder)) {
    return new MergeBuilder();
  }
  this.options = {};
  this.options.matchOptions = '';
  this.options.propertyDefs = {};
  this.options.propertyDefs.properties = [];
  this.options.propertyDefs.namespaces = [];
  this.options.algorithms = {};
  this.options.algorithms.stdAlgorithm = {};
  this.options.algorithms.stdAlgorithm.namespaces = {};
  this.options.algorithms.stdAlgorithm.timestamp = {};
  this.options.algorithms.custom = [];
  this.options.algorithms.collections = {};
  this.options.algorithms.collections.onMerge = {};
  this.options.algorithms.collections.onArchive = {};
  this.options.algorithms.collections.onNoMatch = {};
  this.options.algorithms.collections.onNotification = {};
  this.options.mergeStrategies = [];
  this.options.merging = [];
  this.options.tripleMerge = {};
}

function addPropertyDef(propertyName, that) {
  if (!that.options.propertyDefs.property.some(function (prop) {
    prop.propertyName === propertyName;
  })) {
    that.options.propertyDefs.property.push({
      namespace: '',
      localname: propertyName,
      name: propertyName
    })
  }
}

/**
 * Sets the path to a timestamp value for sorting.
 * @method
 * @memberof mergeBuilder#
 * @param {string} path Path to the timestamp property
 * @param {Object} [namespaces] Namespace definitions for the path.
 * The prefix/URI values for the namespaces as key/value pairs.
 * @returns {mergeBuilder.BuiltOptions} Built merge options
 */
MergeBuilder.prototype.timestamp = function timestampMerge(path, namespaces) {
  if (!path) {
    throw new Error('A path is required.');
  }
  this.options.algorithms.stdAlgorithm.timestamp.path = path;
  if (namespaces) {
    this.options.algorithms.stdAlgorithm.namespaces = namespaces;
  }
  return this;
}

/**
 * Adds weight to a property based on source of document.
 * @method
 * @memberof mergeBuilder#
 * @param {Object} options Options for the source weighting
 * @param {string} options.propertyName Name of the property
 * @param {Array.SourceWeight} options.sourceWeights Array of objects
 * defining the sources and their weights.
 * @param {number} [options.maxValues] Maximum number of property values
 * to include.
 * @returns {mergeBuilder.BuiltOptions} Built merge options
 */
MatchBuilder.prototype.source = function sourceMatch(options) {
  let required = ['propertyName', 'sourceWeights'];
  required.forEach((req) => {
    if (!options[req]) {
      throw new Error('A ' + req + ' option is required.');
    }
  })
  addPropertyDef(options.propertyName, this);
  let opts = {
    propertyName: options.propertyName,
    sourceWeights: options.sourceWeights
  };
  if (options.maxValues) opts.maxValues = options.maxValues;
  this.options.merging.push(opts);
  return this;
}

/**
 * Option for defining a source and its weight for the
 * the {@link mergeBuilder#source} function.
 * @typedef {object} mergeBuilder.SourceWeight
 */
/**
 * Defines a source and its weight. Used with {@link mergeBuilder#source}.
 * @method
 * @memberof mergeBuilder#
 * @param {string} source Name of the source
 * @param {number} weight Weight value
 * @returns {mergeBuilder.SourceWeight} Option for defining the source
 * merge option
 */
MatchBuilder.prototype.sourceWeight = function sourceWeightMatch(source, weight) {
  if (!source) {
    throw new Error('A source name is required.');
  } else if (!weight) {
    throw new Error('A weight is required.');
  } else {
    return {
      name: source,
      weight: weight
    };
  }
}

/**
 * Adds weight to a property based on length of value.
 * @method
 * @memberof mergeBuilder#
 * @param {Object} options Options for the length weighting
 * @param {string} options.propertyName Name of the property
 * @param {number} options.weight A weight value
 * @param {number} [options.maxValues] Maximum number of property values
 * to include.
 * @returns {mergeBuilder.BuiltOptions} Built merge options
 */
MatchBuilder.prototype.length = function lengthMatch(options) {
  let required = ['propertyName', 'weight'];
  required.forEach((req) => {
    if (!options[req]) {
      throw new Error('A ' + req + ' option is required.');
    }
  })
  addPropertyDef(options.propertyName, this);
  let opts = {
    propertyName: options.propertyName,
    length: { weight: options.weight }
  };
  if (options.maxValues) opts.maxValues = options.maxValues;
  this.options.merging.push(opts);
  return this;
}

module.exports = MatchBuilder;
