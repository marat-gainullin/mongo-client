define([
    './cases/date-test'
            , './cases/array-test'
            , './cases/binary-test'
            , './cases/boolean-test'
            , './cases/date-test'
            , './cases/double-test'
            //, './cases/javascript-test'
            //, './cases/javascript-with-scope-test'
            , './cases/long-test'
            , './cases/max-key-test'
            , './cases/min-key-test'
            , './cases/null-test'
            , './cases/object-id-test'
            , './cases/object-test'
            , './cases/regexp-test'
            , './cases/string-test'
            , './cases/timestamp-test'
            , './cases/undefined-test'
            , '../../../../src/main/java/com/bearsoft/mongo/client/mongo-client'
], function () {
    var MongoClient = arguments[arguments.length - 2];
    var client = MongoClient.connect('mongodb://localhost/test');
    var collection = client.collection('test.test');
    var tests = [];
    for (var i = 0; i < arguments.length - 2; i++)
        tests.push(new arguments[i](collection));
    return tests;
});