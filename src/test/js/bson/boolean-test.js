define(['invoke', 'logger', 'mongo-client'], function (Invoke, Logger, MongoClient) {
    function BooleanTest() {
        this.execute = function (onSuccess, onFailure) {
            try {
                var client = MongoClient.connect('mongodb://localhost/test');
                try {
                    var collection = client.collection('test.test');
                    collection.deleteMany({});
                    var value = true;
                    collection.insertOne({data: value});
                    var read = collection.findOne({});
                    if (JSON.stringify(read.data) !== JSON.stringify(value))
                        throw 'Boolean violation 1';
                    collection.deleteMany({});
                    value = new Boolean(true);
                    collection.insertOne({data: value});
                    read = collection.findOne({});
                    if (JSON.stringify(read.data) !== JSON.stringify(value))
                        throw 'Boolean violation 2';
                    collection.deleteMany({});
                    value = false;
                    collection.insertOne({data: value});
                    read = collection.findOne({});
                    if (JSON.stringify(read.data) !== JSON.stringify(value))
                        throw 'Boolean violation 3';
                    collection.deleteMany({});
                    value = new Boolean(false);
                    collection.insertOne({data: value});
                    read = collection.findOne({});
                    if (JSON.stringify(read.data) !== JSON.stringify(value))
                        throw 'Boolean violation 4';
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
    return BooleanTest;
});