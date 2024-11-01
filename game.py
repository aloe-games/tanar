import json


class Map:
    def __init__(self):
        self.data = json.load(open('static/map.json', 'r'))
        self.tiles = self.data['layers'][0]['data']
        self.objects = self.data['layers'][1]['data']
        self.height = self.data['layers'][0]['height']
        self.width = self.data['layers'][0]['width']


class Game:
    def __init__(self):
        self.map = Map()
        self.players = []

    def handle_command(self, command):
        to_player = []
        to_players = []

        username = command['username']
        to_player.append({'command': 'join', 'id': 3, 'username': username, 'image': 'guy', 'x': 6, 'y': 5})
        to_player.append({'command': 'init', 'id': 3, 'width': self.map.width, 'height': self.map.height, 'map': self.map.tiles, 'objects': self.map.objects})
        return to_player, to_players
