/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.bearsoft.mongo;

import com.mongodb.Block;
import com.mongodb.Function;
import com.mongodb.async.SingleResultCallback;
import java.util.function.BiConsumer;
import jdk.nashorn.api.scripting.JSObject;

/**
 *
 * @author mg
 */
public class Callbacks {

    public static BiConsumer<Object, Throwable> asConsumer(JSObject aOnSuccess, JSObject aOnFailure) {
        return (Object aResult, Throwable aReason) -> {
            if (aReason != null) {
                aOnFailure.call(null, aReason, aResult);
            } else {
                aOnSuccess.call(null, aResult);
            }
        };
    }

    public static Function<Object, Object> asFunction(JSObject aFunction) {
        return (Object aArgument) -> {
            return aFunction.call(null, aArgument);
        };
    }

    public static Block<Object> asBlock(BiConsumer<Object, Throwable> aFunction) {
        return (Object aArgument) -> {
            aFunction.accept(aArgument, null);
        };
    }

    public static SingleResultCallback<Object> asCallback(BiConsumer<Object, Throwable> aWrapped) {
        return (Object aResult, Throwable aReason) -> {
            aWrapped.accept(aResult, aReason);
        };
    }
}
