window.addEventListener("load", function() {connect();}, false);

var websocket;

var connect = function() {
    websocketProtocol = "ws:";
    if (document.location.protocol == "https:") {
        websocketProtocol = "wss:";
    }
    websocket = new WebSocket(websocketProtocol + "//" + document.location.host + document.location.pathname + "server");
    websocket.onopen = function () {
        var username = prompt("Username:", getCookie("username"));
        setCookie("username", username, 365);
        send({command: 'join', username: username});
    };
    websocket.onerror = console.log;
    websocket.onclose = console.log;
    websocket.onmessage = function(message) {
        message = message.data;
        console.log("Receive:" + message);
        receive(JSON.parse(message));
    };
};

var send = function (data) {
    var message = JSON.stringify(data);
    websocket.send(message);
    console.log("Send: " + message);
};

//background canvas
var staticCanvas;
//dynamic canvas
var dynamicCanvas;

//background canvas context
var staticContext;
//dynamic canvas contect
var dynamicContext;

//images for tileset and players
var tileImage;
var playerImages = {};

//map size
var mapWidth;
var mapHeight;
var tileSize = 32;
var playerTileHeight = 48;

//my player id
var myPlayerId;

//map
var map;
var objectsMap;

//players
var player;

//players
var players = [];

//players velocity
var velocity = 4;

//chat handle
var messages;

//init astar graph
var init_graph;

var receive = function(data) {
    var command = data.command;

    if(command == 'init') {
        myPlayerId = data.id;
        map = data.map;
        objectsMap = data.objects;
        mapWidth = data.width;
    	mapHeight = data.height;
        init_graph = new Array(data.height);
        for (var i = 0; i < data.height; i++) {
            init_graph[i] = new Array(data.width);
        }
        var k = 0;
        for (var i = 0; i < data.height; i++) {
            for (var j = 0; j < data.width; j++) {
                init_graph[i][j] = (map[k] == 5 || (map[k] > 42 && map[k] <= 54)) ? 0 : 1;
                k++;
            }
        }
        initialize();
    }

    if (command === 'join') {
        players[players.length] = new Character(data.id, {x: data.x, y: data.y}, {x: data.x, y: data.y}, data.image);
    }

    if (command === 'move') {
        update(data.id, data.x, data.y);
    }

    if (command === 'message') {
        messages.innerHTML +=  data.username + ": " + data.content + "<br>";
        for (var p = 0; p < players.length; p++)
            if (players[p].playerId == data.id) {
                players[p].setMessage(data.content);
                break;
            }
        messages.scrollTop = messages.scrollHeight;
    }
};

function initialize() {
    document.getElementById('map').addEventListener("click", goTo, false);
    document.getElementById('send').addEventListener("click", say, false);
    document.getElementById('message').onkeypress = function(e){
    if (!e) e = window.event;
        var keyCode = e.keyCode || e.which;
        if (keyCode == '13'){
            say();
            return false;
        }
    };
    messages = document.getElementById('messages');
    staticCanvas = document.getElementById('static');
    staticContext = staticCanvas.getContext('2d');
    dynamicCanvas = document.getElementById('dynamic');
    dynamicContext = dynamicCanvas.getContext('2d');
    staticCanvas.width = mapWidth * tileSize;
    staticCanvas.height = mapHeight * tileSize;
    dynamicCanvas.width = mapWidth * tileSize;
    dynamicCanvas.height = mapHeight * tileSize;
    dynamicContext.font="bold 13px Tahoma";
    dynamicContext.fillStyle="yellow";
    tileImage = document.getElementById('tileset');
    playerImages['guy'] = document.getElementById('guy');
    playerImages['girl'] = document.getElementById('girl');
    objectsImage = document.getElementById('objects');
    drawMap();
    setInterval(renderFrame, 125);
}

function centerMap(x, y) {
    x -= tileSize * 7.5;
    y -= tileSize * 5;

    x = Math.max(0, x);
    y = Math.max(0, y);

    x = Math.min((mapWidth - (7.5 * 2)) * tileSize, x);
    y = Math.min((mapHeight - (5 * 2)) * tileSize, y);

    staticCanvas.style.left = dynamicCanvas.style.left = '-' + x + 'px';
    staticCanvas.style.top = dynamicCanvas.style.top = '-' + y + 'px';
}

function drawMap() {
    for (var i = 0, k = 0; i < mapHeight; i++) {
        for (var j = 0; j < mapWidth; j++) {
            drawTile(tileImage, map[k], j, i);
            if (objectsMap[k]) {
                drawTile(tileImage, objectsMap[k], j, i);
            }
            k++;
        }
    }
}

function renderFrame() {
    dynamicContext.clearRect(0, 0, dynamicCanvas.width, dynamicCanvas.height);
    drawPlayers();
}

function drawPlayers() {
    for (var i = 0; i < players.length; i++) {
        players[i].render();
    }
}

function drawPlayerTile(x, y, direction, sprite, image, message) {
    dynamicContext.drawImage(
        playerImages[image],
        sprite * tileSize,
        direction * playerTileHeight,
        tileSize,
        playerTileHeight,
        x,
        y - (playerTileHeight - tileSize),
        tileSize,
        playerTileHeight
    );
    if (message.length) {
        if (message.length > 16)
            message = message.substring(0, 16) + '...';
        var width = dynamicContext.measureText(message).width;
        var textX = x - ((width - tileSize) / 2);
        var textY = y - (playerTileHeight - tileSize) - 5;
        dynamicContext.beginPath();
        dynamicContext.rect(textX - 5, textY - 15, width + 10, 13 + 8);
        dynamicContext.fillStyle = 'black';
        dynamicContext.fill();
        dynamicContext.fillStyle = 'yellow';
        dynamicContext.fillText(message, textX, textY);
    }
}

function drawTile(image, tile, x, y) {
    tile--;
    staticContext.drawImage(
        image,
        (tile % 6) * tileSize,
        Math.floor(tile / 6) * tileSize,
        tileSize,
        tileSize,
        x * tileSize,
        y * tileSize,
        tileSize,
        tileSize
    );
}

function update(player, x, y) {
    for (var i = 0; i < players.length; i++) {
        if (players[i].playerId === player) {
            players[i].goTo(x, y);
        }
    }
}

function goTo(event)
{
    var map = document.getElementById("game");
    var x = Math.floor((event.clientX - parseInt(staticCanvas.style.left, 10) - parseInt(map.offsetLeft, 10)) / 32);
    var y = Math.floor((event.clientY - parseInt(staticCanvas.style.top, 10) - parseInt(map.offsetTop, 10)) / 32);
    send({command: 'move', x: x, y: y});
}

function say() {
    var content = document.getElementById("message");
    send({command: 'message', content: content.value});
    content.value = '';
}

function Character(id, position, target, image)
{
    this.playerId = id;
    this.position = position;
    this.target = target;
    this.nextTarget = {x: 0, y: 0};
    this.direction = 0;
    this.sprite = 0;
    this.offset = {x: 0, y: 0};
    this.path = [];
    this.image = image;
    this.message = "";
    this.goTo = function(x, y)
    {
        //if not moving
        if (this.position.x === this.target.x && this.position.y === this.target.y)
        {
            var graph = new Graph(init_graph);
            this.path = astar.search(graph, graph.grid[this.position.y][this.position.x], graph.grid[y][x]);
            if (this.path.length > 0) {
                this.target.x = this.path[0].y;
                this.target.y = this.path[0].x;
            }
        }
        else
        {
            this.nextTarget.x = x;
            this.nextTarget.y = y;
        }
    };
    this.render = function()
    {
        //if location diffrent than target go to target
        if (this.path.length > 0)
        {
            this.sprite = (this.sprite + 1) % 4;

            //first set y
            if (this.position.y < this.target.y)
            {
                this.offset.y += velocity;
                this.direction = 0;
            }
            else if (this.position.y > this.target.y)
            {
                this.offset.y -= velocity;
                this.direction = 3;
            }
            //then set x
            else if (this.position.x < this.target.x) {
                this.offset.x += velocity;
                this.direction = 2;
            }
            else if (this.position.x > this.target.x) {
                this.offset.x -= velocity;
                this.direction = 1;
            }

            //if reach new tile change location
            var checkNext = false;
            if (this.offset.y === tileSize)
            {
                this.offset.y = 0;
                this.position.y++;
                checkNext = true;
            }
            else if (this.offset.y === -tileSize)
            {
                this.offset.y = 0;
                this.position.y--;
                checkNext = true;
            }
            else if (this.offset.x === tileSize)
            {
                this.offset.x = 0;
                this.position.x++;
                checkNext = true;
            }
            else if (this.offset.x === -tileSize)
            {
                this.offset.x = 0;
                this.position.x--;
                checkNext = true;
            }

            if (checkNext) {
                this.path.shift();
                if (this.path.length > 0) {
                    this.target.x = this.path[0].y;
                    this.target.y = this.path[0].x;
                }
            }

            //check if target wasn't changed
            if(checkNext && (this.nextTarget.x !== 0 || this.nextTarget.y !== 0))
            {
                var graph = new Graph(init_graph);
                var test_path = astar.search(graph, graph.grid[this.position.y][this.position.x], graph.grid[this.nextTarget.y][this.nextTarget.x]);
                if (test_path.length > 0) {
                    this.path = test_path;
                    this.target.x = this.path[0].y;
                    this.target.y = this.path[0].x;
                }
                this.nextTarget.x = 0;
                this.nextTarget.y = 0;
            }
        }

        var x = this.position.x * tileSize + this.offset.x;
        var y = this.position.y * tileSize + this.offset.y;
        drawPlayerTile(x, y, this.direction, this.sprite, this.image, this.message);
        if (this.playerId === myPlayerId)
            centerMap(x, y);
    };
    this.setMessage = function(message) {
        this.message = message;
    };
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
    }
    return "";
}
