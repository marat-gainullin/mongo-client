// MongoDB API for Nashorn in AMD environment, supporting Java's Services API
// especially for callbacks in async mode calls.
//
// Based on Three Crickets LLC code and is subject of
// The Apache License version 2.0:
// http://www.opensource.org/licenses/apache2.0.php

define(['./mongo-util', './mongo-error', './mongo-async-client', './mongo-async-collection', './mongo-bson', './mongo-async'], function (MongoUtil, MongoError, MongoClient, MongoCollection, Bson, MongoAsync) {
    var MongoDatabaseClass = Java.type('com.mongodb.async.client.MongoDatabase');
    /**
     *
     * @class
     * @throws {MongoError}
     * @see See the <a href="http://api.mongodb.org/java/current/index.html?com/mongodb/client/MongoDatabase.html">Java API</a>
     */
    function MongoDatabase(uri /* or database */, options /* or client */) {
        var database, client
        if (uri instanceof MongoDatabaseClass) {
            // Just wrap
            database = uri // first argument
            client = options // second argument
        } else {
            // Connect
            var connection = MongoUtil.connectAsyncDatabase(uri, options)
            client = new MongoClient(connection.client)
            client.uri = connection.uri
            database = connection.database
        }

        /** @field */
        this.database = database

        /** @field */
        this.client = client

        /** @field */
        this.name = this.database.name

        //
        // Behavior
        //

        /**
         * @throws {MongoError}
         */
        this.readPreference = function () {
            try {
                return this.database.readPreference
            } catch (x if !(x instanceof MongoError)) {
                throw new MongoError(x)
            }
        }

        /**
         * @throws {MongoError}
         */
        this.writeConcern = function () {
            try {
                return this.database.writeConcern
            } catch (x if !(x instanceof MongoError)) {
                throw new MongoError(x)
            }
        }

        /**
         * @param {Object} [options]
         * @param {String} [options.mode] 'primary', 'primaryPreferred', 'secondary', 'secondaryPreferred', or 'nearest'
         * @param {Object} [options.tags]
         * @throws {MongoError}
         */
        this.withReadPreference = function (options) {
            try {
                var readPreference = MongoUtil.readPreference(options)
                return new MongoDatabase(this.database.withReadPreference(readPreference), this.client)
            } catch (x if !(x instanceof MongoError)) {
                throw new MongoError(x)
            }
        }

        /**
         * @param {Object} [options]
         * @param {Number} [options.w] Number of writes
         * @param {Number} [options.wtimeout] Timeout for writes
         * @param {Boolean} [options.fsync] Whether writes should wait for fsync
         * @param {Boolean} [options.j] Whether writes should wait for a journaling group commit
         * @throws {MongoError}
         */
        this.withWriteConcern = function (options) {
            try {
                var writeConcern = MongoUtil.writeConcern(options)
                return new MongoDatabase(this.database.withWriteConcern(writeConcern), this.client)
            } catch (x if !(x instanceof MongoError)) {
                throw new MongoError(x)
            }
        }

        //
        // Operations
        //

        /**
         * @param aOnSuccess Success callback. Called when the database has been dropped.
         * @param aOnFailure Failure callback. Consumes a failure reason.
         * @throws {MongoError}
         */
        this.drop = function (aOnSuccess, aOnFailure) {
            try {
                this.database.drop(MongoAsync.callbacks(aOnSuccess, aOnFailure))
            } catch (x if !(x instanceof MongoError)) {
                throw new MongoError(x)
            }
        }

        this.commandReadPreference = null

        /**
         * @param {Object} [options] Override the default readPreference for this {@link MongoDatabase}. See {@link MongoClient#connect}.
         * @param {String} [options.mode]
         * @param {Object} [options.tags]
         * @throws {MongoError}
         */
        this.setCommandReadPreference = function (options) {
            this.commandReadPreference = MongoUtil.readPreference(options)
        }

        /**
         * @param aOnSuccess Success callback. Consumes the command's result.
         * @param aOnFailure Failure callback. Consumes a failure reason.
         * @throws {MongoError}
         */
        this.command = function (command, aOnSuccess, aOnFailure) {
            try {
                command = Bson.to(command)
                if (!MongoUtil.exists(this.commandReadPreference)) {
                    this.database.runCommand(command, Bson.documentClass.class, MongoAsync.callbacks(function (aResult) {
                        aOnSuccess(Bson.from(aResult));
                    }, aOnFailure))
                } else {
                    this.database.runCommand(command, this.commandReadPreference, Bson.documentClass.class, MongoAsync.callbacks(function (aResult) {
                        aOnSuccess(Bson.from(aResult));
                    }, aOnFailure))
                }
            } catch (x if !(x instanceof MongoError)) {
                throw new MongoError(x)
            }
        }

        //
        // Collections
        //

        /**
         * @param {String} name
         * @throws {MongoError}
         */
        this.collection = function (name) {
            try {
                var collection = this.database.getCollection(name, Bson.documentClass.class)
                return new MongoCollection(collection, this);
            } catch (x if !(x instanceof MongoError)) {
                throw new MongoError(x)
            }
        }

        /**
         * @param {Object} [options]
         * @param {Number} [options.batchSize]
         * @returns {MongoIterable}
         * @throws {MongoError}
         */
        this.collectionNames = function (options) {
            try {
                var i = this.database.listCollectionNames()
                if (MongoUtil.exists(options))
                    MongoUtil.mongoIterable(i, options);
                return new MongoAsync.Iterable(i);
            } catch (x if !(x instanceof MongoError)) {
                throw new MongoError(x)
            }
        }

        /**
         * @returns {MongoIterable}
         * @throws {MongoError}
         */
        this.collections = function (options) {
            try {
                var i = this.database.listCollections(Bson.documentClass.class)
                if (MongoUtil.exists(options))
                    MongoUtil.listCollectionsIterable(i, options);
                return new MongoAsync.FilteredIterable(i);
            } catch (x if !(x instanceof MongoError)) {
                throw new MongoError(x)
            }
        }

        /**
         * @param {Object} [options]
         * @param {Boolean} [options.autoIndex]
         * @param {Boolean} [options.capped]
         * @param {Number} [options.maxDocuments]
         * @param {Number} [options.sizeInBytes]
         * @param {Object} [options.storageEngineOptions]
         * @param {Boolean} [options.usePowerOf2Sizes]
         * @param aOnSuccess Success callback. Called when the collection has been created.
         * @param aOnFailure Failure callback. Consumes a failure reason.
         * @throws {MongoError}
         */
        this.createCollection = function (name, options, aOnSuccess, aOnFailure) {
            try {
                if (!MongoUtil.exists(options)) {
                    this.database.createCollection(name, MongoAsync.callbacks(aOnSuccess, aOnFailure))
                } else {
                    options = MongoUtil.createCollectionOptions(options)
                    var _self = this;
                    this.database.createCollection(name, options, MongoAsync.callbacks(function () {
                        aOnSuccess(_self.collection(name));
                    }, aOnFailure))
                }
            } catch (x if !(x instanceof MongoError)) {
                throw new MongoError(x)
            }
        }

        //
        // Diagnostics
        //

        /**
         * @param aOnSuccess Success callback. Consumes the command's result.
         * @param aOnFailure Failure callback. Consumes a failure reason.
         * @throws {MongoError}
         */
        this.stats = function (scale, aOnSuccess, aOnFailure) {
            if (!MongoUtil.exists(scale)) {
                scale = 1024
            }
            return this.command({dbStats: 1, scale: scale}, aOnSuccess, aOnFailure)
        }

        //
        // Server administration
        //

        /**
         * @namespace
         */
        this.admin = function (database) {
            var Public = {}

            /**
             * @throws {MongoError}
             */
            Public.ping = function () {
                return database.command({ping: 1})
            }

            /**
             * @param {Object} [sections] Enable or suppress sections (for example 'repl', 'metrics', or 'locks') 
             * @throws {MongoError}
             */
            Public.serverStatus = function (sections) {
                var command = {serverStatus: 1}
                if (MongoUtil.exists(sections)) {
                    for (var k in sections) {
                        command[k] = sections[k]
                    }
                }
                return database.command(command)
            }

            /**
             * @throws {MongoError}
             */
            Public.connectionStatus = function () {
                return database.command({connectionStatus: 1})
            }

            /**
             * @throws {MongoError}
             */
            Public.listCommands = function () {
                return database.command({listCommands: 1})
            }

            /**
             * @throws {MongoError}
             */
            Public.buildInfo = function () {
                return database.command({buildInfo: 1})
            }

            /**
             * @throws {MongoError}
             */
            Public.hostInfo = function () {
                return database.command({hostInfo: 1})
            }

            /**
             * @throws {MongoError}
             */
            Public.connPoolStats = function () {
                return database.command({connPoolStats: 1})
            }

            /**
             * @throws {MongoError}
             */
            Public.sharedConnPoolStats = function () {
                return database.command({sharedConnPoolStats: 1})
            }

            // The following are available on the 'admin' database only

            /**
             * @throws {MongoError}
             */
            Public.listDatabases = function () {
                return database.command({listDatabases: 1})
            }

            /**
             * @throws {MongoError}
             */
            Public.top = function () {
                return database.command({top: 1})
            }

            /**
             * @param {String} [log='global'] 'global', 'rs', 'startupWarnings', or '*'
             * @throws {MongoError}
             */
            Public.getLog = function (log) {
                if (!MongoUtil.exists(log)) {
                    log = 'global'
                }
                return database.command({getLog: log})
            }

            /**
             * @throws {MongoError}
             */
            Public.getCmdLineOpts = function () {
                return database.command({getCmdLineOpts: 1})
            }

            /**
             * @throws {MongoError}
             */
            Public.getParameter = function (option) {
                var command = {getParameter: 1}
                command[option] = 1
                return database.command(command)
            }

            /**
             * @throws {MongoError}
             */
            Public.setParameter = function (option, value) {
                var command = {setParameter: 1}
                command[option] = value
                return database.command(command)
            }

            /**
             * @throws {MongoError}
             */
            Public.fsync = function () {
                return database.command({fsync: 1, async: true})
            }

            /**
             * @throws {MongoError}
             */
            Public.fsyncLock = function () {
                return database.command({fsync: 1, async: false, lock: true})
            }

            /**
             * @throws {MongoError}
             */
            Public.fsyncUnlock = function () {
                return database.command({fsync: 1, async: true, lock: false})
            }

            /**
             * @throws {MongoError}
             */
            Public.logRotate = function () {
                return database.command({logRotate: 1})
            }

            /**
             * @param {Boolean} [force=false]
             * @param {Number} [timeoutSecs]
             * @throws {MongoError}
             */
            Public.shutdown = function (force, timeoutSecs) {
                var command = {shutdown: 1}
                if (MongoUtil.exists(force)) {
                    command.force = force
                }
                if (MongoUtil.exists(timeoutSecs)) {
                    command.timeoutSecs = timeoutSecs
                }
                return database.command(command)
            }

            return Public
        }(this)

        if (this.client.collectionsToProperties) {
            this.collectionsToProperties()
        }
    }
    return MongoDatabase;
});
