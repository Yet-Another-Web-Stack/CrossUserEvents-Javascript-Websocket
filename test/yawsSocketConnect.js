var should = require('chai').should();
require('fake-dom');
describe('yaws.socketConnect', function() {
  var game = require('../src/yawsSocketConnect.js');
  it('yaws should be an object', function() {
    yaws.should.be.a('function');
  });
  it('yaws.socketConnect should be a function', function() {
    yaws.socketConnect.should.be.a('function');
  });
  it('yaws.socketConnect() should be an object', function() {
    yaws.socketConnect().should.be.a('object');
  });
});
