if (!("yaws" in window)) {
    var yaws = {};
}
/**
 * 
 * @param {string} url
 * @param {function} onMessage
 * @param {object} options
 * @returns {Websocket}
 */
yaws.socketConnect = function (url, onMessage, options) {
    /**
     * 
     * @param {string} url
     * @param {object} options
     * @returns {Websocket}
     */
    var getSocket = function (url, options) {
        if (!("Websocket" in window)) {
            throw "No Websocket Implementation found";
        }
        /**
         * 
         * @param {object} options
         * @param {string} key
         * @returns {number}
         */
        var getValue = function (options, key) {
            var canUseProperty = function(object, property) {
                return object && typeof object === 'object' && property && object[property] && typeof object[property] === 'number';
            };
            var defaults = {
                timeout: 5000,
                maxInterval: 60000
            };
            if (!canUseProperty(options, key)) {
                if (key in defaults) {
                    return defaults[key];
                }
                throw "No default defined for " + key + ".";
            }
            if (parseInt(options[key], 10) !== options[key]) {
                return parseInt(options[key] * 1000, 10);
            }
            return options[key];
        };
        //uses https://github.com/appuri/robust-websocket if avaible
        if ("RobustWebSocket" in window) {
            var ws = new RobustWebSocket(url, [], {
                timeout: getValue(options, "timeout"),
                shouldReconnect: function (event, ws) {
                    if (event.code === 1008 || event.code === 1011) {
                        return null;
                    }
                    return Math.min(Math.pow(1.05, (ws.attempts + 2) * ws.attempts / 2) * 500, ws.maxInterval);
                }
            });
            ws.maxInterval = getValue(options, "maxInterval");
            return ws;
        }
        //uses https://github.com/joewalnes/reconnecting-websocket if avaible
        if ("ReconnectingWebSocket" in window) {
            return new ReconnectingWebSocket(url, [], {
                maxReconnectInterval: getValue(options, "maxInterval"),
                reconnectDecay: 2.5,
                timeoutInterval: getValue(options, "timeout")
            });
        }
        //default websocket
        return new Websocket(url, []);
    };
    /**
     * 
     * @returns {Function}
     */
    var getOnMessage = function () {
        if ("FileReader" in window) {
            /**
             * 
             * @param {Event} event
             * @returns {undefined}
             */
            return function (event) {
                if (typeof event.data !== 'object') {
                    throw "Got something (" + (typeof event.data) + ") that shouldn't be returned by the socket.";
                }
                if (event.data instanceof Blob) {
                    event.target.onMessageHandler(event.data);
                    return;
                }
                if (event.data instanceof ArrayBuffer) {
                    var reader = new FileReader();
                    reader.onLoadHandler = event.target.onMessageHandler;
                    reader.onload = function (event) {
                        event.target.onLoadHandler(event.target.result);
                    };
                    reader.readAsArrayBuffer(event.data);
                    return;
                }
                throw "Got an object of a type that shouldn't be returned by the socket.";
            };
        }
        /**
         * 
         * @param {Event} event
         * @returns {undefined}
         */
        return function (event) {
            if (typeof event.data !== 'object') {
                throw "Got something (" + (typeof event.data) + ") that shouldn't be returned by the socket.";
            }
            if (event.data instanceof Blob) {
                event.target.onMessageHandler(event.data);
                return;
            }
            throw "Got an object of a type that shouldn't be returned by the socket.";
        };
    };
    if (typeof onMessage !== "function") {
        throw "The second parameter onMessage is required to be a function accepting a single parameter of type Blob.";
    }
    var Socket = getSocket(url, options);
    Socket.onMessageHandler = onMessage;
    Socket.onmessage = getOnMessage();
    return Socket;
};
