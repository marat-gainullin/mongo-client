define(['../options'], function (Options) {
    function Commands2Test() {
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
                    //database.collection('kill-me-please').drop(complete, complete); return;
                    database.createCollection('kill-me-please', {}, function (aCollection) {
                        aCollection.insertMany([
                            {p1: 'blah', p2: 65, p3: true, p4: null}
                            , {p1: 'blah blah', p2: 65, p3: true, p4: null}
                        ], {}, function () {
                            aCollection.setFlag('noPadding', true, function (aFlagResult) {
                                if(undefined == aFlagResult)
                                    complete('commands2 violation 1');
                                else{
                                    aCollection.compact(true, 1, 0, function (aCompactResult) {
                                        if(undefined == aCompactResult)
                                            complete('commands2 violation 2');
                                        else{
                                            aCollection.touch(true, true, function (aTouchResult) {
                                                if(undefined == aTouchResult)
                                                    complete('commands2 violation 3');
                                                else
                                                    aCollection.drop(complete, complete);
                                            }, complete);
                                        }
                                    }, complete);
                                }
                            }, complete);
                        }, complete);
                    }, complete);
                } catch (e) {
                    complete(e);
                }
            });
        };
    }
    return Commands2Test;
});