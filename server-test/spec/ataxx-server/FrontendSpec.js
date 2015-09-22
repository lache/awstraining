'use strict';
var request = require("request");
var Q = require('q');
var WebSocketClient = require('websocket').client;
var base_url = "http://localhost:3000";
var ws_base_url = "ws://localhost:3000"

jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

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
            expect(body).toBe(JSON.stringify([
                'Hello World',
                'Hello World',
                'Hello World'
            ]));
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

    function checkInitialFullState(b, did, nickname, did2, nickname2) {
        expect(b.gameType).toBe('ataxx');
        expect(b.fullState.width).toBe(7);
        expect(b.fullState.height).toBe(7);
        expect(b.fullState.userList.length).toBe(2);
        expect(b.fullState.userList[0].name).toBe(nickname);
        expect(b.fullState.userList[1].name).toBe(nickname2);
    }

    // 두 기기를 입장시켜서 새로운 매치 세션을 만든다.
    // 두 기기는 한번도 매치 요청을 하지 않은 상태여야 한다.
    // 매치가 완료되면 세션 ID를 반환한다.
    function createMatchSessionPairAsync(did, nickname, did2, nickname2) {
        // (0) did, did2에 대해 닉네임 지정
        // (1) did 요청 -> (2) wait 반환
        // (3) did2 요청 -> (4) did, did2와 매칭됨. 매칭 결과 반환
        // (5) did 요청 -> (6) 매칭 결과(세션 ID; sid) 반환
        // (7) did/sid로 세션 정보 요청 -> (8) 세션 정보 반환
        var deferred = Q.defer();
        var sessionId = '';

        // (0)
        Q.allSettled([
            requestGetAsync('setNickname', {
                did: did,
                nickname: nickname,
            }),
            requestGetAsync('setNickname', {
                did: did2,
                nickname: nickname2,
            }),
        ]).then(function(data) {
            // (1)
            return requestGetAsync('requestMatch', {
                did: did
            });
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
            checkInitialFullState(b, did, nickname, did2, nickname2);
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
            checkInitialFullState(b, did, nickname, did2, nickname2);
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
            checkInitialFullState(b, did, nickname, did2, nickname2);
            deferred.resolve({
                sessionId: sessionId
            });
        }).done();

        return deferred.promise;
    }

    function getMatchSessionCountAsync() {
        var deferred = Q.defer();
        requestGetAsync('getMatchSessionCount', {}).then(function(data) {
            deferred.resolve(JSON.parse(data.body));
        });
        return deferred.promise;
    }

    it('매치 세션 개수 조회', function(done) {
        getMatchSessionCountAsync().then(function(b) {
            expect(b.matchSessionCount).toBeDefined();
            done();
        }).done();
    })

    // 매칭 테스트 (did가 먼저 요청하고 did2가 나중에 요청하는 시나리오)
    it('requestMatch API 테스트', function(done) {
        var matchSessionCount;
        getMatchSessionCountAsync().then(function(data) {
            matchSessionCount = data.matchSessionCount;
            return createMatchSessionPairAsync(did, nickname, did2, nickname2);
        }).then(function(data) {
            expect(data.sessionId).toBeDefined();
            expect(data.sessionId.length).toBeGreaterThan(0);
            return getMatchSessionCountAsync();
        }).then(function(data) {
            expect(data.matchSessionCount - matchSessionCount).toBe(1);
            done();
        }).done();
    });

    // 매칭 테스트 (여러 쌍 더 매칭되도록 하기)
    it('requestMatch API 테스트 (여러 쌍 더)', function(done) {
        var funcs = [];
        var matchCount = 3;
        for (var i = 0; i < matchCount; i++) {
            funcs.push(function(i) {
                return function() {
                    return createMatchSessionPairAsync(
                        did + '__' + i,
                        nickname + '__' + i,
                        did2 + '__' + i,
                        nickname2 + '__' + i);
                };
            }(i));
        }

        var matchSessionCount;
        getMatchSessionCountAsync().then(function(data) {
            matchSessionCount = data.matchSessionCount;
            return funcs.reduce(Q.when, Q());
        }).then(function(data) {
            return getMatchSessionCountAsync();
        }).then(function(data) {
            expect(data.matchSessionCount - matchSessionCount).toBe(matchCount);
            done();
        }).done();
    });

    xit('웹소켓 기본 기능 테스트 - 클라이언트가 열었다 닫는다.', function(done) {
        var client = new WebSocketClient();
        expect(client).toBeDefined();
        client.on('connectFailed', function(error) {
            fail('[WS] connectFailed - ' + error);
        });
        client.on('connect', function(connection) {
            connection.on('error', function(error) {
                fail('[WS] connect error - ' + error);
            });
            connection.on('close', function() {
                done();
            });
            connection.on('message', function(message) {
                if (message.type === 'utf8') {
                    connection.close();
                }
            });

            if (connection.connected) {
                connection.sendUTF('hehe');
            } else {
                fail('Not connected error');
            }
        });
        client.connect('ws://html5rocks.websocket.org/echo');
    });

    // 연결 성립된 웹소켓 연결 객체에 message 핸들러를 1회용으로 달고,
    // data를 송신한다. data 송신에 따른 수신은 1회용으로 단 핸들러가
    // 호출되는 것을 가정하고 있다.
    function sendRecvOnceAsync(data) {
        expect(this.connection.connected).toBeTruthy();
        var deferred = Q.defer();
        this.connection.once('message', function(message) {
            if (message.type === 'utf8') {
                deferred.resolve(message.utf8Data);
            } else {
                var errMsg = 'Unsupported type ' + message.type + ' received.';
                deferred.reject(new Error(errMsg));
            }
        });
        this.connection.sendUTF(data);
        return deferred.promise;
    }

    // sendRecvOnceAsync와 동일한데,
    // send는 하지 않고 메시지를 받기만 한다.
    function recvOnceAsync() {
        expect(this.connection.connected).toBeTruthy();
        var deferred = Q.defer();
        this.connection.once('message', function(message) {
            if (message.type === 'utf8') {
                deferred.resolve(message.utf8Data);
            } else {
                var errMsg = 'Unsupported type ' + message.type + ' received.';
                deferred.reject(new Error(errMsg));
            }
        });
        return deferred.promise;
    }

    function openWebSocketConnectionAsync(addr, protocol) {
        var deferred = Q.defer();
        var client = new WebSocketClient();
        client.on('connectFailed', function(error) {
            deferred.reject(error);
        });
        client.on('connect', function(connection) {
            connection.on('error', function(error) {
                deferred.reject(error);
            });
            connection.on('close', function() {
                done();
            });

            if (connection.connected) {
                deferred.resolve({
                    connection: connection,
                    sendRecvOnceAsync: sendRecvOnceAsync,
                    recvOnceAsync: recvOnceAsync,
                });
            } else {
                deferred.reject(new Error('Connect error'));
            }
        });
        client.connect(addr, protocol);
        return deferred.promise;
    }

    function checkExpectedDelta(r1, r2, expectedDelta) {
        // 초기 보드 상태가 오는지 확인한다.
        var b1 = JSON.parse(r1);
        expect(b1.result).toBe('ok');
        expect(b1.type).toBe('delta');
        expect(b1.data).toEqual(expectedDelta);

        var b2 = JSON.parse(r2);
        expect(b2.result).toBe('ok');
        expect(b2.type).toBe('delta');
        expect(b2.data).toEqual(expectedDelta);
    }

    function conn1SendConn2Recv(conn1, conn2, command) {
        return Q.all([
            conn1.sendRecvOnceAsync(JSON.stringify({
                cmd: 'ataxxCommand',
                data: command,
            })),
            conn2.recvOnceAsync(),
        ])
    }

    function conn2SendConn1Recv(conn1, conn2, command) {
        return Q.all([
            conn1.recvOnceAsync(),
            conn2.sendRecvOnceAsync(JSON.stringify({
                cmd: 'ataxxCommand',
                data: command,
            })),
        ])
    }

    it('매치 세션과의 WebSocket 연결 확인', function(done) {
        var did1 = 'did1',
            nn1 = 'nickname1',
            did2 = 'did2',
            nn2 = 'nickname2';
        var sid;
        var conn1;
        var conn2;

        // did1이 먼저 말을 두게 되는 매치 상황을 만든다.
        createMatchSessionPairAsync(did1, nn1, did2, nn2).then(function(data) {
            sid = data.sessionId;

            // 매치 세션은 생성됐으니 두 개의 ataxx 프로토콜 웹소켓을 연다.
            return Q.all([
                openWebSocketConnectionAsync(ws_base_url, 'ataxx'),
                openWebSocketConnectionAsync(ws_base_url, 'ataxx'),
            ]);
        }).spread(function(c1, c2) {
            // 다음 단계에서 계속 쓸 변수니까 저장해 둔다.
            conn1 = c1;
            conn2 = c2;

            // did1, did2 각자 자신의 세션을 연다.
            return Q.all([
                conn1.sendRecvOnceAsync(JSON.stringify({
                    cmd: 'openSession',
                    did: did1,
                    sid: sid,
                })),
                conn2.sendRecvOnceAsync(JSON.stringify({
                    cmd: 'openSession',
                    did: did2,
                    sid: sid,
                })),
            ]);
        }).spread(function(r1, r2) {
            var b1 = JSON.parse(r1);
            expect(b1.result).toBe('ok');
            expect(b1.type).toBe('openSession');

            var b2 = JSON.parse(r2);
            expect(b2.result).toBe('ok');
            expect(b2.type).toBe('openSession');

            // did1, did2는 초기 보드 상태가 오기를 기다린다.
            return Q.all([
                conn1.recvOnceAsync(),
                conn2.recvOnceAsync(),
            ]);
        }).spread(function(r1, r2) {
            var expectedDelta = ['size 7 7', 'place nickname1 0 0', 'place nickname1 6 6', 'place nickname2 6 0', 'place nickname2 0 6', 'turn 1'];
            checkExpectedDelta(r1, r2, expectedDelta);

            // did1이 (0,0)에 있는 말을 (1,0)으로 옮기도록 한다.
            return conn1SendConn2Recv(conn1, conn2, 'move 0 0 1 0');
        }).spread(function(r1, r2) {
            var expectedDelta = ['move nickname1 0 0 1 0 clone', 'turn 2']
            checkExpectedDelta(r1, r2, expectedDelta);

            // did2가 (6,6)에 있는 말을 (5,6)으로 옮기도록 한다.
            return conn2SendConn1Recv(conn1, conn2, 'move 0 6 1 6');
        }).spread(function(r1, r2) {
            var expectedDelta = ['move nickname2 0 6 1 6 clone', 'turn 3']
            checkExpectedDelta(r1, r2, expectedDelta);

            // did2가 (6,6)에 있는 말을 (6,4)으로 옮기도록 한다.
            return conn1SendConn2Recv(conn1, conn2, 'move 6 6 6 4');
        }).spread(function(r1, r2) {
            var expectedDelta = ['move nickname1 6 6 6 4 move', 'turn 4']
            checkExpectedDelta(r1, r2, expectedDelta);

            done();
        }).done();
    });
});

describe("FrontendDbServerDown", function() {
    it('DB 서버 다운 시 API 테스트 (실제 DB 서버 다운 시에는 실패)', function(done) {
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
