define(['../options'], function (Options) {
    function GroupTest() {
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
                            aCollection.group({}, function (aResult) {
                                if (undefined == aResult)
                                    complete('group violation');
                                else
                                    aCollection.drop(complete, complete);
                            }, complete);
                        }, complete);
                    }, complete);
                } catch (e) {
                    complete(e);
                }
            });
        };
    }
    return GroupTest;
});