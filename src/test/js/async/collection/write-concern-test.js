define(['../options'], function (Options) {
    function CollectionWriteConcernTest() {
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
                        if(undefined == aCollection.writeConcern())
                            complete('write-concern violation');
                        else
                            aCollection.drop(complete, complete);
                    }, complete);
                } catch (e) {
                    complete(e);
                }
            });
        };
    }
    return CollectionWriteConcernTest;
});