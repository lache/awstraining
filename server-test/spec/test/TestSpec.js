describe('CharlieCoreTest', function() {
    it('Test 1 (ataxx)', function() {
        var CHARLIE = require('charlie-core');
        var board = new CHARLIE.ataxx.Board();
        expect(board.getType()).toBe('ataxx');
        expect(board.setSize(7, 7)).toBeTruthy();
    });

    it('Test 2 (match3)', function() {
        var CHARLIE = require('charlie-core');
        var board = new CHARLIE.match3.Board();
        expect(board.getType()).toBe('match3');
        expect(board.setSize(7, 7)).toBeTruthy();
    });

    it('Test 3 (sachun)', function() {
        var CHARLIE = require('charlie-core');
        var board = new CHARLIE.sachun.Board();
        expect(board.getType()).toBe('sachun');
    });
});
