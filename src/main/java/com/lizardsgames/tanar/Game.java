package com.lizardsgames.tanar;

import java.io.IOException;
import java.io.StringReader;
import java.util.Collections;
import java.util.Set;
import java.util.Timer;
import java.util.TimerTask;
import java.util.concurrent.ConcurrentHashMap;
import javax.json.Json;
import javax.json.JsonObject;
import javax.websocket.Session;
import org.apache.commons.lang3.StringEscapeUtils;

public class Game extends TimerTask {

    private Set<Session> sessions = Collections.newSetFromMap(new ConcurrentHashMap<Session, Boolean>());
    private Timer timer;
    private Clock clock;
    private int playerCounter = 1;
    private Map map;
    private String path;
    
    public Game(String path) {
        timer = new Timer();
        clock = new Clock();
        this.path = path;
        map = new Map(path);
        timer.schedule(this, 1000, 1000);
    }
    
    public void onOpen(Session session) {
        sessions.add(session);
    }

    public void onMessage(String message, Session session) {
        System.out.println("Recieve: " + message);
        JsonObject data = Json.createReader(new StringReader(message)).readObject();
        String command = data.getString("command");
        switch(command) {
            case "join":
                this.join(session, data);
                break;
            case "move":
                this.move(session, data);
                break;
            case "message":
                this.message(session, data);
                break;
        }
    }

    public void sendMessage(String message, Session session) {
        try {
            System.out.println("Send: " + message);
            session.getBasicRemote().sendText(message);
        } catch (IOException ex) {
            System.err.println(ex.getMessage());
        }
    }

    public void broadcastMessage(String message) {
        for (Session session : sessions) {
            if (session.getUserProperties().containsKey("player")) {
                sendMessage(message, session);
            }
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
        clock.tickTock();
    }
    
    private void join(Session session, JsonObject data) {
        String username = StringEscapeUtils.escapeHtml4(data.getString("username"));
        Player player = new Player(this.playerCounter++, username);
        session.getUserProperties().put("player", player);
        JsonObject join = Json.createObjectBuilder()
                .add("command", "join")
                .add("id", player.getId())
                .add("username", player.getUsername())
                .add("image", player.getImage())
                .add("x", player.getX())
                .add("y", player.getY())
                .build();
        this.broadcastMessage(join.toString());
        JsonObject init = Json.createObjectBuilder()
                .add("command", "init")
                .add("id", player.getId())
                .add("width", this.map.getWidth())
                .add("height", this.map.getHeight())
                .add("map", this.map.getTiles())
                .add("objects", this.map.getObjects())
                .build();
        this.sendMessage(init.toString(), session);
        //send existing players
        for (Session s : sessions) {
            if (s.getUserProperties().containsKey("player")) {
                Player other = (Player) s.getUserProperties().get("player");
                if (!player.equals(other)) {
                    join = Json.createObjectBuilder()
                        .add("command", "join")
                        .add("id", other.getId())
                        .add("username", other.getUsername())
                        .add("image", other.getImage())
                        .add("x", other.getX())
                        .add("y", other.getY())
                        .build();
                    this.sendMessage(join.toString(), session);
                }
            }
        }
    }
    
    private void move(Session session, JsonObject data) {
        Player player = (Player) session.getUserProperties().get("player");
        player.setX(data.getInt("x"));
        player.setY(data.getInt("y"));
        JsonObject move = Json.createObjectBuilder()
            .add("command", "move")
            .add("id", player.getId())
            .add("x", player.getX())
            .add("y", player.getY())
            .build();
        this.broadcastMessage(move.toString());
    }
    
    private void message(Session session, JsonObject data) {
        Player player = (Player) session.getUserProperties().get("player");
        String userMessage = StringEscapeUtils.escapeHtml4(data.getString("content"));
        player.setMessage(userMessage);
        player.setMessage(path);
        JsonObject message = Json.createObjectBuilder()
            .add("command", "message")
            .add("username", player.getUsername())
            .add("id", player.getId())
            .add("content", userMessage)
            .build();
        this.broadcastMessage(message.toString());
    }
}
