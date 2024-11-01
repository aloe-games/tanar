import json


class Map:
    def __init__(self):
        self.data = json.load(open('static/map.json', 'r'))
        self.tiles = self.data['layers'][0]['data']
        self.objects = self.data['layers'][1]['data']
        self.height = self.data['layers'][0]['height']
        self.width = self.data['layers'][0]['width']


class Player:
    def __init__(self, id, username):
        self.id = id
        self.username = username
        self.x = 6
        self.y = 5
        self.image = "girl" if username.endswith('a') else "guy"
        self.last_message = ""


class Game:
    def __init__(self):
        self.map = Map()
        self.players = {}

    def handle_message(self, id, message):
        to_player = []
        to_players = []

        command = message["command"]

        if command == "join":
            player = Player(id, message["username"])
            self.players[id] = player
            to_players.append({'command': 'join', 'id': player.id, 'username': player.username, 'image': player.image, 'x': player.x, 'y': player.y})
            to_player.append({'command': 'init', 'id': player.id, 'width': self.map.width, 'height': self.map.height, 'map': self.map.tiles, 'objects': self.map.objects})
            for player in self.players.values():
                if player.id != id:
                    to_player.append({'command': 'join', 'id': player.id, 'username': player.username, 'image': player.image, 'x': player.x, 'y': player.y})

        if command == "message":
            content = message["content"]
            player = self.players[id]
            player.last_message = content
            to_players.append({'command': 'message', 'id': player.id, 'username': player.username, 'content': content})

        if command == "move":
            x = message["x"]
            y = message["y"]
            player = self.players[id]
            player.x = x
            player.y = y
            to_players.append({'command': 'move', 'id': player.id, 'x': x, 'y': y})

        return to_player, to_players
