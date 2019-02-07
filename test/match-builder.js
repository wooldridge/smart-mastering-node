const chai = require('chai'),
      sm = require('../lib/sm');

const assert = chai.assert;

let matchOptions;

describe('Match Builder', () => {

  beforeEach(() => {
    matchOptions = sm.createMatchOptions();
  });

  it('should define an exact property match', () => {
    matchOptions.exact({
      propertyName: 'foo',
      weight: 10
    });
    assert.deepEqual(matchOptions.options.propertyDefs.property[0],
      { namespace: '', localname: 'foo', name: 'foo' });
    assert.deepEqual(matchOptions.options.scoring.add[0],
      { propertyName: 'foo', weight: 10 });
  });

  it('should define a thesaurus match', () => {
    matchOptions.thesaurus({
      propertyName: 'foo',
      weight: 10,
      thesaurus: 'test.xml'
    });
    assert.deepEqual(matchOptions.options.algorithms.algorithm[0],
      { name: 'thesaurus',
        namespace: 'http://marklogic.com/smart-mastering/algorithms',
        function: 'thesaurus',
        at: '/com.marklogic.smart-mastering/algorithms/thesaurus.xqy' });
    assert.deepEqual(matchOptions.options.scoring.expand[0],
      { algorithmRef: 'thesaurus',
        propertyName: 'foo',
        weight: 10,
        thesaurus: '/mdm/config/thesauri/test.xml' });
  });

  it('should define a double-metaphone match', () => {
    matchOptions.dblMetaphone({
      propertyName: 'foo',
      weight: 10,
      dictionary: 'test.xml',
      threshold: 50,
      collation: 'http://marklogic.com/collation/codepoint'
    });
    assert.deepEqual(matchOptions.options.algorithms.algorithm[0],
      { name: 'dbl-metaphone',
        namespace: 'http://marklogic.com/smart-mastering/algorithms',
        function: 'double-metaphone',
        at: '/com.marklogic.smart-mastering/algorithms/double-metaphone.xqy' });
    assert.deepEqual(matchOptions.options.scoring.expand[0],
      { algorithmRef: 'dbl-metaphone',
        propertyName: 'foo',
        weight: 10,
        dictionary: 'test.xml',
        distanceThreshold: 50,
        collation: 'http://marklogic.com/collation/codepoint' });
  });

  it('should define a zip match', () => {
    matchOptions.zip({
      propertyName: 'foo',
      weight5: 3,
      weight9: 2
    });
    assert.deepEqual(matchOptions.options.algorithms.algorithm[0],
      { name: 'zip-code',
        namespace: 'http://marklogic.com/smart-mastering/algorithms',
        function: 'zip-match',
        at: '/com.marklogic.smart-mastering/algorithms/zip.xqy' });
    assert.deepEqual(matchOptions.options.scoring.expand[0],
      { algorithmRef: 'zip-code',
        propertyName: 'foo',
        zip: [ { origin: 5, weight: 3 }, { origin: 9, weight: 2 } ] });
  });

  it('should define a reduction', () => {
    matchOptions.reduce({
      propertyNames: [ 'foo', 'bar' ],
      weight: 10
    });
    assert.deepEqual(matchOptions.options.algorithms.algorithm[0],
      { name: 'std-reduce', function: 'standard-reduction' });
    assert.deepEqual(matchOptions.options.scoring.reduce[0],
      { algorithmRef: 'std-reduce',
        weight: 10,
        allMatch: { property: [ 'foo', 'bar' ] } });
  });

  it('should define collection scope', () => {
    matchOptions.collections([ 'foo', 'bar' ]);
    assert.deepEqual(matchOptions.options.collections,
      { content: [ 'foo', 'bar' ] });
  });

  it('should define the maximum matches processed', () => {
    matchOptions.maxScan(100);
    assert.deepEqual(matchOptions.options.tuning,
      { maxScan: 100 });
  });

  it('should define a threshold', () => {
    matchOptions.threshold({
      above: 5,
      label: 'Likely Match',
      action: 'notify'
    });
    assert.deepEqual(matchOptions.options.thresholds.threshold[0],
      { above: 5, label: 'Likely Match', action: 'notify' });
  });

  it('should define a property alias only once', () => {
    matchOptions.exact({ propertyName: 'foo', weight: 10})
      .exact({ propertyName: 'foo', weight: 100 });
    assert.equal(matchOptions.options.propertyDefs.property.length, 1);
  });

});
