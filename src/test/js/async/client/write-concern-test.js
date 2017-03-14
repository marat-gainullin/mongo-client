define(['../options'], function (Options) {
    function ClientWriteConcernTest() {
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
                    var concern = aClient.writeConcern();
                    if (undefined == concern)
                        throw 'client.writeConcern violation';
                    complete();
                } catch (e) {
                    complete(e);
                }
            });
        };
    }
    return ClientWriteConcernTest;
});