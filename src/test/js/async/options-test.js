define(['./options'], function (Options) {
    function OptionsTest() {
        this.execute = function (aOnSuccess, aOnFailure) {
            Options.with(function(aClient, aOnComplete){
                aOnComplete();
                aOnSuccess();
            });
        };
    }
    return OptionsTest;
});