define(['invoke', 'logger', 'mongo-client'], function (Invoke, Logger, MongoClient) {
    function StringTest() {
        this.execute = function (onSuccess, onFailure) {
            try {
                var client = MongoClient.connect('mongodb://localhost/test');
                try {
                    var collection = client.collection('test.test');
                    collection.deleteMany({});
                    var value = 'text text text';
                    collection.insertOne({data: value});
                    var read = collection.findOne({});
                    if (read.data != value)
                        throw 'String violation 1';
                    collection.deleteMany({});
                    value = new String('text text text');
                    collection.insertOne({data: value});
                    read = collection.findOne({});
                    if (read.data != value)
                        throw 'String violation 2';
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
    return StringTest;
});