define(['invoke', 'logger'], function (Invoke, Logger) {

    function TimestampTest(collection) {
        this.execute = function (onSuccess) {
            collection.deleteMany({});
            var moment = new Date();
            var value = {$timestamp: {t: Math.floor(moment.getTime()/1000), i: 100}};
            collection.insertOne({data: value});
            var read = collection.findOne({});
            if (JSON.stringify(read.data) != JSON.stringify(value))
                throw 'Timestamp violation';
            Invoke.later(function () {
                onSuccess();
            });
        };
    }
    return TimestampTest;
});