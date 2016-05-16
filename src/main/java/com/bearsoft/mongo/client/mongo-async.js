define(['./mongo-bson'], function (Bson) {
    var CallbacksClass = Java.type('com.bearsoft.mongo.Callbacks');
    var ScriptsClass = Java.type('com.eas.script.Scripts');
    var module = {};
    
    function callbacks(aOnSuccess, aOnFailure) {
        return CallbacksClass.asCallback(ScriptsClass.inContext(CallbacksClass.asConsumer(aOnSuccess, aOnFailure)));
    }

    function MongoAsyncIterable(aNative) {
//void first(SingleResultCallback<TResult> callback);
        /**
         * Helper to return the first item in the iterator or null.
         *
         * @param aOnSuccess a callback that is passed the first item or null.
         * @param aOnFailure a callback that is called when an error occurs.
         */
        this.first = function (aOnSuccess, aOnFailure) {
            aNative.first(callbacks(function (anElement) {
                aOnSuccess(Bson.from(anElement));
            }, aOnFailure));
        };
        //void forEach(Block<? super TResult> block, SingleResultCallback<Void> callback);
        /**
         * Iterates over all documents in the view, applying the given block to each, and completing the returned future after all documents
         * have been iterated, or an exception has occurred.
         *
         * @param aFunction    the block to apply to each document
         * @param aOnSuccess a callback that completed once the iteration has completed
         * @param aOnFailure a callback that is called when an error occurs.
         */
        this.forEach = function (aFunction, aOnSuccess, aOnFailure) {
            aNative.forEach(CallbacksClass.asBlock(ScriptsClass.inContext(CallbacksClass.asConsumer(function (anElement) {
                aFunction(Bson.from(anElement));
            }, function () {}))), callbacks(aOnSuccess, aOnFailure));
        };
        //<A extends Collection<? super TResult>> void into(A target, SingleResultCallback<A> callback);
        /**
         * Iterates over all the documents, adding each to the given target.
         *
         * @param anArray   the collection to insert into
         * @param aOnSuccess a callback that will be passed the target containing all documents
         * @param aOnFailure a callback that is called when an error occurs.
         */
        this.into = function (anArray, aOnSuccess, aOnFailure) {
            aNative.into(anArray, callbacks(function (aResult) {
                aOnSuccess(Bson.from(aResult));
            }, aOnFailure));
        };
        //<U> MongoIterable<U> map(Function<TResult, U> mapper);
        /**
         * Maps this iterable from the source document type to the target document type.
         *
         * @param aMapper a function that maps from the source to the target document type
         * @return an iterable which maps T to U
         */
        this.map = function (aMapper) {
            return new MongoAsyncIterable(aNative.map(CallbacksClass.asFunction(function (anElement) {
                aMapper(Bson.from(anElement));
            })));
        };
        //void batchCursor(SingleResultCallback<AsyncBatchCursor<TResult>> callback);
        /**
         * Provides the underlying {@link com.mongodb.async.AsyncBatchCursor} allowing fine grained control of the cursor.
         *
         * @param aOnSuccess a callback that will be passed the AsyncBatchCursor
         * @param aOnFailure a callback that is called when an error occurs.
         */
        this.batchCursor = function (aOnSuccess, aOnFailure) {
            aNative.batchCursor(callbacks(function (aCursor) {
                var wrappedCursor = {
                    close: function () {
                        aCursor.close();
                    },
                    next: function (aOnSuccess, aOnFailure) {
                        aCursor.next(callbacks(function (aBatch) {
                            aOnSuccess(Bson.from(aBatch));
                        }, aOnFailure));
                    }
                };
                Object.defineProperty(wrappedCursor, 'closed', {
                    get: function () {
                        return aCursor.isClosed();
                    }
                });
                Object.defineProperty(wrappedCursor, 'batchSize', {
                    get: function () {
                        return aCursor.getBatchSize();
                    },
                    set: function (aSize) {
                        aCursor.setBatchSize(+aSize);
                    }
                });
                aOnSuccess(wrappedCursor);
            }, aOnFailure));
        };
        this.iterable = aNative;
    }

    function MongoAsyncFilteredIterable(aNative) {
        MongoAsyncIterable.call(this, aNative);
        this.filter = function (aPredicate) {
            return new MongoAsyncFilteredIterable(aNative.filter(Bson.to(aPredicate)));
        };
    }

    module.callbacks = callbacks;
    module.AsyncIterable = MongoAsyncIterable;
    module.AsyncFilteredIterable = MongoAsyncFilteredIterable;
    return module;
});