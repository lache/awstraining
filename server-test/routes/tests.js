'use strict';
let express = require('express');
let Q = require('q');
let Jasmine = require('jasmine');
let util = require('util');
let Server = require('../lib/ataxx-server/Server');
let router = express.Router();


router.get('/', function(req, res, next) {
    res.render('tests');
});

var output = '';

router.post('/run', function(req, res, next) {
    output = '';

    let jasmine = new Jasmine();

    jasmine.loadConfigFile('spec/support/jasmine.json');
    /*
    jasmine.onComplete(function(passed) {
        console.log('COMPLETE!!!');
        res.render('tests-result', {
            output,
        });
    });
    */

    jasmine.res = res;

    jasmine.configureDefaultReporter({
        print: function() {
            output += util.format.apply(this, arguments);
        },

        onComplete: function(passed) {
            console.log('~~~COMPLETE');

            jasmine.res.render('tests-result', {
                output,
            });
        },

        showColors: false,
    });

    // 테스트 시행 시마다 새 Server 인스턴스로 리셋한다.
    req.app.server = new Server();
    let server = req.app.server;

    jasmine.execute();
});

module.exports = router;
