'use strict';
var http = require('http');
var cors = require('cors')
var express = require('express');
var fs = require('fs');
var morgan = require('morgan')
var winston = require('winston');
winston.emitErrs = true;
var WebSocketServer = require('websocket').server;
var app = express();
app.use(cors());

var logger = new winston.Logger({
    transports: [
        new winston.transports.File({
            level: 'info',
            filename: __dirname + '/logs/all-logs.log',
            handleExceptions: true,
            json: false,
            maxsize: 5242880, //5MB
            maxFiles: 5,
            colorize: false
        }),
        // new winston.transports.Console({
        //     level: 'debug',
        //     handleExceptions: true,
        //     json: false,
        //     colorize: true
        // }),
    ],
    exitOnError: false
});

//var accessLogStream = fs.createWriteStream(__dirname + '/access.log', {flags: 'a'})
var winstonStream = {
    write: function(message, encoding) {
        logger.info(message.slice(0, -1));
    }
}
app.use(morgan('combined', {
    stream: winstonStream
}));
//app.use(morgan('combined', {stream: accessLogStream}));

// 'Hello World' array generator
var generator = require('./generator');

// Ataxx server logic
var Server = require('../lib/ataxx-server/Server');
var server = new Server(logger);

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

app.get('/getMatchSessionCount', function(req, res) {
    res.send({
        matchSessionCount: server.getMatchSessionCount()
    });
});

app.use('/static', express.static(__dirname + '/public'));

var httpServer = http.createServer(app);
httpServer.listen(3000);




var wsServer = new WebSocketServer({
    httpServer: httpServer,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
});

function originIsAllowed(origin) {
    // put logic here to detect whether the specified origin is allowed.
    return true;
}

wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
        // Make sure we only accept requests from an allowed origin
        request.reject();
        console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
        return;
    }

    var connection = request.accept('ataxx', request.origin);
    //console.log((new Date()) + ' Connection accepted.');
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            //console.log('Received Message: ' + message.utf8Data);
            var b = JSON.parse(message.utf8Data);
            server.onWebSocketMessage(server, connection, b);
        } else if (message.type === 'binary') {
            //console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
            connection.sendBytes(message.binaryData);
        }
    });
    connection.on('close', function(reasonCode, description) {
        //console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});

module.exports = {
    app,
    logger,
    server,
}

//app.listen(3000);
