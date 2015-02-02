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
    send({command: 'join', username: prompt("Username:", "Marek")});
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

//my user id
var id;
var map;

var receive = function(data) {
    var command = data.command;
    
    if(command == 'init') {
        myPlayerId = data.id;
        map = data.map;
        objectsMap = data.objects;
        mapWidth = data.width;
    	mapHeight = data.height;
        initialize();
    }
    
    if (command === 'join') {
        players[players.length] = new Character(data.id, {x: data.x, y: data.y}, {x: data.x, y: data.y});
    }
    
    if (command === 'move') {
        update(data.id, data.x, data.y)
    }
};

function initialize() {
    document.getElementById('map').addEventListener("click", goTo, false);
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

function Character(id, position, target)
{
    this.playerId = id;
    this.position = position;
    this.target = target;
    this.nextTarget = {x: 0, y: 0};
    this.direction = 0;
    this.sprite = 0;
    this.offset = {x: 0, y: 0};
    this.goTo = function(x, y)
    {
        //if not moving
        if (this.position.x === this.target.x && this.position.y === this.target.y)
        {
            this.target.x = x;
            this.target.y= y;
        }
        else
        {
            this.nextTarget.x = x;
            this.nextTarget.y= y;
        }
    };
    this.render = function()
    {
        //if location diffrent than target go to target
        if (this.position.x !== this.target.x || this.position.y !== this.target.y)
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
            
            //check if target wasn't changed
            if(checkNext && (this.nextTarget.x !== 0 || this.nextTarget.y !== 0))
            {
                this.target.x = this.nextTarget.x;
                this.target.y = this.nextTarget.y;
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