define(['../options'], function (Options) {
    function ClientReadPreferenceTest() {
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
                    var preference = aClient.readPreference();
                    if (undefined == preference)
                        throw 'client.readPreference violation';
                    complete();
                } catch (e) {
                    complete(e);
                }
            });
        };
    }
    return ClientReadPreferenceTest;
});