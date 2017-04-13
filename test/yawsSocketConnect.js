var should = require('chai').should();
var expect = require('chai').expect;
require('fake-dom');
describe('yaws.socketConnect', function() {
  window=window?window:{};
  require('../src/yawsSocketConnect.js');
  it('yaws should be an object', function() {
    window.yaws.should.be.a('object');
  });
  it('yaws.socketConnect should be a function', function() {
    window.yaws.socketConnect.should.be.a('function');
  });
  it('yaws.socketConnect() should throw an error on missing argument', function() {
    expect(window.yaws.socketConnect).to.throw("The first parameter 'onMessage' is required to be a function accepting a single parameter of type Blob.");
  });
  it('yaws.socketConnect() should be an object', function() {
    window.yaws.socketConnect(function(blob){},{},'/').should.be.a('object');
  });
});
