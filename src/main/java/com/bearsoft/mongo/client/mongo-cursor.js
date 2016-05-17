//
// MongoDB API for Nashorn in AMD environment, supporting Java's Services API
// especially for callbacks in async mode calls.
//
// Based on Three Crickets LLC code and is subject of
// The Apache License version 2.0:
// http://www.opensource.org/licenses/apache2.0.php

define(['./mongo-bson', './mongo-error'], function (Bson, MongoError) {
    /**
     * This class does not exactly represent a server cursor: it will create a cursor in the server only
     * when data is accessed, and will keep it open until {@link MongoCursor#close} is called.
     * <p>
     * Thus, you can access data again even <i>after</i> calling {@link MongoCursor#close}, which
     * would cause a fresh new cursor to be created in the server.
     * <p>
     * It is recommended to use try/finally semantics when iterating a cursor, to ensure that it is
     * closed when finished, even if an exception is thrown:
     * <p>
     * <pre>
     * var c = collection.find()
     * try {
     *   while (c.hasNext()) {
     *     println(c.next().name)
     *   }
     * }
     * finally {
     *   c.close()
     * }
     * </pre>
     * 
     * @class
     * @see See the <a href="http://api.mongodb.org/java/current/index.html?com/mongodb/client/MongoCursor.html">Java API</a>
     */
    function MongoCursor(iterable, collection, filter) {
        this.iterable = iterable
        this.collection = collection
        this.filter = filter
        this.cursor = null

        /**
         * A convenience function to get the first entry in the cursor, after which it is immediately
         * closed.
         *
         * @throws {MongoError}
         */
        this.first = function () {
            try {
                return Bson.from(this.iterable.first())
            } catch (x if !(x instanceof MongoError)) {
                throw new MongoError(x)
            }
        }

        /**
         * This is a convenience function. It calls count using the filter
         * used to create this cursor.
         * 
         * @param {Object} [options]
         * @param {Object} [options.hint]
         * @param {String} [options.hintString]
         * @param {Number} [options.limit]
         * @param {Number} [options.maxTime]
         * @param {Number} [options.skip]
         * @throws {MongoError}
         */
        this.count = function (options) {
            return this.collection.count(this.filter, options)
        }

        /**
         * @throws {MongoError}
         */
        this.hasNext = function () {
            try {
                if (null === this.cursor) {
                    this.cursor = iterable.iterator()
                }
                return this.cursor.hasNext()
            } catch (x if !(x instanceof MongoError)) {
                throw new MongoError(x)
            }
        }

        /**
         * @throws {MongoError}
         */
        this.next = function () {
            try {
                if (null === this.cursor) {
                    this.cursor = iterable.iterator()
                }
                return Bson.from(this.cursor.next());
            } catch (x if !(x instanceof MongoError)) {
                throw new MongoError(x)
            }
        }

        /**
         * @throws {MongoError}
         */
        this.close = function () {
            try {
                if (null !== this.cursor) {
                    this.cursor.close()
                    this.cursor = null
                }
            } catch (x if !(x instanceof MongoError)) {
                throw new MongoError(x)
            }
        }
    }
    return MongoCursor;
});
