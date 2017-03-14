define(['invoke', 'logger', 'mongo-client'], function (Invoke, Logger, MongoClient) {
    function DoubleTest() {
        this.execute = function (onSuccess, onFailure) {
            try {
                var client = MongoClient.connect('mongodb://localhost/test');
                try {
                    var collection = client.collection('test.test');
                    collection.deleteMany({});
                    var value = 56.87;
                    collection.insertOne({data: value});
                    var read = collection.findOne({});
                    if (read.data != value)
                        throw 'Double violation 1';
                    collection.deleteMany({});
                    value = new Number(56.87);
                    collection.insertOne({data: value});
                    read = collection.findOne({});
                    if (read.data != value)
                        throw 'Double violation 2';
                    collection.deleteMany({});
                    value = NaN;
                    collection.insertOne({data: value});
                    read = collection.findOne({});
                    if (!isNaN(read.data))
                        throw 'Double violation 3';
                    value = Infinity;
                    collection.insertOne({data: value});
                    read = collection.findOne({});
                    if (!isNaN(read.data))
                        throw 'Double violation 4';
                    value = -Infinity;
                    collection.insertOne({data: value});
                    read = collection.findOne({});
                    if (!isNaN(read.data))
                        throw 'Double violation 5';
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
    return DoubleTest;
});