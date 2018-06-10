package com.lizardsgames.tanar;

import java.util.Random;

public class Player {

    private int id;
    private String username;
    private int x;
    private int y;
    private String image;
    private static String[] images = new String[]{"player", "guy", "girl"};
    private String lastMessage;
    
    public Player(int id, String username) {
        this.id = id;
        this.username = username;
        this.x = 6;
        this.y = 5;
        if (username.charAt(username.length() - 1) == 'a') {
            this.image = images[2];
        } else {
            this.image = images[new Random().nextInt(images.length - 1)];
        }
    }
    
    @Override
    public boolean equals(Object obj) {
        if (obj == null) {
            return false;
        }
        if (getClass() != obj.getClass()) {
            return false;
        }
        Player other = (Player) obj;
        return this.getId() == other.getId();
    }

    @Override
    public int hashCode() {
        return getId();
    }

    public int getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public int getX() {
        return x;
    }

    public int getY() {
        return y;
    }
    
    public void setX(int x) {
        this.x = x;
    }

    public void setY(int y) {
        this.y = y;
    }
    
    public String getImage() {
        return this.image;
    }
    
    public String getMessage() {
        return lastMessage;
    }
    
    public void setMessage(String message) {
        lastMessage = message;
    }
}
