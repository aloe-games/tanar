import json

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
def echo(ws):
    while True:
        server.message(ws, json.loads(ws.receive()))
