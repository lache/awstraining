'use strict';
var express = require('express');
var Q = require('q');
var router = express.Router();

router.get('/', function(req, res, next) {
    let server = req.app.server;
    res.render('rooms', {matchedSet: server.getMatchedSet()});
});

module.exports = router;
