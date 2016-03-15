//
// MongoDB API for Nashorn in AMD environment, supporting Java's Services API
// especially for callbacks in async mode calls.
//
// Based on Three Crickets LLC code and is subject of
// The Apache License version 2.0:
// http://www.opensource.org/licenses/apache2.0.php

define(['./mongo-script-util'], function (MongoInternals) {
    /**
     *
     * @class
     * @see See the <a href="http://api.mongodb.org/java/current/index.html?com/mongodb/MongoException.html">Java API</a>
     */
    function MongoError(x) {

        this.exception = x

        if (x instanceof com.mongodb.MongoCommandException) {
            this.code = x.code
            this.message = x.message
            this.serverAddress = String(x.serverAddress)
            this.response = x.response
        } else if (x instanceof com.mongodb.MongoBulkWriteException) {
            this.code = x.code
            this.message = x.message
            this.serverAddress = String(x.serverAddress)
            var writeConcern = x.writeConcernError
            if (MongoInternals.exists(writeConcern)) {
                this.writeConcern = {
                    code: writeConcern.code,
                    message: writeConcern.message,
                    details: writeConcern.details
                }
            }
            var writeErrors = x.writeErrors
            if (MongoInternals.exists(writeErrors)) {
                this.writeErrors = []
                var i = writeErrors.iterator()
                while (i.hasNext()) {
                    var writeError = i.next()
                    this.writeErrors.push({
                        index: writeError.index,
                        code: writeError.code,
                        message: writeError.message,
                        category: String(writeError.category),
                        details: writeError.details
                    })
                }
            }
            var writeResult = x.writeResult
            if (MongoInternals.exists(writeResult)) {
                this.writeResult = MongoInternals.bulkWriteResult(writeResult)
            }
        } else if (x instanceof com.mongodb.MongoServerException) {
            this.code = x.code
            this.message = x.message
            this.serverAddress = String(x.serverAddress)
        } else if (x instanceof com.mongodb.MongoException) {
            this.code = x.code
            this.message = x.message
        } else if (x instanceof java.lang.Throwable) {
            this.message = x.message
        } else if (x instanceof MongoError) {
            this.code = x.code
            this.message = x.message
            this.serverAddress = x.serverAddress
            this.response = x.response
            this.writeConcern = x.writeConcern
            this.writeErrors = x.writeErrors
            this.writeResult = x.writeResult
        } else {
            this.message = x
        }

        this.hasCode = function (code) {
            if (code == this.code) {
                return true
            }
            if (MongoInternals.exists(this.writeConcern)) {
                if (code == this.writeConcern.code) {
                    return true
                }
            }
            if (MongoInternals.exists(this.writeErrors)) {
                for (var e in this.writeErrors) {
                    if (code == this.writeErrors[e].code) {
                        return true
                    }
                }
            }
            return false
        }

        this.clean = function () {
            return MongoInternals.prune(this, ['code', 'message', 'serverAddress', 'response', 'writeConcern', 'writeErrors', 'writeResult'])
        }
    }

    MongoError.represent = function (x, full) {
        var s = new java.io.StringWriter()
        var out = new java.io.PrintWriter(s)
        if (x instanceof MongoError) {
            out.println('MongoDB error:')
            out.println(String(Sincerity.JSON.to(x.clean(), true)))
            if (full) {
                x.exception.printStackTrace(out)
            }
        } else if (x instanceof java.lang.Throwable) {
            out.println('JVM error:')
            if (!full) {
                out.println(String(x))
            } else {
                x.printStackTrace(out)
            }
        } else if (x.nashornException) {
            out.println('JavaScript error:')
            if (!full) {
                out.println(String(x.nashornException))
            } else {
                x.nashornException.printStackTrace(out)
            }
        } else if (x.javaException) {
            out.println('JavaScript error:')
            if (!full) {
                out.println(String(x.javaException))
            } else {
                x.javaException.printStackTrace(out)
            }
        } else {
            out.println('Error:')
            out.println(String(Sincerity.JSON.to(x, true)))
        }
        return String(s)
    }

    /** @constant */
    MongoError.GONE = -2
    /** @constant */
    MongoError.NOT_FOUND = -5
    /** @constant */
    MongoError.COLLECTION_ALREADY_EXISTS = 48
    /** @constant */
    MongoError.CAPPED = 10003
    /** @constant */
    MongoError.DUPLICATE_KEY = 11000
    /** @constant */
    MongoError.DUPLICATE_KEY_ON_UPDATE = 11001
    return MongoError;
});