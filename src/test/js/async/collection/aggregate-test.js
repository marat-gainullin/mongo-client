define(['logger', '../options'], function (Logger, Options) {
    function AggregateTest() {
        this.execute = function (aOnSuccess, aOnFailure) {
            Options.with(function (aClient, aOnComplete) {
                function complete(e) {
                    aOnComplete();
                    if (e)
                        aOnFailure(e);
                    else
                        aOnSuccess();
                }
                try {
                    var database = aClient.database('test');
                    if (undefined == database)
                        throw 'client.database violation';
                    //database.collection('kill-me-please').drop(complete, complete); return;
                    database.createCollection('kill-me-please', {}, function (aCollection) {
                        aCollection.insertOne({p1: 'blah', p2: 65, p3: true, p4: null}, function () {
                            var found = aCollection.aggregate([{$match: {p1: 'blah'}}]);
                            var foundCount = 0;
                            found.forEach(function (anElement) {
                                foundCount++;
                                Logger.info('found - ' + anElement);
                            }, function () {
                                if (foundCount !== 1)
                                    complete('aggregate violation');
                                else{
                                    aCollection.drop(complete, complete);
                                }
                            }, complete);
                        }, complete);
                    }, complete);
                } catch (e) {
                    complete(e);
                }
            });
        };
    }
    return AggregateTest;
});