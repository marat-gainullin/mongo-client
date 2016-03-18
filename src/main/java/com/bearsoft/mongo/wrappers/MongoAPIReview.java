/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.bearsoft.mongo.wrappers;

import com.mongodb.ConnectionString;
import com.mongodb.async.client.MongoClient;
import com.mongodb.async.client.MongoClientSettings;
import com.mongodb.async.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.event.CommandListener;
import java.net.URL;
import java.net.URLClassLoader;
import java.security.MessageDigest;
import org.bson.BsonDocument;

/**
 *
 * @author mg
 */
public class MongoAPIReview {

    public static void main(String[] args) throws Throwable {
        
        BsonDocument d = BsonDocument.parse("6");
        d.asObjectId();
    }

}
