define(['invoke', 'logger'], function (Invoke, Logger) {

    function BooleanTest(collection) {
        this.execute = function (onSuccess) {
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
            Invoke.later(function(){
                onSuccess();
            });
        };
    }
    return BooleanTest;
});