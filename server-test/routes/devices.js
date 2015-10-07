'use strict';
var express = require('express');
var Q = require('q');
var router = express.Router();

router.get('/', function(req, res, next) {
    let server = req.app.server;
    let params = {
        'TableName': 'AppDevice'
    };
    Q.nfcall(server.dyn.scan.bind(server.dyn, params)).then(data => {
        res.render('devices', {data:data});
    }).catch(error => {
        res.render('devices', {data:error});
    }).done();
});

module.exports = router;
