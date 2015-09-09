describe('BoardInit', function () {
    //var Board = require('../../lib/charlie/Board');
    var board;

    beforeEach(function () {
        board = new Board();
    });

    it('#setSize로 초기화됐을 떄의 상태를 확인', function () {
        board.setSize(3, 4);
        expect(board.getWidth()).toEqual(3);
        expect(board.getHeight()).toEqual(4);
        expect(board.getTurn()).toEqual(0);
        expect(board.getStep()).toEqual(0);
        expect(board.getEntireBoard()).toBeNull();
        expect(board.getNewCells()).toEqual([]);
        expect(board.getPendingMove()).toBeNull();
    });

    it('#setBoard', function () {
        board.setSize(3, 4);
        board.setEntireBoard([
            [0,0,0],
            [0,0,0],
            [0,0,0],
            [0,0,0],
        ]);
        board.setBoard(0, 0, 1);
        expect(board.getBoard(0, 0)).toEqual(1);
        expect(function () { board.setBoard(3, 0, 1); }).toThrow(new Error('Out of bounds'));
    });

    it('크기 지정이 되어야 한다.', function () {
        var w = 7;
        var h = 7;
        board.setSize(w, h);
        expect(board.getWidth()).toEqual(w);
        expect(board.getHeight()).toEqual(h);
    });

    it('크기 지정 조건에 맞아야 한다.', function () {
        expect(board.setSize(3, 3)).toBeTruthy();
        expect(board.setSize(4, 3)).toBeTruthy();
        expect(board.setSize(10, 10)).toBeTruthy();
        expect(board.setSize(2, 3)).toBeTruthy();

        expect(function () {
            board.setSize(2, 2);
        }).toThrow(new Error('Too small'));
        expect(function () {
            board.setSize(0, 3);
        }).toThrow(new Error('Size error'));
        expect(function () {
            board.setSize(7, -6);
        }).toThrow(new Error('Size error'));
        expect(function () {
            board.setSize(-7, 5);
        }).toThrow(new Error('Size error'));
        expect(function () {
            board.setSize(10, 11);
        }).toThrow(new Error('Too large'));
        expect(function () {
            board.setSize(11, 10);
        }).toThrow(new Error('Too large'));
    });

    it('보드 생성 직후 턴은 0이어야 한다.', function () {
        var w = 7;
        var h = 7;
        board.setSize(w, h);
        expect(board.getTurn()).toEqual(0);
    });

    it('#setEntireBoard - 크기에 맞지 않는 보드가 설정되면 안된다.', function () {
        expect(board.setSize(3, 3)).toBeTruthy();
        expect(board.setEntireBoard([
            [0,0,0],
            [0,0,0],
            [0,0,0],
        ])).toBeTruthy();
        expect(board.setEntireBoard([
            [0,0,0],
            [0,0,0],
        ])).toBeFalsy();
        expect(board.setEntireBoard([
            [0,0,0],
            [0,0],
        ])).toBeFalsy();
        expect(board.setEntireBoard([
            [0,0,0],
            [0,0,0],
            [0,0,0],
            [0,0,0],
        ])).toBeFalsy();
        expect(board.setEntireBoard([
            [0,0,0],
            [0,0,0],
            [0,0],
        ])).toBeFalsy();
        expect(board.setEntireBoard(null)).toBeFalsy();
        expect(board.setEntireBoard(undefined)).toBeFalsy();
        expect(board.setEntireBoard(null)).toBeFalsy();
    });

    describe('초기 설정이 된 후의 테스트', function () {
        beforeEach(function () {
            board.setSize(3, 3);
            board.setEntireBoard([
                [1,1,2],
                [1,1,2],
                [2,2,3],
            ]);
        });

        it('초기 보드 설정이 되어야 한다.', function () {
            expect(board.getBoard(0, 0)).toEqual(1);
            expect(board.getBoard(1, 0)).toEqual(1);
            expect(board.getBoard(2, 0)).toEqual(2);
            expect(board.getBoard(0, 1)).toEqual(1);
            expect(board.getBoard(1, 1)).toEqual(1);
            expect(board.getBoard(2, 1)).toEqual(2);
            expect(board.getBoard(0, 2)).toEqual(2);
            expect(board.getBoard(1, 2)).toEqual(2);
            expect(board.getBoard(2, 2)).toEqual(3);
        });

        it('보드 범위 밖의 값을 요청했을 때는 undefined다.', function () {
            expect(board.getBoard(-1, 0)).not.toBeDefined();
            expect(board.getBoard(3, 0)).not.toBeDefined();
            expect(board.getBoard(2, -1)).not.toBeDefined();
            expect(board.getBoard(0, 3)).not.toBeDefined();
        });

        it('초기 보드 설정이 잘 되어야 한다. (#getEntireBoard)', function () {
            expect(board.getEntireBoard()).toEqual([
                [1,1,2],
                [1,1,2],
                [2,2,3],
            ]);
        });

        it('0과 null은 비어있는 칸을 뜻한다.', function () {
            expect(null).toBeDefined();
            expect(undefined).not.toBeDefined();
            //expect(null).not.toEqual(undefined);
            expect(null === undefined).toBeFalsy();

            board.setEntireBoard([
                [1,1,2],
                [1,0,2],
                [2,2,null],
            ]);
            expect(board.isEmpty(0, 0)).toBeFalsy();
            expect(board.isEmpty(1, 0)).toBeFalsy();
            expect(board.isEmpty(2, 0)).toBeFalsy();
            expect(board.isEmpty(0, 1)).toBeFalsy();
            expect(board.isEmpty(1, 1)).toBeTruthy(); // <---
            expect(board.isEmpty(2, 1)).toBeFalsy();
            expect(board.isEmpty(0, 2)).toBeFalsy();
            expect(board.isEmpty(1, 2)).toBeFalsy();
            expect(board.getBoard(2, 2)).toBeNull();
            expect(board.isEmpty(2, 2)).toBeTruthy(); // <---

            expect(function () {
                board.isEmpty(-1, 0);
            }).toThrow(new Error('Argument error'));
        });
    });
});
