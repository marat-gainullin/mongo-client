define(['invoke', 'logger'], function (Invoke, Logger) {

    function NullTest(collection) {
        this.execute = function (onSuccess) {
            collection.deleteMany({});
            var value = null;
            collection.insertOne({data: value});
            var read = collection.findOne({});
            if (JSON.stringify(read.data) !== JSON.stringify(value))
                throw 'Null violation';
            Invoke.later(function(){
                onSuccess();
            });
        };
    }
    return NullTest;
});