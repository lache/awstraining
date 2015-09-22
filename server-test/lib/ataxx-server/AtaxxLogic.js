'use strict';
var CHARLIE = require('charlie-core');

var processUserDelta = function(board, did, delta) {
    var t = delta.split(' ');
    if (t[0] == 'move' && t.length == 5) {
        var u;
        for (var k in board.userList) {
            if (board.userList[k].did == did) {
                u = board.userList[k];
            }
        }

        if (board.move(u, Number(t[1]), Number(t[2]), Number(t[3]), Number(t[4]))) {
            if (board.nextTurn() == CHARLIE.ataxx.NextTurnResult.OK) {
                return true;
            }
        }
    } else {
        console.error('Unknown user delta: ' + delta);
    }

    return false;
}

var processOpenSession = function(server, connection, b) {
    var lastSessionId = server.lastSessionSet[b.did];
    if (b.sid != lastSessionId) {
        // (1) openSession에 대한 실패 응답을 보내고 끝.
        connection.sendUTF(JSON.stringify({
            result: 'fail',
            type: b.cmd,
            reason: 'sid not matched',
        }));
    } else {
        server.didConnectionSet[b.did] = connection;
        server.connectionDidSet.set(connection, b.did);

        // 델타를 보낸다.
        // 방을 찾아서...
        var matched = server.matchedSet[b.sid];
        // 게임 컨텍스트를 찾고...
        var board = matched.board;
        var didOther = (b.did == matched.did1) ? matched.did2 : matched.did1;
        var dq = server.deltaQueue[b.did + '+' + b.sid];
        var dqOther = server.deltaQueue[didOther + '+' + b.sid];
        var d;
        while (d = board.dl.pop()) {
            var ds = d.toString();
            dq.push(ds);
            dqOther.push(ds);
        }

        if (dq.length > 0 && connection) {
            connection.sendUTF(JSON.stringify({
                result: 'ok',
                type: 'delta',
                data: dq,
            }));
            dq.length = 0;
        }
    }
}

var findSession = function(server, connection) {
    var did = server.connectionDidSet.get(connection);
    // 패킷을 보낸 did가 지금 하고 있는 게임 sid
    var sid = server.lastSessionSet[did];
    // 방을 찾아서...
    var matched = server.matchedSet[sid];
    // 게임 컨텍스트를 찾고...
    var board = matched.board;
    // 상대방 DID를 파악
    var didOther = (did == matched.did1) ? matched.did2 : matched.did1;
    // 패킷을 보낸 did, 같은 방에 있는 didOther 모두에게 응답 패킷을 보낸다.
    var connOther = server.didConnectionSet[didOther];

    return {
        sid: sid,
        board: board,
        did: did,
        didOther: didOther,
        conn: connection,
        connOther: connOther,
    };
}

var processAtaxxCommand = function(server, connection, b) {
    var s = findSession(server, connection);

    if (processUserDelta(s.board, s.did, b.data) == true) {
        var dq = server.deltaQueue[s.did + '+' + s.sid];
        var dqOther = server.deltaQueue[s.didOther + '+' + s.sid];
        var d;
        while (d = s.board.dl.pop()) {
            var ds = d.toString();
            dq.push(ds);
            dqOther.push(ds);
        }

        if (dq.length > 0 && s.conn) {
            s.conn.sendUTF(JSON.stringify({
                result: 'ok',
                type: 'delta',
                data: dq,
            }));
            dq.length = 0;
        }

        if (dqOther.length > 0 && s.connOther) {
            s.connOther.sendUTF(JSON.stringify({
                result: 'ok',
                type: 'delta',
                data: dqOther,
            }));
            dqOther.length = 0;
        }
    } else {
        s.conn.sendUTF(JSON.stringify({
            result: 'fail',
            type: 'delta',
            reason: 'delta processing failure',
        }));
    }
}

var processGiveUp = function(server, connection, b) {
    var s = findSession(server, connection);

    if (processUserDelta(board, did, b.data) == true) {
        var dq = server.deltaQueue[did + '+' + sid];
        var dqOther = server.deltaQueue[didOther + '+' + sid];
        var d;
        while (d = board.dl.pop()) {
            var ds = d.toString();
            dq.push(ds);
            dqOther.push(ds);
        }

        if (dq.length > 0 && connection) {
            connection.sendUTF(JSON.stringify({
                result: 'ok',
                type: 'delta',
                data: dq,
            }));
            dq.length = 0;
        }

        if (dqOther.length > 0 && connOther) {
            connOther.sendUTF(JSON.stringify({
                result: 'ok',
                type: 'delta',
                data: dqOther,
            }));
            dqOther.length = 0;
        }
    } else {
        connection.sendUTF(JSON.stringify({
            result: 'fail',
            type: 'delta',
            reason: 'delta processing failure',
        }));
    }
}

var processUnknown = function(server, connection, b) {
    connection.sendUTF(JSON.stringify({
        result: 'fail',
        type: b.cmd,
        reason: 'unknown command',
    }));
}

var Handler = function(server, connection, b) {
    if (b.cmd == 'openSession') {
        processOpenSession(server, connection, b);
    } else if (b.cmd == 'ataxxCommand') {
        processAtaxxCommand(server, connection, b);
    } else if (b.cmd == 'giveup') {
        processGiveUp(server, connection, b);
    } else {
        processUnknown(server, connection, b);
    }
}

module.exports = Handler;
