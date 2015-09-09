describe('Board4x4', function () {
    //var Board = require('../../lib/charlie/Board');
    var board;

    beforeEach(function () {
        board = new Board();
        board.setSize(4, 4);
    });

    it('시나리오 1 (단순 세로 방향 매치)', function () {
        board.setNewCells([2, 3, 4, 5, 6, 7, 8, 9, 2, 3, 4, 5, 1, 2, 3, 4]);

        expect(board.getTurn()).toEqual(0);
        expect(board.getStep()).toEqual(0);
        board.setEntireBoard([
            [0,1,0,0],
            [0,1,0,0],
            [0,1,0,0],
            [0,1,0,0],
        ]);
        expect(board.getTurn()).toEqual(0);
        expect(board.getStep()).toEqual(0);
        // #fillEmpties
        expect(board.nextStep()).toEqual([
            [3,1,4,5],
            [8,1,9,2],
            [5,1,6,7],
            [2,1,3,4],
        ]);
        expect(board.getTurn()).toEqual(0);
        expect(board.getStep()).toEqual(1);
        // #removeMatches
        expect(board.nextStep()).toEqual([
            [3,0,4,5],
            [8,0,9,2],
            [5,0,6,7],
            [2,0,3,4],
        ]);
        expect(board.getTurn()).toEqual(0);
        expect(board.getStep()).toEqual(2);
        // #fillEmpties
        expect(board.nextStep()).toEqual([
            [3,4,4,5],
            [8,3,9,2],
            [5,2,6,7],
            [2,1,3,4],
        ]);
        expect(board.getTurn()).toEqual(0);
        expect(board.getStep()).toEqual(3);
        // 더 바뀔 것 없음
        expect(board.nextStep()).toEqual(null);
        expect(board.getTurn()).toEqual(1);
        expect(board.getStep()).toEqual(0);
    });

    it('시나리오 2 (단순 가로 방향 매치)', function () {
        board.setNewCells([2, 3, 4, 5, 6, 7, 8, 9, 2, 3, 4, 5, 1, 2, 3, 4]);

        expect(board.getTurn()).toEqual(0);
        expect(board.getStep()).toEqual(0);
        board.setEntireBoard([
            [0,0,0,0],
            [0,0,0,0],
            [0,0,0,0],
            [1,1,1,1],
        ]);
        expect(board.getTurn()).toEqual(0);
        expect(board.getStep()).toEqual(0);
        // #fillEmpties
        expect(board.nextStep()).toEqual([
            [2,3,4,5],
            [6,7,8,9],
            [2,3,4,5],
            [1,1,1,1],
        ]);
        expect(board.getTurn()).toEqual(0);
        expect(board.getStep()).toEqual(1);
        // #removeMatches
        expect(board.nextStep()).toEqual([
            [2,3,4,5],
            [6,7,8,9],
            [2,3,4,5],
            [0,0,0,0],
        ]);
        expect(board.getTurn()).toEqual(0);
        expect(board.getStep()).toEqual(2);
        // #collapse
        expect(board.nextStep()).toEqual([
            [0,0,0,0],
            [2,3,4,5],
            [6,7,8,9],
            [2,3,4,5],
        ]);
        expect(board.getTurn()).toEqual(0);
        expect(board.getStep()).toEqual(3);
        // #fillEmpties
        expect(board.nextStep()).toEqual([
            [1,2,3,4],
            [2,3,4,5],
            [6,7,8,9],
            [2,3,4,5],
        ]);
        expect(board.getTurn()).toEqual(0);
        expect(board.getStep()).toEqual(4);
        // 더 바뀔 것 없음
        expect(board.nextStep()).toEqual(null);
        expect(board.getTurn()).toEqual(1);
        expect(board.getStep()).toEqual(0);
    });

    it('시나리오 3 (가로 3칸짜리, 세로 4칸짜리 매치 후 턴 진행, 그 다음 move 후 3칸짜리 세로 매치)', function () {
        board.setNewCells([1, 2, 3, 4, 5, 6, 7, 5, 9, 1, 2, 3, 4, 5, 6, 7, 1, 2, 3]);

        expect(board.getTurn()).toEqual(0);
        expect(board.getStep()).toEqual(0);
        board.setEntireBoard([
            [2,3,2,2],
            [2,1,1,1],
            [2,3,2,2],
            [2,3,2,2],
        ]);
        expect(board.getTurn()).toEqual(0);
        expect(board.getStep()).toEqual(0);
        // #removeMatches
        expect(board.nextStep()).toEqual([
            [0,3,2,2],
            [0,0,0,0],
            [0,3,2,2],
            [0,3,2,2],
        ]);
        expect(board.getTurn()).toEqual(0);
        expect(board.getStep()).toEqual(1);
        // #collapse
        expect(board.nextStep()).toEqual([
            [0,0,0,0],
            [0,3,2,2],
            [0,3,2,2],
            [0,3,2,2],
        ]);
        expect(board.getTurn()).toEqual(0);
        expect(board.getStep()).toEqual(2);
        // #fillEmpties
        expect(board.nextStep()).toEqual([
            [4,5,6,7],
            [3,3,2,2],
            [2,3,2,2],
            [1,3,2,2],
        ]);
        expect(board.getTurn()).toEqual(0);
        expect(board.getStep()).toEqual(3);
        // #removeMatches
        expect(board.nextStep()).toEqual([
            [4,5,6,7],
            [3,0,0,0],
            [2,0,0,0],
            [1,0,0,0],
        ]);
        expect(board.getTurn()).toEqual(0);
        expect(board.getStep()).toEqual(4);
        // #collapse
        expect(board.nextStep()).toEqual([
            [4,0,0,0],
            [3,0,0,0],
            [2,0,0,0],
            [1,5,6,7],
        ]);
        expect(board.getTurn()).toEqual(0);
        expect(board.getStep()).toEqual(5);
        // #fillEmpties
        expect(board.nextStep()).toEqual([
            [4,5,6,7],
            [3,2,3,4],
            [2,5,9,1],
            [1,5,6,7],
        ]);
        expect(board.getTurn()).toEqual(0);
        expect(board.getStep()).toEqual(6);
        // 더 바뀔 것 없음 - 턴 진행
        expect(board.nextStep()).toEqual(null);
        expect(board.getTurn()).toEqual(1);
        expect(board.getStep()).toEqual(0);

        expect(board.move(1, 1, 1, 0)).toBeTruthy();
        // #move
        expect(board.nextStep()).toEqual([
            [4,2,6,7],
            [3,5,3,4],
            [2,5,9,1],
            [1,5,6,7],
        ]);
        expect(board.getTurn()).toEqual(1);
        expect(board.getStep()).toEqual(1);
        // #removeMatches
        expect(board.nextStep()).toEqual([
            [4,2,6,7],
            [3,0,3,4],
            [2,0,9,1],
            [1,0,6,7],
        ]);
        expect(board.getTurn()).toEqual(1);
        expect(board.getStep()).toEqual(2);
        // #collapse
        expect(board.nextStep()).toEqual([
            [4,0,6,7],
            [3,0,3,4],
            [2,0,9,1],
            [1,2,6,7],
        ]);
        expect(board.getTurn()).toEqual(1);
        expect(board.getStep()).toEqual(3);
        // #fillEmpties
        expect(board.nextStep()).toEqual([
            [4,3,6,7],
            [3,2,3,4],
            [2,1,9,1],
            [1,2,6,7],
        ]);
        expect(board.getTurn()).toEqual(1);
        expect(board.getStep()).toEqual(4);
    });
});
