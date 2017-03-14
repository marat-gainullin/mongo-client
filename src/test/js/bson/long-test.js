define(['invoke', 'logger', 'mongo-client'], function (Invoke, Logger, MongoClient) {
    function LongTest() {
        this.execute = function (onSuccess, onFailure) {
            try {
                var client = MongoClient.connect('mongodb://localhost/test');
                try {
                    var collection = client.collection('test.test');
                    collection.deleteMany({});
                    var value = {$numberLong: '9223372036854775807'};// Long.MAX_VALUE
                    collection.insertOne({data: value});
                    var read = collection.findOne({});
                    if (JSON.stringify(read.data) !== JSON.stringify(value))
                        throw 'Long violation 1';
                    collection.deleteMany({});
                    value = {$numberLong: '-9223372036854775808'};// -Long.MIN_VALUE
                    collection.insertOne({data: value});
                    read = collection.findOne({});
                    if (JSON.stringify(read.data) !== JSON.stringify(value))
                        throw 'Long violation 2';
                } finally {
                    client.close();
                }
                Invoke.later(function () {
                    onSuccess();
                });
            } catch (e) {
                Invoke.later(function () {
                    onFailure(e);
                });
            }
        };
    }
    return LongTest;
});