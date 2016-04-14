define(['invoke', 'logger'], function (Invoke, Logger) {

    function ObjectTest(collection) {
        this.execute = function (onSuccess) {
            collection.deleteMany({});
            var value = {s: 'tttt', b: true, o: {n: 89}, a: [90, 'yyy', false]};
            collection.insertOne({data: value});
            var read = collection.findOne({});
            if (JSON.stringify(read.data) !== JSON.stringify(value))
                throw 'Object violation';
            collection.deleteMany({});
            Invoke.later(function () {
                onSuccess();
            });
        };
    }
    return ObjectTest;
});