define(['../options'], function (Options) {
    function CreateCollectionTest() {
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
                    var database = aClient.database('test1');
                    if (undefined == database)
                        throw 'client.database violation';
                    database.createCollection('kill-me-please', {}, function (aResult) {
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
    return CreateCollectionTest;
});