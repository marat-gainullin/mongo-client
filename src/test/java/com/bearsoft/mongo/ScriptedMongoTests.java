package com.bearsoft.mongo;

import com.eas.client.application.PlatypusClientApplication;
import com.eas.client.scripts.ScriptedResource;
import com.eas.script.Scripts;
import com.eas.script.SystemJSCallback;
import java.util.concurrent.atomic.AtomicReference;
import java.util.logging.Level;
import java.util.logging.Logger;
import jdk.nashorn.api.scripting.AbstractJSObject;
import jdk.nashorn.api.scripting.JSObject;
import org.junit.Assert;
import org.junit.BeforeClass;

/**
 *
 * @author mg
 */
public class ScriptedMongoTests {

    private static final String TEST_SOURCE_URL = "source.url";
    
    @BeforeClass
    public static void init() throws Exception {
        String sourceURL = System.getProperty(TEST_SOURCE_URL);
        if (sourceURL == null) {
            throw new IllegalStateException(TEST_SOURCE_URL + " property is not defined");
        }
        PlatypusClientApplication.init(PlatypusClientApplication.Config.parse(new String[]{
            "-url", sourceURL
        }));
    }

    protected void start(String aTestModuleName, long aTimeout) throws InterruptedException {
        Object success = new Object();
        Object failure = new Object();
        long started = System.currentTimeMillis();
        AtomicReference<Object> completion = new AtomicReference();
        try {
            ScriptedResource.require(new String[]{aTestModuleName}, null, new AbstractJSObject() {
                @Override
                public Object call(final Object thiz, final Object... args) {
                    JSObject testModule = Scripts.getSpace().lookup(aTestModuleName);
                    JSObject testInstance = (JSObject) testModule.newObject();
                    JSObject execute = (JSObject) testInstance.getMember("execute");
                    try {
                        execute.call(testInstance, new Object[]{new SystemJSCallback() {
                            @Override
                            public Object call(final Object thiz, final Object... args) {
                                completion.set(success);
                                return null;
                            }
                        }, new SystemJSCallback() {
                            @Override
                            public Object call(final Object thiz, final Object... args) {
                                completion.set(args.length > 0 ? args[0] : failure);
                                return null;
                            }
                        }});
                    } catch (Throwable t) {
                        completion.set(t);
                    }
                    return null;
                }

            }, new AbstractJSObject() {
                @Override
                public Object call(final Object thiz, final Object... args) {
                    completion.set(args[0]);
                    return null;
                }
            });
        } catch (Exception ex) {
            Logger.getLogger(ScriptedMongoTests.class.getName()).log(Level.SEVERE, null, ex);
            completion.set(ex);
        }
        while (completion.get() == null && System.currentTimeMillis() < started + aTimeout) {
            Thread.sleep(10);
        }
        Object lastChance = completion.get();
        if (lastChance != success) {
            String failedText = aTestModuleName + " failed due to: ";
            if (lastChance == null) {
                Assert.fail(failedText + "timeout");
            } else if (lastChance == failure) {
                Assert.fail(failedText + "unknown problem");
            } else if (lastChance instanceof Throwable) {
                Assert.fail(failedText + lastChance.toString());
            } else if (lastChance instanceof JSObject) {
                String jsonView = Scripts.getSpace().toJson(lastChance);
                Assert.fail(failedText + (jsonView.length() > 2 ? jsonView : lastChance.toString()));
            } else {
                Assert.fail(failedText + lastChance.toString());
            }
        } else {
            Logger.getLogger(ScriptedMongoTests.class.getName()).log(Level.INFO, "{0} completed", aTestModuleName);
        }
    }
}
