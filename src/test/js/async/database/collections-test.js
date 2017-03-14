define(['../options', 'logger'], function (Options, Logger) {
    function DatabaseCollectionsTest() {
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
                    var collections = database.collections();
                    if (undefined == collections)
                        throw 'client.database.collections violation';
                    collections.forEach(function (aCollection) {
                        Logger.info('collection - ' + aCollection);
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
    return DatabaseCollectionsTest;
});