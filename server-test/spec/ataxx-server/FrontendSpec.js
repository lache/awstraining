var request = require("request");
var Q = require('q');
var base_url = "http://localhost:3000"

jasmine.DEFAULT_TIMEOUT_INTERVAL = 500;

function EncodeQueryData(data) {
    var ret = [];
    for (var d in data) {
        ret.push(encodeURIComponent(d) + "=" + encodeURIComponent(data[d]));
    }
    return ret.join("&");
}

function Command(command, args) {
    return base_url + '/' + command + '?' + EncodeQueryData(args);
}

var app = require('../../app/ServerApp');
app.listen(3000);
console.log('app.listen() called');

function requestGetAsync(cmd, params) {
    var deferred = Q.defer();
    request.get(Command(cmd, params), function(error, response, body) {
        if (error) {
            deferred.reject(new Error(error));
        } else {
            deferred.resolve({
                response: response,
                body: body
            });
        }
    });
    return deferred.promise;
}

var did = 'testdid';
var nickname = 'testdidnickname';
var did2 = 'testdid2';
var nickname2 = 'testdidnickname2';

describe("Ataxx Frontend", function() {

    it("returns status code 200", function(done) {
        request.get(base_url, function(error, response, body) {
            if (error) {
                //fail('오류 발생! 서버가 실행 중인지 확인 해 보시오...');
                expect(true).toBeFalsy();
            } else {
                expect(response.statusCode).toBe(200);
            }
            done();
        });
    });

    it('Hello World 배열을 받는다.', function(done) {
        request.get(base_url + '?number=3', function(error, response, body) {
            expect(body).toBe(JSON.stringify(['Hello World', 'Hello World', 'Hello World']));
            done();
        });
    });

    function setNickname(done, did, nickname) {
        return requestGetAsync('setNickname', {
            did: did,
            nickname: nickname
        }).then(function(data) {
            expect(data.body).toBe(JSON.stringify({
                result: 'ok',
                type: 'nicknameSet'
            }));
            done();
        }, function(error) {
            expect(error).not.toBeDefined();
            done();
        });
    }

    it('setNickname API 테스트', function(done) {
        setNickname(done, did, nickname);
    });

    it('setNickname API 테스트 II', function(done) {
        setNickname(done, did2, nickname2);
    });

    // 직전 테스트에서 설정한 테스트 기기의 닉네임이 잘 조회되는가?
    it('getNickname API 테스트', function(done) {
        request.get(Command('getNickname', {
            did: did
        }), function(error, response, body) {
            var b = JSON.parse(body);
            expect(b.result).toBe('ok');
            expect(b.type).toBe('nickname');
            expect(b.did).toBe(did);
            expect(b.nickname).toBe(nickname);
            done();
        });
    });

    it('getNickname API 테스트 (없는 DID의 경우 닉네임 없어야함)', function(done) {
        var notExistDid = 'asdfasdfadsf'; // 절대 없을 것 같은 닉네임
        request.get(Command('getNickname', {
            did: notExistDid
        }), function(error, response, body) {
            var b = JSON.parse(body);
            expect(b.result).toBe('ok');
            expect(b.type).toBe('nickname');
            expect(b.did).toBe(notExistDid);
            expect(b.nickname).toBe('');
            done();
        });
    });

    it('getNicknameAddedDate API 테스트', function(done) {
        request.get(Command('getNicknameAddedDate', {
            did: did
        }), function(error, response, body) {
            var b = JSON.parse(body);
            expect(b.type).toBe('nicknameAddedDate');
            var dt = new Date() - new Date(b.nicknameaddeddate);
            expect(dt).toBeLessThan(1000);
            done();
        });
    });

    function checkInitialFullState(b) {
        expect(b.gameType).toBe('ataxx');
        expect(b.fullState.width).toBe(7);
        expect(b.fullState.height).toBe(7);
        expect(b.fullState.userList.length).toBe(2);
        expect(b.fullState.userList[0].name).toBe(nickname);
        expect(b.fullState.userList[1].name).toBe(nickname2);
    }

    // 매칭 테스트 (did가 먼저 요청하고 did2가 나중에 요청하는 시나리오)
    it('requestMatch API 테스트', function(done) {
        // (1) did 요청 -> (2) wait 반환
        // (3) did2 요청 -> (4) did, did2와 매칭됨. 매칭 결과 반환
        // (5) did 요청 -> (6) 매칭 결과(세션 ID; sid) 반환
        // (7) did/sid로 세션 정보 요청 -> (8) 세션 정보 반환
        var sessionId = '';

        // (1)
        requestGetAsync('requestMatch', {
            did: did
        }).then(function(data) {
            expect(data.response.statusCode).toBe(200);
            var b = JSON.parse(data.body);
            expect(b.result).toBe('wait');
            // (3)
            return requestGetAsync('requestMatch', {
                did: did2
            });
        }).then(function(data) {
            // (4)
            expect(data.response.statusCode).toBe(200);
            var b = JSON.parse(data.body);
            expect(b.result).toBe('ok');
            expect(b.sessionId.length).toBeGreaterThan(0);
            sessionId = b.sessionId;
            expect(b.opponentNickname).toBe(nickname);
            checkInitialFullState(b);
            // (5)
            return requestGetAsync('requestMatch', {
                did: did
            });
        }).then(function(data) {
            // (6)
            var b = JSON.parse(data.body);
            expect(b.result).toBe('ok');
            expect(b.opponentNickname).toBe(nickname2);
            expect(b.sessionId).toBe(sessionId);
            checkInitialFullState(b);
            // (7)
            return requestGetAsync('requestSessionState', {
                did: did,
                sid: sessionId,
            });
        }).then(function(data) {
            // (8)
            // 현재 상태 정보를 받아서 기대한대로 값이 다 들어있는지 확인한다.
            var b = JSON.parse(data.body);
            expect(b.result).toBe('ok');
            expect(b.type).toBe('sessionState');
            checkInitialFullState(b);
            done();
        }).catch(function(error) {
            expect(error).not.toBeDefined();
            done();
        });
    });
});

describe("FrontendDbServerDown", function() {
    it('DB 서버 다운 시 getNickname API 테스트 (실제 DB 서버 다운 시에는 실패하는 것이 정상)', function(done) {
        requestGetAsync('simulateDbServerDown', {}).then(function(data) {
            expect(data.response.statusCode).toBe(200);
            return requestGetAsync('getNickname', {
                did: 'testdid'
            });
        }).then(function(data) {
            expect(data.response.statusCode).toBe(500);
            return requestGetAsync('stopSimulateDbServerDown', {});
        }).then(function(data) {
            expect(data.response.statusCode).toBe(200);
            return requestGetAsync('getNickname', {
                did: 'testdid'
            });
        }).then(function(data) {
            expect(data.response.statusCode).toBe(200);
            done();
        }, function(error) {
            expect(error).not.toBeDefined();
            done();
        });
    });
});
