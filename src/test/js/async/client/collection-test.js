define(['../options'], function (Options) {
    function ClientCollectionTest() {
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
                    var collection = aClient.collection('test.testCollection');
                    if (undefined == collection)
                        throw 'client.collection violation';
                    complete();
                } catch (e) {
                    complete(e);
                }
            });
        };
    }
    return ClientCollectionTest;
});