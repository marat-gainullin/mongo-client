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
    var BsonJavaScriptClass = Java.type('org.bson.BsonJavaScript');
    var BsonJavaScriptWithScopeClass = Java.type('org.bson.BsonJavaScriptWithScope');
    var BsonDbPointerClass = Java.type('org.bson.BsonDbPointer');
    var BsonSymbolClass = Java.type('org.bson.BsonSymbol');
    var BsonBooleanClass = Java.type('org.bson.BsonBoolean');
    var BsonDateTimeClass = Java.type('org.bson.BsonDateTime');
    var BsonTimestampClass = Java.type('org.bson.BsonTimestamp');
    var BsonDoubleClass = Java.type('org.bson.BsonDouble');
    var BsonInt32Class = Java.type('org.bson.BsonInt32');
    var BsonInt64Class = Java.type('org.bson.BsonInt64');
    var BsonStringClass = Java.type('org.bson.BsonString');
    var BsonArrayClass = Java.type('org.bson.BsonArray');
    var BsonDocumentClass = Java.type('org.bson.BsonDocument');
    var BsonRegularExpressionClass = Java.type('org.bson.BsonRegularExpression');
    var BsonBinaryClass = Java.type('org.bson.BsonBinary');
    var Base64Class = Java.type('java.util.Base64');
    var ListClass = Java.type('java.util.List');
    var MapClass = Java.type('java.util.Map');
    var StringClass = Java.type('java.lang.String');
    var DoubleClass = Java.type('java.lang.Double');

    var base64ToStringEncoding = 'utf-8';
    var int64Re = /BsonInt64{value=(.+)}/;

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
            if (type === 'number') {
                var nmb = +aValue;
                if (nmb === Infinity) {
                    return new BsonDoubleClass(DoubleClass.POSITIVE_INFINITY)
                } else if (nmb === -Infinity)
                    return new BsonDoubleClass(DoubleClass.NEGATIVE_INFINITY)
                else
                    return new BsonDoubleClass(nmb);
            } else if (type === 'string')
                return new BsonStringClass(aValue + '');
            else if (type === 'boolean')
                return new BsonBooleanClass(!!aValue);
            else if (type === 'object') {
                if (aValue instanceof BsonValueClass) {// BsonObjectId, etc.
                    return aValue;
                } else if (undefined !== aValue.$undefined) {
                    return new BsonUndefinedClass();
                } else if (undefined !== aValue.$numberLong) {
                    return new BsonInt64Class(+aValue.$numberLong);
                } else if (undefined !== aValue.$code) {
                    if (undefined !== aValue.$scope)
                        return new BsonJavaScriptWithScopeClass('' + aValue, toBson(aValue.$scope));
                    else
                        return new BsonJavaScriptClass('' + aValue);
                } else if (aValue instanceof Date) {
                    return new BsonDateTimeClass(aValue.getTime());
                } else if (undefined !== aValue.$date) {
                    return new BsonDateTimeClass(+aValue.$date.$numberLong);
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
                    var base64Text = new StringClass(aValue.$binary);
                    return new BsonBinaryClass(aValue.$type, Base64Class.getDecoder().decode(base64Text.getBytes(base64ToStringEncoding)));
                } else if (aValue instanceof Number) {
                    var nmb = +aValue;
                    if (nmb === Infinity)
                        return new BsonDoubleClass(DoubleClass.POSITIVE_INFINITY)
                    else if (nmb === -Infinity)
                        return new BsonDoubleClass(DoubleClass.NEGATIVE_INFINITY)
                    else
                        return new BsonDoubleClass(nmb);
                } else if (undefined !== aValue.$minKey) {
                    return new BsonObjectMinKeyClass();
                } else if (undefined !== aValue.$maxKey) {
                    return new BsonObjectMaxKeyClass();
                } else if (aValue instanceof String) {
                    return new BsonStringClass(aValue + '');
                } else if (aValue instanceof Boolean) {
                    return new BsonBooleanClass(aValue == true);// Don't edit to !!aValue
                } else if (aValue instanceof ObjectIdClass) {
                    return new BsonObjectIdClass(aValue);
                } else if (undefined !== aValue.$oid) {
                    return new BsonObjectIdClass(new ObjectIdClass(aValue.$oid));
                } else if (undefined !== aValue.$ref && undefined !== aValue.$id) {
                    return new BsonDbPointerClass(aValue.$ref, new ObjectIdClass(aValue.$id));
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

    function fromBson(aValue, aMapping) {
        aValue = EngineUtilsClass.unwrap(aValue);
        if (!aMapping)
            aMapping = new HashMapClass();
        if (aValue instanceof BsonUndefinedClass)
            return undefined;
        else if (aValue instanceof BsonNullClass)
            return null;
        else if (aValue instanceof BsonDoubleClass) {
            var dbl = aValue.doubleValue();
            if (dbl == DoubleClass.POSITIVE_INFINITY)
                return Infinity;
            else if (dbl == DoubleClass.NEGATIVE_INFINITY)
                return -Infinity;
            else
                return dbl;
        } else if (aValue instanceof BsonInt32Class)
            return aValue.doubleValue();
        else if (aValue instanceof BsonInt64Class) {
            var int64Text = aValue + '';
            var parsed = int64Text.match(int64Re);
            return {$numberLong: parsed[1]};
        } else if (aValue instanceof BsonStringClass)
            return aValue.getValue();
        else if (aValue instanceof BsonSymbolClass)
            return aValue.getSymbol();
        else if (aValue instanceof BsonJavaScriptClass) {
            return {$code: aValue.getCode()};
        } else if (aValue instanceof BsonJavaScriptWithScopeClass)
            return {$code: aValue.getCode(), $scope: fromBson(aValue.getScope())};
        else if (aValue instanceof BsonBooleanClass)
            return aValue.getValue();
        else if (aValue instanceof BsonDateTimeClass) {
            return new Date(aValue.getValue());
        } else if (aValue instanceof BsonTimestampClass) {
            return {$timestamp: {t: aValue.getTime(), i: aValue.getInc()}};
        } else if (aValue instanceof BsonRegularExpressionClass) {
            return new RegExp(aValue.getPattern(), aValue.getOptions());
        } else if (aValue instanceof BsonBinaryClass) {
            return {$type: +aValue.getType(), $binary: '' + new StringClass(Base64Class.getEncoder().encode(aValue.getData()), base64ToStringEncoding)};
        } else if (aValue instanceof BsonObjectMinKeyClass) {
            return {$minKey: 1};
        } else if (aValue instanceof BsonObjectMaxKeyClass) {
            return {$maxKey: 1};
        } else if (aValue instanceof ObjectIdClass) {
            return {$oid: aValue.toHexString()};
        } else if (aValue instanceof BsonObjectIdClass) {
            return {$oid: aValue.getValue().toHexString()};
        } else if (aValue instanceof BsonDbPointerClass) {
            return {$ref: aValue.getNamespace(), $id: aValue.getId().toHexString()};
        } else if (aValue instanceof MapClass) {
            var jsed = {};
            aMapping.put(aValue, jsed);
            aValue.entrySet().forEach(function (aEntry) {
                var p = aEntry.getKey();
                if (isNaN(p)) {
                    var pValue = aEntry.getValue();
                    var val = aMapping.containsKey(pValue) ? aMapping.get(pValue) : fromBson(pValue, aMapping);
                    jsed[p + ''] = val;
                }
            });
            return jsed;
        } else if (aValue instanceof ListClass) {
            var jsed = [];
            aMapping.put(aValue, jsed);
            for (var i = 0; i < aValue.size(); i++) {
                var pValue = aValue.get(i);
                var val = aMapping.containsKey(pValue) ? aMapping.get(pValue) : fromBson(pValue, aMapping);
                jsed.push(val);
            }
            return jsed;
        } else {
            return aValue;
        }
    }
    var module = {to: toBson, from: fromBson, documentClass: BsonDocumentClass};
    Object.defineProperty(module, 'charset', {
        get: function () {
            return base64ToStringEncoding;
        },
        set: function (aValue) {
            base64ToStringEncoding = aValue;
        }
    });
    return module;
});