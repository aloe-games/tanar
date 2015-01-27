package com.lizardsgames.tanar;

public class Clock {

    private int time;
    
    public Clock() {
        time = 0;
    }
    
    public void tickTock() {
        time++;
    }
    
    public int getTime() {
        return time;
    }
}
