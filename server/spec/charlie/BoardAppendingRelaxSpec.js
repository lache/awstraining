describe('BoardAppendingRelax', function () {
    //var Board = require('../../lib/charlie/Board');
    var board;

    beforeEach(function () {
        board = new Board();
        board.setSize(4, 4);
        board.setEntireBoard([
            [8,1,2,2],
            [3,4,5,5],
            [6,7,1,1],
            [6,7,1,1],
        ]);
        expect(board.isStuck()).toBeTruthy();
    });

    /*
    [ , , , ],
    [ , , , ],
    [ , , , ],
    [ , , , ],
    */
    it('#appendingRelax - 시나리오 1-1', function () {
        // 1번 블럭을 (0,1)위치를 시작으로 오른쪽 방향으로 두 개 연속 두고,
        // 그 다음 칸의 아랫 칸에 한 개를 둔다.
        // 나머지는 아래부터 순서대로 재배열한다.
        expect(board.appendingRelax(1, 0, 1, 'right', 'down')).toEqual([
            [8,1,2,2],
            [1,1,5,5],
            [1,3,1,4],
            [6,7,6,7],
        ]);
        expect(board.isStuck()).toBeFalsy();
    });

    it('#appendingRelax - 시나리오 1-2', function () {
        // 1번 블럭을 (0,1)위치를 시작으로 오른쪽 방향으로 두 개 연속 두고,
        // 그 다음 칸의 윗 칸에 한 개를 둔다.
        // 나머지는 아래부터 순서대로 재배열한다.
        expect(board.appendingRelax(1, 0, 1, 'right', 'up')).toEqual([
            [1,2,1,2],
            [1,1,5,8],
            [1,3,4,5],
            [6,7,6,7],
        ]);
        expect(board.isStuck()).toBeFalsy();
    });

    it('#appendingRelax - 시나리오 1-3', function () {
        // 1번 블럭을 (0,1)위치를 시작으로 오른쪽 방향으로 두 개 연속 두고,
        // 그 다음 칸의 오른쪽 칸에 한 개를 둔다.
        // 나머지는 아래부터 순서대로 재배열한다.
        expect(board.appendingRelax(1, 0, 1, 'right', 'right')).toEqual([
            [8,1,2,2],
            [1,1,5,1],
            [1,3,4,5],
            [6,7,6,7],
        ]);
        expect(board.isStuck()).toBeFalsy();
    });
    /*
    [8,1,2,2],
    [3,4,5,5],
    [6,7,1,1],
    [6,7,1,1],

    [ , , , ],
    [ , , , ],
    [ , , , ],
    [ , , , ],
    */
    it('#appendingRelax - 시나리오 2-1', function () {
        // 1번 블럭을 (3,2)위치를 시작으로 왼쪽 방향으로 두 개 연속 두고,
        // 그 다음 칸의 아랫 칸에 한 개를 둔다.
        // 나머지는 아래부터 순서대로 재배열한다.
        expect(board.appendingRelax(1, 3, 2, 'left', 'down')).toEqual([
            [8,1,2,2],
            [3,4,5,5],
            [7,1,1,1],
            [6,1,7,6],
        ]);
        expect(board.isStuck()).toBeFalsy();
    });

    it('#appendingRelax - 시나리오 2-2', function () {
        // 1번 블럭을 (3,2)위치를 시작으로 왼쪽 방향으로 두 개 연속 두고,
        // 그 다음 칸의 윗 칸에 한 개를 둔다.
        // 나머지는 아래부터 순서대로 재배열한다.
        expect(board.appendingRelax(1, 3, 2, 'left', 'up')).toEqual([
            [8,1,2,2],
            [4,1,5,5],
            [1,3,1,1],
            [6,7,6,7],
        ]);
        expect(board.isStuck()).toBeFalsy();
    });

    it('#appendingRelax - 시나리오 2-3', function () {
        // 1번 블럭을 (3,2)위치를 시작으로 왼쪽 방향으로 두 개 연속 두고,
        // 그 다음 칸의 왼쪽 칸에 한 개를 둔다.
        // 나머지는 아래부터 순서대로 재배열한다.
        expect(board.appendingRelax(1, 3, 2, 'left', 'left')).toEqual([
            [8,1,2,2],
            [3,4,5,5],
            [1,1,1,1],
            [6,7,6,7],
        ]);
        expect(board.isStuck()).toBeFalsy();
    });
    /*
    [8,1,2,2],
    [3,4,5,5],
    [6,7,1,1],
    [6,7,1,1],

    [ , , , ],
    [ , , , ],
    [ , , , ],
    [ , , , ],
    */
    it('#appendingRelax - 시나리오 3-1', function () {
        // 1번 블럭을 (1,0)위치를 시작으로 아랫 방향으로 두 개 연속 두고,
        // 그 다음 칸의 왼쪽 칸에 한 개를 둔다.
        // 나머지는 아래부터 순서대로 재배열한다.
        expect(board.appendingRelax(1, 1, 0, 'down', 'left')).toEqual([
            [1,1,2,2],
            [5,1,5,8],
            [1,1,3,4],
            [6,7,6,7],
        ]);
        expect(board.isStuck()).toBeFalsy();
    });

    it('#appendingRelax - 시나리오 3-2', function () {
        // 1번 블럭을 (1,0)위치를 시작으로 아랫 방향으로 두 개 연속 두고,
        // 그 다음 칸의 오른쪽 칸에 한 개를 둔다.
        // 나머지는 아래부터 순서대로 재배열한다.
        expect(board.appendingRelax(1, 1, 0, 'down', 'right')).toEqual([
            [1,1,2,2],
            [5,1,5,8],
            [1,3,1,4],
            [6,7,6,7],
        ]);
        expect(board.isStuck()).toBeFalsy();
    });

    it('#appendingRelax - 시나리오 3-3', function () {
        // 1번 블럭을 (1,0)위치를 시작으로 아랫 방향으로 두 개 연속 두고,
        // 그 다음 칸의 아랫 칸에 한 개를 둔다.
        // 나머지는 아래부터 순서대로 재배열한다.
        expect(board.appendingRelax(1, 1, 0, 'down', 'down')).toEqual([
            [1,1,2,2],
            [5,1,5,8],
            [7,1,3,4],
            [6,1,7,6],
        ]);
        expect(board.isStuck()).toBeFalsy();
    });
    /*
    [8,1,2,2],
    [3,4,5,5],
    [6,7,1,1],
    [6,7,1,1],

    [ , , , ],
    [ , , , ],
    [ , , , ],
    [ , , , ],
    */
    it('#appendingRelax - 시나리오 4-1', function () {
        // 1번 블럭을 (2,3)위치를 시작으로 윗 방향으로 두 개 연속 두고,
        // 그 다음 칸의 왼쪽 칸에 한 개를 둔다.
        // 나머지는 아래부터 순서대로 재배열한다.
        expect(board.appendingRelax(1, 2, 3, 'up', 'left')).toEqual([
            [8,1,2,2],
            [4,1,5,5],
            [7,1,1,3],
            [6,7,1,6],
        ]);
        expect(board.isStuck()).toBeFalsy();
    });

    it('#appendingRelax - 시나리오 4-2', function () {
        // 1번 블럭을 (2,3)위치를 시작으로 윗 방향으로 두 개 연속 두고,
        // 그 다음 칸의 오른쪽 칸에 한 개를 둔다.
        // 나머지는 아래부터 순서대로 재배열한다.
        expect(board.appendingRelax(1, 2, 3, 'up', 'right')).toEqual([
            [8,1,2,2],
            [4,5,5,1],
            [7,1,1,3],
            [6,7,1,6],
        ]);
        expect(board.isStuck()).toBeFalsy();
    });

    it('#appendingRelax - 시나리오 4-3', function () {
        // 1번 블럭을 (2,3)위치를 시작으로 윗 방향으로 두 개 연속 두고,
        // 그 다음 칸의 윗 칸에 한 개를 둔다.
        // 나머지는 아래부터 순서대로 재배열한다.
        expect(board.appendingRelax(1, 2, 3, 'up', 'up')).toEqual([
            [1,2,1,2],
            [4,5,5,8],
            [7,1,1,3],
            [6,7,1,6],
        ]);
        expect(board.isStuck()).toBeFalsy();
    });

    /*************/

    it('#appendingRelax - 시나리오 5 (다른 블럭을 대상으로)', function () {
        board.setEntireBoard([
            [7,1,2,2],
            [3,4,5,5],
            [6,7,1,1],
            [6,7,1,1],
        ]);
        expect(board.isStuck()).toBeTruthy();
        expect(board.appendingRelax(7, 0, 2, 'right', 'right')).toEqual([
            [5,1,2,2],
            [1,3,4,5],
            [7,7,1,7],
            [6,1,1,6],
        ]);
        expect(board.isStuck()).toBeFalsy();
    });
});
