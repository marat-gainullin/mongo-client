define(['../options', 'logger'], function (Options, Logger) {
    function DatabaseCollectionNamesTest() {
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
                    var collections = database.collectionNames();
                    if (undefined == collections)
                        throw 'client.database.collections violation';
                    collections.forEach(function (aName) {
                        Logger.info('collection name - ' + aName);
                    }, function () {
                        complete();
                    }, function (e) {
                        complete(e);
                    });
                } catch (e) {
                    complete(e);
                }
            });
        };
    }
    return DatabaseCollectionNamesTest;
});