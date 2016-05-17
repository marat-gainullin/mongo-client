define(['invoke', '../options', '../../../../../../../main/java/com/bearsoft/mongo/client/mongo-async-collection'], function (Invoke, Options, MongoCollection) {
    function SelfConnectedCollectionTest() {
        this.execute = function (aOnSuccess, aOnFailure) {
            try {
                var collection = new MongoCollection('mongodb://localhost/test.testCollection', Options.data);
                if (undefined == collection)
                    throw 'self-connected-collection violation';
                collection.client.close();
                Invoke.later(aOnSuccess);
            } catch (e) {
                Invoke.later(function () {
                    aOnFailure(e);
                });
            }
        };
    }
    return SelfConnectedCollectionTest;
});