'use strict';
var express = require('express');
var util = require('util');
var Q = require('q');
var router = express.Router();

router.get('/', function(req, res, next) {
    res.status(200).send({
        result: 'ok',
    })
});

router.get('/listTables', function(req, res, next) {
    let server = req.app.server;
    Q.nfcall(server.dyn.listTables.bind(server.dyn)).then(function(data) {
        res.status(200).send({
            result: 'ok',
            type: 'listTables',
            tableNames: data.TableNames,
        });
    }).catch(function(error) {
        res.status(500).send({
            result: 'error',
            type: 'listTables',
            reason: 500,
            error: error.message,
        });
    }).done();
});

router.get('/initTables', function(req, res, next) {
    let server = req.app.server;
    let params = {
        TableName: 'AppDevice',
        KeySchema: [{
            AttributeName: 'Id',
            KeyType: 'HASH'
        }],
        AttributeDefinitions: [{
            AttributeName: 'Id',
            AttributeType: 'S'
        }],
        ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1
        }
    };

    Q.nfcall(server.dyn.createTable.bind(server.dyn, params)).then(data => {
        res.status(200).send({
            result: 'ok',
            type: 'initTables',
        });
    }).catch(error => {
        res.status(500).send({
            result: 'error',
            type: 'initTables',
            reason: 500,
            error: error.message,
        });
    }).done();
});

router.get('/setNickname', function(req, res, next) {
    let server = req.app.server;
    var did = req.query.did;
    var nickname = req.query.nickname;
    server.setNicknameAsync(did, nickname).then(function(data) {
        res.status(200).send({
            result: 'ok',
            type: 'nicknameSet'
        });
    }).catch(function(error) {
        res.status(500).send({
            result: 'error',
            type: 'setNickname',
            reason: 500,
            error: error.message,
        });
    }).done();
});

router.get('/getNickname', function(req, res, next) {
    let server = req.app.server;
    var did = req.query.did;
    server.getNicknameAsync(did).then(function(nn) {
        res.status(200).send({
            result: 'ok',
            type: 'nickname',
            did: did,
            nickname: nn,
        });
    }).catch(function(error) {
        res.status(500).send({
            result: 'error',
            type: 'nickname',
            reason: 500,
            error: error.message,
        });
    }).done();
});

router.get('/getNicknameAddedDate', function(req, res, next) {
    let server = req.app.server;
    var did = req.query.did;
    server.getNicknameAddedDateAsync(did).then(function(d) {
        res.status(200).send({
            result: 'ok',
            type: 'nicknameAddedDate',
            did: did,
            nicknameaddeddate: d
        });
    }, function(error) {
        res.status(404).send();
    });
});

router.get('/requestMatch', function(req, res, next) {
    let server = req.app.server;
    let did = req.query.did;
    let status = 403;
    let data = undefined;
    server.requestMatchAsync(did).then(function(d) {
        status = 200;
        data = d;
    }).catch(function(error) {
        status = 403;
        data = {
            result: 'fail',
            reason: error.message
        };
    }).finally(function() {
        res.status(status).send(data);
    }).done();
});

router.get('/simulateDbServerDown', function(req, res, next) {
    let server = req.app.server;
    server.simulateDbServerDown();
    res.status(200).send();
});

router.get('/stopSimulateDbServerDown', function(req, res, next) {
    let server = req.app.server;
    server.stopSimulateDbServerDown();
    res.status(200).send();
});

router.get('/requestSessionState', function(req, res, next) {
    let server = req.app.server;
    var did = req.query.did;
    var sid = req.query.sid;
    server.requestSessionStateAsync(did, sid).then(function(d) {
        res.status(200).send({
            result: 'ok',
            type: 'sessionState',
            gameType: 'ataxx',
            fullState: d.fullState,
        });
    }, function(error) {
        res.status(404).send();
    });
});

router.get('/health', function(req, res, next) {
    res.render('health', {
        title: 'HEALTH',
        pid: process.pid,
        memoryUsage: util.inspect(process.memoryUsage()),
        uptime: process.uptime()
    });
});

router.get('/getMatchSessionCount', function(req, res, next) {
    let server = req.app.server;
    res.send({
        matchSessionCount: server.getMatchSessionCount()
    });
});

module.exports = router;
