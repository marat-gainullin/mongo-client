define(['invoke', 'logger'], function (Invoke, Logger) {

    function LongTest(collection) {
        this.execute = function (onSuccess) {
            collection.deleteMany({});
            var value = {$numberLong: '9223372036854775807'};// Long.MAX_VALUE
            collection.insertOne({data: value});
            var read = collection.findOne({});
            if (JSON.stringify(read.data) != JSON.stringify(value))
                throw 'Long violation 1';
            collection.deleteMany({});
            value = {$numberLong: '-9223372036854775808'};// -Long.MIN_VALUE
            collection.insertOne({data: value});
            read = collection.findOne({});
            if (JSON.stringify(read.data) != JSON.stringify(value))
                throw 'Long violation 2';
            Invoke.later(function(){
                onSuccess();
            });
        };
    }
    return LongTest;
});