package com.lizardsgames.tanar;

import java.io.FileNotFoundException;
import java.io.FileReader;
import javax.json.Json;
import javax.json.JsonArray;
import javax.json.JsonObject;

public class Map {

    private String path = "/map.json";
    private JsonObject json;
    private int width;
    private int height;
    private JsonArray tiles;
    private JsonArray objects;
    
    public Map(String path) {
        try {
            json = Json.createReader(new FileReader(path + this.path)).readObject();
            width = json.getInt("width");
            JsonArray layers = json.getJsonArray("layers");
            JsonObject tiles = layers.getJsonObject(0);
            this.tiles = tiles.getJsonArray("data");
            JsonObject objects = layers.getJsonObject(1);
            this.objects = objects.getJsonArray("data");
            height = tiles.getInt("height");
        } catch (FileNotFoundException ex) {
            System.err.println(ex.getMessage());
        }
    }

    public int getWidth() {
        return width;
    }

    public int getHeight() {
        return height;
    }

    public JsonArray getTiles() {
        return tiles;
    }

    public JsonArray getObjects() {
        return objects;
    }
}
