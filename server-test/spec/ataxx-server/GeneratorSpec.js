var generator = require('../../app/generator');

describe('Hello World 생성기', function() {
    it('빈 배열', function() {
        expect(generator.generateHelloWorlds(0)).toEqual([]);
    });

    it('개수 맞는지?', function() {
        var result = generator.generateHelloWorlds(3);
        expect(result.length).toBe(3);
    })

    it('모든 내용이 Hello World인지?', function() {
        var result = generator.generateHelloWorlds(3);
        result.forEach(function(element) {
            expect(element).toBe('Hello World');
        });
    });
});
