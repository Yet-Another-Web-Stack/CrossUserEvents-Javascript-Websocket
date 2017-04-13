var should = require('chai').should();
var expect = require('chai').expect;
require('fake-dom');
window = {
  setLocation: function(full) {
    window.location={href: "https://127.0.0.1/example"};
    if(full) {
      window.location={
          href: "https://127.0.0.1/example",
          protocol: "http",
          path: "/ex",
          domainname: "localhost"
      };
    }
  },
  getSocketMock: function() {
    return function(url){
      this.url=url;
      return this;
    };
  }
};
window.setLocation(true);
require('../src/yawsSocketConnect.js');
describe('yaws', function() {
  it('yaws should be an object', function() {
    window.yaws.should.be.a('object');
  });
  it('yaws should have socketConnect', function() {
    window.yaws.should.have.property('socketConnect');
  });
  describe('yaws.socketConnect', function() {
    it('yaws.socketConnect should be a function', function() {
      window.yaws.socketConnect.should.be.a('function');
    });
    describe('yaws.socketConnect()', function() {
      it('yaws.socketConnect() should throw an error on missing argument', function() {
        expect(window.yaws.socketConnect).to.throw("The first parameter 'onMessage' is required to be a function accepting a single parameter of type Blob.");
      });
      it('yaws.socketConnect() should throw an error on missing Websocket', function() {
        Websocket = undefined;
        delete window["Websocket"];
        expect(function(){window.yaws.socketConnect(function(blob){},{},'/')}).to.throw("No Websocket Implementation found");
        window.Websocket = window.getSocketMock();
        Websocket = window.getSocketMock();
      });
      describe('yaws.socketConnect() @ Websocket', function() {
        window.Websocket = window.getSocketMock();
        Websocket = window.getSocketMock();
        it('yaws.socketConnect() should be an object', function() {
          window.yaws.socketConnect(function(blob){},{},'/').should.be.a('object');
        });
        it('yaws.socketConnect() should be a Websocket', function() {
          window.yaws.socketConnect(function(blob){},{},'/').should.be.instanceof(Websocket);
        });
        describe('yaws.socketConnect().getUrl() @ Websocket', function() {
          it('yaws.socketConnect().url should be wss://127.0.0.1/example', function() {
            window.setLocation(false);
            expect(window.yaws.socketConnect(function(blob){},{})).to.have.property('url','wss://127.0.0.1/example');
            window.setLocation(true);
          });
          it('yaws.socketConnect().url should be ws://localhost/ex', function() {
            expect(window.yaws.socketConnect(function(blob){},{})).to.have.property('url','ws://localhost/ex');
          });
          it('yaws.socketConnect().url should be ws://localhost/socket/ex', function() {
            expect(window.yaws.socketConnect(function(blob){},{},'{protocol}://{domain}/socket{path}')).to.have.property('url','ws://localhost/socket/ex');
          });
        });
      });
      describe('yaws.socketConnect() @ ReconnnectingWebSocket', function() {
        window.ReconnectingWebSocket = window.getSocketMock();
        ReconnectingWebSocket = window.getSocketMock();
        it('yaws.socketConnect() should be an object', function() {
          window.yaws.socketConnect(function(blob){},{},'/').should.be.a('object');
        });
        it('yaws.socketConnect() should be a ReconnectingWebSocket', function() {
          window.yaws.socketConnect(function(blob){},{},'/').should.be.instanceof(ReconnectingWebSocket);
        });
      });
      describe('yaws.socketConnect() @ RobustWebSocket', function() {
        window.RobustWebSocket = window.getSocketMock();
        RobustWebSocket = window.getSocketMock();
        it('yaws.socketConnect() should be an object', function() {
          window.yaws.socketConnect(function(blob){},{},'/').should.be.a('object');
        });
        it('yaws.socketConnect() should be a RobustWebSocket', function() {
          window.yaws.socketConnect(function(blob){},{},'/').should.be.instanceof(RobustWebSocket);
        });
      });
    });
  });
});
