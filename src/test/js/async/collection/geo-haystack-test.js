define(['../options'], function (Options) {
    function GeoHayStackTest() {
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
                        aCollection.insertMany([
                            {loc: [1.2, 0.5], p1: 'blah', p2: 65, p3: true, p4: null}
                            , {loc: [1.2, 0.5], p1: 'blah blah', p2: 65, p3: true, p4: null}
                        ], {}, function () {
                            aCollection.createIndex({loc: 'geoHaystack', p2: 1}, {bucketSize: 10}, function (anIndex) {
                                aCollection.geoHaystackSearch(0, 0, {search: {p2: 65}, maxDistance: 1.5}, function (aResult) {
                                    if (undefined == aResult)
                                        complete('geo-haystack violation');
                                    else
                                        aCollection.drop(complete, complete);
                                }, complete);
                            }, complete);
                        }, complete);
                    }, complete);
                } catch (e) {
                    complete(e);
                }
            });
        };
    }
    return GeoHayStackTest;
});