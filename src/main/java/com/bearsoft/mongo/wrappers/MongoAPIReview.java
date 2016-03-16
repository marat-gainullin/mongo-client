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

/**
 *
 * @author mg
 */
public class MongoAPIReview {

    public static void main(String[] args) throws Throwable {
        MongoClientSettings mcs;
        ConnectionString cs;
        MongoClient c = MongoClients.create();
    }

}
