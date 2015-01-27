package com.lizardsgames.tanar;

import java.io.IOException;
import java.util.Collections;
import java.util.Set;
import java.util.Timer;
import java.util.TimerTask;
import java.util.concurrent.ConcurrentHashMap;
import javax.websocket.Session;

public class Game extends TimerTask {

    private Set<Session> sessions = Collections.newSetFromMap(new ConcurrentHashMap<Session, Boolean>());
    private Timer timer;
    private Clock clock;
    
    public Game() {
        timer = new Timer();
        clock = new Clock();
        timer.schedule(this, 1000, 1000);
    }
    
    public void onOpen(Session session) {
        sessions.add(session);
    }

    public void onMessage(String message, Session session) {
        broadcastMessage(message);
    }

    public void sendMessage(String message, Session session) {
        try {
            session.getBasicRemote().sendText(message);
        } catch (IOException ex) {
            System.err.println(ex.getMessage());
        }
    }

    public void broadcastMessage(String message) {
        for (Session session : sessions) {
            sendMessage(message, session);
        }
    }

    public void onClose(Session session) {
        sessions.remove(session);
    }
    
    public void onError(Session session, Throwable th) {
        onClose(session);
        System.err.println(th.getMessage());
    }

    @Override
    public void run() {
        broadcastMessage("{\"time\":" + clock.getTime() + "}");
        clock.tickTock();
    }
}
