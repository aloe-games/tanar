<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
    <head>
        <title>Tanar</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <link href="main.css" rel="stylesheet" type="text/css">
        <script src="astar.js" type="text/javascript"></script>
        <script src="main.js?v=<%= (System.currentTimeMillis() / 1000L) %>" type="text/javascript"></script>
    </head>
    <body>
        <div id="game">
            <div id="map">
                <canvas id="static">
                </canvas>
                <canvas id="dynamic">
                </canvas>
            </div>
            <div id="inventory">Inventory2</div>
            <div id="chat">
                <div id="messages">
                </div>
                <div id="form">
                    <input type="text" id="message">
                    <input type="button" id="send" value="Send">
                </div>
            </div>
        </div>
        <div id="load">
            <img id="tileset" src="tileset.png">
            <img id="player" src="player.png">
            <img id="guy" src="guy.png">
            <img id="girl" src="girl.png">
        </div>
    </body>
</html>
