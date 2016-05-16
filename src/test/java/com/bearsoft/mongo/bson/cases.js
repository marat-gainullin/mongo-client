define([
    '../../../../../../main/java/com/bearsoft/mongo/client/mongo-client'
            , './date-test'
            , './array-test'
            , './binary-test'
            , './boolean-test'
            , './date-test'
            , './double-test'
            //, './javascript-test'
            //, './javascript-with-scope-test'
            , './long-test'
            , './max-key-test'
            , './min-key-test'
            , './null-test'
            , './object-id-test'
            , './object-test'
            , './regexp-test'
            , './string-test'
            , './timestamp-test'
            , './undefined-test'
], function (MongoClient) {
    var client = MongoClient.connect('mongodb://localhost/test');
    var collection = client.collection('test.test');
    var tests = [];
    for (var i = 1; i < arguments.length - 1; i++)
        tests.push(new arguments[i](collection));
    return tests;
});