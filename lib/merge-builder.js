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
  // TODO below throws error on merge when included
  // this.options.tripleMerge = {};
}

function addPropertyDef(propertyName, that) {
  if (!that.options.propertyDefs.properties.some(function (prop) {
    prop.propertyName === propertyName;
  })) {
    that.options.propertyDefs.properties.push({
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
 * Adds a merge definition to the merge options.
 * @method
 * @memberof mergeBuilder#
 * @param {Object} options Options for the merge definition
 * @param {string} [options.propertyName] Name of the property. If set,
 * then the default setting cannot be true.
 * @param {boolean} [options.default] If true, defines the default behavior
 * and propertyName should not be set.
 * @param {string} [options.algorithmRef] Name of the algorithm. The default
 * is "standard".
 * @param {number} [options.maxValues] Maximum number of property values
 * to include. The default is 99.
 * @param {number} [options.maxSources] Maximum number of sources to consider.
 * @param {Array.SourceWeight} [options.sourceWeights] Array of objects
 * defining the sources and their weights.
 * @param {number} [options.length] A weight that determines the influence of
 * the property value's length.
 * @param {string} [options.strategy] The name of the merge strategy to use
 * as a shortcut for other option values.
 * @returns {mergeBuilder.BuiltOptions} Built merge options
 */
MergeBuilder.prototype.merge = function mergeMatch(options) {
  if (!options) {
    throw new Error('An options object is required.');
  } else if (!options.propertyName && (!options.default || (options.default !== true)) ) {
    throw new Error('A propertyName is required or default must be true.');
  }
  let opts = this.mergeHelper(options, false);
  this.options.merging.push(opts);
  return this;
}

/**
 * Adds a merge strategy to the merge options.
 * @method
 * @memberof mergeBuilder#
 * @param {Object} options Options for the merge strategy
 * @param {string} options.name Name of the strategy.
 * @param {string} [options.algorithmRef] Name of the algorithm. The default
 * is "standard".
 * @param {number} [options.maxValues] Maximum number of property values
 * to include. The default is 99.
 * @param {number} [options.maxSources] Maximum number of sources to consider.
 * @param {Array.SourceWeight} [options.sourceWeights] Array of objects
 * defining the sources and their weights returned from mergeBuilder#sourceWeight.
 * @param {number} [options.length] A weight that determines the influence of
 * the property value's length.
 * @returns {mergeBuilder.BuiltOptions} Built merge options
 */
MergeBuilder.prototype.strategy = function strategyMatch(options) {
  if (!options) {
    throw new Error('An options object is required.');
  } else if (!options.name) {
    throw new Error('A strategy name is required.');
  }
  let opts = this.mergeHelper(options, true);
  opts.name = options.name;
  this.options.mergeStrategies.push(opts);
  return this;
}

/**
 * Defines a source and its weight.
 * @method
 * @memberof mergeBuilder#
 * @param {string} source Name of the source
 * @param {number} weight Weight value
 * @returns {mergeBuilder.SourceWeight} Object that defines the source
 * merge option
 */
MergeBuilder.prototype.sourceWeight = function sourceWeightMatch(source, weight) {
  if (!source) {
    throw new Error('A source name is required.');
  } else if (!weight) {
    throw new Error('A weight is required.');
  } else {
    return {
      source: {
        name: source,
        weight: weight
      }
    };
  }
}

/**
 * Helper function for building a merge definition.
 * @ignore
 * @param {Object} options Options for defining a merge
 * @returns {mergeBuilder.SourceWeight} Object of merge options
 */
MergeBuilder.prototype.mergeHelper = function mergeHelperMatch(options) {
  if (options.propertyName) {
    addPropertyDef(options.propertyName, this);
  }
  let opts = {};
  ['propertyName', 'default', 'algorithmRef', 'maxValues', 'maxSources',
   'strategy'].forEach((opt) => {
    if (options[opt]) opts[opt] = options[opt];
  })
  if (options.sourceWeights) {
    opts.sourceWeights = [];
    options.sourceWeights.forEach((sw) => {
      opts.sourceWeights.push(sw);
    })
  }
  if (options.length) {
    opts.length = { weight: options.length};
  }
  return opts;
}

module.exports = MergeBuilder;
