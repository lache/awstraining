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
});
