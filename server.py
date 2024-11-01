import json


class Server:
    def __init__(self):
        self.map = json.load(open('static/map.json', 'r'))

    def message(self, ws, message):
        username = message['username']
        join = {'command': 'join', 'id': 3, 'username': username, 'image': 'guy', 'x': 6, 'y': 5}
        ws.send(json.dumps(join))
        init = {'command': 'init', 'id': 3, 'width': 45, 'height': 30, 'map': self.map['layers'][0]['data'], 'objects': self.map['layers'][1]['data']}
        ws.send(json.dumps(init))
