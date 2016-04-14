define(['invoke', 'logger'], function (Invoke, Logger) {

    function StringTest(collection) {
        this.execute = function (onSuccess) {
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
            Invoke.later(function () {
                onSuccess();
            });
        };
    }
    return StringTest;
});