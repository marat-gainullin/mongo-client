define(['../options'], function (Options) {
    function InsertManyTest() {
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
                            {p1: 'blah', p2: 65, p3: true, p4: new Date()}
                            , {p1: 'blah', p2: 66, p3: true, p4: new Date()}
                            , {p1: 'blah blah', p2: 65, p3: true, p4: new Date()}
                            , {p1: 'blah blah', p2: 66, p3: true, p4: new Date()}
                            , {p1: 'blah', p2: 65, p3: false, p4: new Date()}
                            , {p1: 'blah', p2: 67, p3: false, p4: new Date()}
                        ], {}, function () {
                            aCollection.drop(complete, complete);
                        }, complete);
                    }, complete);
                } catch (e) {
                    complete(e);
                }
            });
        };
    }
    return InsertManyTest;
});