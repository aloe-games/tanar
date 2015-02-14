window.addEventListener("load", function() {connect();}, false);

var websocket;

var connect = function() {
    websocket = new WebSocket("ws://" + document.location.host + document.location.pathname + "server");
    websocket.onopen = console.log;
    websocket.onerror = console.log;
    websocket.onclose = console.log;
    websocket.onmessage = function(message) {
        message = replaceAll('"[', '[', message.data);
        message = replaceAll(']"', ']', message);
        console.log("Recieve: " + message);
        receive(JSON.parse(message));
    };
    var username = prompt("Username:", getCookie("username"));
    setCookie("username", username, 365);
    send({command: 'join', username: username});
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
var playerImage;
var objectsImage;

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
                init_graph[i][j] = map[k] == 3 ? 0 : 1;
                k++;
            }
        }
        initialize();
    }
    
    if (command === 'join') {
        players[players.length] = new Character(data.id, {x: data.x, y: data.y}, {x: data.x, y: data.y});
    }
    
    if (command === 'move') {
        update(data.id, data.x, data.y);
    }
    
    if (command === 'message') {
        messages.innerHTML +=  data.username + ": " + data.content + "<br>";
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
    tileImage = document.getElementById('tileset');
    playerImage = document.getElementById('player');
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
            drawTile(tileImage, 0, map[k], j, i);
            if (objectsMap[k]) {
                drawTile(objectsImage, 4, objectsMap[k], j, i);
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

function drawPlayerTile(x, y, direction, sprite) {
    dynamicContext.drawImage(
        playerImage,
        sprite * tileSize,
        direction * playerTileHeight,
        tileSize,
        playerTileHeight,
        x,
        y - (playerTileHeight - tileSize),
        tileSize,
        playerTileHeight
    );
}

function drawTile(image, offset, tile, x, y) {
    staticContext.drawImage(
        image,
        (tile - offset - 1) * tileSize,
        0,
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

function Character(id, position, target)
{
    this.playerId = id;
    this.position = position;
    this.target = target;
    this.nextTarget = {x: 0, y: 0};
    this.direction = 0;
    this.sprite = 0;
    this.offset = {x: 0, y: 0};
    this.path = [];
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
        drawPlayerTile(x, y, this.direction, this.sprite);
        if (this.playerId === myPlayerId)
            centerMap(x, y);
    };
}

function escapeRegExp(string) {
    return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

function replaceAll(find, replace, string) {
    return string.replace(new RegExp(escapeRegExp(find), 'g'), replace);
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