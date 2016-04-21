define(['invoke', 'logger'], function (Invoke, Logger) {

    function MaxKeyTest(collection) {
        this.execute = function (onSuccess) {
            collection.deleteMany({});
            var value = {$maxKey: 1};
            collection.insertOne({data: value});
            var read = collection.findOne({});
            if (JSON.stringify(read.data) !== JSON.stringify(value))
                throw 'MaxKey violation';
            Invoke.later(function(){
                onSuccess();
            });
        };
    }
    return MaxKeyTest;
});