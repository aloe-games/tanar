var websocket = new WebSocket("ws://" + document.location.host + document.location.pathname + "server");

websocket.onopen = console.log;
websocket.onerror = console.log;
websocket.onclose = console.log;

var send = function (data) {
    websocket.send(JSON.stringify(data));
};

websocket.onmessage = function (message) {
    console.log(JSON.parse(message.data));
};
