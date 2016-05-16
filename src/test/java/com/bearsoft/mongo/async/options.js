define(['../../../../../../main/java/com/bearsoft/mongo/client/mongo-async-client'], function (MongoClient) {
    var options = {
        clusterSettings: {
            description: 'test-desc'
            , requiredReplicaSetName: 'test-replica-set'
            , serverSelectionTimeout: 5000
            , maxWaitQueueSize: 500
            , requiredClusterType: 'UNKNOWN'
        }
        , connectionPoolSettings: {
            maxSize: 100
            , minSize: 0
            , maxWaitQueueSize: 500
            , maxWaitTime: 120000
            , maxConnectionLifeTime: 0
            , maxConnectionIdleTime: 0
            , maintenanceInitialDelay: 1000000
            , maintenanceFrequency: 3600000
        }
        , serverSettings: {
            heartbeatFrequency: 10
            , minHeartbeatFrequency: 500
        }
        , sslSettings: {
            enabled: false
            , invalidHostNameAllowed: false
        }
        , socketSettings: {
            connectTimeout: 10000
            , readTimeout: 10000
            , keepAlive: false
            , receiveBufferSize: 16 * 1024
            , sendBufferSize: 16 * 1024
        }
    };
    return {data: options, with : function (aHandler) {
            var client = MongoClient.connect('mongodb://localhost/test');//, options);
            aHandler(client, function () {
                client.close();
            });
        }};
});