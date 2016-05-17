define(['./options-test'
, './client/database-test'
, './client/databases-test'
, './client/database-names-test'
, './client/collection-test'
, './client/options-test'
, './client/read-preference-test'
, './client/write-concern-test'
, './database/self-connected-test'
, './database/collection-test'
, './database/collection-names-test'
, './database/collections-test'
, './database/command-test'
, './database/create-collection-test'
, './database/drop-test'
, './collection/self-connected-test'
    ], function () {
    var tests = [];
    for (var i = 0; i < arguments.length - 1; i++)
        tests.push(new arguments[i]());
    return tests;
});