var should = require('chai').should();
var expect = require('chai').expect;
require('fake-dom');
describe('yaws.socketConnect', function() {
  window={location:{href:"https://127.0.0.1/example"}};
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
  it('yaws.socketConnect() should throw an error on missing Websocket', function() {
    expect(function(){window.yaws.socketConnect(function(blob){},{},'/')}).to.throw("No Websocket Implementation found");
  });
  //basic socket
  window.Websocket = function(){};
  Websocket = window.Websocket;
  it('yaws.socketConnect() should be an object', function() {
    window.yaws.socketConnect(function(blob){},{},'/').should.be.a('object');
  });
  it('yaws.socketConnect() should be a Websocket', function() {
    window.yaws.socketConnect(function(blob){},{},'/').should.be.instanceof(Websocket);
  });
  //reconnecting socket
  window.ReconnectingWebSocket = function(){};
  ReconnectingWebSocket = window.ReconnectingWebSocket;
  it('yaws.socketConnect() should be an object', function() {
    window.yaws.socketConnect(function(blob){},{},'/').should.be.a('object');
  });
  it('yaws.socketConnect() should be a ReconnectingWebSocket', function() {
    window.yaws.socketConnect(function(blob){},{},'/').should.be.instanceof(ReconnectingWebSocket);
  });
  //robust socket
  window.RobustWebSocket = function(){};
  RobustWebSocket = window.RobustWebSocket;
  it('yaws.socketConnect() should be an object', function() {
    window.yaws.socketConnect(function(blob){},{},'/').should.be.a('object');
  });
  it('yaws.socketConnect() should be a RobustWebSocket', function() {
    window.yaws.socketConnect(function(blob){},{},'/').should.be.instanceof(RobustWebSocket);
  });
});
