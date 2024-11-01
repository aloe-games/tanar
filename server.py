import json

from game import Game


class Server:
    def __init__(self):
        self.clients = []
        self.game = Game()

    def message(self, client, message):
        if client not in self.clients:
            self.clients.append(client)
        to_client, for_broadcast = self.game.handle_command(json.loads(message))
        for message in to_client:
            client.send(json.dumps(message))
        for message in for_broadcast:
            for client in self.clients:
                client.send(json.dumps(message))
