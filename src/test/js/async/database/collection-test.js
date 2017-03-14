define(['../options'], function (Options) {
    function DatabaseCollectionTest() {
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
                    var database = aClient.database('test');
                    if (undefined == database)
                        throw 'client.database violation';
                    var collection = database.collection('testCollection');
                    if(undefined == collection)
                        throw 'client.database.collection violation';
                    complete();
                } catch (e) {
                    complete(e);
                }
            });
        };
    }
    return DatabaseCollectionTest;
});