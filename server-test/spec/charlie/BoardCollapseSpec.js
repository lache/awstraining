describe('BoardCollapse', function () {
    //var Board = require('../../lib/charlie/Board');
    var board;

    beforeEach(function () {
        board = new Board();
        board.setSize(3, 3);
    });

    it('시나리오 1 (가운데 빈칸 하나)', function () {
        board.setEntireBoard([
            [1,2,3],
            [4,0,6],
            [7,8,9],
        ]);
        expect(board.collapse()).toBeTruthy();
        expect(board.getEntireBoard()).toEqual([
            [1,0,3],
            [4,2,6],
            [7,8,9],
        ]);
    });

    it('시나리오 2 (빈칸은 있으나 변화가 없는 경우)', function () {
        board.setEntireBoard([
            [1,0,3],
            [4,0,6],
            [7,8,9],
        ]);
        expect(board.collapse()).toBeFalsy();
        expect(board.getEntireBoard()).toEqual([
            [1,0,3],
            [4,0,6],
            [7,8,9],
        ]);
    });

    it('시나리오 3 (맨 아랫줄에 빈칸 하나)', function () {
        board.setEntireBoard([
            [1,2,3],
            [4,5,6],
            [7,8,0],
        ]);
        expect(board.collapse()).toBeTruthy();
        expect(board.getEntireBoard()).toEqual([
            [1,2,0],
            [4,5,3],
            [7,8,6],
        ]);
    });

    it('시나리오 4 (맨 아랫줄에 빈칸 두 개)', function () {
        board.setEntireBoard([
            [1,2,3],
            [4,5,6],
            [0,8,0],
        ]);
        expect(board.collapse()).toBeTruthy();
        expect(board.getEntireBoard()).toEqual([
            [0,2,0],
            [1,5,3],
            [4,8,6],
        ]);
    });

    it('시나리오 5 (중간에 빈칸 세 개)', function () {
        board.setEntireBoard([
            [1,2,3],
            [0,0,0],
            [7,8,9],
        ]);
        expect(board.collapse()).toBeTruthy();
        expect(board.getEntireBoard()).toEqual([
            [0,0,0],
            [1,2,3],
            [7,8,9],
        ]);
    });

    it('시나리오 6 (맨 아랫줄 빈칸 세 개)', function () {
        board.setEntireBoard([
            [1,2,3],
            [4,5,6],
            [0,0,0],
        ]);
        expect(board.collapse()).toBeTruthy();
        expect(board.getEntireBoard()).toEqual([
            [0,0,0],
            [1,2,3],
            [4,5,6],
        ]);
    });

    it('시나리오 7 (맨 윗줄과 맨 아랫줄이 모두 빈칸)', function () {
        board.setEntireBoard([
            [0,0,0],
            [4,5,6],
            [0,0,0],
        ]);
        expect(board.collapse()).toBeTruthy();
        expect(board.getEntireBoard()).toEqual([
            [0,0,0],
            [0,0,0],
            [4,5,6],
        ]);
    });

    it('시나리오 8 (대각선으로 빈칸)', function () {
        board.setEntireBoard([
            [0,2,3],
            [4,0,6],
            [7,8,0],
        ]);
        expect(board.collapse()).toBeTruthy();
        expect(board.getEntireBoard()).toEqual([
            [0,0,0],
            [4,2,3],
            [7,8,6],
        ]);
    });

    it('시나리오 9 (두 개 빼고 모두 빈칸)', function () {
        board.setEntireBoard([
            [0,0,3],
            [4,0,0],
            [0,0,0],
        ]);
        expect(board.collapse()).toBeTruthy();
        expect(board.getEntireBoard()).toEqual([
            [0,0,0],
            [0,0,0],
            [4,0,3],
        ]);
    });

    it('시나리오 10 (모두 빈칸) - 변화 없음', function () {
        board.setEntireBoard([
            [0,0,0],
            [0,0,0],
            [0,0,0],
        ]);
        expect(board.collapse()).toBeFalsy();
        expect(board.getEntireBoard()).toEqual([
            [0,0,0],
            [0,0,0],
            [0,0,0],
        ]);
    });

    it('시나리오 11 (ㄱ 자 모양으로 빈칸 - 변화 없음)', function () {
        board.setEntireBoard([
            [0,0,0],
            [4,5,0],
            [7,8,0],
        ]);
        expect(board.collapse()).toBeFalsy();
        expect(board.getEntireBoard()).toEqual([
            [0,0,0],
            [4,5,0],
            [7,8,0],
        ]);
    });

    it('시나리오 12 (ㄱ 자 모양으로 빈칸 - 변화 있음)', function () {
        board.setEntireBoard([
            [1,2,3],
            [0,0,6],
            [7,0,9],
        ]);
        expect(board.collapse()).toBeTruthy();
        expect(board.getEntireBoard()).toEqual([
            [0,0,3],
            [1,0,6],
            [7,2,9],
        ]);
    });

    it('시나리오 13 (변화 없음)', function () {
        board.setEntireBoard([
            [0,2,3],
            [0,5,6],
            [0,8,9],
        ]);
        expect(board.collapse()).toBeFalsy();
        expect(board.getEntireBoard()).toEqual([
            [0,2,3],
            [0,5,6],
            [0,8,9],
        ]);
    });

    it('시나리오 14 (변화 없음)', function () {
        board.setEntireBoard([
            [0,0,0],
            [0,5,0],
            [0,8,9],
        ]);
        expect(board.collapse()).toBeFalsy();
        expect(board.getEntireBoard()).toEqual([
            [0,0,0],
            [0,5,0],
            [0,8,9],
        ]);
    });
});
