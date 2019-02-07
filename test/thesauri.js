const chai = require('chai'),
      sm = require('../lib/sm');

const assert = chai.assert;

let client = sm.createClient({
  host: 'localhost',
  port: 8800,
  database: 'minimal-smart-mastering-content',
  modules: 'minimal-smart-mastering-modules',
  server: 'minimal-smart-mastering',
  user: 'admin',
  password: 'admin'
});

let testThesaurus = `<?xml version="1.0" encoding="UTF-8"?>
<thesaurus xmlns="http://marklogic.com/xdmp/thesaurus">
 <entry>
  <term>foo</term>
  <synonym>
   <term>bar</term>
  </synonym>
 </entry>
</thesaurus>
`;

describe('Thesauri', () => {

  it('should be written', () => {
    return client.thesauri.write('test.xml', testThesaurus)
    .then((res) => {
      assert.equal(res.documents[0].uri, '/mdm/config/thesauri/test.xml');
    })
  });

  it('should be listed', () => {
    return client.thesauri.list()
    .then((res) => {
      assert.isOk(res['availableThesauri']['/mdm/config/thesauri/test.xml']);
    })
  });

  it('should be removed', () => {
    return client.thesauri.remove('test.xml')
    .then((res) => {
      assert.isTrue(res.removed);
    })
  });

});
