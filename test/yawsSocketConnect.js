var should = require('chai').should();
var expect = require('chai').expect;
require('fake-dom');
//setup start
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
  getSocketMock: function(name) {
    window[name] = function(url,opt1,opt2){
      this.url=url;
      this.opt1 = opt1;
      this.opt2 = opt2;
      return this;
    };
    return window[name];
  }
};
window.setLocation(true);
require('../src/yawsSocketConnect.js');
//setup end
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
        expect(window.yaws.socketConnect).to.throw(Error, "The first parameter 'onMessage' is required to be a function accepting a single parameter of type Blob.");
      });
      it('yaws.socketConnect() should throw an error on missing Websocket', function() {
        expect(function(){window.yaws.socketConnect(function(blob){},{},'/')}).to.throw(Error, "No Websocket Implementation found");
      });
      describe('yaws.socketConnect() @ Websocket', function() {
        beforeEach(function() {
          Websocket = window.getSocketMock("Websocket");
        });
        afterEach(function() {
          delete window["Websocket"]
        });
        it('yaws.socketConnect() should be an object', function() {
          window.yaws.socketConnect(function(blob){},{},'/').should.be.a('object');
        });
        it('yaws.socketConnect() should be a Websocket', function() {
          window.yaws.socketConnect(function(blob){},{},'/').should.be.instanceof(Websocket);
        });
        it('yaws.socketConnect() should have an onmessage property', function() {
          window.yaws.socketConnect(function(blob){},{},'/').should.have.property("onmessage");
        });
        describe('yaws.socketConnect().opt1 @ Websocket', function() {
	      it('yaws.socketConnect() @ Websocket should have an opt1 property', function() {
	        window.yaws.socketConnect(function(blob){},{},'/').should.have.property("opt1");
	      });
	      it('yaws.socketConnect().opt1 @ Websocket should be array', function() {
	        window.yaws.socketConnect(function(blob){},{},'/').opt1.should.be.instanceof(Array);
	      });
	      it('yaws.socketConnect().opt1 @ Websocket should have no content', function() {
	        window.yaws.socketConnect(function(blob){},{},'/').opt1.should.have.lengthOf(0);
	      });
        });
        describe('yaws.socketConnect().opt2 @ Websocket', function() {
	      it('yaws.socketConnect() @ Websocket should have an opt2 property', function() {
	        window.yaws.socketConnect(function(blob){},{},'/').should.have.property("opt2");
	      });
	      it('yaws.socketConnect().opt1 @ Websocket should be null or undefined', function() {
	        expect(window.yaws.socketConnect(function(blob){},{},'/').opt2).not.to.exist;
	      });
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
        describe('yaws.socketConnect().onmessage() @ Websocket', function() {
          var onMessageHandler = function(blob){window.success=blob;};
          beforeEach(function(){
            window.success = false;
          });
          it('yaws.socketConnect().onmessage should be a function', function() {
            var socket = window.yaws.socketConnect(onMessageHandler,{});
            expect(socket.onmessage).to.be.a('function');
          });
          it('yaws.socketConnect().onMessageHandler should be a function', function() {
            var socket = window.yaws.socketConnect(onMessageHandler,{});
            expect(socket.onMessageHandler).to.be.a('function');
          });
          it('yaws.socketConnect().onMessageHandler should be expected function', function() {
            var socket = window.yaws.socketConnect(onMessageHandler,{});
            expect(socket.onMessageHandler).to.be.eql(onMessageHandler);
          });
          it('yaws.socketConnect().onMessageHandler should be expected function', function() {
            var socket = window.yaws.socketConnect(onMessageHandler,{});
            socket.onMessageHandler(new Blob(['a']));
            window.success.should.eql(new Blob(['a']));
          });
          it('yaws.socketConnect().onmessage() should throw an exception w/o object given', function() {
            var socket = window.yaws.socketConnect(onMessageHandler,{});
            expect(function(){socket.onmessage({data:"-",target:socket})}).to.throw(Error, "Got something (string) that shouldn't be returned by the socket.");
          });
          it('yaws.socketConnect().onmessage() should throw an exception w/o Blob given', function() {
            var socket = window.yaws.socketConnect(onMessageHandler,{});
            expect(function(){socket.onmessage({data:{},target:socket})}).to.throw(Error, "Got an object of a type that shouldn't be returned by the socket.");
          });
          it('yaws.socketConnect().onmessage() should be able to handle a blob', function() {
            var socket = window.yaws.socketConnect(onMessageHandler,{});
            socket.onmessage({data:new Blob(['a']),target:socket});
            window.success.should.eql(new Blob(['a']));
          });
          /*it('yaws.socketConnect().onmessage() should be able to handle an ArrayBuffer', function() {
            var FileReader = require('filereader');
            var fileReader = new FileReader();
            fileReader.readAsArrayBuffer(new Blob(['a']));
            var socket = window.yaws.socketConnect(onMessageHandler,{});
            socket.onmessage({data:fileReader.result,target:socket});
            window.success.should.eql(new Blob(['a']));
          });*/
        });
        describe('yaws.socketConnect() @ ReconnnectingWebSocket', function() {
          beforeEach(function() {
            ReconnectingWebSocket = window.getSocketMock("ReconnectingWebSocket");
          });
          afterEach(function() {
            delete window["ReconnectingWebSocket"];
          });
          it('yaws.socketConnect() should be an object', function() {
            window.yaws.socketConnect(function(blob){},{},'/').should.be.a('object');
          });
          it('yaws.socketConnect() should be a ReconnectingWebSocket', function() {
            window.yaws.socketConnect(function(blob){},{},'/').should.be.instanceof(ReconnectingWebSocket);
          });
	      describe('yaws.socketConnect().opt1 @ ReconnectingWebSocket', function() {
		    it('yaws.socketConnect() @ ReconnectingWebSocket should have an opt1 property', function() {
		      window.yaws.socketConnect(function(blob){},{},'/').should.have.property("opt1");
		    });
		    it('yaws.socketConnect().opt1 @ ReconnectingWebSocket should be array', function() {
		      window.yaws.socketConnect(function(blob){},{},'/').opt1.should.be.instanceof(Array);
		    });
		    it('yaws.socketConnect().opt1 @ ReconnectingWebSocket should have no content', function() {
		      window.yaws.socketConnect(function(blob){},{},'/').opt1.should.have.lengthOf(0);
		    });
	      });
	      describe('yaws.socketConnect().opt2 @ ReconnectingWebSocket', function() {
		    it('yaws.socketConnect() @ ReconnectingWebSocket should have an opt2 property', function() {
		      window.yaws.socketConnect(function(blob){},{},'/').should.have.property("opt2");
		    });
		    it('yaws.socketConnect().opt1 @ ReconnectingWebSocket should be an object', function() {
		      window.yaws.socketConnect(function(blob){},{},'/').opt2.should.be.a("object");
		    });
		    it('yaws.socketConnect().opt1 @ ReconnectingWebSocket should match defaults', function() {
		      window.yaws.socketConnect(function(blob){},{},'/').opt2.should.be.eql({
                    maxReconnectInterval: 60000,
                    reconnectDecay: 2.5,
                    timeoutInterval: 5000
                });
		    });
		    it('yaws.socketConnect().opt1 @ ReconnectingWebSocket should match config', function() {
		      window.yaws.socketConnect(function(blob){},{timeout:6000,maxInterval:45000},'/').opt2.should.be.eql({
                    maxReconnectInterval: 45000,
                    reconnectDecay: 2.5,
                    timeoutInterval: 6000
                });
		    });
		    it('yaws.socketConnect().opt1 @ ReconnectingWebSocket should match adjusted config', function() {
		      window.yaws.socketConnect(function(blob){},{timeout:0.6,maxInterval:0.45},'/').opt2.should.be.eql({
                    maxReconnectInterval: 450,
                    reconnectDecay: 2.5,
                    timeoutInterval: 600
                });
		    });
	      });
        });
        describe('yaws.socketConnect() @ RobustWebSocket', function() {
          beforeEach(function() {
            RobustWebSocket = window.getSocketMock("RobustWebSocket");
          });
          afterEach(function() {
            delete window["RobustWebSocket"]
          });
          it('yaws.socketConnect() should be an object', function() {
            window.yaws.socketConnect(function(blob){},{},'/').should.be.a('object');
          });
          it('yaws.socketConnect() should be a RobustWebSocket', function() {
            window.yaws.socketConnect(function(blob){},{},'/').should.be.instanceof(RobustWebSocket);
          });
	      describe('yaws.socketConnect().opt1 @ RobustWebSocket', function() {
		    it('yaws.socketConnect() @ RobustWebSocket should have an opt1 property', function() {
		      window.yaws.socketConnect(function(blob){},{},'/').should.have.property("opt1");
		    });
		    it('yaws.socketConnect().opt1 @ RobustWebSocket should be array', function() {
		      window.yaws.socketConnect(function(blob){},{},'/').opt1.should.be.instanceof(Array);
		    });
		    it('yaws.socketConnect().opt1 @ RobustWebSocket should have no content', function() {
		      window.yaws.socketConnect(function(blob){},{},'/').opt1.should.have.lengthOf(0);
		    });
	      });
	      describe('yaws.socketConnect().opt2 @ RobustWebSocket', function() {
		    it('yaws.socketConnect() @ RobustWebSocket should have an opt2 property', function() {
		      window.yaws.socketConnect(function(blob){},{},'/').should.have.property("opt2");
		    });
		    it('yaws.socketConnect().opt2 @ RobustWebSocket should be an object', function() {
		      window.yaws.socketConnect(function(blob){},{},'/').opt2.should.be.a("object");
		    });
		    it('yaws.socketConnect().opt2 @ RobustWebSocket should have shouldReconnect', function() {
		      window.yaws.socketConnect(function(blob){},{},'/').opt2.should.have.property('shouldReconnect');
		    });
		    it('yaws.socketConnect().opt2 @ RobustWebSocket should have shouldReconnect function', function() {
		      window.yaws.socketConnect(function(blob){},{},'/').opt2.shouldReconnect.should.be.a('function');
		    });
		    it('yaws.socketConnect().opt2 @ RobustWebSocket should have timeout', function() {
		      window.yaws.socketConnect(function(blob){},{},'/').opt2.should.have.property('timeout');
		    });
		    it('yaws.socketConnect().opt2 @ RobustWebSocket should have timeout equal default', function() {
		      window.yaws.socketConnect(function(blob){},{},'/').opt2.timeout.should.be.equal(5000);
		    });
		    it('yaws.socketConnect().opt2 @ RobustWebSocket should have timeout equal config', function() {
		      window.yaws.socketConnect(function(blob){},{timeout:6000},'/').opt2.timeout.should.be.equal(6000);
		    });
		    it('yaws.socketConnect().opt2 @ RobustWebSocket should have maxInterval', function() {
		      window.yaws.socketConnect(function(blob){},{},'/').should.have.property('maxInterval');
		    });
		    it('yaws.socketConnect().opt2 @ RobustWebSocket should have maxInterval equal default', function() {
		      window.yaws.socketConnect(function(blob){},{},'/').maxInterval.should.be.equal(60000);
		    });
		    it('yaws.socketConnect().opt2 @ RobustWebSocket should have maxInterval equal config', function() {
		      window.yaws.socketConnect(function(blob){},{maxInterval:66000},'/').maxInterval.should.be.equal(66000);
		    });
		    describe('yaws.socketConnect().opt2.shouldReconnect @ RobustWebSocket', function() {
			  it('yaws.socketConnect().opt2.shouldReconnect @ RobustWebSocket should be a function', function() {
			    window.yaws.socketConnect(function(blob){},{},'/').opt2.shouldReconnect.should.be.a("function");
			  });
			  it('yaws.socketConnect().opt2.shouldReconnect @ RobustWebSocket should return null for code 1008', function() {
			    expect(window.yaws.socketConnect(function(blob){},{},'/').opt2.shouldReconnect({code:1008})).to.be.null;
			  });
			  it('yaws.socketConnect().opt2.shouldReconnect @ RobustWebSocket should return null for code 1011', function() {
			    expect(window.yaws.socketConnect(function(blob){},{},'/').opt2.shouldReconnect({code:1011})).to.be.null;
			  });
			  it('yaws.socketConnect().opt2.shouldReconnect @ RobustWebSocket should return default for attemp 1,000,000', function() {
			  	var socket = window.yaws.socketConnect(function(blob){},{},'/');
			  	socket.attempts = 1000000;
			  	socket.opt2.shouldReconnect({code:1000},socket).should.be.equal(60000);
			  });
			  it('yaws.socketConnect().opt2.shouldReconnect @ RobustWebSocket should return a value between 0 and max for attemp 1', function() {
			  	var socket = window.yaws.socketConnect(function(blob){},{},'/');
			  	socket.attempts = 1;
			  	socket.opt2.shouldReconnect({code:1000},socket).should.be.within(1,10000);
			  });
			  it('yaws.socketConnect().opt2.shouldReconnect @ RobustWebSocket should return 0 for attemp 0', function() {
			  	var socket = window.yaws.socketConnect(function(blob){},{},'/');
			  	socket.attempts = 0;
			  	socket.opt2.shouldReconnect({code:1000},socket).should.be.equal(0);
			  });
		    });
	      });
        });
      });
    });
  });
});
