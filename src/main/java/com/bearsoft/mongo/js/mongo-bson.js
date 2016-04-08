/* global Java */

define(function () {
    var EngineUtilsClass = Java.type('jdk.nashorn.api.scripting.ScriptUtils');
    var HashMapClass = Java.type('java.util.HashMap');
    var BsonUndefinedClass = Java.type('org.bson.BsonUndefined');
    var BsonNullClass = Java.type('org.bson.BsonNull');
    var BsonValueClass = Java.type('org.bson.BsonValue');
    var BsonObjectIdClass = Java.type('org.bson.BsonObjectId');
    var ObjectIdClass = Java.type('org.bson.types.ObjectId');
    var BsonObjectMinKeyClass = Java.type('org.bson.BsonMinKey');
    var BsonObjectMaxKeyClass = Java.type('org.bson.BsonMaxKey');
//    var BsonJavaScriptClass = Java.type('org.bson.BsonJavaScript');
//    var BsonDbPointerClass = Java.type('org.bson.BsonDbPointer');
    var BsonBooleanClass = Java.type('org.bson.BsonBoolean');
    var BsonDateTimeClass = Java.type('org.bson.BsonDateTime');
    var BsonTimestampClass = Java.type('org.bson.BsonTimestamp');
    var BsonDoubleClass = Java.type('org.bson.BsonDouble');
    var BsonStringClass = Java.type('org.bson.BsonString');
    var BsonArrayClass = Java.type('org.bson.BsonArray');
    var BsonDocumentClass = Java.type('org.bson.BsonDocument');
    var BsonRegularExpressionClass = Java.type('org.bson.BsonRegularExpression');
    var BsonBinaryClass = Java.type('org.bson.BsonBinary');
    var Base64Class = Java.type('java.util.Base64');
    function toBson(aValue, aMapping) {
        aValue = EngineUtilsClass.unwrap(aValue);
        if (!aMapping)
            aMapping = new HashMapClass();
        var type = typeof aValue;
        if (type === 'undefined')
            return new BsonUndefinedClass();
        else if (aValue === null)
            return new BsonNullClass();
        else {
            if (type === 'number')
                return new BsonDoubleClass(+aValue);
            else if (type === 'string')
                return new BsonStringClass(aValue + '');
            else if (type === 'boolean')
                return new BsonBooleanClass(!!aValue);
            else if (type === 'object') {
                if (aValue instanceof BsonValueClass) {// BsonObjectId, etc.
                    return aValue;
                } else if (aValue.$undefined) {
                    return new BsonUndefinedClass();
                } else if (aValue instanceof Date) {
                    return new BsonDateTimeClass(aValue.getTime());
                } else if (undefined !== aValue.$date) {
                    return new BsonDateTimeClass(aValue.$date);
                } else if (undefined !== aValue.$timestamp) {
                    return new BsonTimestampClass(aValue.$timestamp.t, aValue.$timestamp.i);
                } else if (aValue instanceof RegExp) {
                    var flags = '';
                    if (aValue.global)
                        flags += 'g';
                    if (aValue.ignoreCase)
                        flags += 'i';
                    if (aValue.multiline)
                        flags += 'm';
                    return new BsonRegularExpressionClass(aValue.source, flags);
                } else if (undefined !== aValue.$regex && undefined !== aValue.$options) {
                    return new BsonRegularExpressionClass(aValue.$regex, aValue.$options);
                } else if (undefined !== aValue.$binary && undefined !== aValue.$type) {
                    return new BsonBinaryClass(aValue.$type, Base64Class.getDecoder().decode(aValue.$binary));
                } else if (aValue instanceof Number) {
                    return new BsonDoubleClass(+aValue);
                } else if (aValue.$minKey) {
                    return new BsonObjectMinKeyClass(+aValue);
                } else if (aValue.$maxKey) {
                    return new BsonObjectMaxKeyClass(+aValue);
                } else if (aValue instanceof String) {
                    return new BsonStringClass(aValue + '');
                } else if (aValue instanceof Boolean) {
                    return new BsonBooleanClass(!!aValue);
                } else if(aValue instanceof ObjectIdClass){
                    return new BsonObjectIdClass(aValue);
                } else if(aValue.$oid){
                    return new BsonObjectIdClass(new ObjectIdClass(aValue.$oid));
                } else {
                    var isArray = aValue instanceof Array;
                    var bsoned = isArray ? new BsonArrayClass() : new BsonDocumentClass();
                    aMapping.put(aValue, bsoned);
                    if (isArray) {
                        for (var i = 0; i < aValue.length; i++) {
                            var pValue = aValue[i];
                            if (typeof pValue !== 'function') {
                                var val = aMapping.containsKey(pValue) ? aMapping.get(pValue) : toBson(pValue, aMapping);
                                bsoned.add(val);
                            }
                        }
                    }
                    for (var p in aValue) {
                        if (!isArray || isNaN(p)) {
                            var pValue = aValue[p];
                            if (typeof pValue !== 'function') {
                                var val = aMapping.containsKey(pValue) ? aMapping.get(pValue) : toBson(pValue, aMapping);
                                bsoned.put(p + '', val);
                            }
                        }
                    }
                    return bsoned;
                }
            }
        }
    }
    return {to: toBson, documentClass: BsonDocumentClass};
});