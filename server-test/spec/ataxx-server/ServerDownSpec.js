describe('ServerDown', function() {
    var Server = require('../../lib/ataxx-server/Server');
    var server;

    beforeEach(function() {
        server = new Server();
    });

    it('#getNickname (DB 서버 다운 시 응답 테스트)', function(done) {
        server.simulateDbServerDown();

        server.getNickname('xxxyyy', function(nickname) {
            expect(nickname).not.toBeDefined();
            done();
        });

        server.stopSimulateDbServerDown();
    });

    it('#getNickname (서버 구동 중 아닐 때 실패)', function(done) {
        server.getNickname('xxxyyy', function(nickname) {
            expect(nickname).toBeNull();
            done();
        });
    });
});
