AWS = require('aws-sdk');
AWS.config.update({
    accessKeyId: "myKeyId",
    secretAccessKey: "secretKey",
    region: "us-east-1",
});

var Q = require('q');

function Server() {
    dyn = new AWS.DynamoDB({
        endpoint: new AWS.Endpoint('http://localhost:8000')
    });
}

var waitingSet = {}; // requestMatch를 호출한 DID 맵: DID (Device ID) -> true
var matchedSet = {}; // 세션(매칭 완료된 DID 쌍) 맵: SID (Session ID) -> {did1:*, did2:*}
var lastSessionSet = {}; // DID별 소속된 세션 맵: DID -> SID

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
        deferred.resolve({
            result: 'ok',
            type: 'matchInfo',
            opponentNickname: did === matched.did1 ? matched.did2Nickname : matched.did1Nickname,
            sessionId: matched.sid,
            matchedDateTime: matched.matchedDateTime,
        });
    }, function(error) {
        deferred.reject(new Error('fillNicknamesForMatched error : [' + error + ']'));
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

module.exports = Server;