define(['invoke', 'logger'], function (Invoke, Logger) {

    function BinaryTest(collection) {
        this.execute = function (onSuccess) {
            collection.deleteMany({});
            var value = {$type: 2, $binary: 'AQ8='};// Two bytes 0x01, 0x0f converted to string via utf-8
            collection.insertOne({data: value});
            var read = collection.findOne({});
            if (JSON.stringify(read.data) !== JSON.stringify(value))
                throw 'Binary violation';
            Invoke.later(function(){
                onSuccess();
            });
        };
    }
    return BinaryTest;
});