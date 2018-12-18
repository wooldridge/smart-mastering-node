const chai = require('chai'),
      sm = require('../lib/sm');

const assert = chai.assert;

describe('Smart Mastering', () => {
  it('should create a client', () => {
    let client = sm.createClient({
      user: 'user',
      password: 'password'
    })
    assert.equal(client.constructor.name, 'SmartMasteringClient');
  });
  it('should read stats', () => {
    let client = sm.createClient({
      host: 'localhost',
      port: 8800,
      database: 'minimal-smart-mastering-content',
      modules: 'minimal-smart-mastering-modules',
      server: 'minimal-smart-mastering',
      user: 'admin',
      password: 'admin'
    })
    return client.readStats()
    .then((res) => {
      assert.isNumber(res.docCount);
    })
  });
});
