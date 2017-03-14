define(['../options'], function (Options) {
    function FindOneAndReplaceTest() {
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
                            aCollection.findOneAndReplace({p1: {$eq: 'blah'}}, {p1: 'blah', p2: 65, p3: true, p4: new Date()}, {}, function(aResult){
                                if(undefined == aResult)
                                    complete('find-one-and-replace violation');
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
    return FindOneAndReplaceTest;
});