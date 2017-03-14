define(['invoke', 'logger', 'mongo-client'], function (Invoke, Logger, MongoClient) {
    function MinKeyTest() {
        this.execute = function (onSuccess, onFailure) {
            try {
                var client = MongoClient.connect('mongodb://localhost/test');
                try {
                    var collection = client.collection('test.test');
                    collection.deleteMany({});
                    var value = {$minKey: 1};
                    collection.insertOne({data: value});
                    var read = collection.findOne({});
                    if (JSON.stringify(read.data) !== JSON.stringify(value))
                        throw 'MinKey violation';
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
    return MinKeyTest;
});