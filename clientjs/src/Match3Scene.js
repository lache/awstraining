'use strict';
var Match3Scene = cc.Scene.extend({
    onEnter: function() {
        this._super();

        cc.log('Match3Scene 입장');
        var size = cc.winSize;

        var json = ccs.load('res/Match3Scene.json');
        var node = json.node;
        this.addChild(node);

    },
});
