define(['invoke', 'logger'], function (Invoke, Logger) {

    function JavaScriptTest(collection) {
        this.execute = function (onSuccess) {
            collection.deleteMany({});
            var value = {$code: 'var a = 90;'};
            collection.insertOne({data: value});
            var read = collection.findOne({});
            if (JSON.stringify(read.data) != JSON.stringify(value))
                throw 'JavaScript violation';
            Invoke.later(function(){
                onSuccess();
            });
        };
    }
    return JavaScriptTest;
});