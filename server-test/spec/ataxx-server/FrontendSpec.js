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
    });
});
