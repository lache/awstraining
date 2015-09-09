describe('BoardRandomRelaxSpec', function () {
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

    it('#getDistribution', function () {
        expect(board.getDistribution()).toEqual({
            1: 3,
            2: 3,
            3: 2,
            4: 1
        });
    });

    it('#getRelaxCandidates', function () {
        expect(board.getRelaxCandidates()).toEqual([
            1, 2
        ]);
    });

    it('#getRelaxPatternCandidiates', function () {
        expect(board.getRelaxPatternCandidiates(0, 0)).toEqual([
            [[0,0],[1,0],[2,1]], // appending-right-down
            [[0,0],[0,1],[1,2]], // appending-down-right
        ]);

        expect(board.getRelaxPatternCandidiates(1, 0)).toEqual([
            [[1,0],[1,1],[0,2]], // appending-down-left
            [[1,0],[1,1],[2,2]], // appending-down-right
            [[0,0],[1,1],[2,0]], // inserting-horizontal-down
        ]);

        expect(board.getRelaxPatternCandidiates(2, 0)).toEqual([
            [[2,0],[1,0],[0,1]], // appending-left-down
            [[2,0],[2,1],[1,2]], // appending-down-left
        ]);

        expect(board.getRelaxPatternCandidiates(0, 1)).toEqual([
            [[0,1],[1,1],[2,0]], // appending-right-up
            [[0,1],[1,1],[2,2]], // appending-right-down
            [[0,0],[1,1],[0,2]], // inserting-vertical-right
        ]);

        expect(board.getRelaxPatternCandidiates(1, 1)).toEqual([
            [[0,1],[1,0],[2,1]], // inserting-horizontal-up
            [[0,1],[1,2],[2,1]], // inserting-horizontal-down
            [[1,0],[0,1],[1,2]], // inserting-vertical-left
            [[1,0],[2,1],[1,2]], // inserting-horizontal-right
        ]);

        expect(board.getRelaxPatternCandidiates(2, 1)).toEqual([
            [[2,1],[1,1],[0,0]], // appending-left-up
            [[2,1],[1,1],[0,2]], // appending-left-down
            [[2,0],[1,1],[2,2]], // inserting-vertical-left
        ]);

        expect(board.getRelaxPatternCandidiates(0, 2)).toEqual([
            [[0,2],[1,2],[2,1]], // appending-right-up
            [[0,2],[0,1],[1,0]], // appending-up-right
        ]);

        expect(board.getRelaxPatternCandidiates(1, 2)).toEqual([
            [[1,2],[1,1],[0,0]], // appending-up-left
            [[1,2],[1,1],[2,0]], // appending-up-right
            [[0,2],[1,1],[2,2]], // inserting-horizontal-up
        ]);

        expect(board.getRelaxPatternCandidiates(2, 2)).toEqual([
            [[2,2],[1,2],[0,1]], // appending-left-up
            [[2,2],[2,1],[1,0]], // appending-up-left
        ]);
    });

    function clone(obj) {
        var copy;

        // Handle the 3 simple types, and null or undefined
        if (null == obj || "object" != typeof obj) return obj;

        // Handle Date
        if (obj instanceof Date) {
            copy = new Date();
            copy.setTime(obj.getTime());
            return copy;
        }

        // Handle Array
        if (obj instanceof Array) {
            copy = [];
            for (var i = 0, len = obj.length; i < len; i++) {
                copy[i] = clone(obj[i]);
            }
            return copy;
        }

        // Handle Object
        if (obj instanceof Object) {
            copy = {};
            for (var attr in obj) {
                if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
            }
            return copy;
        }

        throw new Error("Unable to copy obj! Its type isn't supported.");
    }

    it('#randomRelax', function () {
        var beforeDist = board.getDistribution();
        var beforeBoard = clone(board.getEntireBoard());
        board.randomRelax();
        expect(board.getDistribution()).toEqual(beforeDist);
        expect(board.isStuck()).toBeFalsy();
        expect(board.getEntireBoard()).not.toEqual(beforeBoard);
    });

    it('#randomRelax 예외', function () {
        board.setEntireBoard([
            [1,1,2],
            [2,3,3],
            [4,4,5],
        ]);
        expect(function () {
            board.randomRelax();
        }).toThrow(new Error('Dead board'));
    })
});
