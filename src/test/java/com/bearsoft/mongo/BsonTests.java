package com.bearsoft.mongo;

import org.junit.Ignore;
import org.junit.Test;

/**
 *
 * @author mgainullin
 */
public class BsonTests extends ScriptedMongoTests {

    private static final long TEST_TIMEOUT = 4000L;

    @Test
    public void arrayTest() throws InterruptedException {
        start("bson/array-test", TEST_TIMEOUT);
    }

    @Test
    public void binaryTest() throws InterruptedException {
        start("bson/binary-test", TEST_TIMEOUT);
    }

    @Test
    public void booleanTest() throws InterruptedException {
        start("bson/boolean-test", TEST_TIMEOUT);
    }

    @Test
    public void dateTest() throws InterruptedException {
        start("bson/date-test", TEST_TIMEOUT);
    }

    @Test
    public void doubleTest() throws InterruptedException {
        start("bson/double-test", TEST_TIMEOUT);
    }

    @Test
    @Ignore("It is unclear if JavaScript bson is necessary")
    public void javaScriptTest() throws InterruptedException {
        start("bson/javascript-test", TEST_TIMEOUT);
    }

    @Test
    @Ignore("It is unclear if JavaScript bson is necessary")
    public void javaScriptWithScopeTest() throws InterruptedException {
        start("bson/javascript-with-scope-test", TEST_TIMEOUT);
    }

    @Test
    public void longTest() throws InterruptedException {
        start("bson/long-test", TEST_TIMEOUT);
    }

    @Test
    public void maxTest() throws InterruptedException {
        start("bson/max-key-test", TEST_TIMEOUT);
    }

    @Test
    public void minTest() throws InterruptedException {
        start("bson/min-key-test", TEST_TIMEOUT);
    }

    @Test
    public void NullTest() throws InterruptedException {
        start("bson/null-test", TEST_TIMEOUT);
    }

    @Test
    public void objectIdTest() throws InterruptedException {
        start("bson/object-id-test", TEST_TIMEOUT);
    }

    @Test
    public void objectTest() throws InterruptedException {
        start("bson/object-test", TEST_TIMEOUT);
    }

    @Test
    public void regexpTest() throws InterruptedException {
        start("bson/regexp-test", TEST_TIMEOUT);
    }

    @Test
    public void Test() throws InterruptedException {
        start("bson/string-test", TEST_TIMEOUT);
    }

    @Test
    public void timestampTest() throws InterruptedException {
        start("bson/timestamp-test", TEST_TIMEOUT);
    }

    @Test
    public void undefinedTest() throws InterruptedException {
        start("bson/undefined-test", TEST_TIMEOUT);
    }
}
