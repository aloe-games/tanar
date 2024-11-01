import json

from game import Game


class Server:
    def __init__(self):
        self.clients = []
        self.game = Game()

    def message(self, client, message):
        if client not in self.clients:
            self.clients.append(client)
        id = self.clients.index(client) + 1
        to_client, for_broadcast = self.game.handle_message(id, json.loads(message))
        for message in to_client:
            client.send(json.dumps(message))
        for message in for_broadcast:
            for client in self.clients:
                client.send(json.dumps(message))
