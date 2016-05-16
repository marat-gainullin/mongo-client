define(['../options'], function (Options) {
    function ClientOptionsTest() {
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
                    var options = aClient.options();
                    if (!options)
                        throw 'client.options violation';
                    complete();
                } catch (e) {
                    complete(e);
                }
            });
        };
    }
    return ClientOptionsTest;
});