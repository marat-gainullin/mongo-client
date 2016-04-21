define(['invoke', 'logger'], function (Invoke, Logger) {

    function JavaScriptWithScopeTest(collection) {
        this.execute = function (onSuccess) {
            collection.deleteMany({});
            var value = {$code: 'var a = 90;', $scope: {b: 'ggg', n: 58}};
            collection.insertOne({data: value});
            var read = collection.findOne({});
            if (JSON.stringify(read.data) != JSON.stringify(value))
                throw 'JavaScriptWithScope violation';
            Invoke.later(function(){
                onSuccess();
            });
        };
    }
    return JavaScriptWithScopeTest;
});