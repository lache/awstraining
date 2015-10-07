describe('Async', function() {
    var value;
    var AWS;
    var dyn;

    beforeEach(function(done) {
        setTimeout(function() {
            value = 0;
            done();
        }, 1);

        AWS = require('aws-sdk');
        AWS.config.update({
            accessKeyId: "myKeyId",
            secretAccessKey: "secretKey",
            region: "us-east-1"
        });
        dyn = new AWS.DynamoDB({
            endpoint: new AWS.Endpoint('http://localhost:8000')
        });
    });

    it('테이블 모크로크', function(done) {
        dyn.listTables(function(err, data) {
            expect(data.TableNames[0]).toEqual('AppDevice');
            //expect(data.TableNames[1]).toEqual('Image');
            //expect(data.TableNames[2]).toEqual('ImageTag');
            done();
        });
    });

    it("should support async execution of test preparation and expectations", function(done) {
        value++;
        expect(value).toBeGreaterThan(0);
        done();
    });

    it('#putItem', function(done) {
        var params = {
            TableName: 'AppDevice',
            Item: {
                Id: {
                    S: "ios:com.popsongremix.sky:AAA22956-1DE0-4DE7-A1D7-35ECAA169970"
                },
                DateAdded: {
                    S: new Date().toISOString()
                },
            }
        };
        dyn.putItem(params, function(err, data) {
            expect(err).toBeFalsy();
            done();
        });
    });

    it('#getItem', function(done) {
        var Id = "ios:com.popsongremix.sky:AAA22956-1DE0-4DE7-A1D7-35ECAA169970";
        var params = {
            TableName: 'AppDevice',
            Key: {
                Id: {
                    S: Id
                }
            }
        };
        dyn.getItem(params, function(err, data) {
            expect(err).toBeFalsy();
            expect(data.Item.Id.S).toEqual(Id);
            expect(data.Item.Nickname).not.toBeDefined();
            done();
        });
    });

    it('#getItem', function (done) {
        var Id = "not existing device unique id";
        var params = {
            TableName: 'AppDevice',
            Key: {
                Id: {
                    S: Id
                }
            }
        };
        dyn.getItem(params, function(err, data) {
            expect(err).toBeFalsy();
            expect(data.Item).not.toBeDefined();
            done();
        });
    });

    it('신규 기기 닉네임 지정하기', function (done) {
        var id = 'nickname test device';
        var nickname = '가나다라';
        var params = {
            TableName: 'AppDevice',
            Item: {
                Id: {
                    S: id
                },
                DateAdded: {
                    S: new Date().toISOString()
                },
                Nickname: {
                    S: nickname
                }
            }
        };
        dyn.putItem(params, function(err, data) {
            expect(err).toBeFalsy();

            var params = {
                TableName: 'AppDevice',
                Key: {
                    Id: {
                        S: id
                    }
                }
            };
            dyn.getItem(params, function (err, data) {
                expect(err).toBeFalsy();
                expect(data.Item.Nickname.S).toEqual(nickname);
                done();
            });
        });
    });
    /*
    xdescribe("long asynchronous specs", function() {
        var originalTimeout;
        beforeEach(function() {
            originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
            jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
        });

        it("takes a long time", function(done) {
            setTimeout(function() {
                done();
            }, 1000);
        });

        afterEach(function() {
            jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
        });
    });
    */
});
