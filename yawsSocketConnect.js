if(!("yaws" in window)){
	var yaws={};
}
yaws.socketConnect=function(url,onMessage,options) {
	var get=function(url,options) {
		if(!("Websocket" in window)) {
			throw "No Websocket Implementation found";
		}
		//uses https://github.com/appuri/robust-websocket if avaible
		if("RobustWebSocket" in window) {
			var ws = new RobustWebSocket(url,[],{
				timeout: options.timeout?options.timeout:5000,
				shouldReconnect: function(event, ws) {
					if(event.code===1008||event.code===1011) {
						return null;
					}
				  	return Math.min(Math.pow(1.05, (ws.attempts+2)*ws.attempts/2) * 500,ws.maxInterval);
				}
			});
			ws.maxInterval = options.maxInterval?options.maxInterval:60000;
			return ws;
		}
		//uses https://github.com/joewalnes/reconnecting-websocket if avaible
		if("ReconnectingWebSocket" in window) {
			return new ReconnectingWebSocket(url,[],{
				maxReconnectInterval: options.maxInterval?options.maxInterval:60000,
				reconnectDecay: 2.5,
				timeoutInterval: options.timeout?options.timeout:5000
			});
		}
		//default websocket
		return new Websocket(url,[]);
	}
	if(typeof onMessage!=="function") {
		throw "The second parameter onMessage is required to be a function accepting a single parameter of type Blob.";
	}
	var Socket = get(url,options?options:{});
	Socket.onMessageHandler = onMessage;
	Socket.onmessage=function(event){
		 if(typeof event.data === "string") {
				throw "Got a string from the socket, expected binary data.";
		} else if(event.data instanceof ArrayBuffer) {
				if(!("FileReader" in window)) {
					console.log("Got an ArrayBuffer, required a Blob. No Method to convert it found.");
				}
				console.log("Got an ArrayBuffer, trying to convert to blob.");
				var reader = new FileReader();
				reader.onLoadHandler=event.target.onMessageHandler;
				reader.onload=function(event) {
					event.target.onLoadHandler.call(event.target.result);
				}
				reader.readAsArrayBuffer(event.data);
		} else if(event.data instanceof Blob) {
				event.target.onMessageHandler.call(event.data);
		} else {
				throw "Got something that shouldn't exist from the socket: "+(typeof event.data)+".";
		}
	};
	return Socket;
}
