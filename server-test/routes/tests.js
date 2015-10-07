'use strict';
let express = require('express');
let Q = require('q');
let router = express.Router();
let jn = require('jasmine-node');

router.get('/', function(req, res, next) {
    res.render('tests');
});

router.post('/run', function(req, res, next) {
    let output = '';
    let called = false;
    let server = req.app.server;
    jn.executeSpecsInFolder({
        specFolders: ['spec'],
        print: str => output += str,
        server: server,
        onComplete: () => {
            // 뭔가 두 번 호출되는 문제가 있는 것 같다... called 플래그로 처리
            if (!called) {
                called = true;
                console.log('ON COMPLETE!!!')
                res.render('tests-result', {
                    output
                });
            }

        }
    });
});

module.exports = router;
