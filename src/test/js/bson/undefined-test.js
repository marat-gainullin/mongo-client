define(['invoke', 'logger', 'mongo-client'], function (Invoke, Logger, MongoClient) {
    function UndefinedTest() {
        this.execute = function (onSuccess, onFailure) {
            try {
                var client = MongoClient.connect('mongodb://localhost/test');
                try {
                    var collection = client.collection('test.test');
                    collection.deleteMany({});
                    var value = undefined;
                    collection.insertOne({data: value});
                    var read = collection.findOne({});
                    if (read.data !== undefined)
                        throw 'Undefined violation';
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
    return UndefinedTest;
});