/* global Java */

define(function () {
    var EngineUtilsClass = Java.type('jdk.nashorn.api.scripting.ScriptUtils');
    var HashMapClass = Java.type('java.util.HashMap');
    var BsonUndefinedClass = Java.type('org.bson.BsonUndefined');
    var BsonNullClass = Java.type('org.bson.BsonNull');
    var BsonValueClass = Java.type('org.bson.BsonValue');
//    var BsonObjectIdClass = Java.type('org.bson.BsonObjectId');
//    var BsonJavaScriptClass = Java.type('org.bson.BsonJavaScript');
//    var BsonDbPointerClass = Java.type('org.bson.BsonDbPointer');
    var BsonBooleanClass = Java.type('org.bson.BsonBoolean');
    var BsonDateClass = Java.type('org.bson.BsonDate');
    var BsonDoubleClass = Java.type('org.bson.BsonDouble');
    var BsonStringClass = Java.type('org.bson.BsonString');
    var BsonArrayClass = Java.type('org.bson.BsonArray');
    var BsonDocumentClass = Java.type('org.bson.BsonDocument');
    var BsonRegularExpressionClass = Java.type('org.bson.BsonRegularExpression');
    function toBson(aValue, aMapping) {
        aValue = EngineUtilsClass.unwrap(aValue);
        if (!aMapping)
            aMapping = new HashMapClass();
        var type = typeof aValue;
        if (type === 'undefined')
            return new BsonUndefinedClass();
        else if(aValue === null)
            return new BsonNullClass();
        else {
            if (type === 'number')
                return new BsonDoubleClass(+aValue);
            else if (type === 'string')
                return new BsonStringClass(aValue + '');
            else if (type === 'boolean')
                return new BsonBooleanClass(!!aValue);
            else if (type === 'object') {
                if(aValue instanceof BsonValueClass){// BsonObjectId, etc.
                    return aValue;
                } else if (aValue instanceof Date) {
                    return new BsonDateClass(aValue.getTime());
                } else if (aValue instanceof RegExp) {
                    var flags = '';
                    if (aValue.global)
                        flags += 'g';
                    if (aValue.ignoreCase)
                        flags += 'i';
                    if (aValue.multiline)
                        flags += 'm';
                    return new BsonRegularExpressionClass(aValue.source, flags);
                } else if (aValue instanceof Number) {
                    return new BsonDoubleClass(+aValue);
                } else if (aValue instanceof String) {
                    return new BsonStringClass(aValue + '');
                } else if (aValue instanceof Boolean) {
                    return new BsonBooleanClass(!!aValue);
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
    return {to: toBson, documentClass : BsonDocumentClass};
});