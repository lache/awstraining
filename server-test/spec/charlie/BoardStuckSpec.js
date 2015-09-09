describe('BoardStuck', function () {
    //var Board = require('../../lib/charlie/Board');
    var board;

    beforeEach(function () {
        board = new Board();
    });

    it('#getPossibleMove - #getInsertingPossibleMove (기존 그룹의 중간에 끼워서 매칭되는 경우)', function () {
        board.setSize(3, 3);

        board.setEntireBoard([
            [0,1,0],
            [1,2,0],
            [0,1,0],
        ]);
        expect(board.getPossibleMove()).toEqual([0, 1, 1, 1]);

        board.setEntireBoard([
            [0,1,0],
            [0,2,1],
            [0,1,0],
        ]);
        expect(board.getPossibleMove()).toEqual([1, 1, 2, 1]);

        board.setEntireBoard([
            [0,1,0],
            [1,2,1],
            [0,0,0],
        ]);
        expect(board.getPossibleMove()).toEqual([1, 0, 1, 1]);

        board.setEntireBoard([
            [0,0,0],
            [1,2,1],
            [0,1,0],
        ]);
        expect(board.getPossibleMove()).toEqual([1, 1, 1, 2]);
    });

    it('#getPossibleMove - #getAppendingPossibleMove (기존 그룹의 끝에 위치시켜서 매칭되는 경우)', function () {
        board.setSize(6, 6);

        board.setEntireBoard([
            [0,0,0,0,0,0],
            [1,2,0,0,0,0],
            [0,1,0,0,0,0],
            [0,1,0,0,0,0],
            [0,0,0,0,0,0],
            [0,0,0,0,0,0],
        ]);
        expect(board.getPossibleMove()).toEqual([0, 1, 1, 1]);

        board.setEntireBoard([
            [0,1,0,0,0,0],
            [3,2,0,0,0,0],
            [0,1,0,0,0,0],
            [0,1,0,0,0,0],
            [0,0,0,0,0,0],
            [0,0,0,0,0,0],
        ]);
        expect(board.getPossibleMove()).toEqual([1, 0, 1, 1]);

        board.setEntireBoard([
            [0,0,0,0,0,0],
            [0,2,1,0,0,0],
            [0,1,0,0,0,0],
            [0,1,0,0,0,0],
            [0,0,0,0,0,0],
            [0,0,0,0,0,0],
        ]);
        expect(board.getPossibleMove()).toEqual([1, 1, 2, 1]);

        board.setEntireBoard([
            [0,0,0,0,0,0],
            [0,2,0,0,0,0],
            [0,1,0,0,0,0],
            [0,1,0,0,0,0],
            [1,2,0,0,0,0],
            [0,0,0,0,0,0],
        ]);
        expect(board.getPossibleMove()).toEqual([0, 4, 1, 4]);

        board.setEntireBoard([
            [0,0,0,0,0,0],
            [0,2,0,0,0,0],
            [0,1,0,0,0,0],
            [0,1,0,0,0,0],
            [3,2,0,0,0,0],
            [0,1,0,0,0,0],
        ]);
        expect(board.getPossibleMove()).toEqual([1, 4, 1, 5]);

        board.setEntireBoard([
            [0,0,0,0,0,0],
            [0,2,0,0,0,0],
            [0,1,0,0,0,0],
            [0,1,0,0,0,0],
            [3,2,1,0,0,0],
            [0,0,0,0,0,0],
        ]);
        expect(board.getPossibleMove()).toEqual([1, 4, 2, 4]);

        board.setEntireBoard([
            [0,0,0,0,0,0],
            [0,1,0,0,0,0],
            [3,2,1,1,0,0],
            [0,4,0,0,0,0],
            [1,2,0,0,0,0],
            [0,0,0,0,0,0],
        ]);
        expect(board.getPossibleMove()).toEqual([1, 1, 1, 2]);

        board.setEntireBoard([
            [0,0,0,0,0,0],
            [0,5,0,0,0,0],
            [1,2,1,1,0,0],
            [0,4,0,0,0,0],
            [1,2,0,0,0,0],
            [0,0,0,0,0,0],
        ]);
        expect(board.getPossibleMove()).toEqual([0, 2, 1, 2]);

        board.setEntireBoard([
            [0,0,0,0,0,0],
            [0,5,0,0,0,0],
            [6,2,1,1,0,0],
            [0,1,0,0,0,0],
            [1,2,0,0,0,0],
            [0,0,0,0,0,0],
        ]);
        expect(board.getPossibleMove()).toEqual([1, 2, 1, 3]);

        board.setEntireBoard([
            [0,0,0,0,0,0],
            [0,5,0,0,1,0],
            [5,2,1,1,2,0],
            [0,4,0,0,0,0],
            [1,2,0,0,0,0],
            [0,0,0,0,0,0],
        ]);
        expect(board.getPossibleMove()).toEqual([4, 1, 4, 2]);

        board.setEntireBoard([
            [0,0,0,0,0,0],
            [0,5,0,0,3,0],
            [5,2,1,1,2,1],
            [0,4,0,0,0,0],
            [1,2,0,0,0,0],
            [0,0,0,0,0,0],
        ]);
        expect(board.getPossibleMove()).toEqual([4, 2, 5, 2]);

        board.setEntireBoard([
            [0,0,0,0,0,0],
            [0,5,0,0,0,0],
            [5,2,1,1,2,0],
            [0,4,0,0,1,0],
            [1,2,0,0,0,0],
            [0,0,0,0,0,0],
        ]);
        expect(board.getPossibleMove()).toEqual([4, 2, 4, 3]);


    });

    it('#isStuck', function () {
        board.setSize(3, 3);
        board.setEntireBoard([
            [1,2,3],
            [4,5,6],
            [7,8,9],
        ]);
        expect(board.isStuck()).toBeTruthy();
    });

    it('#isStuck', function () {
        board.setSize(3, 3);
        board.setEntireBoard([
            [1,1,2],
            [1,1,2],
            [2,3,4],
        ]);
        expect(board.isStuck()).toBeTruthy();
    });

    it('#isStuck', function () {
        board.setSize(3, 3);
        board.setEntireBoard([
            [1,1,2],
            [1,1,2],
            [2,2,3],
        ]);
        expect(board.isStuck()).toBeFalsy();
    });
});
