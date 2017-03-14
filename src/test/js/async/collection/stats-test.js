define(['../options'], function (Options) {
    function StatsTest() {
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
                        aCollection.stats(1, true, function (aStats) {
                            if (undefined == aStats)
                                complete('stats-test violation');
                            else
                                aCollection.drop(complete, complete);
                        }, complete);
                    }, complete);
                } catch (e) {
                    complete(e);
                }
            });
        };
    }
    return StatsTest;
});