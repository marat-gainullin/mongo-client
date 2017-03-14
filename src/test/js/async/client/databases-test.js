define(['../options', 'logger', 'invoke'], function (Options, Logger, Invoke) {
    function ClientDatabasesTest() {
        this.execute = function (aOnSuccess, aOnFailure) {
            Options.with(function (aClient, aOnComplete) {
                function complete(e) {
                    aOnComplete();
                    if (e)
                        aOnFailure(e);
                    else
                        aOnSuccess();
                }
                var mIterable = aClient.databases();
                function firstTest() {
                    mIterable.first(function (aDatabase) {
                        Logger.info('database - ' + aDatabase);
                        Invoke.later(forEachTest);
                    }, function (e) {
                        complete(e);
                    });
                }
                function forEachTest() {
                    mIterable.forEach(function (aDatabase) {
                        Logger.info('database - ' + aDatabase);
                    }, function () {
                        Invoke.later(intoTest);
                    }, function (e) {
                        complete(e);
                    });
                }
                function intoTest() {
                    var a = [];
                    mIterable.into(a, function (aFilled) {
                        if (a.length === 0)
                            complete('into violation 1');
                        else {
                            if (aFilled.length === 0)
                                complete('into violation 2');
                            else
                                Invoke.later(mapTest);
                        }
                    }, function (e) {
                        complete(e);
                    });
                }
                function mapTest() {
                    var mappedIterable = mIterable.map(function (element) {
                    });
                    if (mappedIterable)
                        Invoke.later(batchCursorTest);
                    else
                        complete('AsyncIterable.map violation');
                }
                function batchCursorTest() {
                    mIterable.batchCursor(function (bCursor) {
                        if (bCursor.closed) {
                            complete('batchCursor violation 1');
                        } else {
                            try {
                                bCursor.batchSize = 100;
                                Invoke.later(function () {
                                    bCursor.next(function (aBatch) {
                                        try {
                                            for (var i in aBatch)
                                                Logger.info('aBatch[i] - ' + aBatch[i]);
                                            Invoke.later(function () {
                                                bCursor.close();
                                                if (!bCursor.closed) {
                                                    complete('batchCursor violation 3');
                                                } else {
                                                    complete();
                                                }
                                            });
                                        } catch (e) {
                                            complete(e);
                                        }
                                    }, function (e) {
                                        complete(e);
                                    });
                                });
                            } catch (e) {
                                complete('batchCursor violation 2: ' + e);
                            }
                        }
                    }, function (e) {
                        complete(e);
                    });
                }
                firstTest();
            });
        };
    }
    return ClientDatabasesTest;
});