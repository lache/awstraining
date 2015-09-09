describe('AtaxxServer', function() {
    var Server = require('../../lib/ataxx-server/Server');
    var server;

    beforeEach(function () {
        server = new Server();
    });

    it('#getNickname', function (done) {
        server.getNickname('not available device id', function (nickname) {
            expect(nickname).not.toBeDefined();
            done();
        });
    });

    it('#setNickname', function (done) {
        var did = 'nickname set device id';
        var nickname = 'testnickname';
        server.setNickname(did, nickname, function (err) {
            expect(err).toBeFalsy();
            if (!err) {
                server.getNickname(did, function (nn) {
                    expect(nn).toEqual(nickname);
                    done();
                });
            }
        });
    });
});
