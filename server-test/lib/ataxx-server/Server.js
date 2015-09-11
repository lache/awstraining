AWS = require('aws-sdk');
AWS.config.update({
    accessKeyId: "myKeyId",
    secretAccessKey: "secretKey",
    region: "us-east-1"
});

var Q = require('q');

function Server() {
    dyn = new AWS.DynamoDB({
        endpoint: new AWS.Endpoint('http://localhost:8000')
    });
}

Server.prototype.getNicknameAsync = function (did) {
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

Server.prototype.getNicknameAddedDateAsync = function (did) {
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

Server.prototype.setNicknameAsync = function (did, nickname) {
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

Server.prototype.getNickname = function (did, cb) {
    var params = {
        TableName: 'AppDevice',
        Key: {
            Id: {
                S: did
            }
        }
    };
    dyn.getItem(params, function(err, data) {
        if (err || !data.Item || !data.Item.Nickname) {
            cb(undefined);
        } else {
            cb(data.Item.Nickname.S);
        }
    });
}

Server.prototype.setNickname = function (did, nickname, cb) {
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

module.exports = Server;
