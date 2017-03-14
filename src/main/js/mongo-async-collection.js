//
// MongoDB API for Nashorn in AMD environment,
// especially for callbacks in async mode calls.
//
// Based on Three Crickets LLC code and is subject of
// The Apache License version 2.0:
// http://www.opensource.org/licenses/apache2.0.php

define(['./mongo-util', './mongo-error', './mongo-bson', './mongo-async-client', './mongo-cursor', './mongo-async'], function (MongoUtil, MongoError, Bson, MongoClient, MongoCursor, MongoAsync) {
    var MongoCollectionClass = Java.type('com.mongodb.async.client.MongoCollection');
    var MongoNamespaceClass = Java.type('com.mongodb.MongoNamespace');
    var StringClass = Java.type('java.lang.String');
    /**
     *
     * @class
     * @throws {MongoError}
     * @see See the <a href="http://api.mongodb.org/java/current/index.html?com/mongodb/client/MongoCollection.html">Java API</a>
     */
    function MongoCollection(uri /* or collection */, options /* or database */, database) {
        var collection, database, client
        var capped = false;
        if (uri instanceof MongoCollectionClass) {
            // Just wrap
            collection = uri // first argument
            database = options // second argument
            client = database.client
        } else {
            var MongoDatabase = require('./mongo-async-database');
            // Connect
            var connection = MongoUtil.connectAsyncCollection(uri, options)
            client = new MongoClient(connection.client)
            client.uri = connection.uri
            database = new MongoDatabase(connection.database, client)
            collection = connection.collection
        }

        /** @field */
        this.collection = collection

        /** @field */
        this.database = database

        /** @field */
        this.client = client

        /** @field */
        this.name = this.collection.namespace.collectionName

        /** @field */
        this.databaseName = this.collection.namespace.databaseName

        /** @field */
        this.fullName = this.collection.namespace.fullName

        //
        // Behavior
        //

        /**
         * @throws {MongoError}
         */
        this.readPreference = function () {
            try {
                return this.collection.readPreference
            } catch (x if !(x instanceof MongoError)) {
                throw new MongoError(x)
            }
        }

        /**
         * @throws {MongoError}
         */
        this.writeConcern = function () {
            try {
                return this.collection.writeConcern
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
                return new MongoCollection(this.collection.withReadPreference(readPreference), this.database)
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
                return new MongoCollection(this.collection.withWriteConcern(writeConcern), this.database)
            } catch (x if !(x instanceof MongoError)) {
                throw new MongoError(x)
            }
        }

        //
        // Operations
        //

        /**
         * @param aOnSuccess Success callback. Called when the collection has been dropped.
         * @param aOnFailure Failure callback. Consumes a failure reason.
         * @throws {MongoError}
         */
        this.drop = function (aOnSuccess, aOnFailure) {
            try {
                this.collection.drop(MongoAsync.callbacks(aOnSuccess, aOnFailure))
            } catch (x if !(x instanceof MongoError)) {
                throw new MongoError(x)
            }
        }

        /**
         * @param {Object} [options]
         * @param {Boolean} [options.dropTarget]
         * @param aOnSuccess Success callback. Called when the collection has been renamed.
         * @param aOnFailure Failure callback. Consumes a failure reason.
         * @throws {MongoError}
         */
        this.rename = function (newName, options, aOnSuccess, aOnFailure) {
            try {
                var _self = this;
                var namespace = new MongoNamespaceClass(this.databaseName, newName)
                if (!MongoUtil.exists(options)) {
                    this.collection.renameCollection(namespace, MongoAsync.callbacks(function () {
                        aOnSuccess(_self.database.collection(newName));
                    }, aOnFailure))
                } else {
                    options = MongoUtil.renameCollectionOptions(options)
                    this.collection.renameCollection(namespace, options, MongoAsync.callbacks(function () {
                        aOnSuccess(_self.database.collection(newName));
                    }, aOnFailure))
                }
            } catch (x if !(x instanceof MongoError)) {
                throw new MongoError(x)
            }
        }

        /**
         * @param {Boolean} [force=false]
         * @param {Number} [paddingFactor]
         * @param {Number} [paddingBytes]
         * @param aOnSuccess Success callback. Called when the collection has been compacted.
         * @param aOnFailure Failure callback. Consumes a failure reason.
         * @throws {MongoError}
         */
        this.compact = function (force, paddingFactor, paddingBytes, aOnSuccess, aOnFailure) {
            var command = {compact: this.name}
            if (MongoUtil.exists(force)) {
                command.force = force
            }
            if (MongoUtil.exists(paddingFactor)) {
                command.paddingFactor = paddingFactor
            }
            if (MongoUtil.exists(paddingBytes)) {
                command.paddingBytes = paddingBytes
            }
            this.database.command(command, aOnSuccess, aOnFailure)
        }

        /**
         * @param {Number} size
         * @throws {MongoError}
         * @param aOnSuccess Success callback. Called when the collection has been converted.
         * @param aOnFailure Failure callback. Consumes a failure reason.
         */
        this.convertToCapped = function (size, aOnSuccess, aOnFailure) {
            this.database.command({convertToCapped: this.name, size: size}, function (aResult) {
                capped = true;
                aOnSuccess(aResult);
            }, aOnFailure)
        }

        /**
         * @param aOnSuccess Success callback. Called when the flag has been setted.
         * @param aOnFailure Failure callback. Consumes a failure reason.
         * @throws {MongoError}
         */
        this.setFlag = function (flag, value, aOnSuccess, aOnFailure) {
            var command = {collMod: this.name}
            command[flag] = value
            this.database.command(command, aOnSuccess, aOnFailure)
        }

        //
        // Indexes
        //

        /**
         * @param {String|Object} fieldOrSpec
         * @param {Object} [options]
         * @param {Boolean} [options.background]
         * @param {Number} [options.bits]
         * @param {Number} [options.bucketSize]
         * @param {String} [options.defaultLanguage]
         * @param {Number} [options.expireAfter]
         * @param {String} [options.languageOverride]
         * @param {Number} [options.max]
         * @param {Number} [options.min]
         * @param {String} [options.name]
         * @param {Boolean} [options.sparse]
         * @param {Number} [options.sphereVersion]
         * @param {Object} [options.storageEngine]
         * @param {Number} [options.textVersion]
         * @param {Boolean} [options.unique]
         * @param {Number} [options.version]
         * @param {Object} [options.weights]
         * @param aOnSuccess Success callback. Called when the index has been created.
         * @param aOnFailure Failure callback. Consumes a failure reason.
         * @throws {MongoError}
         */
        this.createIndex = function (fieldOrSpec, options, aOnSuccess, aOnFailure) {
            try {
                var spec
                if (MongoUtil.isString(fieldOrSpec)) {
                    spec = {}
                    spec[fieldOrSpec] = 1
                } else {
                    spec = fieldOrSpec
                }
                spec = Bson.to(spec)
                if (!MongoUtil.exists(options)) {
                    return this.collection.createIndex(spec, MongoAsync.callbacks(aOnSuccess, aOnFailure))
                } else {
                    options = MongoUtil.createIndexOptions(options)
                    return this.collection.createIndex(spec, options, MongoAsync.callbacks(aOnSuccess, aOnFailure))
                }
            } catch (x if !(x instanceof MongoError)) {
                throw new MongoError(x)
            }
        }

        /**
         * @param {Array} fieldsOrSpecs Strings or Objects
         * @param aOnSuccess Success callback. Called when the indexes have been created.
         * @param aOnFailure Failure callback. Consumes a failure reason.
         * @throws {MongoError}
         */
        this.createIndexes = function (fieldsOrSpecs, aOnSuccess, aOnFailure) {
            try {
                var specs = MongoUtil.indexSpecsList(fieldsOrSpecs)
                return this.collection.createIndexes(specs, MongoAsync.callbacks(aOnSuccess, aOnFailure))
            } catch (x if !(x instanceof MongoError)) {
                throw new MongoError(x)
            }
        }

        /**
         * @param {String|Object} fieldOrSpec
         * @param aOnSuccess Success callback. Called when the index has been dropped.
         * @param aOnFailure Failure callback. Consumes a failure reason.
         * @throws {MongoError}
         */
        this.dropIndex = function (fieldOrSpec, aOnSuccess, aOnFailure) {
            try {
                if (MongoUtil.isString(fieldOrSpec)) {
                    this.collection.dropIndex(fieldOrSpec, MongoAsync.callbacks(aOnSuccess, aOnFailure))
                } else {
                    fieldOrSpec = Bson.to(fieldOrSpec)
                    this.collection.dropIndex(fieldOrSpec, MongoAsync.callbacks(aOnSuccess, aOnFailure))
                }
            } catch (x if !(x instanceof MongoError)) {
                throw new MongoError(x)
            }
        }

        /**
         * @param aOnSuccess Success callback. Called when the indexes have been dropped.
         * @param aOnFailure Failure callback. Consumes a failure reason.
         * @throws {MongoError}
         */
        this.dropIndexes = function (aOnSuccess, aOnFailure) {
            try {
                this.collection.dropIndexes(MongoAsync.callbacks(aOnSuccess, aOnFailure))
            } catch (x if !(x instanceof MongoError)) {
                throw new MongoError(x)
            }
        }

        /**
         * @param {Object} [options]
         * @param {Number} [options.batchSize]
         * @param {Number} [options.maxTime]
         * @throws {MongoError}
         */
        this.indexes = function (options) {
            try {
                var i = this.collection.listIndexes(Bson.documentClass.class)
                if (MongoUtil.exists(options)) {
                    MongoUtil.listIndexesIterable(i, options)
                }
                return new MongoAsync.Iterable(i);
            } catch (x if !(x instanceof MongoError)) {
                throw new MongoError(x)
            }
        }

        /**
         * @param aOnSuccess Success callback. Called when the reindex procedure has been completed.
         * @param aOnFailure Failure callback. Consumes a failure reason.
         * @throws {MongoError}
         */
        this.reIndex = function (aOnSuccess, aOnFailure) {
            this.database.command({reIndex: this.name}, aOnSuccess, aOnFailure)
        }

        //
        // Queries
        //

        /**
         * @param {Object} [filter]
         * @param {Object} [options]
         * @param {Number} [options.batchSize]
         * @param {String|com.mongodb.CursorType} [options.cursorType] 'nonTailable', 'tailable', or 'tailableAwait'
         * @param {Object} [options.filter]
         * @param {Number} [options.limit]
         * @param {Number} [options.maxTime]
         * @param {Object} [options.modifiers]
         * @param {Boolean} [options.noCursorTimeout]
         * @param {Boolean} [options.oplogReplay]
         * @param {Boolean} [options.partial]
         * @param {Object} [options.projection]
         * @param {Number} [options.skip]
         * @param {Object} [options.sort]
         * @throws {MongoError}
         */
        this.find = function (filter, options) {
            try {
                var i
                if (!MongoUtil.exists(filter)) {
                    i = this.collection.find()
                } else {
                    filter = Bson.to(filter)
                    i = this.collection.find(filter)
                }
                if (MongoUtil.exists(options)) {
                    MongoUtil.findIterable(i, options)
                }
                return new MongoAsync.FindIterable(i)
            } catch (x if !(x instanceof MongoError)) {
                throw new MongoError(x)
            }
        }

        /**
         * This is a convenience function. It calls find and fetches the first document.
         *
         * @param {Object} [filter]
         * @param {Object} [options]
         * @param {Number} [options.batchSize]
         * @param {String|com.mongodb.CursorType} [options.cursorType] 'nonTailable', 'tailable', or 'tailableAwait'
         * @param {Object} [options.filter]
         * @param {Number} [options.limit]
         * @param {Number} [options.maxTime]
         * @param {Object} [options.modifiers]
         * @param {Boolean} [options.noCursorTimeout]
         * @param {Boolean} [options.oplogReplay]
         * @param {Boolean} [options.partial]
         * @param {Object} [options.projection]
         * @param {Number} [options.skip]
         * @param {Object} [options.sort]
         * @param aOnSuccess Success callback. Called when an object is found.
         * @param aOnFailure Failure callback. Consumes a failure reason.
         * @throws {MongoError}
         */
        this.findOne = function (filter, options, aOnSuccess, aOnFailure) {
            var cursor = this.find(filter, options)
            cursor.first(aOnSuccess, aOnFailure);
        }

        //
        // Aggregate queries
        //

        /**
         * @param {Object} [filter]
         * @param {Object} [options]
         * @param {Object} [options.hint]
         * @param {String} [options.hintString]
         * @param {Number} [options.limit]
         * @param {Number} [options.maxTime]
         * @param {Number} [options.skip]
         * @param aOnSuccess Success callback. Consumes operation result.
         * @param aOnFailure Failure callback. Called if insertion failed.
         * @throws {MongoError}
         */
        this.count = function (filter, options, aOnSuccess, aOnFailure) {
            try {
                if (!MongoUtil.exists(filter)) {
                    return this.collection.count(MongoAsync.callbacks(aOnSuccess, aOnFailure))
                } else {
                    filter = Bson.to(filter)
                    if (!MongoUtil.exists(options)) {
                        return this.collection.count(filter, MongoAsync.callbacks(function (aCount) {
                            aOnSuccess(+aCount);
                        }, aOnFailure))
                    } else {
                        options = MongoUtil.countOptions(options)
                        return this.collection.count(filter, options, MongoAsync.callbacks(function (aCount) {
                            aOnSuccess(+aCount);
                        }, aOnFailure))
                    }
                }
            } catch (x if !(x instanceof MongoError)) {
                throw new MongoError(x)
            }
        }

        /**
         * @param {Number} [options.batchSize]
         * @param {Object} [options.filter]
         * @param {Number} [options.maxTime]
         * @throws {MongoError}
         */
        this.distinct = function (key, options) {
            try {
                var i = this.collection.distinct(key, StringClass.class)
                if (MongoUtil.exists(options)) {
                    MongoUtil.distinctIterable(i, options)
                }
                return new MongoAsync.DistinctIterable(i);
            } catch (x if !(x instanceof MongoError)) {
                throw new MongoError(x)
            }
        }

        /**
         * @param {Object[]} pipeline
         * @param {Object} [options]
         * @param {Boolean} [options.allowDiskUse]
         * @param {Number} [options.batchSize]
         * @param {Number} [options.maxTime]
         * @param {Boolean} [options.useCursor]
         * @throws {MongoError}
         */
        this.aggregate = function (pipeline, options) {
            try {
                pipeline = MongoUtil.documentList(pipeline)
                var i = this.collection.aggregate(pipeline, Bson.documentClass.class)
                if (MongoUtil.exists(options)) {
                    MongoUtil.aggregateIterable(i, options)
                }
                return new MongoAsync.AggregateIterable(i);
            } catch (x if !(x instanceof MongoError)) {
                throw new MongoError(x)
            }
        }

        /**
         * @param {Object} args.key
         * @param {Function} [args.reduce=function(c,r){}]
         * @param {Object} [args.initial]
         * @param {Function} [args.keyf]
         * @param {Object} [args.filter]
         * @param {Function} [args.finalize]
         * @param aOnSuccess Success callback. Called when group operation has been completed.
         * @param aOnFailure Failure callback. Consumes a failure reason.
         * @throws {MongoError}
         */
        this.group = function (args, aOnSuccess, aOnFailure) {
            if (!MongoUtil.exists(args.initial)) {
                args.initial = {}
            }
            if (!MongoUtil.exists(args.reduce)) {
                args.reduce = function (c, r) {}
            }
            var command = {
                group: {
                    ns: this.name,
                    key: args.key,
                    initial: args.initial,
                    $reduce: String(args.reduce)
                }
            }
            if (MongoUtil.exists(args.keyf)) {
                command.group.$keyf = String(args.keyf)
            }
            if (MongoUtil.exists(args.filter)) {
                command.group.cond = args.filter
            }
            if (MongoUtil.exists(args.finalize)) {
                command.group.finalize = String(args.finalize)
            }
            this.database.command(command, aOnSuccess, aOnFailure)
        }

        /**
         * @param {Function} args.map
         * @param {Function} args.reduce
         * @param {String|Object} [args.out={inline: 1}]
         * @param {Object} [args.filter]
         * @param {Object} [args.sort]
         * @param {Number} [args.limit]
         * @param {Object} [args.scope]
         * @param {Function} [args.finalize]
         * @param {Boolean} [args.jsMode=false]
         * @param {Boolean} [args.verbose=true]
         * @param aOnSuccess Success callback. Called when map/reduce has been completed.
         * @param aOnFailure Failure callback. Consumes a failure reason.
         * @throws {MongoError}
         */
        this.mapReduce = function (args, aOnSuccess, aOnFailure) {
            if (!MongoUtil.exists(args.out)) {
                args.out = {inline: 1}
            }
            var command = {
                mapReduce: this.name,
                map: String(args.map),
                reduce: String(args.reduce),
                out: args.out
            }
            if (MongoUtil.exists(args.filter)) {
                command.query = args.filter
            }
            if (MongoUtil.exists(args.sort)) {
                command.sort = args.sort
            }
            if (MongoUtil.exists(args.limit)) {
                command.limit = args.limit
            }
            if (MongoUtil.exists(args.scope)) {
                command.scope = args.scope
            }
            if (MongoUtil.exists(args.finalize)) {
                command.finalize = String(args.finalize)
            }
            if (MongoUtil.exists(args.jsMode)) {
                command.jsMode = args.jsMode
            }
            if (MongoUtil.exists(args.verbose)) {
                command.verbose = args.verbose
            }
            this.database.command(command, aOnSuccess, aOnFailure)
        }

        //
        // Geospatial queries
        //

        /**
         * @param {Number} x
         * @param {Number} y
         * @param {Object} [options]
         * @param {Boolean} [options.spherical]
         * @param {Number} [options.distanceMultiplier]
         * @param {Object} [options.filter]
         * @param {Boolean} [options.includeLocations]
         * @param {Number} [options.limit]
         * @param {Number} [options.maxDistance]
         * @param {Number} [options.minDistance]
         * @param {Number} [options.num]
         * @param {Boolean} [options.uniqueDocs]
         * @param aOnSuccess Success callback. Called when objects have been found.
         * @param aOnFailure Failure callback. Consumes a failure reason.
         * @throws {MongoError}
         */
        this.geoNear = function (x, y, options, aOnSuccess, aOnFailure) {
            var command = {
                geoNear: this.name,
                near: {type: 'Point', coordinates: [x, y]}
            }
            if (MongoUtil.exists(options.spherical)) {
                command.spherical = options.spherical
            }
            if (MongoUtil.exists(options.distanceMultiplier)) {
                command.distanceMultiplier = options.distanceMultiplier
            }
            if (MongoUtil.exists(options.filter)) {
                command.filter = options.filter
            }
            if (MongoUtil.exists(options.includeLocations)) {
                command.includeLocations = options.includeLocations
            }
            if (MongoUtil.exists(options.limit)) {
                command.limit = options.limit
            }
            if (MongoUtil.exists(options.maxDistance)) {
                command.maxDistance = options.maxDistance
            }
            if (MongoUtil.exists(options.minDistance)) {
                command.minDistance = options.minDistance
            }
            if (MongoUtil.exists(options.num)) {
                command.num = options.num
            }
            if (MongoUtil.exists(options.uniqueDocs)) {
                command.uniqueDocs = options.uniqueDocs
            }
            this.database.command(command, aOnSuccess, aOnFailure)
        }

        /**
         * @param {Number} x
         * @param {Number} y
         * @param {Object} [options]
         * @param {Object} [options.search]
         * @param {Number} [options.maxDistance]
         * @param {Number} [options.limit]
         * @param aOnSuccess Success callback. Called when objects have been found.
         * @param aOnFailure Failure callback. Consumes a failure reason.
         * @throws {MongoError}
         */
        this.geoHaystackSearch = function (x, y, options, aOnSuccess, aOnFailure) {
            var command = {
                geoSearch: this.name,
                near: [x, y]
            }
            if (MongoUtil.exists(options.search)) {
                command.search = options.search
            }
            if (MongoUtil.exists(options.maxDistance)) {
                command.maxDistance = options.maxDistance
            }
            if (MongoUtil.exists(options.limit)) {
                command.limit = options.limit
            }
            this.database.command(command, aOnSuccess, aOnFailure)
        }

        //
        // Insertion
        //

        /**
         * @param {Object[]} [docs]
         * @param {Object} [options]
         * @param {Boolean} [options.ordered]
         * @param aOnSuccess Success callback. Called when insertion is done.
         * @param aOnFailure Failure callback. Called if insertion failed.
         * @throws {MongoError}
         */
        this.insertMany = function (docs, options, aOnSuccess, aOnFailure) {
            try {
                docs = MongoUtil.documentList(docs)
                if (!MongoUtil.exists(options)) {
                    this.collection.insertMany(docs, MongoAsync.callbacks(aOnSuccess, aOnFailure))
                } else {
                    options = MongoUtil.insertManyOptions(options)
                    this.collection.insertMany(docs, options, MongoAsync.callbacks(aOnSuccess, aOnFailure))
                }
            } catch (x if !(x instanceof MongoError)) {
                throw new MongoError(x)
            }
        }

        /**
         * @param {Object} [doc]
         * @param aOnSuccess Success callback. Called when insertion is done.
         * @param aOnFailure Failure callback. Called if insertion failed.
         * @throws {MongoError}
         */
        this.insertOne = function (doc, aOnSuccess, aOnFailure) {
            try {
                this.collection.insertOne(Bson.to(doc), MongoAsync.callbacks(aOnSuccess, aOnFailure))
            } catch (x if !(x instanceof MongoError)) {
                throw new MongoError(x)
            }
        }

        //
        // Deletion
        //

        /**
         * @param {Object} filter
         * @param aOnSuccess Success callback. Called when deletion is done with argument: {Object} .wasAcknowledged (Boolean), .deleteCount (Number).
         * @param aOnFailure Failure callback. Called if deletion failed.
         * @throws {MongoError}
         */
        this.deleteMany = function (filter, aOnSuccess, aOnFailure) {
            try {
                filter = Bson.to(filter)
                this.collection.deleteMany(filter, MongoAsync.callbacks(function (aResult) {
                    aOnSuccess(MongoUtil.deleteResult(aResult));
                }, aOnFailure))
            } catch (x if !(x instanceof MongoError)) {
                throw new MongoError(x)
            }
        }

        /**
         * @param {Object} filter
         * @param aOnSuccess Success callback. Called when deletion is done with argument: {Object} .wasAcknowledged (Boolean), .deleteCount (Number).
         * @param aOnFailure Failure callback. Called if deletion failed.
         * @returns 
         * @throws {MongoError}
         */
        this.deleteOne = function (filter, aOnSuccess, aOnFailure) {
            try {
                filter = Bson.to(filter)
                this.collection.deleteOne(filter, MongoAsync.callbacks(function (aResult) {
                    aOnSuccess(MongoUtil.deleteResult(aResult));
                }, aOnFailure))
            } catch (x if !(x instanceof MongoError)) {
                throw new MongoError(x)
            }
        }

        /**
         * @param {Object} [options]
         * @param {Number} [options.maxTime]
         * @param {Object} [options.projection]
         * @param {Object} [options.sort]
         * @param aOnSuccess Success callback. Called when the operation is completed.
         * @param aOnFailure Failure callback. Consumes a failure reason.
         * @throws {MongoError}
         */
        this.findOneAndDelete = function (filter, options, aOnSuccess, aOnFailure) {
            try {
                filter = Bson.to(filter)
                if (!MongoUtil.exists(options)) {
                    this.collection.findOneAndDelete(filter, MongoAsync.callbacks(function (aResult) {
                        aOnSuccess(Bson.from(aResult));
                    }, aOnFailure))
                } else {
                    options = MongoUtil.findOneAndDeleteOptions(options)
                    this.collection.findOneAndDelete(filter, options, MongoAsync.callbacks(function (aResult) {
                        aOnSuccess(Bson.from(aResult));
                    }, aOnFailure))
                }
            } catch (x if !(x instanceof MongoError)) {
                throw new MongoError(x)
            }
        }

        //
        // Replacement
        //

        /**
         * @param {Object} [filter]
         * @param {Object} [replacement]
         * @param {Object} [options]
         * @param {Boolean} [options.upsert]
         * @param aOnSuccess Success callback. Called when updating is done.
         * Consumes Object: .wasAcknowledged (Boolean), .modifiedCountAvailable (Boolean), .modifiedCount (Number), .matchedCount (Number), .upsertedId (usually ObjectId)
         * @param aOnFailure Failure callback. Called if insertion failed.
         * @throws {MongoError}
         */
        this.replaceOne = function (filter, replacement, options, aOnSuccess, aOnFailure) {
            try {
                filter = Bson.to(filter)
                replacement = Bson.to(replacement)
                if (!MongoUtil.exists(options)) {
                    this.collection.replaceOne(filter, replacement, MongoAsync.callbacks(function (aResult) {
                        aOnSuccess(MongoUtil.updateResult(aResult));
                    }, aOnFailure))
                } else {
                    options = MongoUtil.updateOptions(options)
                    this.collection.replaceOne(filter, replacement, options, MongoAsync.callbacks(function (aResult) {
                        aOnSuccess(MongoUtil.updateResult(aResult));
                    }, aOnFailure))
                }
            } catch (x if !(x instanceof MongoError)) {
                throw new MongoError(x)
            }
        }

        /**
         * @param {Object} [options]
         * @param {Number} [options.maxTime]
         * @param {Object} [options.projection]
         * @param {String|com.mongodb.client.model.ReturnDocument} [options.returnDocument] 'after' or 'before'
         * @param {Object} [options.sort]
         * @param {Boolean} [options.upsert]
         * @param aOnSuccess Success callback. Called when the operation is completed.
         * @param aOnFailure Failure callback. Consumes a failure reason.
         * @throws {MongoError}
         */
        this.findOneAndReplace = function (filter, replacement, options, aOnSuccess, aOnFailure) {
            try {
                filter = Bson.to(filter)
                replacement = Bson.to(replacement)
                if (!MongoUtil.exists(options)) {
                    this.collection.findOneAndReplace(filter, replacement, MongoAsync.callbacks(function (aResult) {
                        aOnSuccess(Bson.from(aResult));
                    }, aOnFailure))
                } else {
                    options = MongoUtil.findOneAndReplaceOptions(options)
                    this.collection.findOneAndReplace(filter, replacement, options, MongoAsync.callbacks(function (aResult) {
                        aOnSuccess(Bson.from(aResult));
                    }, aOnFailure))
                }
            } catch (x if !(x instanceof MongoError)) {
                throw new MongoError(x)
            }
        }

        //
        // Update
        //

        /**
         * @param {Object} [filter]
         * @param {Object} [update]
         * @param {Object} [options]
         * @param {Boolean} [options.upsert]
         * @param aOnSuccess Success callback. Called when updating is done.
         * Consumes Object: .wasAcknowledged (Boolean), .modifiedCountAvailable (Boolean), .modifiedCount (Number), .matchedCount (Number), .upsertedId (usually ObjectId)
         * @param aOnFailure Failure callback. Called if insertion failed.
         * @throws {MongoError}
         */
        this.updateMany = function (filter, update, options, aOnSuccess, aOnFailure) {
            try {
                filter = Bson.to(filter)
                update = Bson.to(update)
                if (!MongoUtil.exists(options)) {
                    this.collection.updateMany(filter, update, MongoAsync.callbacks(function (aResult) {
                        aOnSuccess(MongoUtil.updateResult(aResult));
                    }, aOnFailure))
                } else {
                    options = MongoUtil.updateOptions(options)
                    this.collection.updateMany(filter, update, options, MongoAsync.callbacks(function (aResult) {
                        aOnSuccess(MongoUtil.updateResult(aResult));
                    }, aOnFailure))
                }
            } catch (x if !(x instanceof MongoError)) {
                throw new MongoError(x)
            }
        }

        /**
         * @param {Object} [filter]
         * @param {Object} [update]
         * @param {Object} [options]
         * @param {Boolean} [options.upsert]
         * @param aOnSuccess Success callback. Called when updating is done.
         * Consumes Object: .wasAcknowledged (Boolean), .modifiedCountAvailable (Boolean), .modifiedCount (Number), .matchedCount (Number), .upsertedId (usually ObjectId)
         * @param aOnFailure Failure callback. Called if insertion failed.
         * @throws {MongoError}
         */
        this.updateOne = function (filter, update, options, aOnSuccess, aOnFailure) {
            try {
                filter = Bson.to(filter)
                update = Bson.to(update)
                if (!MongoUtil.exists(options)) {
                    this.collection.updateOne(filter, update, MongoAsync.callbacks(function (aResult) {
                        aOnSuccess(MongoUtil.updateResult(aResult));
                    }, aOnFailure))
                } else {
                    options = MongoUtil.updateOptions(options)
                    this.collection.updateOne(filter, update, options, MongoAsync.callbacks(function (aResult) {
                        aOnSuccess(MongoUtil.updateResult(aResult));
                    }, aOnFailure))
                }
            } catch (x if !(x instanceof MongoError)) {
                throw new MongoError(x)
            }
        }

        /**
         * @param {Object} [options]
         * @param {Number} [options.maxTime]
         * @param {Object} [options.projection]
         * @param {String|com.mongodb.client.model.ReturnDocument} [options.returnDocument] 'after' or 'before'
         * @param {Object} [options.sort]
         * @param {Boolean} [options.upsert]
         * @param aOnSuccess Success callback. Called when the operation is completed.
         * @param aOnFailure Failure callback. Consumes a failure reason.
         * @throws {MongoError}
         */
        this.findOneAndUpdate = function (filter, update, options, aOnSuccess, aOnFailure) {
            try {
                filter = Bson.to(filter)
                update = Bson.to(update)
                if (!MongoUtil.exists(options)) {
                    this.collection.findOneAndUpdate(filter, update, MongoAsync.callbacks(function (aResult) {
                        aOnSuccess(Bson.from(aResult));
                    }, aOnFailure))
                } else {
                    options = MongoUtil.findOneAndUpdateOptions(options)
                    this.collection.findOneAndUpdate(filter, update, options, MongoAsync.callbacks(function (aResult) {
                        aOnSuccess(Bson.from(aResult));
                    }, aOnFailure))
                }
            } catch (x if !(x instanceof MongoError)) {
                throw new MongoError(x)
            }
        }

        //
        // Bulk write
        //

        /**
         * @param {Array} operations Array of Objects with the following structure: {type: 'type', filter: {}, update: {}, replacement: {}, document: {}, options: {}}
         * type can be 'deleteMany', 'deleteOne', 'insertOne', 'replaceOne', 'updateMany', 'updateOne'
         * @param {Object} [options]
         * @param {Boolean} [options.ordered]
         * @param aOnSuccess Success callback. Called when the write is completed.
         * @param aOnFailure Failure callback. Consumes a failure reason.
         * @throws {MongoError}
         */
        this.bulkWrite = function (operations, options, aOnSuccess, aOnFailure) {
            try {
                operations = MongoUtil.writeModelList(operations)
                if (!MongoUtil.exists(options)) {
                    this.collection.bulkWrite(operations, MongoAsync.callbacks(function (aResult) {
                        aOnSuccess(MongoUtil.bulkWriteResult(aResult));
                    }, aOnFailure))
                } else {
                    options = MongoUtil.bulkWriteOptions(options)
                    this.collection.bulkWrite(operations, options, MongoAsync.callbacks(function (aResult) {
                        aOnSuccess(MongoUtil.bulkWriteResult(aResult));
                    }, aOnFailure))
                }
            } catch (x if !(x instanceof MongoError)) {
                throw new MongoError(x)
            }
        }

        /**
         * Update an existing document or, if it doesn't exist, insert it.
         * <p>
         * This is a convenience function. If the document <i>does not</i> have an _id,
         * it will call insertOne. If the document <i>does</i> have an _id, it will
         * call updateOne with upsert=true. The upsert is there to guarantee that
         * the object is saved even if it has been deleted.
         * 
         * @param {Object} [doc]
         * @param {Object} [options] Only used when updateOne is called
         * @param aOnSuccess Success callback. Called when the object has been saved.
         * @param aOnFailure Failure callback. Consumes a failure reason.
         * @throws {MongoError}
         */
        this.save = function (doc, options, aOnSuccess, aOnFailure) {
            if (!MongoUtil.exists(doc._id)) {
                // Insert
                this.insertOne(doc, aOnSuccess, aOnFailure)
            } else {
                // Update
                if (!MongoUtil.exists(options)) {
                    options = {upsert: true}
                } else {
                    options.upsert = true
                }
                var id = doc._id
                var update = {$set: doc}
                return this.updateOne({_id: id}, update, options, aOnSuccess, aOnFailure)
            }
        }

        //
        // Diagnostics
        //

        /**
         * @param {Number} [scale]
         * @param {Boolean} [verbose]
         * @param aOnSuccess Success callback. Called when the operation is completed.
         * @param aOnFailure Failure callback. Consumes a failure reason.
         * @throws {MongoError}
         */
        this.stats = function (scale, verbose, aOnSuccess, aOnFailure) {
            if (!MongoUtil.exists(scale)) {
                scale = 1024
            }
            if (!MongoUtil.exists(verbose)) {
                verbose = false
            }
            this.database.command({collStats: this.name, scale: scale, verbose: verbose}, aOnSuccess, aOnFailure)
        }

        /**
         * @param {String} operation Operation name. Can be one of the following: 'count', 'distinct', 'group', 'find', 'findAndModify', 'delete', or 'update'
         * For more details, see https://docs.mongodb.com/manual/reference/command/explain/#dbcmd.explain
         * @param {Object} args Additional options of explain command, for example: 'query', 'updtes'.
         * @param {String} [verbosity='allPlansExecution'] 'queryPlanner', 'executionStats', or 'allPlansExecution'
         * @param aOnSuccess Success callback. Called when the operation is completed.
         * @param aOnFailure Failure callback. Consumes a failure reason.
         * @throws {MongoError}
         */
        this.explainRaw = function (operation, args, verbosity, aOnSuccess, aOnFailure) {
            var command = {explain: {}}
            // Note: the order *matters*, and the operation *must* be the first key in the dict
            command.explain[operation] = this.name
            for (var k in args) {
                if (args.hasOwnProperty(k)) {
                    command.explain[k] = args[k]
                }
            }
            if (MongoUtil.exists(verbosity)) {
                command.verbosity = verbosity
            }
            this.database.command(command, aOnSuccess, aOnFailure)
        }

        /**
         * @namespace
         */
        this.explain = function (collection) {
            var Public = {}

            /**
             * 'queryPlanner', 'executionStats', or 'allPlansExecution'
             * <p>
             * Defaults to 'allPlansExecution'
             * 
             * @field
             */
            Public.verbosity = null

            /**
             * @param aOnSuccess Success callback. Called when the operation is completed.
             * @param aOnFailure Failure callback. Consumes a failure reason.
             * @throws {MongoError}
             */
            Public.find = function (filter, aOnSuccess, aOnFailure) {
                filter = filter || {}
                return collection.explainRaw('find', {filter: filter}, this.verbosity, aOnSuccess, aOnFailure)
            }

            /**
             * @param aOnSuccess Success callback. Called when the operation is completed.
             * @param aOnFailure Failure callback. Consumes a failure reason.
             * @throws {MongoError}
             */
            Public.count = function (filter, aOnSuccess, aOnFailure) {
                filter = filter || {}
                return collection.explainRaw('count', {query: filter}, this.verbosity, aOnSuccess, aOnFailure)
            }

            /**
             * @param aOnSuccess Success callback. Called when the operation is completed.
             * @param aOnFailure Failure callback. Consumes a failure reason.
             * @throws {MongoError}
             */
            Public.group = function (args, aOnSuccess, aOnFailure) {
                if (!MongoUtil.exists(args.initial)) {
                    args.initial = {}
                }
                if (!MongoUtil.exists(args.reduce)) {
                    args.reduce = function (c, r) {}
                }
                var group = {
                    ns: collection.name,
                    key: args.key,
                    initial: args.initial,
                    $reduce: String(args.reduce)
                }
                if (MongoUtil.exists(args.keyf)) {
                    group.$keyf = String(args.keyf)
                }
                if (MongoUtil.exists(args.filter)) {
                    group.cond = args.filter
                }
                if (MongoUtil.exists(args.finalize)) {
                    group.finalize = String(args.finalize)
                }
                return collection.explainRaw('group', {group: group}, this.verbosity, aOnSuccess, aOnFailure)
            }

            /**
             * @param aOnSuccess Success callback. Called when the operation is completed.
             * @param aOnFailure Failure callback. Consumes a failure reason.
             * @throws {MongoError}
             */
            Public.deleteOne = function (filter, aOnSuccess, aOnFailure) {
                filter = filter || {}
                return collection.explainRaw('delete', {deletes: [{q: filter, limit: 1}]}, this.verbosity, aOnSuccess, aOnFailure)
            }

            /**
             * @param aOnSuccess Success callback. Called when the operation is completed.
             * @param aOnFailure Failure callback. Consumes a failure reason.
             * @throws {MongoError}
             */
            Public.deleteMany = function (filter, aOnSuccess, aOnFailure) {
                filter = filter || {}
                return collection.explainRaw('delete', {deletes: [{q: filter, limit: 0}]}, this.verbosity, aOnSuccess, aOnFailure)
            }

            /**
             * @param aOnSuccess Success callback. Called when the operation is completed.
             * @param aOnFailure Failure callback. Consumes a failure reason.
             * @throws {MongoError}
             */
            Public.updateMany = function (filter, update, options, aOnSuccess, aOnFailure) {
                filter = filter || {}
                update = update || {}
                var upsert = MongoUtil.exists(options) && options.upsert
                return collection.explainRaw('update', {updates: [{q: filter, u: update, upsert: upsert, multi: true}]}, this.verbosity, aOnSuccess, aOnFailure)
            }

            /**
             * @param aOnSuccess Success callback. Called when the operation is completed.
             * @param aOnFailure Failure callback. Consumes a failure reason.
             * @throws {MongoError}
             */
            Public.updateOne = function (filter, update, options, aOnSuccess, aOnFailure) {
                filter = filter || {}
                update = update || {}
                var upsert = MongoUtil.exists(options) && options.upsert
                return collection.explainRaw('update', {updates: [{q: filter, u: update, upsert: upsert, multi: false}]}, this.verbosity, aOnSuccess, aOnFailure)
            }

            return Public
        }(this)

        this.isCapped = function () {
            return capped;
        };
    }
    return MongoCollection;
});
