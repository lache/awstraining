describe('BoardRelaxPatternException', function () {
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

    it('#getRelaxPattern - 예외 던지는 경우', function () {
        expect(function () { board.getRelaxPattern('appending', 5, 3, 'left', 'right'); }).toThrow(new Error('Argument combination error'));
        expect(function () { board.getRelaxPattern('appending', 5, 3, 'right', 'left'); }).toThrow(new Error('Argument combination error'));
        expect(function () { board.getRelaxPattern('appending', 5, 3, 'up', 'down'); }).toThrow(new Error('Argument combination error'));
        expect(function () { board.getRelaxPattern('appending', 5, 3, 'down', 'up'); }).toThrow(new Error('Argument combination error'));
        expect(function () { board.getRelaxPattern('appending', 5, 3, 'xxx', 'down'); }).toThrow(new Error('Unknown dir1'));
        expect(function () { board.getRelaxPattern('appending', 5, 3, 'down', 'yyy'); }).toThrow(new Error('Unknown dir2'));

        expect(function () { board.getRelaxPattern('inserting', 4, 4, 'xxx', 'up'  ); }).toThrow(new Error('Unknown dir1'));
        expect(function () { board.getRelaxPattern('inserting', 4, 4, 'horizontal', 'yyy'  ); }).toThrow(new Error('Unknown dir2'));
        expect(function () { board.getRelaxPattern('inserting', 4, 4, 'horizontal', 'left'  ); }).toThrow(new Error('Argument combination error'));
        expect(function () { board.getRelaxPattern('inserting', 4, 4, 'horizontal', 'right'); }).toThrow(new Error('Argument combination error'));
        expect(function () { board.getRelaxPattern('inserting', 4, 4, 'vertical', 'up'  ); }).toThrow(new Error('Argument combination error'));
        expect(function () { board.getRelaxPattern('inserting', 4, 4, 'vertical', 'down' ); }).toThrow(new Error('Argument combination error'));

        expect(function () { board.getRelaxPattern('zzz', 5, 3, 'left', 'right'); }).toThrow(new Error('Unknown type'));
    });

    it('#getRelaxPattern - appending', function () {
        expect(board.getRelaxPattern('appending', 5, 3, 'left',  'up'   )).toEqual([[5,3],[4,3],[3,2]]);
        expect(board.getRelaxPattern('appending', 5, 3, 'left',  'down' )).toEqual([[5,3],[4,3],[3,4]]);
        expect(board.getRelaxPattern('appending', 5, 3, 'left',  'left' )).toEqual([[5,3],[4,3],[2,3]]);

        expect(board.getRelaxPattern('appending', 5, 3, 'right', 'up'   )).toEqual([[5,3],[6,3],[7,2]]);
        expect(board.getRelaxPattern('appending', 5, 3, 'right', 'down' )).toEqual([[5,3],[6,3],[7,4]]);
        expect(board.getRelaxPattern('appending', 5, 3, 'right', 'right')).toEqual([[5,3],[6,3],[8,3]]);

        expect(board.getRelaxPattern('appending', 5, 3, 'up', 'left'    )).toEqual([[5,3],[5,2],[4,1]]);
        expect(board.getRelaxPattern('appending', 5, 3, 'up', 'right'   )).toEqual([[5,3],[5,2],[6,1]]);
        expect(board.getRelaxPattern('appending', 5, 3, 'up', 'up'      )).toEqual([[5,3],[5,2],[5,0]]);

        expect(board.getRelaxPattern('appending', 5, 3, 'down', 'left'  )).toEqual([[5,3],[5,4],[4,5]]);
        expect(board.getRelaxPattern('appending', 5, 3, 'down', 'right' )).toEqual([[5,3],[5,4],[6,5]]);
        expect(board.getRelaxPattern('appending', 5, 3, 'down', 'down'  )).toEqual([[5,3],[5,4],[5,6]]);
    });

    it('#getRelaxPattern - inserting', function () {
        expect(board.getRelaxPattern('inserting', 4, 4, 'horizontal', 'up'  )).toEqual([[3,4],[4,3],[5,4]]);
        expect(board.getRelaxPattern('inserting', 4, 4, 'horizontal', 'down')).toEqual([[3,4],[4,5],[5,4]]);

        expect(board.getRelaxPattern('inserting', 4, 4, 'vertical', 'left'  )).toEqual([[4,3],[3,4],[4,5]]);
        expect(board.getRelaxPattern('inserting', 4, 4, 'vertical', 'right' )).toEqual([[4,3],[5,4],[4,5]]);
    });
});
