define(['./mongo-util', './mongo-error'], function (MongoUtil, MongoError) {
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
     * @see See the <a href="http://api.mongodb.org/java/current/index.html?com/mongodb/MongoClient.html">Java API</a>
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
                return this.client.settings
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
                return this.client.mongoClientOptions.readPreference
            } catch (x if !(x instanceof MongoError)) {
                throw new MongoError(x)
            }
        }

        /**
         * @throws {MongoError}
         */
        this.writeConcern = function () {
            try {
                return this.client.mongoClientOptions.writeConcern
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
         * @returns {MongoDatabase[]}
         * @throws {MongoError}
         */
        this.databases = function (options) {
            try {
                var databases = []
                var i = this.client.listDatabaseNames().iterator()
                try {
                    if (MongoUtil.exists(options)) {
                        MongoUtil.mongoIterable(i, options)
                    }
                    while (i.hasNext()) {
                        databases.push(this.database(i.next()))
                    }
                } finally {
                    i.close()
                }
                return databases
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
                var databaseNames = []
                var i = this.client.listDatabaseNames().iterator()
                try {
                    if (MongoUtil.exists(options)) {
                        MongoUtil.mongoIterable(i, options)
                    }
                    while (i.hasNext()) {
                        databaseNames.push(i.next())
                    }
                } finally {
                    i.close()
                }
                return databaseNames
            } catch (x if !(x instanceof MongoError)) {
                throw new MongoError(x)
            }
        }
    }

    /**
     * Creates a {@link MongoClient} instance.
     * 
     * @param {String|com.mongodb.MongoClientURI} [uri='mongodb://localhost/']
     * @param {Object|com.mongodb.MongoClientOptions.Builder} [options]
     * @param {String} [options.description]
     *  A description of this connection (useful for debugging)
     * @param {Object} [options.readPreference]
     * @param {String} [options.readPreference.mode='primary'] 
     *  <ul>
     *   <li>'primary': read only from the primary</li>
     *   <li>'primaryPreferred': read from the primary if available, otherwise from a secondary</li>
     *   <li>'secondary': read only from a secondary</li>
     *   <li>'secondaryPreferred': read from a secondary if available, otherwise from the primary</li>
     *   <li>'nearest'</li>: allow reads from either the primary the secondaries
     *  </ul>
     * @param {Object} [options.readPreference.tags]
     *  The set of tags allowed for selection of secondaries. Not usable for 'primary' mode.
     * @param {Object} [options.writeConcern]
     * @param {Number} [options.writeConcern.w=1]
     *  The write strategy.
     *  <ul>
     *   <li>0: Don't wait for acknowledgement from the server</li>
     *   <li>1: Wait for acknowledgement, but don't wait for secondaries to replicate</li>
     *   <li>&gt;=2: Wait for one or more secondaries to also acknowledge</li>
     *  </ul>
     * @param {Number} [options.writeConcern.wtimeout=0]
     *  How long to wait for slaves before failing.
     *  <ul>
     *   <li>0: indefinite</li>
     *   <li>&gt;0: time to wait in milliseconds</li>
     *  </ul>
     * @param {Boolean} [options.writeConcern.j=false]
     *  If true block until write operations have been committed to the journal. Cannot be used in combination with fsync. Prior to MongoDB 2.6 this option was ignored if
     *  the server was running without journaling. Starting with MongoDB 2.6 write operations will fail with an exception if this option is used when the server is running
     *  without journaling.
     * @param {Boolean} [options.writeConcern.fsync=false]
     *  If true and the server is running without journaling, blocks until the server has synced all data files to disk. If the server is running with journaling, this acts
     *  the same as the j option, blocking until write operations have been committed to the journal. Cannot be used in combination with j. In almost all cases the j flag
     *  should be used in preference to this one.
     * @param {Boolean} [options.cursorFinalizerEnabled=true]
     *  Whether there is a a finalize method created that cleans up instances of MongoCursor that the client does not close. If you are careful to always call the close
     *  method of MongoCursor, then this can safely be set to false.
     * @param {Boolean} [options.alwaysUseMBeans=false]
     *  Whether JMX beans registered by the driver should always be MBeans.
     * @param {Boolean} [options.sslEnabled=false]
     *  Whether to use SSL.
     * @param {Boolean} [options.sslInvalidHostNameAllowed=false]
     *  Whether invalid host names should be allowed if SSL is enabled. Take care before setting this to true, as it makes the application susceptible to man-in-the-middle
     *  attacks.
     * @param {String} [options.requiredReplicaSetName]
     *  The required replica set name. With this option set, the MongoClient instance will
     *  <ol>
     *   <li>Connect in replica set mode, and discover all members of the set based on the given servers</li>
     *   <li>Make sure that the set name reported by all members matches the required set name.</li>
     *   <li>Refuse to service any requests if any member of the seed list is not part of a replica set with the required name.</li>
     *  </ol>
     * @param {Number} [options.localThreshold=15]
     *  The local threshold. When choosing among multiple MongoDB servers to send a request, the MongoClient will only send that request to a server whose ping time is
     *  less than or equal to the server with the fastest ping time plus the local threshold. For example, let's say that the client is choosing a server to send a query
     *  when the read preference is 'secondary', and that there are three secondaries, server1, server2, and server3, whose ping times are 10, 15, and 16 milliseconds,
     *  respectively. With a local threshold of 5 milliseconds, the client will send the query to either server1 or server2 (randomly selecting between the two).
     * @param {Number} [options.serverSelectionTimeout=30000]
     *  The server selection timeout in milliseconds, which defines how long the driver will wait for server selection to succeed before throwing an exception. A value of
     *  0 means that it will timeout immediately if no server is available. A negative value means to wait indefinitely.
     * @param {Number} [options.minConnectionsPerHost=0]
     *  The minimum number of connections per host for this MongoClient instance. Those connections will be kept in a pool when idle, and the pool will ensure over time
     *  that it contains at least this minimum number.
     * @param {Number} [options.connectionsPerHost=100]
     *  The maximum number of connections allowed per host for this MongoClient instance. Those connections will be kept in a pool when idle. Once the pool is exhausted,
     *  any operation requiring a connection will block waiting for an available connection.
     * @param {Number} [options.threadsAllowedToBlockForConnectionMultiplier=5]
     *  This multiplier, multiplied with the connectionsPerHost setting, gives the maximum number of threads that may be waiting for a connection to become available from
     *  the pool. All further threads will get an exception right away. For example if connectionsPerHost is 10 and threadsAllowedToBlockForConnectionMultiplier is 5, then
     *  up to 50 threads can wait for a connection.
     * @param {Number} [options.connectTimeout=10000]
     *  The connection timeout in milliseconds. A value of 0 means no timeout. It is used solely when establishing a new connection.
     * @param {Number} [options.maxWaitTime=120000]
     *  The maximum wait time in milliseconds that a thread may wait for a connection to become available. A value of 0 means that it will not wait. A negative value means
     *  to wait indefinitely.
     * @param {Number} [options.maxConnectionIdleTime=0]
     *  The maximum idle time of a pooled connection. A zero value indicates no limit to the idle time. A pooled connection that has exceeded its idle time will be closed
     *  and replaced when necessary by a new connection.
     * @param {Number} [options.maxConnectionLifeTime=0]
     *  The maximum life time of a pooled connection. A zero value indicates no limit to the life time. A pooled connection that has exceeded its life time will be closed
     *  and replaced when necessary by a new connection.
     * @param {Boolean} [options.socketKeepAlive=false]
     *  This flag controls the socket keep alive feature that keeps a connection alive through firewalls.
     * @param {Number} [options.minHeartbeatFrequency=500]
     *  Gets the minimum heartbeat frequency. In the event that the driver has to frequently re-check a server's availability, it will wait at least this long since the
     *  previous check to avoid wasted effort.
     * @param {Number} [options.heartbeatFrequency=10000]
     *  The heartbeat frequency. This is the frequency that the driver will attempt to determine the current state of each server in the cluster.
     * @param {Number} [options.heartbeatConnectTimeout=20000]
     *  The connect timeout for connections used for the cluster heartbeat.
     * @param {Number} [options.heartbeatSocketTimeout=20000]
     *  The socket timeout for connections used for the cluster heartbeat.
     * @param {Number} [options.socketTimeout=0]
     *  The socket timeout in milliseconds. It is used for I/O socket read and write operations. 0 means no timeout.
     * @returns {MongoClient}
     * @throws {MongoError}
     */
    MongoClient.connect = function (uri, options) {
        return new MongoClient(uri, options)
    }
    
    return MongoClient;
});