var request = require("request");

var base_url = "http://localhost:3000"

var app = require('../../app/hello_world');
app.listen(3000);
console.log('app.listen() called');

describe("Hello World Server", function() {
    describe("GET /", function() {
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

        it('setNickname API 테스트', function(done) {
            request.get(base_url + '/setNickname?did=testdid&nickname=testdidnickname', function(error, response, body) {
                expect(body).toBe(JSON.stringify({result:'ok', type:'nicknameSet'}));
                done();
            });
        });

        // 직전 테스트에서 설정한 테스트 기기의 닉네임이 잘 조회되는가?
        it('getNickname API 테스트', function(done) {
            request.get(base_url + '/getNickname?did=testdid', function(error, response, body) {
                expect(body).toBe(JSON.stringify({result:'ok', type:'nickname', did:'testdid', nickname:'testdidnickname'}));
                done();
            });
        });

        it('getNickname API 테스트 (없는 DID의 경우 닉네임 없어야함)', function(done) {
            request.get(base_url + '/getNickname?did=asdfasdfadsf', function(error, response, body) {
                expect(body).toBe(JSON.stringify({result:'ok', type:'nickname', did:'asdfasdfadsf', nickname:''}));
                done();
            });
        });

        it('getNicknameAddedDate API 테스트', function(done) {
            request.get(base_url + '/getNicknameAddedDate?did=testdid', function(error, response, body) {
                var b = JSON.parse(body);
                expect(b.type).toBe('nicknameAddedDate');
                var dt = new Date() - new Date(b.nicknameaddeddate);
                expect(dt).toBeLessThan(1000);
                done();
            });
        });
    });
});
