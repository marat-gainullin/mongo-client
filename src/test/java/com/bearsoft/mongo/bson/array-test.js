define(['invoke', 'logger'], function (Invoke, Logger) {

    function ArrayTest(collection) {
        this.execute = function (onSuccess) {
            collection.deleteMany({});
            var value = [4, 'ttt', true, {n: 89, s: 'name', b: true}];
            collection.insertOne({data: value});
            var read = collection.findOne({});
            if (JSON.stringify(read.data) !== JSON.stringify(value))
                throw 'Array violation';
            Invoke.later(function(){
                onSuccess();
            });
        };
    }
    return ArrayTest;
});