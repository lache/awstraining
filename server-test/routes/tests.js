'use strict';
let express = require('express');
let Q = require('q');
let router = express.Router();
let jn = require('jasmine-node');

router.get('/', function(req, res, next) {
    res.render('tests');
});

router.post('/run', function(req, res, next) {
    jn.run({specFolders:['./spec']});
    res.render('tests-result');
});

module.exports = router;
