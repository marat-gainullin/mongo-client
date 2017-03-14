define(['../options'], function (Options) {
    function ClientDatabaseTest() {
        this.execute = function (aOnSuccess, aOnFailure) {
            Options.with(function (aClient, aOnComplete) {
                function complete(e){
                    aOnComplete();
                    if(e)
                        aOnFailure(e);
                    else
                        aOnSuccess();
                }
                try {
                    var db = aClient.db('test');
                    if (!db)
                        throw 'db violation';
                    var database = aClient.database('test1');
                    if (!database)
                        throw 'database violation';
                    complete();
                } catch (e) {
                    complete(e);
                }
            });
        };
    }
    return ClientDatabaseTest;
});