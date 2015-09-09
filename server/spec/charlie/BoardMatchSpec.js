describe('BoardMatch', function () {
    //var Board = require('../../lib/charlie/Board');
    var board;

    beforeEach(function () {
        board = new Board();
        board.setSize(3, 3);
    });

    it('#getSameLengthWidth', function () {
        board.setEntireBoard([
            [1,1,1],
            [0,0,0],
            [0,0,0],
        ]);
        expect(board.getSameLengthWidth(0, 0)).toEqual({left: 0, right: 2});
        expect(board.getSameLengthWidth(1, 0)).toEqual({left: 1, right: 1});
        expect(board.getSameLengthWidth(2, 0)).toEqual({left: 2, right: 0});
        expect(board.getSameLengthWidth(1, 1)).toEqual({left: 0, right: 0});
    });

    it('#getSameLengthHeight', function () {
        board.setEntireBoard([
            [0,1,0],
            [0,1,0],
            [0,1,0],
        ]);
        expect(board.getSameLengthHeight(0, 0)).toEqual({top: 0, bottom: 0});
        expect(board.getSameLengthHeight(1, 0)).toEqual({top: 0, bottom: 2});
        expect(board.getSameLengthHeight(1, 1)).toEqual({top: 1, bottom: 1});
        expect(board.getSameLengthHeight(1, 2)).toEqual({top: 2, bottom: 0});
    });

    it('#getMatches', function () {
        board.setEntireBoard([
            [1,1,1],
            [4,5,6],
            [7,8,9],
        ]);
        var matches = {}
        matches[[0,0]] = [0,0];
        matches[[1,0]] = [1,0];
        matches[[2,0]] = [2,0];
        expect(board.getMatches()).toEqual(matches);

        board.setEntireBoard([
            [1,2,3],
            [4,2,6],
            [7,2,9],
        ]);
        var matches = {}
        matches[[1,0]] = [1,0];
        matches[[1,1]] = [1,1];
        matches[[1,2]] = [1,2];
        expect(board.getMatches()).toEqual(matches);
    });

    var simpleMatcher = function(before, after, removeCellCount) {
        board.setEntireBoard(before);
        expect(board.removeMatches()).toEqual(removeCellCount);
        expect(board.getEntireBoard()).toEqual(after);
    };

    it('시나리오 1 (매치 없음)', function () {
        simpleMatcher([
            [1,2,3],
            [4,5,6],
            [7,8,9],
        ], [
            [1,2,3],
            [4,5,6],
            [7,8,9],
        ], 0);
    });

    it('시나리오 2 (가로 단순 매치)', function () {
        simpleMatcher([
            [1,1,1],
            [4,5,6],
            [7,8,9],
        ], [
            [0,0,0],
            [4,5,6],
            [7,8,9],
        ], 3);
    });

    it('시나리오 3 (세로 단순 매치)', function () {
        simpleMatcher([
            [1,2,3],
            [4,2,6],
            [7,2,9],
        ], [
            [1,0,3],
            [4,0,6],
            [7,0,9],
        ], 3);
    });

    it('시나리오 4 (가로 두 쌍 단순 매치)', function () {
        simpleMatcher([
            [1,1,1],
            [4,5,6],
            [1,1,1],
        ], [
            [0,0,0],
            [4,5,6],
            [0,0,0],
        ], 6);
    });

    it('시나리오 5 (세로 두 쌍 단순 매치)', function () {
        simpleMatcher([
            [1,1,3],
            [1,1,6],
            [1,1,9],
        ], [
            [0,0,3],
            [0,0,6],
            [0,0,9],
        ], 6);
    });

    it('시나리오 6 (ㄱ자 매치 테스트)', function () {
        simpleMatcher([
            [1,1,1],
            [2,2,1],
            [2,2,1],
        ], [
            [0,0,0],
            [2,2,0],
            [2,2,0],
        ], 5);
    });

    it('시나리오 7 (L자 매치 테스트)', function () {
        simpleMatcher([
            [1,2,2],
            [1,2,2],
            [1,1,1],
        ], [
            [0,2,2],
            [0,2,2],
            [0,0,0],
        ], 5);
    });

    it('시나리오 8 (T자 매치 테스트)', function () {
        simpleMatcher([
            [1,1,1],
            [2,1,2],
            [2,1,2],
        ], [
            [0,0,0],
            [2,0,2],
            [2,0,2],
        ], 5);
    });

    it('시나리오 9 (ㅗ자 매치 테스트)', function () {
        simpleMatcher([
            [2,1,2],
            [2,1,2],
            [1,1,1],
        ], [
            [2,0,2],
            [2,0,2],
            [0,0,0],
        ], 5);
    });

    it('시나리오 9 (좌우반사된 L자 매치 테스트)', function () {
        simpleMatcher([
            [2,2,1],
            [2,2,1],
            [1,1,1],
        ], [
            [2,2,0],
            [2,2,0],
            [0,0,0],
        ], 5);
    });

    it('시나리오 10 (좌우반사된 ㄱ자 매치 테스트)', function () {
        simpleMatcher([
            [1,1,1],
            [1,2,2],
            [1,2,2],
        ], [
            [0,0,0],
            [0,2,2],
            [0,2,2],
        ], 5);
    });

    it('시나리오 11 (ㅓ자 매치 테스트)', function () {
        simpleMatcher([
            [2,2,1],
            [1,1,1],
            [2,2,1],
        ], [
            [2,2,0],
            [0,0,0],
            [2,2,0],
        ], 5);
    });

    it('시나리오 12 (ㅏ자 매치 테스트)', function () {
        simpleMatcher([
            [1,2,2],
            [1,1,1],
            [1,2,2],
        ], [
            [0,2,2],
            [0,0,0],
            [0,2,2],
        ], 5);
    });

    it('시나리오 13 (십자 매치 테스트)', function () {
        simpleMatcher([
            [2,1,2],
            [1,1,1],
            [2,1,2],
        ], [
            [2,0,2],
            [0,0,0],
            [2,0,2],
        ], 5);
    });

    it('시나리오 13 (십자 매치 테스트 2)', function () {
        simpleMatcher([
            [2,1,2],
            [1,1,1],
            [1,1,2],
        ], [
            [2,0,2],
            [0,0,0],
            [1,0,2],
        ], 5);
    });
});

describe('JSSetTest', function () {
    it('배열 기본 테스트', function () {
        var a = [];
        a.push([100,200]);
        expect(a.length).toEqual(1);
        expect(a[0]).toEqual([100,200]);
        var aLength = a.length;
        for (var i = 0; i < aLength; ++i) {
            expect(a[i]).toEqual([100,200]);
        }

        var b = [];
        b.push([100,200]);
        b.push([300,400]);
        expect(b.length).toEqual(2);
        expect(b[0]).toEqual([100,200]);
        expect(b[1]).toEqual([300,400]);
        var bb = [];
        var bCount = 0;
        var bLength = b.length;
        for (var i = 0; i < bLength; ++i) {
            bb.push(b[i]);
        }
        expect(bb).toEqual(b);
    });
});

describe('JSHashTest', function () {
    it('해시 기본 테스트', function () {
        var a = {};
        a[[100,200]] = [100,200];
        expect(Object.keys(a).length).toEqual(1);
        expect(a[[100,200]]).toEqual([100,200]);
        a[[300,400]] = [300,400];
        expect(Object.keys(a).length).toEqual(2);
        expect(a[[300,400]]).toEqual([300,400]);
        a[[300,400]] = [300,400];
        expect(Object.keys(a).length).toEqual(2);
        expect(a[[300,400]]).toEqual([300,400]);

        var aKeys = Object.keys(a);
        var aLength = aKeys.length;
        expect(aLength).toEqual(2);
        for (var i = 0; i < aLength; ++i) {
            if (i == 0) {
                expect(a[aKeys[i]]).toEqual([100,200]);
            } else {
                expect(a[aKeys[i]]).toEqual([300,400]);
            }
        }
    });

    it('JavaScript 해시 테이블 기능 테스트', function () {
        var d = {};
        d[[1,2]] = true;
        expect(d.hasOwnProperty([1,2])).toBeTruthy();
        expect(Object.keys(d).length).toEqual(1);
        d[[1,2]] = true;
        expect(Object.keys(d).length).toEqual(1);
        d[[3,4]] = true;
        expect(d.hasOwnProperty([3,4])).toBeTruthy();
        expect(Object.keys(d).length).toEqual(2);
        expect(d.hasOwnProperty([1,5])).toBeFalsy();
    });
});
