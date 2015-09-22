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

function Server() {
    this.dyn = new AWS.DynamoDB({
        endpoint: new AWS.Endpoint('http://localhost:8000')
    });

    this.waitingSet = {}; // requestMatch를 호출한 DID 맵: DID (Device ID) -> true
    this.matchedSet = {}; // 세션(매칭 완료된 DID 쌍) 맵: SID (Session ID) -> {did1:*, did2:*, ...}
    this.lastSessionSet = {}; // DID별 소속된 세션 맵: DID -> SID
    this.didConnectionSet = {}; // DID -> WebSocket connection
    this.connectionDidSet = new Map(); // WebSocket connection -> DID
    this.deltaQueue = {}; // DID+SID -> Delta 배열
}

Server.prototype.getMatchSessionCount = function() {
    return Object.keys(this.matchedSet).length;
}

Server.prototype.requestSessionStateAsync = function(did, sid) {
    var deferred = Q.defer();

    if (sid in this.matchedSet) {
        deferred.resolve({
            fullState: this.matchedSet[sid].board
        });
    } else {
        deferred.reject(new Error('Not found'));
    }

    return deferred.promise;
}

var getNewGuid = function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
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
    if (did in this.lastSessionSet) {
        var matched = this.matchedSet[this.lastSessionSet[did]];
        this.fillNicknamesForMatched(did, matched, deferred);
        return deferred.promise;
    }

    var matched = null;
    for (var k in this.waitingSet) {
        if (k !== did) {
            var sid = getNewGuid();

            // 매치 정보 저장
            matched = {
                sid: sid,
                did1: k,
                did2: did,
                matchedDateTime: new Date().toISOString(),
            };
            this.matchedSet[sid] = matched;
            // 세션 정보 업데이트
            this.lastSessionSet[did] = sid;
            this.lastSessionSet[k] = sid;
            // 대기열에서 지운다.
            delete this.waitingSet[did];
            delete this.waitingSet[k];
            break;
        }
    }

    if (matched == null) {
        this.waitingSet[did] = true;
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
    this.getNicknameAsync(matched.did1).then(function(nn) {
        matched.did1Nickname = nn;

        return this.getNicknameAsync(matched.did2);
    }.bind(this)).then(function(nn) {
        //console.log('b');
        matched.did2Nickname = nn;

        //console.log('did1Nickname='+matched.did1Nickname);
        //console.log('did2Nickname='+matched.did2Nickname);

        // 게임 컨택스트 생성!
        if (typeof matched.board === 'undefined') {
            var board = new CHARLIE.ataxx.Board();
            var dl = new CHARLIE.ataxx.DeltaLogger();
            var user1 = new CHARLIE.ataxx.User(matched.did1Nickname);
            user1.did = matched.did1;
            var user2 = new CHARLIE.ataxx.User(matched.did2Nickname);
            user2.did = matched.did2;
            var w = 7,
                h = 7;
            board.setDeltaLogger(dl);
            board.setSize(w, h);
            board.place(user1, 0, 0);
            board.place(user1, w - 1, h - 1);
            board.place(user2, w - 1, 0);
            board.place(user2, 0, h - 1);
            board.nextTurn();
            matched.board = board;

            this.deltaQueue[matched.did1 + '+' + matched.sid] = [];
            this.deltaQueue[matched.did2 + '+' + matched.sid] = [];
        }

        var opponentNickname = did === matched.did1 ?
            matched.did2Nickname :
            matched.did1Nickname;

        deferred.resolve({
            result: 'ok',
            type: 'matchInfo',
            gameType: 'ataxx',
            opponentNickname: opponentNickname,
            sessionId: matched.sid,
            matchedDateTime: matched.matchedDateTime,
            fullState: matched.board,
        });
    }.bind(this)).catch(function(error) {
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
    this.dyn.getItem(params, function(err, data) {
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
    this.dyn.getItem(params, function(err, data) {
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
    this.dyn.putItem(params, function(err, data) {
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
    this.dyn.getItem(params, function(err, data) {
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
    this.dyn.putItem(params, function(err, data) {
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
    this.dyn = new AWS.DynamoDB({
        endpoint: new AWS.Endpoint('http://localhost:8123')
    });
    //console.log('Retry Delays:' + dyn.retryDelays())
}

Server.prototype.stopSimulateDbServerDown = function() {
    this.dyn = new AWS.DynamoDB({
        endpoint: new AWS.Endpoint('http://localhost:8000')
    });
}

Server.prototype.onWebSocketMessage = require('./AtaxxLogic');

module.exports = Server;
