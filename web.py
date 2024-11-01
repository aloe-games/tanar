from flask import Flask
from flask import render_template
from flask_sock import Sock

from server import Server

app = Flask(__name__)
sock = Sock(app)
server = Server()


@app.route("/")
def index():
    return render_template('index.html')


@sock.route('/server')
def echo(client):
    while True:
        server.message(client, client.receive())
