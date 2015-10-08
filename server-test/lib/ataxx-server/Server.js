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
var uuid = require('node-uuid');

function Server(logger) {
    this.dyn = new AWS.DynamoDB({
        endpoint: new AWS.Endpoint('http://localhost:8000')
    });

    this.waitingSet = {}; // requestMatch를 호출한 DID 맵: DID (Device ID) -> true
    this.matchedSet = {}; // 세션(매칭 완료된 DID 쌍) 맵: SID (Session ID) -> {did1:*, did2:*, ...}
    this.lastSessionSet = {}; // DID별 소속된 세션 맵: DID -> SID
    this.didConnectionSet = {}; // DID -> WebSocket connection
    this.connectionDidSet = new Map(); // WebSocket connection -> DID
    this.deltaQueue = {}; // DID+SID -> Delta 배열
    this.requestMatchResultSet = {}; // DID -> Q.defer (requestMatch를 호출한 did의 요청 세트)
    this.logger = logger || {
        info: function() {},
    };
}

Server.prototype.getMatchedSet = function() {
    return this.matchedSet;
}

Server.prototype.getLogger = function() {
    return this.logger;
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
    return uuid.v4();
    /*
    var g = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
    return g.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
    */
}

Server.prototype.getRequestMatchResultSetCount = function() {
    return Object.keys(this.requestMatchResultSet).length;
}

Server.prototype.requestMatchAsync = function(did) {
    var deferred = this.requestMatchResultSet[did];
    if (deferred) {
        return deferred.promise;
    } else {
        var newDeferred = Q.defer();
        this.requestMatchResultSet[did] = newDeferred;
        return this.requestMatchAsync_Internal(did, newDeferred).finally((function() {
            delete this.requestMatchResultSet[did];
        }).bind(this));
    }
}

Server.prototype.requestMatchAsync_Internal = function(did, newDeferred) {
    var deferred = newDeferred;

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

    this.getNicknameAsync(did).then((function(nn) {
        if (nn) {
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
        } else {
            deferred.reject(new Error('Empty nickname'));
        }
    }).bind(this)).done();
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
    Q.all([
        this.getNicknameAsync(matched.did1),
        this.getNicknameAsync(matched.did2),
    ]).spread(function(nn1, nn2) {
        matched.did1Nickname = nn1;
        matched.did2Nickname = nn2;

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

            this.deltaQueue[this.getDqId(matched.did1, matched.sid)] = [];
            this.deltaQueue[this.getDqId(matched.did2, matched.sid)] = [];
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
            //deferred.reject('xxx');
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

Server.prototype.findSession = function(conn) {
    var did = this.connectionDidSet.get(conn);
    // 패킷을 보낸 did가 지금 하고 있는 게임 sid
    var sid = this.lastSessionSet[did];
    // 방을 찾아서...
    var matched = this.matchedSet[sid];
    // 게임 컨텍스트를 찾고...
    var board = matched.board;
    // 상대방 DID를 파악
    var didOther = (did == matched.did1) ? matched.did2 : matched.did1;
    // 패킷을 보낸 did, 같은 방에 있는 didOther 모두에게 응답 패킷을 보낸다.
    var connOther = this.didConnectionSet[didOther];

    var nn, nnOther;
    if (did === matched.did1) {
        nn = matched.did1Nickname;
        nnOther = matched.did2Nickname;
    } else {
        nn = matched.did2Nickname;
        nnOther = matched.did1Nickname;
    }

    var dq = this.deltaQueue[this.getDqId(did, sid)];
    var dqOther = this.deltaQueue[this.getDqId(didOther, sid)];

    return {
        sid,
        board,
        did,
        didOther,
        conn,
        connOther,
        nn,
        nnOther,
        dq,
        dqOther,
    };
}

Server.prototype.getDqId = (did, sid) => did + '+' + sid;

// connection이 바인드된 세션을 리셋한다.
// 세션에 엮인 다른 연결 세션도 함꼐 리셋된다.
Server.prototype.removeSessionByConnection = function(connection) {
    var s = this.findSession(connection);

    delete this.waitingSet[s.did];
    delete this.waitingSet[s.didOther];
    delete this.matchedSet[s.sid];
    delete this.lastSessionSet[s.did];
    delete this.lastSessionSet[s.didOther];
    delete this.didConnectionSet[s.did];
    delete this.didConnectionSet[s.didOther];
    this.connectionDidSet.delete(s.conn);
    this.connectionDidSet.delete(s.connOther);
    delete this.deltaQueue[this.getDqId(s.did, s.sid)];
    delete this.deltaQueue[this.getDqId(s.didOther, s.sid)];
    delete this.requestMatchResultSet[s.did];
    delete this.requestMatchResultSet[s.didOther];
}


Server.prototype.onWebSocketMessage = require('./AtaxxLogic');

module.exports = Server;
