describe('BoardRelax', function () {
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

    it('#getFlattenedCells', function () {
        expect(board.getFlattenedCells()).toEqual([3,1,4,2,3,2,1,1,2]);
        expect(board.getEntireBoard()).toEqual([
            [1,1,2],
            [2,3,2],
            [3,1,4],
        ]);
    });

    it('#removeFirst3', function () {
        var a = [1,2,5,3,2,2,5,2];
        expect(board.removeFirst3(a, 2)).toBeTruthy()
        expect(a).toEqual([1,5,3,5,2]);
    })

    it('#removeAllCells', function () {
        board.removeAllCells();
        expect(board.getEntireBoard()).toEqual([
            [0,0,0],
            [0,0,0],
            [0,0,0],
        ]);
    })

    it('#getCellCount', function () {
        expect(board.getCellCount(0)).toEqual(0);
        expect(board.getCellCount(1)).toEqual(3);
        expect(board.getCellCount(2)).toEqual(3);
        expect(board.getCellCount(3)).toEqual(2);
        expect(board.getCellCount(4)).toEqual(1);
    });

    it('배열 두 개 붙이는 작업 테스트 - Array.push.apply', function () {
        var a1 = [1,2,3];
        var a2 = [4,5,6];
        a1.extend(a2);
        expect(a1).toEqual([1,2,3,4,5,6]);
    });

    it('해시테이블에 존재하지 않는 키 조회했을 때 반환되는 것은 undefined', function () {
        var dirMap = {
            left: [-1,0], right: [1,0], up: [0,-1], down: [0,1]
        };
        expect(dirMap['left']).toEqual([-1,0]);
        expect(dirMap['xxx']).not.toBeDefined();
    });

    it('#relaxWithPattern 예외', function () {
        expect(function () {
            board.relaxWithPattern(3, [[0,0],[1,0],[2,1]]);
        }).toThrow(new Error('Not enough match'));
    });
});
