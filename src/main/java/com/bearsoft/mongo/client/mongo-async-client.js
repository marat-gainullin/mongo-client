define(['./mongo-util', './mongo-error', './mongo-async', './mongo-bson'], function (MongoUtil, MongoError, MongoAsync, Bson) {
    var MongoClientClass = Java.type('com.mongodb.async.client.MongoClient');
    var MongoNamespaceClass = Java.type('com.mongodb.MongoNamespace');
    /**
     * A single client instance manages a pool of connections to a MongoDB sever or cluster.
     * All {@link MongoDatabase}, {@link MongoConnection}, and {@link MongoCursor} instances
     * derived from the client will use its shared pool of connections.
     * <p>
     * The connection pool is created when the instance is constructed, and exists until
     * {@link MongoClient#close} is called.
     * <p>
     * See the {@link MongoClient#connect} static method for an explanation of constructor
     * arguments. Note that there is no difference between constructing instances directly
     * using the 'new' keyword or calling {@link MongoClient#connect}. Both options are
     * supported.
     * <p>
     * The client's readPreference and writeConcern are used as default values for
     * operations in {@link MongoDatabase} and {@link MongoCollection}. As with other
     * options, you cannot change these defaults after the client has been created, but
     * you can use the withReadPreference and withWriteConcern methods in
     * {@link MongoDatabase} and {@link MongoCollection} to change their default values.
     *
     * @class
     * @param [uri]
     * @param [options]
     * @see See the <a href="http://api.mongodb.org/java/current/index.html?com/mongodb/async/client/MongoClient.html">Java API</a>
     * @throws {MongoError}
     */
    function MongoClient(uri, options) {

        var connection
        if (uri instanceof MongoClientClass) {
            // Just wrap
            connection = {
                client: uri
            }
        } else {
            // Connect
            connection = MongoUtil.connectAsyncClient(uri, options)
        }

        /** @field */
        this.client = connection.client

        /** @field */
        this.uri = connection.uri

        /** @field */
        this.collectionsToProperties = false

        /**
         * @returns {<a href="http://api.mongodb.org/java/current/index.html?com/mongodb/MongoClientOptions.html">com.mongodb.MongoClientOptions</a>}
         * @throws {MongoError}
         */
        this.options = function () {
            try {
                return this.client.getSettings()
            } catch (x if !(x instanceof MongoError)) {
                throw new MongoError(x)
            }
        }

        //
        // Behavior
        //

        /**
         * @throws {MongoError}
         */
        this.readPreference = function () {
            try {
                return this.client.getSettings().getReadPreference()
            } catch (x if !(x instanceof MongoError)) {
                throw new MongoError(x)
            }
        }

        /**
         * @throws {MongoError}
         */
        this.writeConcern = function () {
            try {
                return this.client.getSettings().getWriteConcern()
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
        this.close = function () {
            try {
                this.client.close()
            } catch (x if !(x instanceof MongoError)) {
                throw new MongoError(x)
            }
        }

        //
        // Databases and collections
        //

        /**
         * Direct access to a database.
         * <p>
         * The database will inherit the readPreference and writeConcern for its operations
         * from this client, but these defaults can be changed by calling
         * {@link MongoDatabase#withReadPreference} and {@link MongoDatabase#withWriteConcern}.
         * 
         * @returns {MongoDatabase}
         * @throws {MongoError}
         */
        this.database = this.db = function (name) {
            try {
                var MongoDatabase = require('./mongo-async-database');
                return new MongoDatabase(this.client.getDatabase(name), this)
            } catch (x if !(x instanceof MongoError)) {
                throw new MongoError(x)
            }
        }

        /**
         * Direct access to a collection.
         * <p>
         * The collection will inherit the readPreference and writeConcern for its operations
         * from this client, but these defaults can be changed by calling
         * {@link MongoCollection#withReadPreference} and {@link MongoCollection#withWriteConcern}.
         * 
         * @param {String|com.mongodb.MongoNamespace} fullName
         *  The full name of the collection. For example, the collection 'mycollection'
         *  in database 'mydatabase' would be 'mydatabase.mycollection' 
         * @returns {MongoCollection}
         * @throws {MongoError}
         */
        this.collection = function (fullName) {
            try {
                if (!(fullName instanceof MongoNamespaceClass)) {
                    fullName = new MongoNamespaceClass(fullName)
                }
                var database = this.database(fullName.databaseName)
                return database.collection(fullName.collectionName)
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
        this.databaseNames = function (options) {
            try {
                var i = this.client.listDatabaseNames();
                if (MongoUtil.exists(options))
                    MongoUtil.mongoIterable(i, options);
                return new MongoAsync.AsyncIterable(i);
            } catch (x if !(x instanceof MongoError)) {
                throw new MongoError(x);
            }
        };

        /**
         * @returns {MongoAsync.AsyncIterable}
         * @throws {MongoError}
         */
        this.databases = function (options) {
            try {
                var i = this.client.listDatabases(Bson.documentClass.class);
                if (MongoUtil.exists(options))
                    MongoUtil.listDatabasesIterable(i, options);
                return new MongoAsync.AsyncIterable(i);
            } catch (x if !(x instanceof MongoError)) {
                throw new MongoError(x);
            }
        };

    }

    /**
     * Create a new client with the given connection string and optional settings.
     *
     * @param {String} connectionString The connection string of the created client.
     * @param {Object} options The settings to be applied to the creted client.
     * 
     * @return the client
     * 
     * @param {String} [options.clusterSettings.description]
     *  A description of this connection (useful for debugging)
     * @param {String} [options.clusterSettings.requiredReplicaSetName]
     *  A required replica set name for the cluster.
     * @param {Number} [options.clusterSettings.serverSelectionTimeout]
     * The timeout to apply when selecting a server.  If the timeout expires before a server is found to handle a request, a
     * {@link com.mongodb.MongoTimeoutException} will be thrown.  The default value is 30 seconds.
     *
     * <p> A value of 0 means that it will timeout immediately if no server is available.  A negative value means to wait
     * indefinitely.</p>
     * @param {Number} [options.clusterSettings.maxWaitQueueSize=500]
     * The number of threads that are allowed to be waiting for a connection.
     * @param {String} [options.clusterSettings.requiredClusterType] 
     * The required cluster type for the cluster.
     * @param {Number} [options.connectionPoolSettings.maxSize=100] 
     * <p>The maximum number of connections allowed. Those connections will be kept in the pool when idle. Once the pool is exhausted, any
     * operation requiring a connection will block waiting for an available connection.</p>
     * @param {Number} [options.connectionPoolSettings.minSize=0] 
     * <p>The minimum number of connections. Those connections will be kept in the pool when idle, and the pool will ensure that it contains
     * at least this minimum number.</p>
     * @param {Number} [options.connectionPoolSettings.maxWaitQueueSize=500] 
     * <p>This is the maximum number of operations that may be waiting for a connection to become available from the pool. All further
     * operations will get an exception immediately.</p>
     * @param {Number} [options.connectionPoolSettings.maxWaitTime] 
     * <p>Maximum time that a thread may wait for a connection to become available.</p>
     * <p>Default is 2 minutes. A value of 0 means that it will not wait.  A negative value means it will wait indefinitely.</p>
     * @param {Number} [options.connectionPoolSettings.maxConnectionLifeTime] 
     * Mmaximum time a pooled connection can live for.  A zero value indicates no limit to the life time.  A pooled connection that has
     * exceeded its life time will be closed and replaced when necessary by a new connection.
     * @param {Number} [options.connectionPoolSettings.maxConnectionIdleTime]
     * Maximum idle time of a pooled connection.  A zero value indicates no limit to the idle time.  A pooled connection that
     * has exceeded its idle time will be closed and replaced when necessary by a new connection.
     * @param {Number} [options.connectionPoolSettings.maintenanceInitialDelay]
     * Period of time to wait before running the first maintenance job on the connection pool.
     * @param {Number} [options.connectionPoolSettings.maintenanceFrequency]
     * Time period between runs of the maintenance job.
     * @param {Number} [options.serverSettings.heartbeatFrequency=10]
     * The frequency that the cluster monitor attempts to reach each server.  The default value is 10 seconds.
     * @param {Number} [options.serverSettings.minHeartbeatFrequency=500]
     * The minimum heartbeat frequency.  In the event that the driver has to frequently re-check a server's availability, it will wait
     * at least this long since the previous check to avoid wasted effort.  The default value is 500 milliseconds.
     * @param {Boolean} [options.sslSettings.enabled]
     * Whether SSL is enabled.
     * @param {Boolean} [options.sslSettings.invalidHostNameAllowed=false]
     * True if invalid host names should be allowed.  Defaults to false.  Take care before setting this to true, as it makes
     * the application susceptible to man-in-the-middle attacks.
     * @param {Number} [options.socketSettings.connectTimeout=10000]
     * Gets the timeout for socket connect.  Defaults to 10 seconds.
     * @param {Number} [options.socketSettings.readTimeout=0]
     * The timeout for socket reads.  Defaults to 0, which indicates no timeout
     * @param {Boolean} [options.socketSettings.keepAlive=false]
     * True if keep-alive is enabled. Defaults to false.
     * @param {Boolean} [options.socketSettings.receiveBufferSize]
     * The receive buffer size. Defaults to the operating system default.
     * @param {Boolean} [options.socketSettings.sendBufferSize]
     * The send buffer size.  Defaults to the operating system default.
     * @returns {MongoClient}
     * @throws {MongoError}
     */
    MongoClient.connect = function (uri, options) {
        return new MongoClient(uri, options)
    }

    return MongoClient;
});