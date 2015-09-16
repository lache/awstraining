describe('CharlieCoreTest', function() {
    it('Test 1', function() {
        var CHARLIE = require('charlie-core');
        var board = new CHARLIE.ataxx.Board();
        expect(board.getType()).toBe('ataxx');
        expect(board.setSize(7, 7)).toBeTruthy();
    });
});
