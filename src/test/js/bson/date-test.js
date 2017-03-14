define(['invoke', 'logger', 'mongo-client'], function (Invoke, Logger, MongoClient) {
    function DateTest() {
        this.execute = function (onSuccess, onFailure) {
            try {
                var client = MongoClient.connect('mongodb://localhost/test');
                try {
                    var collection = client.collection('test.test');
                    collection.deleteMany({});
                    var moment = new Date();
                    var value = moment;
                    collection.insertOne({data: value});
                    var read = collection.findOne({});
                    if (JSON.stringify(read.data) !== JSON.stringify(moment))
                        throw 'Date violation 1';
                    collection.deleteMany({});
                    value = {$date: {$numberLong: '' + moment.getTime()}};
                    collection.insertOne({data: value});
                    read = collection.findOne({});
                    if (JSON.stringify(read.data) !== JSON.stringify(moment))
                        throw 'Date violation 2';
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
    return DateTest;
});