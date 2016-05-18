/**
 * 
 * @author mg
 */
define(['forms', 'invoke'], function (Forms, Invoke, aModuleName) {
    function Launcher() {
        var self = this
                , form = Forms.loadForm(aModuleName);

        self.show = function () {
            form.show();
        };

        form.btnRun.onActionPerformed = function (event) {
            require(['logger', './bson/cases', './async/cases'], function (Logger, bsonTests, asyncTests) {
                var tests = [];
                Array.prototype.push.apply(tests, bsonTests);
                Array.prototype.push.apply(tests, asyncTests);
                form.progress.minimum = 0;
                form.progress.maximum = tests.length;
                form.btnRun.enabled = false;
                form.progress.value = 0;
                form.txtLog.text = '';
                var testidx = 0;
                function performTest() {
                    if (testidx < tests.length) {
                        var test = tests[testidx];
                        test.execute(function () {
                            form.progress.value++;
                            var msg = test.constructor.name + " - passed";
                            if (form.txtLog.text)
                                form.txtLog.text += '\n';
                            form.txtLog.text += msg;
                            Logger.info(msg);
                            testidx++;
                            Invoke.later(performTest);
                        }, function(e){
                            var msg = test.constructor.name + " - failed - " + e;
                            if (form.txtLog.text)
                                form.txtLog.text += '\n';
                            form.txtLog.text += msg;
                            Logger.severe(msg);
                        });
                    } else {
                        form.btnRun.enabled = true;
                    }
                }
                Invoke.later(performTest);
            });
        };
    }
    return Launcher;
});
