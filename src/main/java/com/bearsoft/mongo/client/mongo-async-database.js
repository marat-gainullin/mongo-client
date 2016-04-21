//
// MongoDB API for Nashorn in AMD environment, supporting Java's Services API
// especially for callbacks in async mode calls.
//
// Based on Three Crickets LLC code and is subject of
// The Apache License version 2.0:
// http://www.opensource.org/licenses/apache2.0.php

define(['./mongo-util', './mongo-error', './mongo-async-client', './mongo-collection', './mongo-bson'], function (MongoUtil, MongoError, MongoClient, MongoCollection, BSON) {
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
            var connection = MongoUtil.connectDatabase(uri, options)
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
         * @throws {MongoError}
         */
        this.drop = function () {
            try {
                this.database.drop()
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
         * @throws {MongoError}
         */
        this.command = function (command) {
            try {
                var result
                command = BSON.to(command)
                var result;
                if (!MongoUtil.exists(this.commandReadPreference)) {
                    result = this.database.runCommand(command, BSON.documentClass)
                } else {
                    result = this.database.runCommand(command, this.commandReadPreference, BSON.documentClass)
                }
                return BSON.from(result)
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
                // This will convert native JavaScript types
                var collection = this.database.getCollection(name, BSON.documentClass.class)
                return new MongoCollection(collection, this);
            } catch (x if !(x instanceof MongoError)) {
                throw new MongoError(x)
            }
        }

        /**
         * @param {Object} [options]
         * @param {Number} [options.batchSize]
         * @returns {MongoCollection[]}
         * @throws {MongoError}
         */
        this.collections = function (options) {
            try {
                var collections = []
                var i = this.database.listCollectionNames().iterator()
                try {
                    if (MongoUtil.exists(options)) {
                        MongoUtil.mongoIterable(i, options)
                    }
                    while (i.hasNext()) {
                        collections.push(this.collection(i.next()))
                    }
                } finally {
                    i.close()
                }
                return collections
            } catch (x if !(x instanceof MongoError)) {
                throw new MongoError(x)
            }
        }

        /**
         * @param {Object} [options]
         * @param {Number} [options.batchSize]
         * @returns {String[]}
         * @throws {MongoError}
         */
        this.collectionNames = function (options) {
            try {
                var collectionNames = []
                var i = this.database.listCollectionNames().iterator()
                try {
                    if (MongoUtil.exists(options)) {
                        MongoUtil.mongoIterable(i, options)
                    }
                    while (i.hasNext()) {
                        collectionNames.push(i.next())
                    }
                } finally {
                    i.close()
                }
                return collectionNames
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
         * @throws {MongoError}
         */
        this.createCollection = function (name, options) {
            try {
                if (!MongoUtil.exists(options)) {
                    this.database.createCollection(name)
                } else {
                    options = MongoUtil.createCollectionOptions(options)
                    this.database.createCollection(name, options)
                }
            } catch (x if !(x instanceof MongoError)) {
                throw new MongoError(x)
            }
        }

        /**
         * Creates properties of type {@link MongoCollection} for every collection the database.
         * <p>
         * The property keys are the collection names. If there is conflict with an existing property,
         * then a "_" will be appended as a suffix. More "_" will be added for as long as there is conflict.
         * <p>
         * If there are "." in a collection name, then the collection will be put in a hierarchy of
         * objects. If a parent object does not exist, then an empty object will be inserted.
         * 
         * @param {Object} [options]
         * @param {Number} [options.batchSize]
         * @returns {String[]}
         * @throws {MongoError}
         */
        this.collectionsToProperties = function (options) {
            var PlaceHolder = function () {} // Empty class

            try {
                var names = this.collectionNames(options)
                names.sort() // we want them in order, so that sub-collections will be added to their parents
                for (var n in names) {
                    var name = names[n]
                    var parts = String(name).split('.')
                    var location = this
                    for (var p in parts) {
                        var part = parts[p]
                        part = safeProperteryName(location, part)
                        if (p == parts.length - 1) {
                            location[part] = this.collection(name)
                        } else {
                            location[part] = location[part] || new PlaceHolder()
                            location = location[part]
                        }
                    }
                }
            } catch (x if !(x instanceof MongoError)) {
                throw new MongoError(x)
            }

            function safeProperteryName(o, name) {
                while (true) {
                    if (!MongoUtil.exists(o[name]) || (o[name] instanceof MongoCollection) || (o[name] instanceof PlaceHolder)) {
                        return name
                    }
                    name += '_'
                }
            }
        }

        //
        // Diagnostics
        //

        /**
         * @throws {MongoError}
         */
        this.stats = function (scale) {
            if (!MongoUtil.exists(scale)) {
                scale = 1024
            }
            return this.command({dbStats: 1, scale: scale})
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

    /**
     * Fetches the global {@link MongoDatabase} singleton, or lazily creates and sets a new one if
     * it hasn't yet been set.
     * <p>
     * The database is set as 'mongoDb.database' in {@link applications.globals}. You can set it there
     * directly, or use a string (the database name) to support lazy creation. Lazy creation requires
     * a global client to be set, too. (See {@link MongoClient#global}.) 
     * <p>
     * In Prudence, you can also set the global in {@link application.sharedGlobals}, to allow
     * all applications to have access the same client. Note that {@link applications.globals}
     * is checked first, so it has precedence.
     * 
     * @throws {MongoError}
     */
    MongoDatabase.global = function (applicationService) {
        var database = MongoUtil.getGlobal('database', applicationService)
        if (MongoUtil.isString(database)) {
            var client = MongoClient.global()
            if (!MongoUtil.exists(client)) {
                return null
            }
            database = client.database(database)
            database = MongoUtil.setGlobal('database', database)
        }
        return database
    }
    return MongoDatabase;
});
