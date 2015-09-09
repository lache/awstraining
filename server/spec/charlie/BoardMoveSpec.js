describe('BoardMove', function () {
    //var Board = require('../../lib/charlie/Board');
    var board;

    beforeEach(function () {
        board = new Board();
        board.setSize(3, 3);
        board.setEntireBoard([
            [1,1,2],
            [1,1,2],
            [2,2,3],
        ]);
    });

    it('이동하려는 두 셀은 반드시 거리 차가 1이어야 한다. 아니면 예외가 발생한다.', function () {
        expect(function () {
            board.move(1, 1, 2, 2);
        }).toThrow(new Error('Wrong move'));
        expect(function () {
            board.move(2, 2, 0, 0);
        }).toThrow(new Error('Wrong move'));
        expect(function () {
            board.move(1, 2, 1, 2);
        }).toThrow(new Error('Wrong move'));
    });

    it('유효한 #move는 true를 반환하고, 해당 내용을 캐시한다.', function () {
        expect(board.move(1, 2, 2, 2)).toBeTruthy();
        expect(board.getPendingMove()).toEqual([1, 2, 2, 2]);
    });

    it('유효하지 않은 #move는 false를 반환하고 캐시 내용은 불변한다.', function () {
        var pm = board.getPendingMove();
        expect(board.move(0, 0, 1, 0)).toBeFalsy();
        expect(board.getPendingMove()).toEqual(pm);
    });

    it('마지막으로 호출된 유효한 #move가 캐시된다.', function () {
        expect(board.move(1, 2, 2, 2)).toBeTruthy();
        expect(board.move(2, 2, 2, 1)).toBeTruthy();
        expect(board.getPendingMove()).toEqual([2, 2, 2, 1]);
    });

    it('#move 직후에는 셀 배치는 변경되지 않는다.', function () {
        expect(board.move(1, 2, 2, 2)).toBeTruthy();
        expect(board.getEntireBoard()).toEqual([
            [1,1,2],
            [1,1,2],
            [2,2,3],
        ]);
    });

    it('#move 후 #nextStep을 하면 셀 배치가 변경된다.', function () {
        expect(board.move(1, 2, 2, 2)).toBeTruthy();
        expect(board.nextStep()).toEqual([
            [1,1,2],
            [1,1,2],
            [2,3,2],
        ]);
        expect(board.getPendingMove()).toBeNull();
    });

    it('범위를 벗어난 #move는 예외를 발생시킨다.', function () {
        expect(function () {
            board.move(-1, 0, 1, 2);
        }).toThrow(new Error('Out of bounds'));
        expect(function () {
            board.move(8, 0, 1, 2);
        }).toThrow(new Error('Out of bounds'));
        expect(function () {
            board.move(0, -2, 1, 2);
        }).toThrow(new Error('Out of bounds'));
        expect(function () {
            board.move(0, 999, 1, 2);
        }).toThrow(new Error('Out of bounds'));
        expect(function () {
            board.move(0, 0, -99, 2);
        }).toThrow(new Error('Out of bounds'));
        expect(function () {
            board.move(0, 0, 100, 2);
        }).toThrow(new Error('Out of bounds'));
        expect(function () {
            board.move(0, 0, 1, -1234);
        }).toThrow(new Error('Out of bounds'));
        expect(function () {
            board.move(0, 0, 2, 777);
        }).toThrow(new Error('Out of bounds'));
    });

    it('빈칸을 움직이려 할 때 예외가 발생한다.', function () {
        board.setEntireBoard([
            [0,0,0],
            [0,0,0],
            [1,2,3],
        ])
        expect(function () {
            board.move(1, 1, 1, 2);
        }).toThrow(new Error('Empty'));
        expect(function () {
            board.move(1, 2, 1, 1);
        }).toThrow(new Error('Empty'));
    });
});
