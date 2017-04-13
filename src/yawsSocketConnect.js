/**
 * Creates the yaws-object and the socketConnect method
 * @returns {undefined}
 */
(function () {
    "use strict";
    if (!("yaws" in window)) {
        window.yaws = {};
    }
    /**
     * 
     * @param {function} onMessage
     * @param {object} options optional
     * @param {string} url optional
     * @returns {Websocket}
     */
    window.yaws.socketConnect = function (onMessage, options, url) {
        /**
         * returns the Websocket that provides the best reliability of the avaible ones
         * @param {string} url optional
         * @param {object} options optional
         * @returns {Websocket}
         */
        var getSocket = function (url, options) {
            if (!("Websocket" in window)) {
                throw new Error("No Websocket Implementation found");
            }
            /**
             * returns the value given or a default if that doesn't exist
             * @param {object} options optional
             * @param {string} key optional
             * @returns {number}
             */
            var getValue = function (options, key) {
                var canUseProperty = function (object, property) {
                    return object && typeof object === "object" && property && object[property] && typeof object[property] === "number";
                };
                var defaults = {
                    timeout: 5000,
                    maxInterval: 60000
                };
                if (!canUseProperty(options, key)) {
                    if (key in defaults) {
                        return defaults[key];
                    }
                    throw new Error("No default defined for " + key + ".");
                }
                if (parseInt(options[key], 10) !== options[key]) {
                    return parseInt(options[key] * 1000, 10);
                }
                return options[key];
            };
            /**
             * returns an url to connect to. If one is supplied replaces placeholders for path and protocol
             * @param {string} url optional
             * @returns {string}
             */
            var getUrl = function(url) {
                /**
                 * returns basic location information as a object containing protocol, path and domain
                 * @returns {object}
                 **/
                var getLocation = function() {
                    if("protocol" in window.location && "path" in window.location && "domainname" in window.location) {
                        return {
                            protocol: "ws"+(window.location.protocol === "https"?"s":""),
                            domain: window.location.domainname,
                            path: window.location.path
                        };
                    }
                    var location={
                        protocol: "ws"+(window.location.href.match(/^https:\/\//i)?"s":""),
                        path: window.location.href.replace(/^https?:\/\/(.*?)(\?.*?)?(#.*?)?$/i,"$1"),
                        domain: ""
                    };
                    location.domain = location.path.replace(/\/.*/,"").replace(/:.*/,"");
                    location.path = location.path.replace(/^.*?(\/|$)/,"$1");
                    return location;
                };
                if(!url || typeof url !== "string") {
                    url = "{protocol}://{domain}{path}";
                }
                var location = getLocation();
                return url.replace("{protocol}",location.protocol).replace("{path}",location.path).replace("{domain}",location.domain);
            };
            if ("RobustWebSocket" in window) {
                /*global RobustWebSocket*/
                var ws = new RobustWebSocket(getUrl(url), [], {
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
            if ("ReconnectingWebSocket" in window) {
                /*global ReconnectingWebSocket*/
                return new ReconnectingWebSocket(getUrl(url), [], {
                    maxReconnectInterval: getValue(options, "maxInterval"),
                    reconnectDecay: 2.5,
                    timeoutInterval: getValue(options, "timeout")
                });
            }
            /*global Websocket*/
            return new Websocket(getUrl(url), []);
        };
        /**
         * returns a function handling the binary data returned by the socket
         * @returns {Function}
         */
        var getOnMessage = function () {
            /**
             * handles the Blob or ArrayBuffer returned by the socket
             * @param {Event} event
             * @returns {undefined}
             */
            return function (event) {
                if (typeof event.data !== "object") {
                    throw new Error("Got something (" + (typeof event.data) + ") that shouldn't be returned by the socket.");
                }
                if (event.data instanceof ArrayBuffer) {
                    event.data = new Blob([event.data]);
                }
                if (event.data instanceof Blob) {
                    event.target.onMessageHandler(event.data);
                    return;
                }
                throw new Error("Got an object of a type that shouldn't be returned by the socket.");
            };
        };
        if (typeof onMessage !== "function") {
            throw new Error("The first parameter 'onMessage' is required to be a function accepting a single parameter of type Blob.");
        }
        var Socket = getSocket(url, options);
        Socket.onMessageHandler = onMessage;
        Socket.onmessage = getOnMessage();
        return Socket;
    };
})();
