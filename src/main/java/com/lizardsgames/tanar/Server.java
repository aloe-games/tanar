package com.lizardsgames.tanar;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import javax.servlet.annotation.WebListener;
import javax.websocket.OnClose;
import javax.websocket.OnError;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;

@WebListener
@ServerEndpoint(value="/server")
public class Server implements ServletContextListener {

    private static Game game;

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

    @Override
    public void contextInitialized(ServletContextEvent sce) {
        game = new Game(sce.getServletContext().getRealPath("/"));
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        game.stop();
    }
}
