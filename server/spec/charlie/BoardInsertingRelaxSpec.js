describe('BoardInsertingRelax', function () {
    //var Board = require('../../lib/charlie/Board');
    var board;

    beforeEach(function () {
        board = new Board();
        board.setSize(3, 3);
        board.setEntireBoard([
            [1,1,2],
            [2,3,2],
            [3,1,4],
        ]);
        expect(board.isStuck()).toBeTruthy();
    });

    /*
    [ , , ],
    [ , , ],
    [ , , ],
    */
    it('#insertingRelax - 시나리오 1', function () {
        // (1,1)위치를 중심으로 수평방향으로 인접한 두 칸 및 윗 칸에 각각 1을 둔다.
        // 나머지는 아래부터 순서대로 재배열한다.
        expect(board.insertingRelax(1, 1, 1, 'horizontal', 'up')).toEqual([
            [2,1,2],
            [1,3,1],
            [3,4,2],
        ]);
        expect(board.isStuck()).toBeFalsy();
    });

    it('#insertingRelax - 시나리오 2', function () {
        // (1,0)위치를 중심으로 수평방향으로 인접한 두 칸 및 아랫 칸에 각각 1을 둔다.
        // 나머지는 아래부터 순서대로 재배열한다.
        expect(board.insertingRelax(1, 1, 0, 'horizontal', 'down')).toEqual([
            [1,2,1],
            [3,1,2],
            [3,4,2],
        ]);
        expect(board.isStuck()).toBeFalsy();
    });

    it('#insertingRelax - 시나리오 3', function () {
        // (1,1)위치를 중심으로 수직방향으로 인접한 두 칸 및 왼쪽 칸에 각각 1을 둔다.
        // 나머지는 아래부터 순서대로 재배열한다.
        expect(board.insertingRelax(1, 1, 1, 'vertical', 'left')).toEqual([
            [2,1,2],
            [1,2,3],
            [3,1,4],
        ]);
        expect(board.isStuck()).toBeFalsy();
    });

    it('#insertingRelax - 시나리오 4', function () {
        // (1,1)위치를 중심으로 수직방향으로 인접한 두 칸 및 왼쪽 칸에 각각 1을 둔다.
        // 나머지는 아래부터 순서대로 재배열한다.
        expect(board.insertingRelax(1, 0, 1, 'vertical', 'right')).toEqual([
            [1,2,2],
            [2,1,3],
            [1,3,4],
        ]);
        expect(board.isStuck()).toBeFalsy();
    });

    it('#insertingRelax - 시나리오 5 (다른 블럭을 대상으로)', function () {
        expect(board.insertingRelax(2, 1, 2, 'horizontal', 'up')).toEqual([
            [3,1,1],
            [1,2,4],
            [2,3,2],
        ]);
        expect(board.isStuck()).toBeFalsy();
    });

    it('#insertingRelax - 시나리오 6 (예외: 블럭이 잘못 지정됨)', function () {
        expect(function () {
            board.insertingRelax(null, 1, 2, 'horizontal', 'up');
        }).toThrow(new Error('First argument error'));
    });

    it('#insertingRelax - 시나리오 6 (예외: 블럭이 3개 미만이라 매치 불가)', function () {
        expect(function () {
            board.insertingRelax(99, 1, 2, 'horizontal', 'up');
        }).toThrow(new Error('Not enough cells to match'));

        expect(function () {
            board.insertingRelax(3, 1, 2, 'horizontal', 'up');
        }).toThrow(new Error('Not enough cells to match'));
    });

    it('#insertingRelax - 시나리오 7 (예외: 범위 밖)', function () {
        expect(function () {
            board.insertingRelax(2, 1, -2, 'horizontal', 'up');
        }).toThrow(new Error('Out of bounds'));
    });
});
