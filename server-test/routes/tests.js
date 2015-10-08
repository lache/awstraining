'use strict';
let express = require('express');
let Q = require('q');
let Jasmine = require('jasmine');
let util = require('util');
let jasmine = new Jasmine();
let router = express.Router();

router.get('/', function(req, res, next) {
    res.render('tests');
});

router.post('/run', function(req, res, next) {
    let server = req.app.server;

    let output = '';
    let completeCount = 0;
    jasmine.loadConfigFile('spec/support/jasmine.json');
    /*
    jasmine.onComplete(function(passed) {
        console.log('COMPLETE');
        // 테스트 성공 시 onComplete가 한번 불리고
        // 실패 시 두 번 불리는 괴상한 현상 때문에 아래와 같이 처리
        if (passed) {
            completeCount = 2;
        } else {
            completeCount++;
        }
        if (completeCount == 2) {
            res.render('tests-result', {
                output,
            });
        }
    });
    */
    jasmine.configureDefaultReporter({
        print: function() {
            output += util.format.apply(this, arguments);
        },
        onComplete: function(passed) {
            console.log('~~~COMPLETE');
            completeCount++;
            if (completeCount == 1) {
                res.render('tests-result', {
                    output,
                });
            }
        },
        showColors: false,
    });

    jasmine.execute();
});

module.exports = router;
