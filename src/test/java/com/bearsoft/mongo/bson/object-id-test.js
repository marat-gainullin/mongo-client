define(['invoke', 'logger'], function (Invoke, Logger) {

    function ObjectIdTest(collection) {
        this.execute = function (onSuccess) {
            collection.deleteMany({});
            var value = {$oid: '570f6d9b7529a61560cb7353'};
            collection.insertOne({data: value});
            var read = collection.findOne({});
            if (JSON.stringify(read.data) !== JSON.stringify(value))
                throw 'ObjectId violation';
            Invoke.later(function(){
                onSuccess();
            });
        };
    }
    return ObjectIdTest;
});