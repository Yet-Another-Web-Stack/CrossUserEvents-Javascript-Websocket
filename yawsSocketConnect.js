if(!("yaws" in window)){
	var yaws={};
}
yaws.socketConnect=function(url,onMessage) {
	var get=function(url) {
		if(!("Websocket" in window)) {
			throw "No Websocket Implementation found";
		}
		//uses https://github.com/appuri/robust-websocket if avaible
		if("RobustWebSocket" in window) {
			return new RobustWebSocket(url,[],{
				timeout:5000,
				shouldReconnect: function(event, ws) {
					if(event.code===1008||event.code===1011) {
						return null;
					}
				  	return Math.min(Math.pow(1.15, ws.attempts*ws.attempts) * 500,60000);
				}
			});
		}
		//uses https://github.com/joewalnes/reconnecting-websocket if avaible
		if("ReconnectingWebSocket" in window) {
			return new ReconnectingWebSocket(url,[],{
				maxReconnectInterval: 60000,
				reconnectDecay: 2.5,
				timeoutInterval: 5000
			}});
		}
		//default websocket
		return new Websocket(url,[]);
	}
	if(typeof onMessage!=="function") {
		throw "The second parameter onMessage is required to be a function accepting a single parameter of type Blob.";
	}
	var Socket = get(url);
	Socket.onMessageHandler=onMessage;
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
