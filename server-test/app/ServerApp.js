var cors = require('cors')
var express = require('express');
var app = express();
app.use(cors());

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
            nickname: nn,
        });
    }, function(error) {
        res.status(500).send({
            result: 'error',
            type: 'nickname',
            reason: 500,
        });
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
        res.status(404).send();
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

app.get('/simulateDbServerDown', function(req, res) {
    server.simulateDbServerDown();
    res.status(200).send();
});

app.get('/stopSimulateDbServerDown', function(req, res) {
    server.stopSimulateDbServerDown();
    res.status(200).send();
});

app.get('/requestSessionState', function(req, res) {
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

app.get('/health', function(req, res) {
    res.send({
        pid: process.pid,
        memory: process.memoryUsage(),
        uptime: process.uptime()
    });
});

app.use('/static', express.static(__dirname + '/public'));

module.exports = app;

//app.listen(3000);
