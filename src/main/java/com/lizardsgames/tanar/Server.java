package com.lizardsgames.tanar;

import javax.websocket.OnClose;
import javax.websocket.OnError;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;

@ServerEndpoint("/server")
public class Server {

    private static Game game = new Game();

    @OnOpen
    public void onOpen(Session session) {
        game.onOpen(session);
    }

    @OnMessage
    public void onMessage(String message, Session session) {
        game.onMessage(message, session);
    }

    @OnClose
    public void onClose(Session session) {
        game.onClose(session);
    }
    
    @OnError
    public void onError(Session session, Throwable th) {
        game.onError(session, th);
    }
}
