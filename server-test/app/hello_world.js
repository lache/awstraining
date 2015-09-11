var express = require('express');
var app = express();

// 'Hello World' array generator
var generator = require('./generator');

// Ataxx server logic
var Server = require('../lib/ataxx-server/Server');
var server = new Server();

app.get('/', function(req, res) {
    var number = req.query.number;
    var helloWorldArray = generator.generateHelloWorlds(number);
    res.status(200).send(helloWorldArray);
})

app.get('/setNickname', function(req, res) {
    var did = req.query.did;
    var nickname = req.query.nickname;
    server.setNicknameAsync(did, nickname).then(function(data) {
        res.status(200).send({
            result: 'ok',
            type: 'nicknameSet'
        });
        /*
        setTimeout(function() {
            res.status(200).send({result:'ok'});
        }, 2000);
        */
    }, function(error) {
        res.status(404);
    });
});

app.get('/getNickname', function(req, res) {
    var did = req.query.did;
    server.getNicknameAsync(did).then(function(nn) {
        res.status(200).send({
            result: 'ok',
            type: 'nickname',
            did: did,
            nickname: nn
        });
    }, function(error) {
        res.status(404);
    });
});

app.get('/getNicknameAddedDate', function(req, res) {
    var did = req.query.did;
    server.getNicknameAddedDateAsync(did).then(function(d) {
        res.status(200).send({
            result: 'ok',
            type: 'nicknameAddedDate',
            did: did,
            nicknameaddeddate: d
        });
    }, function(error) {
        res.status(404);
    });
});

app.get('/requestMatch', function(req, res) {
    var did = req.query.did;
    server.requestMatchAsync(did).then(function(d) {
        res.status(200).send(d);
    }, function(error) {
        res.status(404);
    });
});

module.exports = app;

//app.listen(3000);
