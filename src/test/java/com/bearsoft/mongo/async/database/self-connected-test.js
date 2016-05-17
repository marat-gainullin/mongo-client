define(['invoke', '../options', '../../../../../../../main/java/com/bearsoft/mongo/client/mongo-async-database'], function (Invoke, Options, MongoDatabase) {
    function SelfConnectedDatabaseTest() {
        this.execute = function (aOnSuccess, aOnFailure) {
            try {
                var database = new MongoDatabase('mongodb://localhost/test', Options.data);
                if (undefined == database)
                    throw 'self-connected-database violation';
                database.client.close();
                Invoke.later(aOnSuccess);
            } catch (e) {
                Invoke.later(function () {
                    aOnFailure(e);
                });
            }
        };
    }
    return SelfConnectedDatabaseTest;
});