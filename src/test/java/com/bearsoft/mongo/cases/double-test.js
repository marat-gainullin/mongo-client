define(['invoke', 'logger'], function (Invoke, Logger) {

    function DoubleTest(collection) {
        this.execute = function (onSuccess) {
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
            Invoke.later(function(){
                onSuccess();
            });
        };
    }
    return DoubleTest;
});