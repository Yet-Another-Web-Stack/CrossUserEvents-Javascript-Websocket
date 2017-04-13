var should = require('chai').should();
require('fake-dom');
describe('yaws.socketConnect', function() {
  window=window?window:{};
  require('../src/yawsSocketConnect.js');
  it('yaws should be an object', function() {
    window.yaws.should.be.a('function');
  });
  it('yaws.socketConnect should be a function', function() {
    window.yaws.socketConnect.should.be.a('function');
  });
  it('yaws.socketConnect() should be an object', function() {
    window.yaws.socketConnect().should.be.a('object');
  });
});
