define(['../options'], function (Options) {
    function DatabaseCommandTest() {
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
                    database.command({buildInfo: 1}, function (aResult) {
                        if (undefined == aResult)
                            complete('comand-test violation 1');
                        else {
                            database.setCommandReadPreference({mode: 'nearest'});
                            database.command({buildInfo: 1}, function (aResult) {
                                if (undefined == aResult)
                                    complete('comand-test violation 2');
                                else
                                    complete();
                            }, function (e) {
                                complete(e);
                            });
                        }
                    }, function (e) {
                        complete(e);
                    });
                } catch (e) {
                    complete(e);
                }
            });
        };
    }
    return DatabaseCommandTest;
});