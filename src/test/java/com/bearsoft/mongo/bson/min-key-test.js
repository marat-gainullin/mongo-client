define(['invoke', 'logger'], function (Invoke, Logger) {

    function MinKeyTest(collection) {
        this.execute = function (onSuccess) {
            collection.deleteMany({});
            var value = {$minKey: 1};
            collection.insertOne({data: value});
            var read = collection.findOne({});
            if (JSON.stringify(read.data) !== JSON.stringify(value))
                throw 'MinKey violation';
            Invoke.later(function(){
                onSuccess();
            });
        };
    }
    return MinKeyTest;
});