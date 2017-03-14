define(['../options'], function (Options) {
    function DropDatabaseTest() {
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
                    database.drop(function () {
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
    return DropDatabaseTest;
});