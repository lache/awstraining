describe('AtaxxServer', function() {
    var Server = require('../../lib/ataxx-server/Server');
    var server;

    beforeEach(function() {
        server = new Server();
    });

    it('#getNickname', function(done) {
        server.getNickname('not available device id', function(nickname) {
            expect(nickname).not.toBeDefined();
            done();
        });
    });

    it('#setNickname', function(done) {
        var did = 'nickname set device id';
        var nickname = 'testnickname';
        server.setNickname(did, nickname, function(err) {
            expect(err).toBeFalsy();
            if (!err) {
                server.getNickname(did, function(nn) {
                    expect(nn).toEqual(nickname);
                    done();
                });
            }
        });
    });

    // 매칭 테스트용 기기 두 개 중 첫째를 생성한다.
    it('#setNickname', function(done) {
        var did = 'firstdid';
        var nickname = 'firstdidnickname';
        server.setNickname(did, nickname, function(err) {
            expect(err).toBeFalsy();
            if (!err) {
                server.getNickname(did, function(nn) {
                    expect(nn).toEqual(nickname);
                    done();
                });
            }
        });
    });

    // 매칭 테스트용 기기 두 개 중 둘째를 생성한다.
    it('#setNickname', function(done) {
        var did = 'seconddid';
        var nickname = 'seconddidnickname';
        server.setNickname(did, nickname, function(err) {
            expect(err).toBeFalsy();
            if (!err) {
                server.getNickname(did, function(nn) {
                    expect(nn).toEqual(nickname);
                    done();
                });
            }
        });
    });

    // did1, did2 순으로 차례차례 들어가서 둘이 매치되는 것을 확인
    // did, did2가 들어가는 시점에서 waiting 중인 기기는 없는 것을 가정한다.
    function expectPairing(did1, nickname1, did2, nickname2, done) {
        expectPairingInternal(did1, nickname1, did2, nickname2, done, false);
    }

    // did1, did2 순으로 차례차례 들어가서 둘이 매치되는 것을 확인
    // 다만 매칭 신청 시 각자 요청을 두 번 연속으로 해서 overlapping 상황을
    // 의도적으로 만든다.
    // did, did2가 들어가는 시점에서 waiting 중인 기기는 없는 것을 가정한다.
    function expectPairingOverlapped(did1, nickname1, did2, nickname2, done) {
        expectPairingInternal(did1, nickname1, did2, nickname2, done, true);
    }

    function expectPairingInternal(did1, nickname1, did2, nickname2, done, overlapped) {
        var sid;
        server.setNicknameAsync(did1, nickname1).then(function(data) {
            return server.setNicknameAsync(did2, nickname2);
        }).then(function(data) {
            if (overlapped) {
                server.requestMatchAsync(did1); // 두 번 연속 중 첫째
            }
            return server.requestMatchAsync(did1); // 두 번 연속 중 둘째
        }).then(function(data) {
            expect(data.result).toBe('wait');
            if (overlapped) {
                server.requestMatchAsync(did2); // 두 번 연속 중 첫째
            }
            return server.requestMatchAsync(did2); // 두 번 연속 중 둘째
        }).then(function(data) {
            var dt = new Date() - new Date(data.matchedDateTime);
            expect(dt).toBeLessThan(1000);
            expect(data.result).toBe('ok');
            expect(data.opponentNickname).toBe(nickname1);
            expect(data.sessionId.length).toBeGreaterThan(0);
            sid = data.sessionId;
            return server.requestMatchAsync(did1);
        }).then(function(data) {
            expect(data.result).toBe('ok');
            expect(data.opponentNickname).toBe(nickname2);
            expect(data.sessionId).toBe(sid);
            return server.requestMatchAsync(did2);
        }).then(function(data) {
            expect(data.result).toBe('ok');
            expect(data.opponentNickname).toBe(nickname1);
            expect(data.sessionId).toBe(sid);
            return server.requestMatchAsync(did1);
        }).then(function(data) {
            expect(data.result).toBe('ok');
            expect(data.opponentNickname).toBe(nickname2);
            expect(data.sessionId).toBe(sid);
            if (done) {
                done();
            }
        }, function(error) {
            expect(error).not.toBeDefined();
            if (done) {
                done();
            }
        });
    }

    it('#requestMatch - 처음 들어온 두 명(alpha, bravo)는 끼리끼리 매치가 된다.', function(done) {
        var did1 = 'alpha';
        var nickname1 = 'alpha-nickname';
        var did2 = 'bravo';
        var nickname2 = 'bravo-nickname';
        expectPairing(did1, nickname1, did2, nickname2, done);
    });

    it('#requestMatch - 다음으로 들어오는 두 명(charlie, delta)도 끼리끼리 매치가 된다.', function(done) {
        var did1 = 'charlie';
        var nickname1 = 'charlie-nickname';
        var did2 = 'delta';
        var nickname2 = 'delta-nickname';
        expectPairing(did1, nickname1, did2, nickname2, done);
    });

    it('#requestMatch - 또 다음으로 들어오는 두 명(echo, fox)도 끼리끼리 매치가 된다.', function(done) {
        var did1 = 'echo';
        var nickname1 = 'echo-nickname';
        var did2 = 'foxtrot';
        var nickname2 = 'foxtrot-nickname';
        expectPairing(did1, nickname1, did2, nickname2, done);
    });

    it('#requestMatch - 또또 다음으로 들어오는 수많은 자들도 끼리끼리 매치가 된다.', function(done) {
        var count = 5;
        for (var i = 0; i < count; ++i) {
            var did1 = 'pairing-match-test-did1-' + i;
            var nickname1 = did1 + '-nickname';
            var did2 = 'pairing-match-test-did2-' + i;
            var nickname2 = did2 + '-nickname';
            expectPairing(did1, nickname1, did2, nickname2, (i == count - 1) ? done : null);
            //console.log('match ' + i);
        }
    });

    it('#requestMatch - overlapped', function(done) {
        var did1 = 'overlapped1';
        var nickname1 = did1 + '-nickname';
        var did2 = 'overlapped2';
        var nickname2 = did2 + '-nickname';
        expectPairingOverlapped(did1, nickname1, did2, nickname2, done);
    });

    it('Q promise test', function(done) {
        var did = 'nickname set device id';
        var nickname = 'testnickname';
        server.getNicknameAsync(did).then(function(nn) {
            expect(nn).toEqual(nickname);
            done();
        }).done();
    });

    it('Q promise test II', function(done) {
        var did2 = 'nickname set device id II';
        var nickname2 = 'testnickname IIxx';
        server.setNicknameAsync(did2, nickname2).then(function(data) {
            return server.getNicknameAsync(did2);
        }).then(function(nn2) {
            expect(nn2).toEqual(nickname2);
            done();
        }).done();
    });

    it('Q promise test III', function(done) {
        var did = 'not existing device id';
        server.getNicknameAsync(did).then(function(nn) {
            expect(nn).toEqual('');
            done();
        }).done();
    });

    it('map test', function() {
        var matchingPool = {};
        matchingPool['testdid'] = true;
        matchingPool['testdid2'] = true;
        var i = 0;
        for (var k in matchingPool) {
            if (i == 0) expect(k).toBe('testdid');
            else if (i == 1) expect(k).toBe('testdid2');
            ++i;
        }
        expect(i).toBe(2);

        delete matchingPool['testdid'];

        i = 0;
        for (var k in matchingPool) {
            if (i == 0) expect(k).toBe('testdid2');
            ++i;
        }
        expect(i).toBe(1);

        expect('testdid2' in matchingPool).toBeTruthy();
        expect('xxx' in matchingPool).toBeFalsy();
        matchingPool['xxx'] = true;
        expect('xxx' in matchingPool).toBeTruthy();
    });
});
