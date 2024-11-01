from flask import Flask
from flask import render_template
from flask_sock import Sock

app = Flask(__name__)
sock = Sock(app)


@app.route("/")
def index():
    return render_template('index.html')


@sock.route('/server')
def echo(ws):
    while True:
        data = ws.receive()
        print(data)
        ws.send(data)
