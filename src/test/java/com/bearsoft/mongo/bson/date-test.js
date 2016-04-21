define(['invoke', 'logger'], function (Invoke, Logger) {

    function DateTest(collection) {
        this.execute = function (onSuccess) {
            collection.deleteMany({});
            var moment = new Date();
            var value = moment;
            collection.insertOne({data: value});
            var read = collection.findOne({});
            if (JSON.stringify(read.data) !== JSON.stringify(moment))
                throw 'Date violation 1';
            collection.deleteMany({});
            value = {$date: {$numberLong: '' + moment.getTime()}};
            collection.insertOne({data: value});
            read = collection.findOne({});
            if (JSON.stringify(read.data) !== JSON.stringify(moment))
                throw 'Date violation 2';
            Invoke.later(function(){
                onSuccess();
            });
        };
    }
    return DateTest;
});