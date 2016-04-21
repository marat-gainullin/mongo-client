define(['invoke', 'logger'], function (Invoke, Logger) {

    function UndefinedTest(collection) {
        this.execute = function (onSuccess) {
            collection.deleteMany({});
            var value = undefined;
            collection.insertOne({data: value});
            var read = collection.findOne({});
            if (read.data !== undefined)
                throw 'Undefined violation';
            Invoke.later(function(){
                onSuccess();
            });
        };
    }
    return UndefinedTest;
});