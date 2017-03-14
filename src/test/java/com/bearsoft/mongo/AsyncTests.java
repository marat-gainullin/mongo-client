package com.bearsoft.mongo;

import org.junit.Test;

/**
 *
 * @author mgainullin
 */
public class AsyncTests extends ScriptedMongoTests {

    public static final long TEST_TIMEOUT = 4000L;

    @Test
    public void optionsTest() throws InterruptedException {
        start("async/options-test", TEST_TIMEOUT);
    }

    @Test
    public void databaseTest() throws InterruptedException {
        start("async/client/database-test", TEST_TIMEOUT);
    }

    @Test
    public void databasesTest() throws InterruptedException {
        start("async/client/databases-test", TEST_TIMEOUT);
    }

    @Test
    public void databaseNamesTest() throws InterruptedException {
        start("async/client/database-names-test", TEST_TIMEOUT);
    }

    @Test
    public void clientCollectionTest() throws InterruptedException {
        start("async/client/collection-test", TEST_TIMEOUT);
    }

    @Test
    public void clientOptionsTest() throws InterruptedException {
        start("async/client/options-test", TEST_TIMEOUT);
    }

    @Test
    public void clientReadPreferenceTest() throws InterruptedException {
        start("async/client/read-preference-test", TEST_TIMEOUT);
    }

    @Test
    public void clientWriteConcernTest() throws InterruptedException {
        start("async/client/write-concern-test", TEST_TIMEOUT);
    }

    @Test
    public void selfConnectedTest() throws InterruptedException {
        start("async/database/self-connected-test", TEST_TIMEOUT);
    }

    @Test
    public void collectionTest() throws InterruptedException {
        start("async/database/collection-test", TEST_TIMEOUT);
    }

    @Test
    public void collectionNamesTest() throws InterruptedException {
        start("async/database/collection-names-test", TEST_TIMEOUT);
    }

    @Test
    public void databaseCollectionTest() throws InterruptedException {
        start("async/database/collections-test", TEST_TIMEOUT);
    }

    @Test
    public void commandTest() throws InterruptedException {
        start("async/database/command-test", TEST_TIMEOUT);
    }

    @Test
    public void createCollectionTest() throws InterruptedException {
        start("async/database/create-collection-test", TEST_TIMEOUT);
    }

    @Test
    public void dropTest() throws InterruptedException {
        start("async/database/drop-test", TEST_TIMEOUT);
    }

    @Test
    public void collectionSelfConnectedTest() throws InterruptedException {
        start("async/collection/self-connected-test", TEST_TIMEOUT);
    }

    @Test
    public void insertManyTest() throws InterruptedException {
        start("async/collection/insert-many-test", TEST_TIMEOUT);
    }

    @Test
    public void insertOneTest() throws InterruptedException {
        start("async/collection/insert-one-test", TEST_TIMEOUT);
    }

    @Test
    public void countTest() throws InterruptedException {
        start("async/collection/count-test", TEST_TIMEOUT);
    }

    @Test
    public void commands1Test() throws InterruptedException {
        start("async/collection/commands1-test", TEST_TIMEOUT);
    }

    @Test
    public void commands2Test() throws InterruptedException {
        start("async/collection/commands2-test", TEST_TIMEOUT);
    }

    @Test
    public void createIndexTest() throws InterruptedException {
        start("async/collection/create-index-test", TEST_TIMEOUT);
    }

    @Test
    public void createIndexesTest() throws InterruptedException {
        start("async/collection/create-indexes-test", TEST_TIMEOUT);
    }

    @Test
    public void reindexTest() throws InterruptedException {
        start("async/collection/reindex-test", TEST_TIMEOUT);
    }

    @Test
    public void listIndexesTest() throws InterruptedException {
        start("async/collection/list-indexes-test", TEST_TIMEOUT);
    }

    @Test
    public void deleteOneTest() throws InterruptedException {
        start("async/collection/delete-one-test", TEST_TIMEOUT);
    }

    @Test
    public void deleteManyTest() throws InterruptedException {
        start("async/collection/delete-many-test", TEST_TIMEOUT);
    }

    @Test
    public void collectionReadPreferenceTest() throws InterruptedException {
        start("async/collection/read-preference-test", TEST_TIMEOUT);
    }

    @Test
    public void collectionWriteConcernTest() throws InterruptedException {
        start("async/collection/write-concern-test", TEST_TIMEOUT);
    }

    @Test
    public void renameTest() throws InterruptedException {
        start("async/collection/rename-test", TEST_TIMEOUT);
    }

    @Test
    public void explainTest() throws InterruptedException {
        start("async/collection/explain-test", TEST_TIMEOUT);
    }

    @Test
    public void statsTest() throws InterruptedException {
        start("async/collection/stats-test", TEST_TIMEOUT);
    }

    @Test
    public void bulkWriteTest() throws InterruptedException {
        start("async/collection/bulk-write-test", TEST_TIMEOUT);
    }

    @Test
    public void updateOneTest() throws InterruptedException {
        start("async/collection/update-one-test", TEST_TIMEOUT);
    }

    @Test
    public void updateManyTest() throws InterruptedException {
        start("async/collection/update-many-test", TEST_TIMEOUT);
    }

    @Test
    public void saveTest() throws InterruptedException {
        start("async/collection/save-test", TEST_TIMEOUT);
    }

    @Test
    public void replaceOneTest() throws InterruptedException {
        start("async/collection/replace-one-test", TEST_TIMEOUT);
    }

    @Test
    public void mapReduceTest() throws InterruptedException {
        start("async/collection/map-reduce-test", TEST_TIMEOUT);
    }

    @Test
    public void groupTest() throws InterruptedException {
        start("async/collection/group-test", TEST_TIMEOUT);
    }

    @Test
    public void geoNearTest() throws InterruptedException {
        start("async/collection/geo-near-test", TEST_TIMEOUT);
    }

    @Test
    public void geoHaystackTest() throws InterruptedException {
        start("async/collection/geo-haystack-test", TEST_TIMEOUT);
    }

    @Test
    public void findOneAndUpdateTest() throws InterruptedException {
        start("async/collection/find-one-and-update-test", TEST_TIMEOUT);
    }

    @Test
    public void findOneAndReplaceTest() throws InterruptedException {
        start("async/collection/find-one-and-replace-test", TEST_TIMEOUT);
    }

    @Test
    public void findOneAndDeleteTest() throws InterruptedException {
        start("async/collection/find-one-and-delete-test", TEST_TIMEOUT);
    }

    @Test
    public void findTest() throws InterruptedException {
        start("async/collection/find-test", TEST_TIMEOUT);
    }

    @Test
    public void findOneTest() throws InterruptedException {
        start("async/collection/find-one-test", TEST_TIMEOUT);
    }

    @Test
    public void distinctTest() throws InterruptedException {
        start("async/collection/distinct-test", TEST_TIMEOUT);
    }

    @Test
    public void aggregateTest() throws InterruptedException {
        start("async/collection/aggregate-test", TEST_TIMEOUT);
    }
}
