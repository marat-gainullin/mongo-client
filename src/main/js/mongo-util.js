/* global Java */

//
// MongoDB API for Nashorn in AMD environment,
// especially for callbacks in async mode calls.
//
// Based on Three Crickets LLC code and is subject of
// The Apache License version 2.0:
// http://www.opensource.org/licenses/apache2.0.php

define(['./mongo-script-util', './mongo-error', './mongo-bson'], function (MongoInternals, MongoError, Bson) {
    var ArrayListClass = Java.type('java.util.ArrayList');
    var ObjectIdClass = Java.type('org.bson.types.ObjectId');
    var MongoClientURIClass = Java.type('com.mongodb.MongoClientURI');
    var MongoClientOptionsClass = Java.type('com.mongodb.MongoClientOptions');
    var MongoClientOptionsBuilderClass = Java.type('com.mongodb.MongoClientOptions.Builder');
    var CreateCollectionOptionsClass = Java.type('com.mongodb.client.model.CreateCollectionOptions');
    var CountOptionsClass = Java.type('com.mongodb.client.model.CountOptions');
    var IndexOptionsClass = Java.type('com.mongodb.client.model.IndexOptions');
    var FindOneAndDeleteOptionsClass = Java.type('com.mongodb.client.model.FindOneAndDeleteOptions');
    var FindOneAndReplaceOptionsClass = Java.type('com.mongodb.client.model.FindOneAndReplaceOptions');
    var ReturnDocumentClass = Java.type('com.mongodb.client.model.ReturnDocument');
    var FindOneAndUpdateOptionsClass = Java.type('com.mongodb.client.model.FindOneAndUpdateOptions');
    var UpdateOptionsClass = Java.type('com.mongodb.client.model.UpdateOptions');
    var InsertManyOptionsClass = Java.type('com.mongodb.client.model.InsertManyOptions');
    var RenameCollectionOptionsClass = Java.type('com.mongodb.client.model.RenameCollectionOptions');
    var BulkWriteOptionsClass = Java.type('com.mongodb.client.model.BulkWriteOptions');
    var WriteModelClass = Java.type('com.mongodb.client.model.WriteModel');
    var CursorTypeClass = Java.type('com.mongodb.CursorType');
    var ConnectionStringClass = Java.type('com.mongodb.ConnectionString');
    var MongoClientsClass = Java.type('com.mongodb.async.client.MongoClients');

    var ClusterTypeClass = Java.type('com.mongodb.connection.ClusterType');
    var MongoClientSettingsClass = Java.type('com.mongodb.async.client.MongoClientSettings');
    var ClusterSettingsClass = Java.type('com.mongodb.connection.ClusterSettings');
    var ConnectionPoolSettingsClass = Java.type('com.mongodb.connection.ConnectionPoolSettings');
    var ServerSettingsClass = Java.type('com.mongodb.connection.ServerSettings');
    var SslSettingsClass = Java.type('com.mongodb.connection.SslSettings');
    var SocketSettingsClass = Java.type('com.mongodb.connection.SocketSettings');
    var TimeUnitClass = Java.type('java.util.concurrent.TimeUnit');
    var MongoClientClass = Java.type('com.mongodb.MongoClient');
    var TagClass = Java.type('com.mongodb.Tag');
    var TagSetClass = Java.type('com.mongodb.TagSet');
    var ReadPreferenceClass = Java.type('com.mongodb.ReadPreference');
    var WriteConcernClass = Java.type('com.mongodb.WriteConcern');
    var DeleteManyModelClass = Java.type('com.mongodb.client.model.DeleteManyModel');
    var DeleteOneModelClass = Java.type('com.mongodb.client.model.DeleteOneModel');
    var InsertOneModelClass = Java.type('com.mongodb.client.model.InsertOneModel');
    var ReplaceOneModelClass = Java.type('com.mongodb.client.model.ReplaceOneModel');
    var UpdateManyModelClass = Java.type('com.mongodb.client.model.UpdateManyModel');
    var UpdateOneModelClass = Java.type('com.mongodb.client.model.UpdateOneModel');
    var IndexModelClass = Java.type('com.mongodb.client.model.IndexModel');

    var MongoUtil = function () {
        /** @exports Public as MongoUtil */
        var Public = {}

        //
        // MongoDB utilities
        //

        Public.getVersion = function () {
            // Nashorn
            return '0.1';
        }

        /**
         * @param {String|byte[]} [raw]
         * @returns {<a href="http://api.mongodb.org/java/current/index.html?org/bson/types/ObjectId.html">org.bson.types.ObjectId</a>}
         */
        Public.id = function (raw) {
            if (!Public.exists(raw)) {
                return new ObjectIdClass()
            } else if (raw instanceof ObjectIdClass) {
                return raw
            } else {
                return new ObjectIdClass(raw)
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

        Public.applyTimeOptions = function (target, source, options) {
            for (var o in options) {
                var option = options[o]
                if (Public.exists(source[option])) {
                    target[option](source[option], TimeUnitClass.MILLISECONDS)
                }
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
                var client = new MongoClientClass(uri)
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
                connection.collection = connection.database.getCollection(uri.collection, Bson.documentClass)
                return connection
            } catch (x if !(x instanceof MongoError)) {
                throw new MongoError(x)
            }
        }

        /**
         * @throws {MongoError}
         */
        Public.connectAsyncClient = function (uri, options) {
            if (!MongoUtil.exists(uri)) {
                uri = 'mongodb://localhost/'
            }
            var settingsBuilder = MongoClientSettingsClass.builder();
            var connectionString = uri instanceof ConnectionStringClass ? uri : new ConnectionStringClass(uri);

            var clusterSettingsBuilder = ClusterSettingsClass.builder();
            if (MongoUtil.exists(options) && MongoUtil.exists(options.clusterSettings)) {
                MongoUtil.applyOptions(clusterSettingsBuilder, options.clusterSettings, [
                    'description',
                    'requiredReplicaSetName',
                    'maxWaitQueueSize'
                ]);
                MongoUtil.applyTimeOptions(clusterSettingsBuilder, options.clusterSettings, [
                    'serverSelectionTimeout'
                ]);
                if (MongoUtil.exists(options.clusterSettings.requiredClusterType)) {
                    clusterSettingsBuilder = clusterSettingsBuilder.requiredClusterType(ClusterTypeClass.valueOf(options.clusterSettings.requiredClusterType));
                }
            }
            clusterSettingsBuilder.applyConnectionString(connectionString);
            settingsBuilder = settingsBuilder.clusterSettings(clusterSettingsBuilder.build());

            var connectionPoolSettingsBuilder = ConnectionPoolSettingsClass.builder().applyConnectionString(connectionString);
            if (MongoUtil.exists(options) && MongoUtil.exists(options.connectionPoolSettings)) {
                MongoUtil.applyOptions(connectionPoolSettingsBuilder, options.connectionPoolSettings, [
                    'maxSize',
                    'minSize',
                    'maxWaitQueueSize'
                ]);
                MongoUtil.applyTimeOptions(connectionPoolSettingsBuilder, options.connectionPoolSettings, [
                    'maxWaitTime',
                    'maxConnectionLifeTime',
                    'maxConnectionIdleTime',
                    'maintenanceInitialDelay',
                    'maintenanceFrequency'
                ]);
            }
            settingsBuilder = settingsBuilder.connectionPoolSettings(connectionPoolSettingsBuilder.build());

            var serverSettingsBuilder = ServerSettingsClass.builder();
            if (MongoUtil.exists(options) && MongoUtil.exists(options.serverSettings)) {
                MongoUtil.applyTimeOptions(serverSettingsBuilder, options.serverSettings, [
                    'heartbeatFrequency',
                    'minHeartbeatFrequency'
                ]);
            }
            settingsBuilder = settingsBuilder.serverSettings(serverSettingsBuilder.build());

            settingsBuilder = settingsBuilder.credentialList(connectionString.getCredentialList());

            var sslSettingsBuilder = SslSettingsClass.builder().applyConnectionString(connectionString);
            if (MongoUtil.exists(options) && MongoUtil.exists(options.sslSettings)) {
                MongoUtil.applyOptions(sslSettingsBuilder, options.sslSettings, [
                    'enabled',
                    'invalidHostNameAllowed'
                ]);
            }
            settingsBuilder = settingsBuilder.sslSettings(sslSettingsBuilder.build());

            var socketSettingsBuilder = SocketSettingsClass.builder().applyConnectionString(connectionString);
            if (MongoUtil.exists(options) && MongoUtil.exists(options.socketSettings)) {
                MongoUtil.applyOptions(socketSettingsBuilder, options.socketSettings, [
                    'keepAlive',
                    'receiveBufferSize',
                    'sendBufferSize'
                ]);
                MongoUtil.applyTimeOptions(socketSettingsBuilder, options.socketSettings, [
                    'connectTimeout',
                    'readTimeout'
                ]);
            }
            settingsBuilder = settingsBuilder.socketSettings(socketSettingsBuilder.build());
            try {
                var client = MongoClientsClass.create(settingsBuilder.build());
                return {
                    uri: connectionString,
                    client: client
                };
            } catch (x if !(x instanceof MongoError)) {
                throw new MongoError(x);
            }
        };

        /**
         * @throws {MongoError}
         */
        Public.connectAsyncDatabase = function (uri, options) {
            if (!Public.exists(uri)) {
                uri = 'mongodb://localhost/default'
            }
            var uri = new ConnectionStringClass(uri);
            if (!Public.exists(uri.database)) {
                throw new MongoError('URI does not specify database: ' + uri)
            }
            var connection = Public.connectAsyncClient(uri, options);
            try {
                connection.database = connection.client.getDatabase(uri.database)
                return connection;
            } catch (x if !(x instanceof MongoError)) {
                throw new MongoError(x)
            }
        }

        /**
         * @throws {MongoError}
         */
        Public.connectAsyncCollection = function (uri, options) {
            if (!Public.exists(uri)) {
                uri = 'mongodb://localhost/default.default'
            }
            var uri = new ConnectionStringClass(uri);
            if (!Public.exists(uri.collection)) {
                throw new MongoError('URI does not specify collection:' + uri)
            }
            var connection = Public.connectAsyncDatabase(uri, options)
            try {
                connection.collection = connection.database.getCollection(uri.collection, Bson.documentClass.class)
                return connection;
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
                if (!(uri instanceof MongoClientURIClass)) {
                    if (Public.exists(options)) {
                        options = Public.clientOptions(options)
                        uri = new MongoClientURIClass(uri, options)
                    } else {
                        uri = new MongoClientURIClass(uri)
                    }
                }
                return uri
            } catch (x if !(x instanceof MongoError)) {
                throw new MongoError(x)
            }
        }

        Public.documentList = function (array) {
            // TODO: is this really necessary?
            var list = new ArrayListClass(array.length)
            for (var a in array) {
                list.add(Bson.to(array[a]))
            }
            return list
        }

        Public.indexSpecsList = function (fieldsOrSpecs) {
            var list = new ArrayListClass(fieldsOrSpecs.length)
            for (var f in fieldsOrSpecs) {
                var fieldOrSpec = fieldsOrSpecs[f]
                if (Public.isString(fieldOrSpec)) {
                    var spec = {}
                    spec[fieldOrSpec] = 1
                    fieldOrSpec = spec
                }
                list.add(new IndexModelClass(Bson.to(fieldOrSpec)))
            }
            return list
        }

        Public.writeModelList = function (array) {
            var list = new ArrayListClass(array.length)
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
            if (!(options instanceof MongoClientOptionsBuilderClass)) {
                var clientOptions = MongoClientOptionsClass.builder()
                Public.applyOptions(clientOptions, options, ['alwaysUseMBeans', 'connectionsPerHost', 'connectTimeout', 'cursorFinalizerEnabled', 'description', 'heartbeatConnectTimeout', 'heartbeatFrequency', 'heartbeatSocketTimeout', 'localThreshold', 'maxConnectionIdleTime', 'maxConnectionLifeTime', 'maxWaitTime', 'minConnectionsPerHost', 'minHeartbeatFrequency', 'requiredReplicaSetName', 'serverSelectionTimeout', 'socketKeepAlive', 'socketTimeout', 'sslEnabled', 'sslInvalidHostNameAllowed', 'threadsAllowedToBlockForConnectionMultiplier'])
                if (Public.exists(options.readPreference)) {
                    clientOptions.readPreference(Public.readPreference(options.readPreference))
                }
                if (Public.exists(options.writeConcern)) {
                    clientOptions.writeConcern(Public.writeConcern(options.writeConcern))
                }
                options = clientOptions
            }
            return options
        }

        Public.createCollectionOptions = function (options) {
            if (!(options instanceof CreateCollectionOptionsClass)) {
                var createCollectionOptions = new CreateCollectionOptionsClass()
                Public.applyOptions(createCollectionOptions, options, ['autoIndex', 'capped', 'maxDocuments', 'sizeInBytes', 'usePowerOf2Sizes'])
                if (Public.exists(options.storageEngineOptions)) {
                    createCollectionOptions.storageEngineOptions(Bson.to(options.storageEngineOptions))
                }
                options = createCollectionOptions
            }
            return options
        }

        Public.countOptions = function (options) {
            if (!(options instanceof CountOptionsClass)) {
                var countOptions = new CountOptionsClass()
                Public.applyOptions(countOptions, options, ['hintString', 'limit', 'skip'])
                if (Public.exists(options.hint)) {
                    countOptions.hint(Bson.to(options.hint))
                }
                if (Public.exists(options.maxTime)) {
                    countOptions.maxTime(options.maxTime, TimeUnitClass.MILLISECONDS)
                }
                options = countOptions
            }
            return options
        }

        Public.createIndexOptions = function (options) {
            if (!(options instanceof IndexOptionsClass)) {
                var indexOptions = new IndexOptionsClass()
                Public.applyOptions(indexOptions, options, ['background', 'bits', 'bucketSize', 'defaultLanguage', 'languageOverride', 'max', 'min', 'name', 'sparse', 'sphereVersion', 'textVersion', 'unique', 'version'])
                if (Public.exists(options.expireAfter)) {
                    indexOptions.expireAfter(options.expireAfter, TimeUnitClass.MILLISECONDS)
                }
                if (Public.exists(options.storageEngine)) {
                    indexOptions.storageEngine(Bson.to(options.expireAfter))
                }
                if (Public.exists(options.weights)) {
                    indexOptions.weights(Bson.to(options.weights))
                }
                options = indexOptions
            }
            return options
        }

        Public.findOneAndDeleteOptions = function (options) {
            if (!(options instanceof FindOneAndDeleteOptionsClass)) {
                var findOneAndDeleteOptions = new FindOneAndDeleteOptionsClass()
                if (Public.exists(options.maxTime)) {
                    findOneAndDeleteOptions.maxTime(options.maxTime, TimeUnitClass.MILLISECONDS)
                }
                if (Public.exists(options.projection)) {
                    findOneAndDeleteOptions.projection(Bson.to(options.projection))
                }
                if (Public.exists(options.sort)) {
                    findOneAndDeleteOptions.sort(Bson.to(options.sort))
                }
                options = findOneAndDeleteOptions
            }
            return options
        }

        Public.findOneAndReplaceOptions = function (options) {
            if (!(options instanceof FindOneAndReplaceOptionsClass)) {
                var findOneAndReplaceOptions = new FindOneAndReplaceOptionsClass()
                Public.applyOptions(findOneAndReplaceOptions, options, ['upsert'])
                if (Public.exists(options.maxTime)) {
                    findOneAndReplaceOptions.maxTime(options.maxTime, TimeUnitClass.MILLISECONDS)
                }
                if (Public.exists(options.projection)) {
                    findOneAndReplaceOptions.projection(Bson.to(options.projection))
                }
                if (Public.exists(options.returnDocument)) {
                    if (options.returnDocument instanceof ReturnDocumentClass) {
                        findOneAndReplaceOptions.returnDocument(options.returnDocument)
                    } else {
                        switch (options.returnDocument) {
                            case 'after':
                                findOneAndReplaceOptions.returnDocument(ReturnDocumentClass.AFTER)
                                break
                            case 'before':
                                findOneAndReplaceOptions.returnDocument(ReturnDocumentClass.BEFORE)
                                break
                            default:
                                throw new MongoError('Unsupported return document: ' + options.returnDocument)
                        }
                    }
                }
                if (Public.exists(options.sort)) {
                    findOneAndReplaceOptions.sort(Bson.to(options.sort))
                }
                options = findOneAndReplaceOptions
            }
            return options
        }

        Public.findOneAndUpdateOptions = function (options) {
            if (!(options instanceof FindOneAndUpdateOptionsClass)) {
                var findOneAndUpdateOptions = new FindOneAndUpdateOptionsClass()
                Public.applyOptions(findOneAndUpdateOptions, options, ['upsert'])
                if (Public.exists(options.maxTime)) {
                    findOneAndUpdateOptions.maxTime(options.maxTime, TimeUnitClass.MILLISECONDS)
                }
                if (Public.exists(options.projection)) {
                    findOneAndUpdateOptions.projection(Bson.to(options.projection))
                }
                if (Public.exists(options.returnDocument)) {
                    if (options.returnDocument instanceof ReturnDocumentClass) {
                        findOneAndUpdateOptions.returnDocument(options.returnDocument)
                    } else {
                        switch (options.returnDocument) {
                            case 'after':
                                findOneAndUpdateOptions.returnDocument(ReturnDocumentClass.AFTER)
                                break
                            case 'before':
                                findOneAndUpdateOptions.returnDocument(ReturnDocumentClass.BEFORE)
                                break
                            default:
                                throw new MongoError('Unsupported return document: ' + options.returnDocument)
                        }
                    }
                }
                if (Public.exists(options.sort)) {
                    findOneAndUpdateOptions.sort(Bson.to(options.sort))
                }
                options = findOneAndUpdateOptions
            }
            return options
        }

        Public.updateOptions = function (options) {
            if (!(options instanceof UpdateOptionsClass)) {
                var updateOptions = new UpdateOptionsClass()
                Public.applyOptions(updateOptions, options, ['upsert'])
                options = updateOptions
            }
            return options
        }

        Public.insertManyOptions = function (options) {
            if (!(options instanceof InsertManyOptionsClass)) {
                var insertManyOptions = new InsertManyOptionsClass()
                Public.applyOptions(insertManyOptions, options, ['ordered'])
                options = insertManyOptions
            }
            return options
        }

        Public.renameCollectionOptions = function (options) {
            if (!(options instanceof RenameCollectionOptionsClass)) {
                var renameCollectionOptions = new RenameCollectionOptionsClass()
                Public.applyOptions(renameCollectionOptions, options, ['dropTarget'])
                options = renameCollectionOptions
            }
            return options
        }

        Public.bulkWriteOptions = function (options) {
            if (!(options instanceof BulkWriteOptionsClass)) {
                var bulkWriteOptions = new BulkWriteOptionsClass()
                Public.applyOptions(bulkWriteOptions, options, ['ordered'])
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
                var tagList = new ArrayListClass()
                for (var name in options.tags) {
                    var value = options.tags[value]
                    tagList.add(new TagClass(name, value))
                }
                var tagSet = new TagSetClass(tagList)
                readPreference = ReadPreferenceClass[options.mode](tagSet)
            } else {
                readPreference = ReadPreferenceClass[options.mode]()
            }

            return readPreference
        }

        Public.writeConcern = function (options) {
            var w = Public.exists(options.w) ? options.w : 0
            var wtimeout = Public.exists(options.wtimeout) ? options.wtimeout : 0
            var fsync = Public.exists(options.fsync) ? options.fsync : false
            var j = Public.exists(options.j) ? options.j : false
            return new WriteConcernClass(w, wtimeout, fsync, j)
        }

        // Models

        /**
         * @throws {MongoError}
         */
        Public.writeModel = function (model) {
            if (!(model instanceof WriteModelClass)) {
                switch (model.type) {
                    case 'deleteMany':
                        model = new DeleteManyModelClass(Bson.to(model.filter))
                        break
                    case 'deleteOne':
                        model = new DeleteOneModelClass(Bson.to(model.filter))
                        break
                    case 'insertOne':
                        model = new InsertOneModelClass(Bson.to(model.document))
                        break
                    case 'replaceOne':
                        var filter = Bson.to(model.filter)
                        var replacement = Bson.to(model.replacement)
                        if (!Public.exists(model.options)) {
                            model = new ReplaceOneModelClass(filter, replacement)
                        } else {
                            var options = Public.updateOptions(model.options)
                            model = new ReplaceOneModelClass(filter, replacement, options)
                        }
                        break
                    case 'updateMany':
                        var filter = Bson.to(model.filter)
                        var update = Bson.to(model.update)
                        if (!Public.exists(model.options)) {
                            model = new UpdateManyModelClass(filter, update)
                        } else {
                            var options = Public.updateOptions(model.options)
                            model = new UpdateManyModelClass(filter, update, options)
                        }
                        break
                    case 'updateOne':
                        var filter = Bson.to(model.filter)
                        var update = Bson.to(model.update)
                        if (!Public.exists(model.options)) {
                            model = new UpdateOneModelClass(filter, update)
                        } else {
                            var options = Public.updateOptions(model.options)
                            model = new UpdateOneModelClass(filter, update, options)
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
                deleteResult.deletedCount = +result.deletedCount
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
                i.filter(Bson.to(options.filter))
            }
            if (Public.exists(options.maxTime)) {
                i.maxTime(options.maxTime, TimeUnitClass.MILLISECONDS)
            }
        }

        /**
         * @throws {MongoError}
         */
        Public.findIterable = function (i, options) {
            Public.applyOptions(i, options, ['batchSize', 'limit', 'noCursorTimeout', 'oplogReplay', 'partial', 'skip'])
            if (Public.exists(options.cursorType)) {
                if (options.cursorType instanceof CursorTypeClass) {
                    i.cursorType(options.cursorType)
                } else {
                    switch (options.cursorType) {
                        case 'nonTailable':
                            i.cursorType(CursorTypeClass.NonTailable)
                            break
                        case 'tailable':
                            i.cursorType(CursorTypeClass.Tailable)
                            break
                        case 'tailableAwait':
                            i.cursorType(CursorTypeClass.TailableAwait)
                            break
                        default:
                            throw new MongoError('Unsupported cursor type: ' + options.cursorType)
                    }
                }
            }
            if (Public.exists(options.filter)) {
                i.filter(Bson.to(options.filter))
            }
            if (Public.exists(options.maxTime)) {
                i.maxTime(options.maxTime, TimeUnitClass.MILLISECONDS)
            }
            if (Public.exists(options.modifiers)) {
                i.modifiers(Bson.to(options.modifiers))
            }
            if (Public.exists(options.projection)) {
                i.projection(Bson.to(options.projection))
            }
            if (Public.exists(options.sort)) {
                i.sort(Bson.to(options.sort))
            }
        }

        Public.mongoIterable = function (i, options) {
            Public.applyOptions(i, options, ['batchSize'])
        }

        Public.listCollectionsIterable = function (i, options) {
            Public.applyOptions(i, options, ['batchSize'])
            if (Public.exists(options.maxTime)) {
                i.maxTime(options.maxTime, TimeUnitClass.MILLISECONDS)
            }
        }
        Public.listIndexesIterable = Public.listCollectionsIterable;
        Public.listDatabasesIterable = Public.listCollectionsIterable;

        Public.aggregateIterable = function (i, options) {
            Public.applyOptions(i, options, ['allowDiskUse', 'batchSize', 'useCursor'])
            if (Public.exists(options.maxTime)) {
                i.maxTime(options.maxTime, TimeUnitClass.MILLISECONDS)
            }
        }

        return Public
    }();
    return MongoUtil;
});
