define(['../options'], function (Options) {
    function DeleteManyTest() {
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
                        aCollection.insertOne({p1: 'blah', p2: 65, p3: true, p4: null}, function () {
                            aCollection.deleteMany({}, function (aResult) {
                                if (undefined == aResult.wasAcknowledged)
                                    complete('delete-one violation 1');
                                else {
                                    if (aResult.deletedCount !== 1)
                                        complete('delete-one violation 2');
                                    else
                                        aCollection.drop(complete, complete);
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
    return DeleteManyTest;
});