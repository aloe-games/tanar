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

    def handle_command(self, id, command):
        to_player = []
        to_players = []

        if command["command"] == "join":
            player = Player(id, command["username"])
            self.players[id] = player
            to_players.append({'command': 'join', 'id': player.id, 'username': player.username, 'image': player.image, 'x': player.x, 'y': player.y})
            to_player.append({'command': 'init', 'id': player.id, 'width': self.map.width, 'height': self.map.height, 'map': self.map.tiles, 'objects': self.map.objects})
            for player in self.players.values():
                if player.id != id:
                    to_player.append({'command': 'join', 'id': player.id, 'username': player.username, 'image': player.image, 'x': player.x, 'y': player.y})

        return to_player, to_players
