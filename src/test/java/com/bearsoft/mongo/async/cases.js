define(function () {
    var tests = [];
    for (var i = 1; i < arguments.length - 1; i++)
        tests.push(new arguments[i]());
    return tests;
});