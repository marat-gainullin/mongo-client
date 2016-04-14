/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.bearsoft.mongo.wrappers;

import org.bson.BsonDouble;
import org.bson.BsonInt64;

/**
 *
 * @author mg
 */
public class MongoAPIReview {

    public static void main(String[] args) throws Throwable {
        BsonDouble bd = new BsonDouble(Double.NEGATIVE_INFINITY);
        BsonInt64 blMax = new BsonInt64(Long.MAX_VALUE);
        BsonInt64 blMin = new BsonInt64(Long.MIN_VALUE);
        System.out.print(Long.MAX_VALUE);
        System.out.print(Long.MIN_VALUE);
    }

}
