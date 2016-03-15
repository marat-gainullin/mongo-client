//
// MongoDB API for Nashorn in AMD environment, supporting Java's Services API
// especially for callbacks in async mode calls.
//
// Based on Three Crickets LLC code and is subject of
// The Apache License version 2.0:
// http://www.opensource.org/licenses/apache2.0.php

define(function () {
    var Public = {};
    //
    // General-purpose JavaScript utilities
    //
    Public.exists = function (value) {
        // Note the order: we need the value on the right side for Rhino not to
        // complain about non-JS objects
        return (undefined !== value) && (null !== value)
    }

    Public.prune = function (o, keys) {
        var r = {}
        for (var k in keys) {
            var key = keys[k]
            var value = o[key]
            if (Public.exists(value)) {
                r[key] = value
            }
        }
        return r
    }

    Public.bulkWriteResult = function (result) {
        var bulkWriteResult = {
            wasAcknowledged: result.wasAcknowledged()
        }
        if (bulkWriteResult.wasAcknowledged) {
            bulkWriteResult.modifiedCountAvailable = result.modifiedCountAvailable
            if (bulkWriteResult.modifiedCountAvailable) {
                bulkWriteResult.modifiedCount = result.modifiedCount
            }
            bulkWriteResult.deletedCount = result.deletedCount
            bulkWriteResult.insertedCount = result.insertedCount
            var upserts = result.upserts
            if (Public.exists(upserts)) {
                bulkWriteResult.upserts = []
                var i = upserts.iterator()
                while (i.hasNext()) {
                    var upsert = i.next()
                    bulkWriteResult.upserts.push({
                        id: upsert.id,
                        index: upsert.index
                    })
                }
            }
        }
        return bulkWriteResult
    }

    return Public;
});