'use strict';

var AWS = require('aws-sdk');
AWS.config.update({
    accessKeyId: "myKeyId",
    secretAccessKey: "secretKey",
    region: "us-east-1",
    maxRetries: 3,
});

var Q = require('q');
var CHARLIE = require('charlie-core');
var dyn;

function Server() {
    dyn = new AWS.DynamoDB({
        endpoint: new AWS.Endpoint('http://localhost:8000')
    });
}

var waitingSet = {}; // requestMatch를 호출한 DID 맵: DID (Device ID) -> true
var matchedSet = {}; // 세션(매칭 완료된 DID 쌍) 맵: SID (Session ID) -> {did1:*, did2:*, ...}
var lastSessionSet = {}; // DID별 소속된 세션 맵: DID -> SID
var didConnectionSet = {}; // DID -> WebSocket connection
var connectionDidSet = new Map(); // WebSocket connection -> DID
Server.prototype.getMatchSessionCount = function() {
    return Object.keys(matchedSet).length;
}

Server.prototype.requestSessionStateAsync = function(did, sid) {
    var deferred = Q.defer();

    if (sid in matchedSet) {
        deferred.resolve({
            fullState: matchedSet[sid].board
        });
    } else {
        deferred.reject(new Error('Not found'));
    }

    return deferred.promise;
}

Server.prototype.requestMatchAsync = function(did) {
    var deferred = Q.defer();

    // 잘못된 DID에 대해서는 응답하지 않는다.
    if (did === null) {
        deferred.reject(new Error('Argument is null'));
        return deferred.promise;
    }
    if (did.length <= 0) {
        deferred.reject(new Error('Argument length is zero'));
        return deferred.promise;
    }
    // 이미 매칭된 상태라면
    if (did in lastSessionSet) {
        var matched = matchedSet[lastSessionSet[did]];
        this.fillNicknamesForMatched(did, matched, deferred);
        return deferred.promise;
    }

    var matched = null;
    for (var k in waitingSet) {
        if (k !== did) {
            var sid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random() * 16 | 0,
                    v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });

            // 매치 정보 저장
            matched = {
                sid: sid,
                did1: k,
                did2: did,
                matchedDateTime: new Date().toISOString(),
            };
            matchedSet[sid] = matched;
            // 세션 정보 업데이트
            lastSessionSet[did] = sid;
            lastSessionSet[k] = sid;
            // 대기열에서 지운다.
            delete waitingSet[did];
            delete waitingSet[k];
            break;
        }
    }

    if (matched == null) {
        waitingSet[did] = true;
        deferred.resolve({
            result: 'wait',
            type: 'matchInfo',
        });
    } else {
        this.fillNicknamesForMatched(did, matched, deferred);
    }
    return deferred.promise;
}

Server.prototype.fillNicknamesForMatched = function(did, matched, deferred) {
    if (!did) {
        deferred.reject(new Error('Argument null'));
        return;
    }
    if (!matched) {
        deferred.reject(new Error('Argument null'));
        return;
    }
    if (!deferred) {
        deferred.reject(new Error('Argument null'));
        return;
    }
    //console.log('matched.did1=' + matched.did1);
    //console.log('matched.did2=' + matched.did2);
    var self = this;
    this.getNicknameAsync(matched.did1).then(function(nn) {
        matched.did1Nickname = nn;

        return self.getNicknameAsync(matched.did2);
    }).then(function(nn) {
        //console.log('b');
        matched.did2Nickname = nn;

        //console.log('did1Nickname='+matched.did1Nickname);
        //console.log('did2Nickname='+matched.did2Nickname);

        // 게임 컨택스트 생성!
        if (typeof matched.board === 'undefined') {
            var board = new CHARLIE.ataxx.Board();
            var user1 = new CHARLIE.ataxx.User(matched.did1Nickname);
            var user2 = new CHARLIE.ataxx.User(matched.did2Nickname);
            var w = 7,
                h = 7;
            board.setSize(w, h);
            board.place(user1, 0, 0);
            board.place(user1, w - 1, h - 1);
            board.place(user2, w - 1, 0);
            board.place(user2, 0, h - 1);
            matched.board = board;
        }

        deferred.resolve({
            result: 'ok',
            type: 'matchInfo',
            gameType: 'ataxx',
            opponentNickname: did === matched.did1 ? matched.did2Nickname : matched.did1Nickname,
            sessionId: matched.sid,
            matchedDateTime: matched.matchedDateTime,
            fullState: matched.board,
        });
    }).catch(function(error) {
        deferred.reject(error);
    });
}

Server.prototype.getNicknameAsync = function(did) {
    var deferred = Q.defer();
    var params = {
        TableName: 'AppDevice',
        Key: {
            Id: {
                S: did
            }
        }
    };
    dyn.getItem(params, function(err, data) {
        if (err) {
            deferred.reject(new Error(err));
        } else if (!data.Item) {
            deferred.resolve('');
        } else if (data.Item.Nickname) {
            deferred.resolve(data.Item.Nickname.S);
        } else {
            deferred.resolve('');
        }
    });
    return deferred.promise;
}

Server.prototype.getNicknameAddedDateAsync = function(did) {
    var deferred = Q.defer();
    var params = {
        TableName: 'AppDevice',
        Key: {
            Id: {
                S: did
            }
        }
    };
    dyn.getItem(params, function(err, data) {
        if (err) {
            deferred.reject(new Error(err));
        } else if (!data.Item) {
            deferred.resolve('');
        } else if (data.Item.DateAdded) {
            deferred.resolve(data.Item.DateAdded.S);
        } else {
            deferred.resolve('');
        }
    });
    return deferred.promise;
}

Server.prototype.setNicknameAsync = function(did, nickname) {
    var deferred = Q.defer();
    var params = {
        TableName: 'AppDevice',
        Item: {
            Id: {
                S: did
            },
            DateAdded: {
                S: new Date().toISOString()
            },
            Nickname: {
                S: nickname
            },
        },
    };
    dyn.putItem(params, function(err, data) {
        if (err) {
            deferred.reject(new Error(err));
        } else {
            deferred.resolve(data);
        }
    });
    return deferred.promise;
}

Server.prototype.getNickname = function(did, cb) {
    var params = {
        TableName: 'AppDevice',
        Key: {
            Id: {
                S: did
            }
        }
    };
    dyn.getItem(params, function(err, data) {
        if (err) {
            cb(undefined);
        } else if (!data.Item || !data.Item.Nickname) {
            cb(null);
        } else {
            cb(data.Item.Nickname.S);
        }
    });
}

Server.prototype.setNickname = function(did, nickname, cb) {
    var params = {
        TableName: 'AppDevice',
        Item: {
            Id: {
                S: did
            },
            DateAdded: {
                S: new Date().toISOString()
            },
            Nickname: {
                S: nickname
            },
        },
    };
    dyn.putItem(params, function(err, data) {
        cb(err);
    });
}

Server.prototype.simulateDbServerDown = function() {
    // DB 서버를 이상한 주소로 설정한다.
    //console.log('Simulate DB Server Down');
    AWS.config.update({
        /*
        httpOptions: {
            timeout: 3000,
        },
        */
        maxRetries: 3,
    });
    dyn = new AWS.DynamoDB({
        endpoint: new AWS.Endpoint('http://localhost:8123')
    });
    //console.log('Retry Delays:' + dyn.retryDelays())
}

Server.prototype.stopSimulateDbServerDown = function() {
    dyn = new AWS.DynamoDB({
        endpoint: new AWS.Endpoint('http://localhost:8000')
    });
}

Server.prototype.onWebSocketMessage = function(connection, b) {
    var responseJson = {
        result: 'ok',
    };

    if (b.cmd == 'openSession') {
        responseJson.type = b.cmd;
        var lastSessionId = lastSessionSet[b.did];
        if (b.sid != lastSessionId) {
            responseJson.result = 'fail';
        } else {
            didConnectionSet[b.did] = connection;
            connectionDidSet.set(connection, b.did);
        }
        connection.sendUTF(JSON.stringify(responseJson));
    } else if (b.cmd == 'ataxxCommand') {
        // 패킷을 보낸 did
        var did = connectionDidSet.get(connection);
        // 패킷을 보낸 did가 지금 하고 있는 게임 sid
        var sid = lastSessionSet[did];
        // 방을 찾아서...
        var matched = matchedSet[sid];
        // 상대방 DID를 파악
        var didOther = (did == matched.did1) ? matched.did2 : matched.did1;
        // 패킷을 보낸 did, 같은 방에 있는 didOther 모두에게 응답 패킷을 보낸다.
        var connOther = didConnectionSet[didOther];

        responseJson.type = b.cmd;
        responseJson.data = b.data;
        var r = JSON.stringify(responseJson);
        if (connOther) {
            connOther.sendUTF(r);
        }
        if (connection) {
            connection.sendUTF(r);
        }
    } else {
        responseJson.result = 'fail';
        connection.sendUTF(JSON.stringify(responseJson));
    }
}

module.exports = Server;
