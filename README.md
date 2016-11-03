# CrossUserEvents-Javascript-Websocket

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/756e77273897425c85aa31fcc97a9a7e)](https://www.codacy.com/app/Yet-Another-Web-Stack/CrossUserEvents-Javascript-Websocket?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=Yet-Another-Web-Stack/CrossUserEvents-Javascript-Websocket&amp;utm_campaign=Badge_Grade)
[![Code Climate](https://codeclimate.com/github/Yet-Another-Web-Stack/CrossUserEvents-Javascript-Websocket/badges/gpa.svg)](https://codeclimate.com/github/Yet-Another-Web-Stack/CrossUserEvents-Javascript-Websocket)

This provides a transport layer for binary data via websocket. Supported implementations are [Robust Websocket](https://github.com/appuri/robust-websocket), [Reconnection Websocket](https://github.com/joewalnes/reconnecting-websocket) and the default [Websocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API).
Due to the shared interface you don't need to care about the implementation used, but for stability and reliably reasons we prefer the usage of one of the automatically reconnecting implementations.
