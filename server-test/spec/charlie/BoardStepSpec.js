describe('BoardStep', function () {
    //var Board = require('../../lib/charlie/Board');
    var board;

    beforeEach(function () {
        board = new Board();
        board.setSize(3, 3);
    });

    it('시나리오 1 (단순 세로 방향 매치)', function () {
        board.setNewCells([ 7, 8, 9 ]);
        board.setEntireBoard([
            [1,1,2],
            [2,1,2],
            [2,2,3], // 2->3으로 이동하는 시나리오
        ]);
        expect(board.getTurn()).toEqual(0);
        expect(board.getStep()).toEqual(0);

        expect(board.move(1, 2, 2, 2)).toBeTruthy();
        expect(board.getTurn()).toEqual(0);
        expect(board.getStep()).toEqual(0);
        // 오른쪽 컬럼 세로 매치 상태 성립
        expect(board.nextStep()).toEqual([
            [1,1,2],
            [2,1,2],
            [2,3,2],
        ]);
        expect(board.getTurn()).toEqual(0);
        expect(board.getStep()).toEqual(1);
        // 매치 상태 된 것은 삭제
        expect(board.nextStep()).toEqual([
            [1,1,0],
            [2,1,0],
            [2,3,0],
        ]);
        expect(board.getTurn()).toEqual(0);
        expect(board.getStep()).toEqual(2);
        // 빈 칸은 채워짐
        expect(board.nextStep()).toEqual([
            [1,1,9],
            [2,1,8],
            [2,3,7],
        ]);
        expect(board.getTurn()).toEqual(0);
        expect(board.getStep()).toEqual(3);
        // 더 바뀔 것 없음
        expect(board.nextStep()).toEqual(null);
        expect(board.getTurn()).toEqual(1);
        expect(board.getStep()).toEqual(0);
    });

    it('시나리오 2 (단순 가로 방향 매치)', function () {
        expect(board.getTurn()).toEqual(0);
        expect(board.getStep()).toEqual(0);
        board.setNewCells([ 7, 8, 9 ]);
        board.setEntireBoard([
            [1,1,2],
            [2,1,2], // 가운데 1과 그 아래 2를 바꿈
            [2,2,3],
        ]);
        expect(board.move(1, 1, 1, 2)).toBeTruthy();
        expect(board.getTurn()).toEqual(0);
        expect(board.getStep()).toEqual(0);
        // 가운데 줄 가로 매치 상태 성립
        expect(board.nextStep()).toEqual([
            [1,1,2],
            [2,2,2], // <--
            [2,1,3],
        ]);
        expect(board.getTurn()).toEqual(0);
        expect(board.getStep()).toEqual(1);
        // 매치 상태 된 것은 삭제
        expect(board.nextStep()).toEqual([
            [1,1,2],
            [0,0,0], // <--
            [2,1,3],
        ]);
        expect(board.getTurn()).toEqual(0);
        expect(board.getStep()).toEqual(2);
        // 무너짐 (collapse)
        expect(board.nextStep()).toEqual([
            [0,0,0],
            [1,1,2],
            [2,1,3],
        ]);
        expect(board.getTurn()).toEqual(0);
        expect(board.getStep()).toEqual(3);
        // 채워짐 (fillEmpties)
        expect(board.nextStep()).toEqual([
            [7,8,9],
            [1,1,2],
            [2,1,3],
        ]);
        expect(board.getTurn()).toEqual(0);
        expect(board.getStep()).toEqual(4);
        // 더 바뀔 것 없음
        expect(board.nextStep()).toEqual(null);
        expect(board.getTurn()).toEqual(1);
        expect(board.getStep()).toEqual(0);
    });

    it('시나리오 3 (단순 가로 방향 매치 두 쌍 동시에)', function () {
        expect(board.getTurn()).toEqual(0);
        expect(board.getStep()).toEqual(0);
        board.setNewCells([ 1, 2, 3, 4, 5, 6, 7, 8, 9 ]);
        board.setEntireBoard([
            [0,0,0],
            [1,2,1],
            [2,1,2],
        ]);
        expect(board.move(1, 1, 1, 2)).toBeTruthy();
        expect(board.getTurn()).toEqual(0);
        expect(board.getStep()).toEqual(0);
        // 가운데 줄 가로 매치 상태 성립
        expect(board.nextStep()).toEqual([
            [0,0,0],
            [1,1,1],
            [2,2,2],
        ]);
        expect(board.getTurn()).toEqual(0);
        expect(board.getStep()).toEqual(1);
        // #fillEmpties
        expect(board.nextStep()).toEqual([
            [1,2,3],
            [1,1,1],
            [2,2,2],
        ]);
        expect(board.getTurn()).toEqual(0);
        expect(board.getStep()).toEqual(2);
        // #removeMatches
        expect(board.nextStep()).toEqual([
            [1,2,3],
            [0,0,0],
            [0,0,0],
        ]);
        expect(board.getTurn()).toEqual(0);
        expect(board.getStep()).toEqual(3);
        // #collapse
        expect(board.nextStep()).toEqual([
            [0,0,0],
            [0,0,0],
            [1,2,3],
        ]);
        expect(board.getTurn()).toEqual(0);
        expect(board.getStep()).toEqual(4);
        // #fillEmpties
        expect(board.nextStep()).toEqual([
            [7,8,9],
            [4,5,6],
            [1,2,3],
        ]);
        expect(board.getTurn()).toEqual(0);
        expect(board.getStep()).toEqual(5);
        // 더 바뀔 것 없음
        expect(board.nextStep()).toEqual(null);
        expect(board.getTurn()).toEqual(1);
        expect(board.getStep()).toEqual(0);
    });

    it('시나리오 4 (단순 세로 방향 매치 두 쌍 동시에)', function () {
        expect(board.getTurn()).toEqual(0);
        expect(board.getStep()).toEqual(0);
        board.setNewCells([ 1, 2, 3, 4, 5, 6, 7, 8, 9 ]);
        board.setEntireBoard([
            [1,2,0],
            [2,1,0],
            [1,2,0],
        ]);
        expect(board.move(0, 1, 1, 1)).toBeTruthy();
        expect(board.getTurn()).toEqual(0);
        expect(board.getStep()).toEqual(0);
        // 가운데 줄 가로 매치 상태 성립
        expect(board.nextStep()).toEqual([
            [1,2,0],
            [1,2,0],
            [1,2,0],
        ]);
        expect(board.getTurn()).toEqual(0);
        expect(board.getStep()).toEqual(1);
        // #fillEmpties
        expect(board.nextStep()).toEqual([
            [1,2,3],
            [1,2,2],
            [1,2,1],
        ]);
        expect(board.getTurn()).toEqual(0);
        expect(board.getStep()).toEqual(2);
        // #removeMatches
        expect(board.nextStep()).toEqual([
            [0,0,3],
            [0,0,2],
            [0,0,1],
        ]);
        expect(board.getTurn()).toEqual(0);
        expect(board.getStep()).toEqual(3);
        // #fillEmpties
        expect(board.nextStep()).toEqual([
            [8,9,3],
            [6,7,2],
            [4,5,1],
        ]);
        expect(board.getTurn()).toEqual(0);
        expect(board.getStep()).toEqual(4);
        // 더 바뀔 것 없음
        expect(board.nextStep()).toEqual(null);
        expect(board.getTurn()).toEqual(1);
        expect(board.getStep()).toEqual(0);
    });

    it('시나리오 5 (연속 매치 - 세로, 가로 순)', function () {
        expect(board.getTurn()).toEqual(0);
        expect(board.getStep()).toEqual(0);
        board.setNewCells([ 2, 1, 3, 7, 8, 9 ]);
        board.setEntireBoard([
            [1,1,2],
            [1,1,2],
            [2,2,3], // 2->3
        ]);
        expect(board.move(1, 2, 2, 2)).toBeTruthy();
        expect(board.getTurn()).toEqual(0);
        expect(board.getStep()).toEqual(0);
        // 가운데 줄 가로 매치 상태 성립
        expect(board.nextStep()).toEqual([
            [1,1,2],
            [1,1,2],
            [2,3,2],
        ]);
        expect(board.getTurn()).toEqual(0);
        expect(board.getStep()).toEqual(1);
        // #removeMatches
        expect(board.nextStep()).toEqual([
            [1,1,0],
            [1,1,0],
            [2,3,0],
        ]);
        expect(board.getTurn()).toEqual(0);
        expect(board.getStep()).toEqual(2);
        // #fillEmpties
        expect(board.nextStep()).toEqual([
            [1,1,3],
            [1,1,1],
            [2,3,2],
        ]);
        expect(board.getTurn()).toEqual(0);
        expect(board.getStep()).toEqual(3);
        // #removeMatches
        expect(board.nextStep()).toEqual([
            [1,1,3],
            [0,0,0],
            [2,3,2],
        ]);
        expect(board.getTurn()).toEqual(0);
        expect(board.getStep()).toEqual(4);
        // #collapse
        expect(board.nextStep()).toEqual([
            [0,0,0],
            [1,1,3],
            [2,3,2],
        ]);
        expect(board.getTurn()).toEqual(0);
        expect(board.getStep()).toEqual(5);
        // #fillEmpties
        expect(board.nextStep()).toEqual([
            [7,8,9],
            [1,1,3],
            [2,3,2],
        ]);
        expect(board.getTurn()).toEqual(0);
        expect(board.getStep()).toEqual(6);
        // 더 바뀔 것 없음
        expect(board.nextStep()).toEqual(null);
        expect(board.getTurn()).toEqual(1);
        expect(board.getStep()).toEqual(0);
    });
});
