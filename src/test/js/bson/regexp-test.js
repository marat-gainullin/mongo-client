define(['invoke', 'logger', 'mongo-client'], function (Invoke, Logger, MongoClient) {

    function regExpIsEqual(regExp1, regExp2) {
        return regExp1.source == regExp2.source
                && regExp1.global == regExp2.global
                && regExp1.ignoreCase == regExp2.ignoreCase
                && regExp1.multiline == regExp2.multiline;
    }

    function RegExpTest() {
        this.execute = function (onSuccess, onFailure) {
            try {
                var client = MongoClient.connect('mongodb://localhost/test');
                try {
                    var collection = client.collection('test.test');
                    collection.deleteMany({});
                    var value = /w+/gi;
                    collection.insertOne({data: value});
                    var read = collection.findOne({});
                    if (!regExpIsEqual(read.data, value))
                        throw 'RegExp violation 1';
                    collection.deleteMany({});
                    value = new RegExp('w+', 'gi');
                    collection.insertOne({data: value});
                    read = collection.findOne({});
                    if (!regExpIsEqual(read.data, value))
                        throw 'RegExp violation 2';
                    collection.deleteMany({});
                    value = new RegExp('w+', 'gi');
                    collection.insertOne({data: {$regex: 'w+', $options: 'gi'}});
                    read = collection.findOne({});
                    if (!regExpIsEqual(read.data, value))
                        throw 'RegExp violation 3';
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
    return RegExpTest;
});