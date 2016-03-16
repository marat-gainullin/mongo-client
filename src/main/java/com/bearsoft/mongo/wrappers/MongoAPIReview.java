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
import org.bson.BsonDocument;
import org.bson.BsonElement;
import org.bson.BsonUndefined;
import org.bson.BsonValue;

/**
 *
 * @author mg
 */
public class MongoAPIReview {

    public void test() {
        BsonValue bv;
        BsonUndefined bu;
        BsonElement be;
        BsonDocument bd;
        MongoClientSettings mcs;
        ConnectionString cs;
        MongoClient c = MongoClients.create();
    }

}
