const chai = require('chai'),
      sm = require('../lib/sm');

const assert = chai.assert;

let mergeOptions;

describe('Merge Builder', () => {

  beforeEach(() => {
    mergeOptions = sm.createMergeOptions();
  });

  it('should define a timestamp', () => {
    mergeOptions.timestamp('/a/path/to/the/timestamp');
    assert.deepEqual(mergeOptions.options.algorithms.stdAlgorithm.timestamp,
      { path: '/a/path/to/the/timestamp' });
  });

  it('should define a source weight merge option', () => {
    let sw1 = mergeOptions.sourceWeight('bar', 10);
    let sw2 = mergeOptions.sourceWeight('baz', 20);
    mergeOptions.merge({
      propertyName: 'foo',
      sourceWeights: [sw1, sw2],
      maxValues: 1
    });
    assert.deepEqual(mergeOptions.options.propertyDefs.properties[0],
      { namespace: '', localname: 'foo', name: 'foo' });
    assert.deepEqual(mergeOptions.options.merging[0],
      { propertyName: 'foo',
        sourceWeights: [
          { source: { name: 'bar', weight: 10 } },
          { source: { name: 'baz', weight: 20 } }
        ],
        maxValues: 1 });
  });

  it('should define a length merge option', () => {
    mergeOptions.merge({
      propertyName: 'foo',
      length: 10,
      maxSources: 1
    });
    assert.deepEqual(mergeOptions.options.propertyDefs.properties[0],
      { namespace: '', localname: 'foo', name: 'foo' });
    assert.deepEqual(mergeOptions.options.merging[0],
      { propertyName: 'foo', length: { weight: 10 }, maxSources: 1 });
  });

  it('should define a default merge option with a length and source weight', () => {
    let sw1 = mergeOptions.sourceWeight('bar', 10);
    mergeOptions.merge({
      default: true,
      sourceWeights: [sw1],
      length: 10
    });
    assert.empty(mergeOptions.options.propertyDefs.properties);
    assert.deepEqual(mergeOptions.options.merging[0],
      { default: true, length: { weight: 10 },
        sourceWeights: [ { source: { name: 'bar', weight: 10 } } ]});
  });

  it('should define and use a merge strategy', () => {
    mergeOptions.strategy({
      name: 'test',
      length: 10
    });
    assert.empty(mergeOptions.options.propertyDefs.properties);
    assert.deepEqual(mergeOptions.options.mergeStrategies[0],
      { length: { weight: 10 }, name: 'test' });
    mergeOptions.merge({
      propertyName: 'foo',
      strategy: 'test'
    });
    assert.deepEqual(mergeOptions.options.propertyDefs.properties[0],
      { namespace: '', localname: 'foo', name: 'foo' });
    assert.deepEqual(mergeOptions.options.merging[0],
      { propertyName: 'foo', strategy: 'test' });
  });

});
