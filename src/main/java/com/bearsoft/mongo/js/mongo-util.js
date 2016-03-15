//
// MongoDB API for Nashorn in AMD environment, supporting Java's Services API
// especially for callbacks in async mode calls.
//
// Based on Three Crickets LLC code and is subject of
// The Apache License version 2.0:
// http://www.opensource.org/licenses/apache2.0.php

define(['./mongo-script-util', './mongo-error'], function (MongoInternals, MongoError) {
    var MongoUtil = function () {
        /** @exports Public as MongoUtil */
        var Public = {}

        //
        // MongoDB utilities
        //

        Public.getVersion = function () {
            // Nashorn
            return BSON.class.package.implementationVersion
        }

        /**
         * @param {String|byte[]} [raw]
         * @returns {<a href="http://api.mongodb.org/java/current/index.html?org/bson/types/ObjectId.html">org.bson.types.ObjectId</a>}
         */
        Public.id = function (raw) {
            if (!Public.exists(raw)) {
                return new org.bson.types.ObjectId()
            } else if (raw instanceof org.bson.types.ObjectId) {
                return raw
            } else {
                return new org.bson.types.ObjectId(raw)
            }
        }

        //
        // General-purpose JavaScript utilities
        //

        Public.exists = MongoInternals.exists;

        Public.isString = function (value) {
            try {
                return (value instanceof String) || (typeof value === 'string')
            } catch (x) {
                return false
            }
        }

        Public.applyOptions = function (target, source, options) {
            for (var o in options) {
                var option = options[o]
                if (Public.exists(source[option])) {
                    target[option](source[option])
                }
            }
        }

        Public.prune = MongoInternals.prune;

        //
        // Scripturian utilities
        //

        Public.getGlobal = function (name, applicationService) {
            if (!MongoUtil.exists(applicationService)) {
                applicationService = application
            }
            var fullName = 'mongoDb.' + name
            var value = null
            // In Scripturian
            try {
                value = applicationService.globals.get(fullName)
            } catch (x) {
            }
            // In Prudence
            if (!Public.exists(value)) {
                try {
                    value = applicationService.sharedGlobals.get(fullName)
                } catch (x) {
                }
            }
            // In Prudence initialization scripts
            if (!Public.exists(value)) {
                try {
                    value = app.globals.mongoDb[name]
                } catch (x) {
                }
            }
            if (!Public.exists(value)) {
                try {
                    value = app.globals[fullName]
                } catch (x) {
                }
            }
            if (!Public.exists(value)) {
                try {
                    value = app.sharedGlobals.mongoDb[name]
                } catch (x) {
                }
            }
            if (!Public.exists(value)) {
                try {
                    value = app.sharedGlobals[fullName]
                } catch (x) {
                }
            }
            return value
        }

        Public.setGlobal = function (name, value, applicationService) {
            if (!MongoUtil.exists(applicationService)) {
                applicationService = application
            }
            var fullName = 'mongoDb.' + name
            // In Scripturian
            value = applicationService.getGlobal(fullName, value)
            try {
                // In Prudence initialization scripts
                app.globals.mongoDb = app.globals.mongoDb || {}
                app.globals.mongoDb.client = Public.client
            } catch (x) {
            }
            return value
        }

        //
        // Driver utilities
        //

        // Connection

        /**
         * @throws {MongoError}
         */
        Public.connectClient = function (uri, options) {
            if (!MongoUtil.exists(uri)) {
                uri = 'mongodb://localhost/'
            }
            uri = Public.clientUri(uri, options)
            try {
                var client = new com.mongodb.MongoClients.create(uri)
                return {
                    uri: uri,
                    client: client
                }
            } catch (x if !(x instanceof MongoError)) {
                throw new MongoError(x)
            }
        }

        /**
         * @throws {MongoError}
         */
        Public.connectDatabase = function (uri, options) {
            if (!Public.exists(uri)) {
                uri = 'mongodb://localhost/default'
            }
            uri = Public.clientUri(uri, options)
            if (!Public.exists(uri.database)) {
                throw new MongoError('URI does not specify database: ' + uri)
            }
            var connection = Public.connectClient(uri)
            try {
                connection.database = connection.client.getDatabase(uri.database)
                return connection
            } catch (x if !(x instanceof MongoError)) {
                throw new MongoError(x)
            }
        }

        /**
         * @throws {MongoError}
         */
        Public.connectCollection = function (uri, options) {
            if (!Public.exists(uri)) {
                uri = 'mongodb://localhost/default.default'
            }
            uri = Public.clientUri(uri, options)
            if (!Public.exists(uri.collection)) {
                throw new MongoError('URI does not specify collection:' + uri)
            }
            var connection = Public.connectDatabase(uri)
            try {
                connection.collection = connection.database.getCollection(uri.collection, BSON.documentClass)
                return connection
            } catch (x if !(x instanceof MongoError)) {
                throw new MongoError(x)
            }
        }

        // Arguments

        /**
         * @return {<a href="http://api.mongodb.org/java/current/index.html?com/mongodb/MongoClientURI.html">com.mongodb.MongoClientURI</a>}
         * @throws {MongoError}
         */
        Public.clientUri = function (uri, options) {
            try {
                if (!(uri instanceof com.mongodb.MongoClientURI)) {
                    if (Public.exists(options)) {
                        options = Public.clientOptions(options)
                        uri = new com.mongodb.MongoClientURI(uri, options)
                    } else {
                        uri = new com.mongodb.MongoClientURI(uri)
                    }
                }
                return uri
            } catch (x if !(x instanceof MongoError)) {
                throw new MongoError(x)
            }
        }

        Public.documentList = function (array) {
            // TODO: is this really necessary?
            var list = new java.util.ArrayList(array.length)
            for (var a in array) {
                list.add(array[a])
            }
            return list
        }

        Public.indexSpecsList = function (fieldsOrSpecs) {
            var list = new java.util.ArrayList(fieldsOrSpecs.length)
            for (var f in fieldsOrSpecs) {
                var fieldOrSpec = fieldsOrSpecs[f]
                if (Public.isString(fieldOrSpec)) {
                    var spec = {}
                    spec[fieldOrSpec] = 1
                    fieldOrSpec = spec
                }
                list.add(fieldOrSpec)
            }
            return list
        }

        Public.writeModelList = function (array) {
            var list = new java.util.ArrayList(array.length)
            for (var a in array) {
                var entry = array[a]
                entry = Public.writeModel(entry)
                list.add(entry)
            }
            return list
        }

        // Options

        /**
         * @throws {MongoError}
         */
        Public.clientOptions = function (options) {
            if (!(options instanceof com.mongodb.MongoClientOptions.Builder)) {
                var clientOptions = com.mongodb.MongoClientOptions.builder()
                Public.applyOptions(clientOptions, options, ['alwaysUseMBeans', 'connectionsPerHost', 'connectTimeout', 'cursorFinalizerEnabled', 'description', 'heartbeatConnectTimeout', 'heartbeatFrequency', 'heartbeatSocketTimeout', 'localThreshold', 'maxConnectionIdleTime', 'maxConnectionLifeTime', 'maxWaitTime', 'minConnectionsPerHost', 'minHeartbeatFrequency', 'requiredReplicaSetName', 'serverSelectionTimeout', 'socketKeepAlive', 'socketTimeout', 'sslEnabled', 'sslInvalidHostNameAllowed', 'threadsAllowedToBlockForConnectionMultiplier'])
                if (Public.exists(options.readPreference)) {
                    clientOptions.readPreference(Public.readPreference(options.readPreference))
                }
                if (Public.exists(options.writeConcern)) {
                    clientOptions.writeConcern(Public.writeConcern(options.writeConcern))
                }
                options = clientOptions
            }

            // This will convert native JavaScript types
            options.codecRegistry(BSON.codecRegistry)

            return options
        }

        Public.createCollectionOptions = function (options) {
            if (!(options instanceof com.mongodb.client.model.CreateCollectionOptions)) {
                var createCollectionOptions = new com.mongodb.client.model.CreateCollectionOptions()
                Public.applyOptions(createCollectionOptions, options, ['autoIndex', 'capped', 'maxDocuments', 'sizeInBytes', 'usePowerOf2Sizes'])
                if (Public.exists(options.storageEngineOptions)) {
                    createCollectionOptions.storageEngineOptions(BSON.to(options.storageEngineOptions))
                }
                options = createCollectionOptions
            }
            return options
        }

        Public.countOptions = function (options) {
            if (!(options instanceof com.mongodb.client.model.CountOptions)) {
                var countOptions = new com.mongodb.client.model.CountOptions()
                Public.applyOptions(countOptions, options, ['hintString', 'limit', 'skip'])
                if (Public.exists(options.hint)) {
                    countOptions.hint(BSON.to(options.hint))
                }
                if (Public.exists(options.maxTime)) {
                    countOptions.maxTime(options.maxTime, java.util.concurrent.TimeUnit.MILLISECONDS)
                }
                options = countOptions
            }
            return options
        }

        Public.createIndexOptions = function (options) {
            if (!(options instanceof com.mongodb.client.model.IndexOptions)) {
                var indexOptions = new com.mongodb.client.model.IndexOptions()
                Public.applyOptions(indexOptions, options, ['background', 'bits', 'bucketSize', 'defaultLanguage', 'languageOverride', 'max', 'min', 'name', 'sparse', 'sphereVersion', 'textVersion', 'unique', 'version'])
                if (Public.exists(options.expireAfter)) {
                    indexOptions.expireAfter(options.expireAfter, java.util.concurrent.TimeUnit.MILLISECONDS)
                }
                if (Public.exists(options.storageEngine)) {
                    indexOptions.storageEngine(BSON.to(options.expireAfter))
                }
                if (Public.exists(options.weights)) {
                    indexOptions.weights(BSON.to(options.weights))
                }
                options = indexOptions
            }
            return options
        }

        Public.findOneAndDeleteOptions = function (options) {
            if (!(options instanceof com.mongodb.client.model.FindOneAndDeleteOptions)) {
                var findOneAndDeleteOptions = new com.mongodb.client.model.FindOneAndDeleteOptions()
                if (Public.exists(options.maxTime)) {
                    findOneAndDeleteOptions.maxTime(options.maxTime, java.util.concurrent.TimeUnit.MILLISECONDS)
                }
                if (Public.exists(options.projection)) {
                    findOneAndDeleteOptions.projection(BSON.to(options.projection))
                }
                if (Public.exists(options.sort)) {
                    findOneAndDeleteOptions.sort(BSON.to(options.sort))
                }
                options = findOneAndDeleteOptions
            }
            return options
        }

        Public.findOneAndReplaceOptions = function (options) {
            if (!(options instanceof com.mongodb.client.model.FindOneAndReplaceOptions)) {
                var findOneAndReplaceOptions = new com.mongodb.client.model.FindOneAndReplaceOptions()
                Public.applyOptions(findOneAndReplaceOptions, options, ['upsert'])
                if (Public.exists(options.maxTime)) {
                    findOneAndReplaceOptions.maxTime(options.maxTime, java.util.concurrent.TimeUnit.MILLISECONDS)
                }
                if (Public.exists(options.projection)) {
                    findOneAndReplaceOptions.projection(BSON.to(options.projection))
                }
                if (Public.exists(options.returnDocument)) {
                    if (options.returnDocument instanceof com.mongodb.client.model.ReturnDocument) {
                        findOneAndReplaceOptions.returnDocument(options.returnDocument)
                    } else {
                        switch (options.returnDocument) {
                            case 'after':
                                findOneAndReplaceOptions.returnDocument(com.mongodb.client.model.ReturnDocument.AFTER)
                                break
                            case 'before':
                                findOneAndReplaceOptions.returnDocument(com.mongodb.client.model.ReturnDocument.BEFORE)
                                break
                            default:
                                throw new MongoError('Unsupported return document: ' + options.returnDocument)
                        }
                    }
                }
                if (Public.exists(options.sort)) {
                    findOneAndReplaceOptions.sort(BSON.to(options.sort))
                }
                options = findOneAndReplaceOptions
            }
            return options
        }

        Public.findOneAndUpdateOptions = function (options) {
            if (!(options instanceof com.mongodb.client.model.FindOneAndUpdateOptions)) {
                var findOneAndUpdateOptions = new com.mongodb.client.model.FindOneAndUpdateOptions()
                Public.applyOptions(findOneAndUpdateOptions, options, ['upsert'])
                if (Public.exists(options.maxTime)) {
                    findOneAndUpdateOptions.maxTime(options.maxTime, java.util.concurrent.TimeUnit.MILLISECONDS)
                }
                if (Public.exists(options.projection)) {
                    findOneAndUpdateOptions.projection(BSON.to(options.projection))
                }
                if (Public.exists(options.returnDocument)) {
                    if (options.returnDocument instanceof com.mongodb.client.model.ReturnDocument) {
                        findOneAndUpdateOptions.returnDocument(options.returnDocument)
                    } else {
                        switch (options.returnDocument) {
                            case 'after':
                                findOneAndUpdateOptions.returnDocument(com.mongodb.client.model.ReturnDocument.AFTER)
                                break
                            case 'before':
                                findOneAndUpdateOptions.returnDocument(com.mongodb.client.model.ReturnDocument.BEFORE)
                                break
                            default:
                                throw new MongoError('Unsupported return document: ' + options.returnDocument)
                        }
                    }
                }
                if (Public.exists(options.sort)) {
                    findOneAndUpdateOptions.sort(BSON.to(options.sort))
                }
                options = findOneAndUpdateOptions
            }
            return options
        }

        Public.updateOptions = function (options) {
            if (!(options instanceof com.mongodb.client.model.UpdateOptions)) {
                var updateOptions = new com.mongodb.client.model.UpdateOptions()
                Public.applyOptions(updateOptions, options, ['upsert'])
                options = updateOptions
            }
            return options
        }

        Public.insertManyOptions = function (options) {
            if (!(options instanceof com.mongodb.client.model.InsertManyOptions)) {
                var insertManyOptions = new com.mongodb.client.model.InsertManyOptions()
                Public.applyOptions(insertManyOptions, options, ['ordered'])
                options = insertManyOptions
            }
            return options
        }

        Public.renameCollectionOptions = function (options) {
            if (!(options instanceof com.mongodb.client.model.RenameCollectionOptions)) {
                var renameCollectionOptions = new com.mongodb.client.model.RenameCollectionOptions()
                Public.applyOptions(renameCollectionOptions, options, ['dropTarget'])
                options = renameCollectionOptions
            }
            return options
        }

        Public.bulkWriteOptions = function (options) {
            if (!(options instanceof com.mongodb.client.model.BulkWriteOptions)) {
                var bulkWriteOptions = new com.mongodb.client.model.BulkWriteOptions()
                Public.applyOptions(renameCollectionOptions, options, ['ordered'])
                options = bulkWriteOptions
            }
            return options
        }

        // Behavior

        /**
         * @throws {MongoError}
         */
        Public.readPreference = function (options) {
            if ((options.mode != 'primary') && (options.mode != 'primaryPreferred') && (options.mode != 'secondary') && (options.mode != 'secondaryPreferred') && (options.mode != 'nearest')) {
                throw new MongoError('Unsupported read preference: ' + options.mode)
            }

            var readPreference

            if (Public.exists(options.tags)) {
                var tagList = new java.util.ArrayList()
                for (var name in options.tags) {
                    var value = options.tags[value]
                    tagList.add(new com.mongodb.Tag(name, value))
                }
                var tagSet = new com.mongodb.TagSet(tagList)
                readPreference = com.mongodb.ReadPreference[options.mode](tagSet)
            } else {
                readPreference = com.mongodb.ReadPreference[options.mode]()
            }

            return readPreference
        }

        Public.writeConcern = function (options) {
            var w = Public.exists(options.w) ? options.w : 0
            var wtimeout = Public.exists(options.wtimeout) ? options.wtimeout : 0
            var fsync = Public.exists(options.fsync) ? options.fsync : false
            var j = Public.exists(options.j) ? options.j : false
            return new com.mongodb.WriteConcern(w, wtimeout, fsync, j)
        }

        // Models

        /**
         * @throws {MongoError}
         */
        Public.writeModel = function (model) {
            if (!(model instanceof com.mongodb.client.model.WriteModel)) {
                switch (model.type) {
                    case 'deleteMany':
                        model = new com.mongodb.client.model.DeleteManyModel(model.filter)
                        break
                    case 'deleteOne':
                        model = new com.mongodb.client.model.DeleteOneModel(model.filter)
                        break
                    case 'insertOne':
                        model = new com.mongodb.client.model.InsertOneModel(model.document)
                        break
                    case 'replaceOne':
                        var filter = model.filter
                        var replacement = model.replacement
                        if (!Public.exists(model.options)) {
                            model = new com.mongodb.client.model.ReplaceOneModel(filter, replacement)
                        } else {
                            var options = Public.updateOptions(model.options)
                            model = new com.mongodb.client.model.ReplaceOneModel(filter, replacement, options)
                        }
                        break
                    case 'updateMany':
                        var filter = model.filter
                        var update = model.update
                        if (!Public.exists(model.options)) {
                            model = new com.mongodb.client.model.UpdateManyModel(filter, update)
                        } else {
                            var options = Public.updateOptions(model.options)
                            model = new com.mongodb.client.model.UpdateManyModel(filter, update, options)
                        }
                        break
                    case 'updateOne':
                        var filter = model.filter
                        var update = model.update
                        if (!Public.exists(model.options)) {
                            model = new com.mongodb.client.model.UpdateOneModel(filter, update)
                        } else {
                            var options = Public.updateOptions(model.options)
                            model = new com.mongodb.client.model.UpdateOneModel(filter, update, options)
                        }
                        break
                    default:
                        throw new MongoError('Unsupported write model type: ' + model.type)
                }
            }
            return model
        }

        // Results

        Public.deleteResult = function (result) {
            var deleteResult = {
                wasAcknowledged: result.wasAcknowledged()
            }
            if (deleteResult.wasAcknowledged) {
                deleteResult.deletedCount = result.deletedCount
            }
            return deleteResult
        }

        Public.updateResult = function (result) {
            var updateResult = {
                wasAcknowledged: result.wasAcknowledged()
            }
            if (updateResult.wasAcknowledged) {
                updateResult.modifiedCountAvailable = result.modifiedCountAvailable
                if (updateResult.modifiedCountAvailable) {
                    updateResult.modifiedCount = result.modifiedCount
                }
                updateResult.matchedCount = result.matchedCount
                updateResult.upsertedId = result.upsertedId
            }
            return updateResult
        }

        Public.bulkWriteResult = MongoInternals.bulkWriteResult;

        // Iterables

        Public.distinctIterable = function (i, options) {
            Public.applyOptions(i, options, ['batchSize'])
            if (Public.exists(options.filter)) {
                i.filter(BSON.to(options.filter))
            }
            if (Public.exists(options.maxTime)) {
                i.maxTime(options.maxTime, java.util.concurrent.TimeUnit.MILLISECONDS)
            }
        }

        /**
         * @throws {MongoError}
         */
        Public.findIterable = function (i, options) {
            Public.applyOptions(i, options, ['batchSize', 'limit', 'noCursorTimeout', 'oplogReplay', 'partial', 'skip'])
            if (Public.exists(options.cursorType)) {
                if (options.cursorType instanceof com.mongodb.CursorType) {
                    i.cursorType(options.cursorType)
                } else {
                    switch (options.cursorType) {
                        case 'nonTailable':
                            i.cursorType(com.mongodb.CursorType.NonTailable)
                            break
                        case 'tailable':
                            i.cursorType(com.mongodb.CursorType.Tailable)
                            break
                        case 'tailableAwait':
                            i.cursorType(com.mongodb.CursorType.TailableAwait)
                            break
                        default:
                            throw new MongoError('Unsupported cursor type: ' + options.cursorType)
                    }
                }
            }
            if (Public.exists(options.filter)) {
                i.filter(BSON.to(options.filter))
            }
            if (Public.exists(options.maxTime)) {
                i.maxTime(options.maxTime, java.util.concurrent.TimeUnit.MILLISECONDS)
            }
            if (Public.exists(options.modifiers)) {
                i.modifiers(BSON.to(options.modifiers))
            }
            if (Public.exists(options.projection)) {
                i.projection(BSON.to(options.projection))
            }
            if (Public.exists(options.sort)) {
                i.sort(BSON.to(options.sort))
            }
        }

        Public.mongoIterable = function (i, options) {
            Public.applyOptions(i, options, ['batchSize'])
        }

        Public.listIndexesIterable = function (i, options) {
            Public.applyOptions(i, options, ['batchSize'])
            if (Public.exists(options.maxTime)) {
                i.maxTime(options.maxTime, java.util.concurrent.TimeUnit.MILLISECONDS)
            }
        }

        Public.aggregateIterable = function (i, options) {
            Public.applyOptions(i, options, ['allowDiskUse', 'batchSize', 'useCursor'])
            if (Public.exists(options.maxTime)) {
                i.maxTime(options.maxTime, java.util.concurrent.TimeUnit.MILLISECONDS)
            }
        }

        return Public
    }();
    return MongoUtil;
});
