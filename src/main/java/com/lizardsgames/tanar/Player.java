package com.lizardsgames.tanar;

import java.util.Random;

public class Player {

    private int id;
    private String username;
    private int x;
    private int y;
    private String image;
    private static String[] images = new String[]{"player", "guy", "girl"};
    
    public Player(int id, String username) {
        this.id = id;
        this.username = username;
        this.x = 3;
        this.y = 2;
        int rand = new Random().nextInt(images.length);
        this.image = images[rand];
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
}
