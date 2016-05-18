define(['../options'], function (Options) {
    function GeoNearTest() {
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
                            , {loc: [0.2, 0.5], p1: 'blah blah', p2: 65, p3: true, p4: null}
                        ], {}, function () {
                            aCollection.createIndex({loc: '2dsphere'}, {}, function (anIndex) {
                                aCollection.geoNear(0, 0, {spherical: true, maxDistance: 1.5}, function (aResult) {
                                    if (undefined == aResult)
                                        complete('geo-near violation');
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
    return GeoNearTest;
});