define(['invoke', 'logger', 'mongo-client'], function (Invoke, Logger, MongoClient) {
    function TimestampTest() {
        this.execute = function (onSuccess, onFailure) {
            try {
                var client = MongoClient.connect('mongodb://localhost/test');
                try {
                    var collection = client.collection('test.test');
                    collection.deleteMany({});
                    var moment = new Date();
                    var value = {$timestamp: {t: Math.floor(moment.getTime() / 1000), i: 100}};
                    collection.insertOne({data: value});
                    var read = collection.findOne({});
                    if (JSON.stringify(read.data) != JSON.stringify(value))
                        throw 'Timestamp violation';
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
    return TimestampTest;
});