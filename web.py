import time

from flask import Flask, request
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
def server(client):
    while True:
        server.message(client, client.receive())


@app.route("/chat", methods=['POST'])
def chat():
    time.sleep(2)
    conversation = request.json
    message = "Hello"
    if len(conversation) > 2:
        message = "You are bringing too much attention"
    if len(conversation) > 4:
        message = "It's not safe here"
    return {"message": message}
