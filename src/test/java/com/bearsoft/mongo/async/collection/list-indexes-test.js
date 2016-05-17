define(['logger', '../options'], function (Logger, Options) {
    function ListIndexesTest() {
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
                            aCollection.createIndexes(['p1', {p3: 1}], function (created) {
                                if (undefined == created || created.length !== 2)
                                    complete('list-indexes violation');
                                else {
                                    var indexes = aCollection.indexes({});
                                    indexes.forEach(function (aIndex) {
                                        Logger.info('index - ' + aIndex)
                                    },
                                    function () {
                                        aCollection.drop(complete, complete);
                                    },
                                    complete);
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
    return ListIndexesTest;
});