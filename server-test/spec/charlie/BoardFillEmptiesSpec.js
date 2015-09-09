describe('BoardFillEmpties', function () {
    //var Board = require('../../lib/charlie/Board');
    var board;

    beforeEach(function () {
        board = new Board();
    });

    describe('#fillEmpties', function () {
        beforeEach(function () {
            var w = 3;
            var h = 3;
            board.setSize(w, h);
        });

        it('맨 윗줄에 빈칸이 하나', function () {
            board.setEntireBoard([
                [1,1,0],
                [1,1,2],
                [2,2,3],
            ]);
            board.setNewCells([ 7, 8, 9 ]);
            expect(board.fillEmpties()).toEqual(1);
            expect(board.getEntireBoard()).toEqual([
                [1,1,7],
                [1,1,2],
                [2,2,3],
            ]);
        });

        it('아래에서 윗쪽으로, 왼쪽에서 오른쪽 순서로 채워진다.', function () {
            board.setEntireBoard([
                [0,0,0],
                [0,0,0],
                [1,2,0],
            ]);
            board.setNewCells([ 3, 4, 5, 6, 7, 8, 9 ]);
            expect(board.fillEmpties()).toEqual(7);
            expect(board.getEntireBoard()).toEqual([
                [7,8,9],
                [4,5,6],
                [1,2,3],
            ]);
        });

        it('빈칸이 있지만 채워질 것이 없을 떄는 예외 발생된다.', function () {
            board.setEntireBoard([
                [0,0,0],
                [4,5,6],
                [1,2,3],
            ]);
            board.setNewCells([ 7, 8 ]);
            expect(board.getNewCells()).toBeDefined();
            expect(function () {
                board.fillEmpties();
            }).toThrow(new Error('Not enough new cells'));
        });

        it('배열에서 하나씩 shift해서 빼면 undefined가 된다?', function () {
            var a = [ 1, 2, 3];
            expect(a.length).toEqual(3);
            expect(a.shift()).toEqual(1);
            expect(a.length).toEqual(2);
            expect(a.shift()).toEqual(2);
            expect(a.length).toEqual(1);
            expect(a.shift()).toEqual(3);
            expect(a.length).toEqual(0);
            expect(a).toBeDefined();
        });
    });
});
