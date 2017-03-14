//
// MongoDB API for Nashorn in AMD environment,
// especially for callbacks in async mode calls.
//
// Based on Three Crickets LLC code and is subject of
// The Apache License version 2.0:
// http://www.opensource.org/licenses/apache2.0.php

define(['./mongo-util', './mongo-error', './mongo-bson', './mongo-cursor'], function (MongoUtil, MongoError, Bson, MongoCursor) {
    var MongoCollectionClass = Java.type('com.mongodb.client.MongoCollection');
    var MongoNamespaceClass = Java.type('com.mongodb.MongoNamespace');
    var ObjectClass = Java.type('java.lang.Object');
    /**
     *
     * @class
     * @throws {MongoError}
     * @see See the <a href="http://api.mongodb.org/java/current/index.html?com/mongodb/client/MongoCollection.html">Java API</a>
     */
    function MongoCollection(uri /* or collection */, options /* or database */, database) {
        var collection, database, client
        if (uri instanceof MongoCollectionClass) {
            // Just wrap
            collection = uri // first argument
            database = options // second argument
            client = database.client
        } else {
            // Connect
            var connection = MongoUtil.connectCollection(uri, options)
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
         * @throws {MongoError}
         */
        this.drop = function () {
            try {
                this.collection.drop()
            } catch (x if !(x instanceof MongoError)) {
                throw new MongoError(x)
            }
        }

        /**
         * @param {Object} [options]
         * @param {Boolean} [options.dropTarget]
         * @throws {MongoError}
         */
        this.rename = function (newName, options) {
            try {
                var namespace = new MongoNamespaceClass(this.databaseName, newName)
                if (!MongoUtil.exists(options)) {
                    this.renameCollection(namespace)
                } else {
                    options = MongoUtil.renameCollectionOptions(options)
                    this.renameCollection(namespace, options)
                }
                this.name = this.collection.namespace.collectionName
                this.databaseName = this.collection.namespace.databaseName
                this.fullName = this.collection.namespace.fullName
            } catch (x if !(x instanceof MongoError)) {
                throw new MongoError(x)
            }
        }

        /**
         * @param {Boolean} [force=false]
         * @param {Number} [paddingFactor]
         * @param {Number} [paddingBytes]
         * @throws {MongoError}
         */
        this.compact = function (force, paddingFactor, paddingBytes) {
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
            return this.database.command(command)
        }

        /**
         * @param {Number} size
         * @throws {MongoError}
         */
        this.convertToCapped = function (size) {
            return this.database.command({convertToCapped: this.name, size: size})
        }

        /**
         * @throws {MongoError}
         */
        this.setFlag = function (flag, value) {
            var command = {collMod: this.name}
            command[flag] = value
            return this.database.command(command)
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
         * @throws {MongoError}
         */
        this.createIndex = function (fieldOrSpec, options) {
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
                    return this.collection.createIndex(spec)
                } else {
                    options = MongoUtil.createIndexOptions(options)
                    return this.collection.createIndex(spec, options)
                }
            } catch (x if !(x instanceof MongoError)) {
                throw new MongoError(x)
            }
        }

        /**
         * @param {Array} fieldsOrSpecs Strings or Objects
         * @throws {MongoError}
         */
        this.createIndexes = function (fieldsOrSpecs) {
            try {
                var specs = MongoUtil.indexSpecsList(fieldsOrSpecs)
                return this.collection.createIndexes(specs)
            } catch (x if !(x instanceof MongoError)) {
                throw new MongoError(x)
            }
        }

        /**
         * @param {String|Object} fieldOrSpec
         * @throws {MongoError}
         */
        this.dropIndex = function (fieldOrSpec) {
            try {
                if (MongoUtil.isString(fieldOrSpec)) {
                    this.collection.dropIndex(fieldOrSpec)
                } else {
                    fieldOrSpec = Bson.to(fieldOrSpec)
                    this.collection.dropIndex(fieldOrSpec)
                }
            } catch (x if !(x instanceof MongoError)) {
                throw new MongoError(x)
            }
        }

        /**
         * @throws {MongoError}
         */
        this.dropIndexes = function () {
            try {
                this.collection.dropIndexes()
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
                var indexes = []
                var i = this.collection.listIndexes().iterator()
                try {
                    if (MongoUtil.exists(options)) {
                        MongoUtil.listIndexesIterable(i, options)
                    }
                    while (i.hasNext()) {
                        indexes.push(i.next())
                    }
                } finally {
                    i.close()
                }
                return indexes
            } catch (x if !(x instanceof MongoError)) {
                throw new MongoError(x)
            }
        }

        /**
         * @throws {MongoError}
         */
        this.reIndex = function () {
            return this.database.command({reIndex: this.name})
        }

        /**
         * Currently can only change expireAfterSeconds option.
         *
         * @throws {MongoError}
         */
        this.modifyIndex = function (fieldOrSpec, options) {
            if (MongoUtil.isString(fieldOrSpec)) {
                var spec = {}
                spec[fieldOrSpec] = 1
                fieldOrSpec = spec
            }
            var index = {keyPattern: fieldOrSpec}
            for (var k in options) {
                index[k] = options[k]
            }
            return this.setFlag('index', index)
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
                return new MongoCursor(i, this, filter)
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
         * @throws {MongoError}
         */
        this.findOne = function (filter, options) {
            var cursor = this.find(filter, options)
            return cursor.first()
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
         * @throws {MongoError}
         */
        this.count = function (filter, options) {
            try {
                if (!MongoUtil.exists(filter)) {
                    return this.collection.count()
                } else {
                    filter = Bson.to(filter)
                    if (!MongoUtil.exists(options)) {
                        return this.collection.count(filter)
                    } else {
                        options = MongoUtil.countOptions(options)
                        return this.collection.count(filter, options)
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
                var i = this.collection.distinct(key, ObjectClass)
                if (MongoUtil.exists(options)) {
                    MongoUtil.distinctIterable(i, options)
                }
                // TODO
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
                return new MongoCursor(i, this)
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
         * @throws {MongoError}
         */
        this.group = function (args) {
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
            return this.database.command(command)
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
         * @throws {MongoError}
         */
        this.mapReduce = function (args) {
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
            return this.database.command(command)
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
         * @throws {MongoError}
         */
        this.geoNear = function (x, y, options) {
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
            return this.database.command(command)
        }

        /**
         * @param {Object} [options]
         * @param {Object} [options.search]
         * @param {Number} [options.maxDistance]
         * @param {Number} [options.limit]
         * @throws {MongoError}
         */
        this.geoHaystackSearch = function (x, y, options) {
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
            return this.database.command(command)
        }

        //
        // Insertion
        //

        /**
         * @param {Object[]} [docs]
         * @param {Object} [options]
         * @param {Boolean} [options.ordered]
         * @throws {MongoError}
         */
        this.insertMany = function (docs, options) {
            try {
                docs = MongoUtil.documentList(docs)
                if (!MongoUtil.exists(options)) {
                    this.collection.insertMany(docs)
                } else {
                    options = MongoUtil.insertManyOptions(options)
                    this.collection.insertMany(docs, options)
                }
            } catch (x if !(x instanceof MongoError)) {
                throw new MongoError(x)
            }
        }

        /**
         * @param {Object} [doc]
         * @throws {MongoError}
         */
        this.insertOne = function (doc) {
            try {
                this.collection.insertOne(Bson.to(doc))
            } catch (x if !(x instanceof MongoError)) {
                throw new MongoError(x)
            }
        }

        //
        // Deletion
        //

        /**
         * @param {Object} filter
         * @returns Object: .wasAcknowledged (Boolean), .deleteCount (Number)
         * @throws {MongoError}
         */
        this.deleteMany = function (filter) {
            try {
                filter = Bson.to(filter)
                var result = this.collection.deleteMany(filter)
                return MongoUtil.deleteResult(result)
            } catch (x if !(x instanceof MongoError)) {
                throw new MongoError(x)
            }
        }

        /**
         * @param {Object} filter
         * @returns Object: .wasAcknowledged (Boolean), .deleteCount (Number)
         * @throws {MongoError}
         */
        this.deleteOne = function (filter) {
            try {
                filter = Bson.to(filter)
                var result = this.collection.deleteOne(filter)
                return MongoUtil.deleteResult(result)
            } catch (x if !(x instanceof MongoError)) {
                throw new MongoError(x)
            }
        }

        /**
         * @param {Object} [options]
         * @param {Number} [options.maxTime]
         * @param {Object} [options.projection]
         * @param {Object} [options.sort]
         * @throws {MongoError}
         */
        this.findOneAndDelete = function (filter, options) {
            try {
                filter = Bson.to(filter)
                var result;
                if (!MongoUtil.exists(options)) {
                    result = this.collection.findOneAndDelete(filter)
                } else {
                    options = MongoUtil.findOneAndDeleteOptions(options)
                    result = this.collection.findOneAndDelete(filter, options)
                }
                return Bson.from(result)
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
         * @returns Object: .wasAcknowledged (Boolean), .modifiedCountAvailable (Boolean), .modifiedCount (Number), .matchedCount (Number), .upsertedId (usually ObjectId)
         * @throws {MongoError}
         */
        this.replaceOne = function (filter, replacement, options) {
            try {
                filter = Bson.to(filter)
                var result;
                if (!MongoUtil.exists(options)) {
                    result = this.collection.replaceOne(filter, replacement)
                } else {
                    options = MongoUtil.updateOptions(options)
                    result = this.collection.replaceOne(filter, replacement, options)
                }
                return MongoUtil.updateResult(result)
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
         * @throws {MongoError}
         */
        this.findOneAndReplace = function (filter, replacement, options) {
            try {
                filter = Bson.to(filter)
                var result;
                if (!MongoUtil.exists(options)) {
                    result = this.collection.findOneAndReplace(filter, replacement)
                } else {
                    options = MongoUtil.findOneAndReplaceOptions(options)
                    result = this.collection.findOneAndReplace(filter, replacement, options)
                }
                return Bson.from(result)
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
         * @returns Object: .wasAcknowledged (Boolean), .modifiedCountAvailable (Boolean), .modifiedCount (Number), .matchedCount (Number), .upsertedId (usually ObjectId)
         * @throws {MongoError}
         */
        this.updateMany = function (filter, update, options) {
            try {
                filter = Bson.to(filter)
                update = Bson.to(update)
                var result;
                if (!MongoUtil.exists(options)) {
                    result = this.collection.updateMany(filter, update)
                } else {
                    options = MongoUtil.updateOptions(options)
                    result = this.collection.updateMany(filter, update, options)
                }
                return MongoUtil.updateResult(result)
            } catch (x if !(x instanceof MongoError)) {
                throw new MongoError(x)
            }
        }

        /**
         * @param {Object} [filter]
         * @param {Object} [update]
         * @param {Object} [options]
         * @param {Boolean} [options.upsert]
         * @returns Object: .wasAcknowledged (Boolean), .modifiedCountAvailable (Boolean), .modifiedCount (Number), .matchedCount (Number), .upsertedId (usually ObjectId)
         * @throws {MongoError}
         */
        this.updateOne = function (filter, update, options) {
            try {
                filter = Bson.to(filter)
                update = Bson.to(update)
                var result;
                if (!MongoUtil.exists(options)) {
                    result = this.collection.updateOne(filter, update)
                } else {
                    options = MongoUtil.updateOptions(options)
                    result = this.collection.updateOne(filter, update, options)
                }
                return MongoUtil.updateResult(result)
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
         * @throws {MongoError}
         */
        this.findOneAndUpdate = function (filter, update, options) {
            try {
                filter = Bson.to(filter)
                update = Bson.to(update)
                var result;
                if (!MongoUtil.exists(options)) {
                    result = this.collection.findOneAndUpdate(filter, update)
                } else {
                    options = MongoUtil.findOneAndUpdateOptions(options)
                    result = this.collection.findOneAndUpdate(filter, update, options)
                }
                return Bson.from(result)
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
         * @throws {MongoError}
         */
        this.save = function (doc, options) {
            if (!MongoUtil.exists(doc._id)) {
                // Insert
                this.insertOne(doc)
                return null
            } else {
                // Update
                if (!MongoUtil.exists(options)) {
                    options = {upsert: true}
                } else {
                    options.upsert = true
                }
                var id = doc._id
                delete doc._id
                var update = {$set: doc}
                try {
                    return this.updateOne({_id: id}, update, options)
                } finally {
                    doc._id = id
                }
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
         * @throws {MongoError}
         */
        this.bulkWrite = function (operations, options) {
            try {
                operations = MongoUtil.writeModelList(operations)
                if (!MongoUtil.exists(options)) {
                    return MongoUtil.bulkWriteResult(this.collection.bulkWrite(operations))
                } else {
                    options = MongoUtil.bulkWriteOptions(options)
                    return MongoUtil.bulkWriteResult(this.collection.bulkWrite(operations, options))
                }
            } catch (x if !(x instanceof MongoError)) {
                throw new MongoError(x)
            }
        }

        //
        // Diagnostics
        //

        /**
         * @param {Number} [scale]
         * @param {Boolean} [verbose]
         * @throws {MongoError}
         */
        this.stats = function (scale, verbose) {
            if (!MongoUtil.exists(scale)) {
                scale = 1024
            }
            if (!MongoUtil.exists(verbose)) {
                verbose = false
            }
            return this.database.command({collStats: this.name, scale: scale, verbose: verbose})
        }

        /**
         * @param {String} operation
         * @param {String} [verbosity='allPlansExecution'] 'queryPlanner', 'executionStats', or 'allPlansExecution'
         * @throws {MongoError}
         */
        this.explainRaw = function (operation, args, verbosity) {
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
            return this.database.command(command)
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
             * @throws {MongoError}
             */
            Public.find = function (filter) {
                filter = filter || {}
                return collection.explainRaw('find', {filter: filter}, this.verbosity)
            }

            /**
             * @throws {MongoError}
             */
            Public.count = function (filter) {
                filter = filter || {}
                return collection.explainRaw('count', {query: filter}, this.verbosity)
            }

            /**
             * @throws {MongoError}
             */
            Public.group = function (args) {
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
                return collection.explainRaw('group', {group: group}, this.verbosity)
            }

            /**
             * @throws {MongoError}
             */
            Public.deleteOne = function (filter) {
                filter = filter || {}
                return collection.explainRaw('delete', {deletes: [{q: filter, limit: 1}]}, this.verbosity)
            }

            /**
             * @throws {MongoError}
             */
            Public.deleteMany = function (filter) {
                filter = filter || {}
                return collection.explainRaw('delete', {deletes: [{q: filter, limit: 0}]}, this.verbosity)
            }

            /**
             * @throws {MongoError}
             */
            Public.updateMany = function (filter, update, options) {
                filter = filter || {}
                update = update || {}
                var upsert = MongoUtil.exists(options) && options.upsert
                return collection.explainRaw('update', {updates: [{q: filter, u: update, upsert: upsert, multi: true}]}, this.verbosity)
            }

            /**
             * @throws {MongoError}
             */
            Public.updateOne = function (filter, update, options) {
                filter = filter || {}
                update = update || {}
                var upsert = MongoUtil.exists(options) && options.upsert
                return collection.explainRaw('update', {updates: [{q: filter, u: update, upsert: upsert, multi: false}]}, this.verbosity)
            }

            return Public
        }(this)
    }
    return MongoCollection;
});
