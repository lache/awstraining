'use strict';
var LoaderScene = cc.Scene.extend({
    onEnter: function() {
        this._super();

        cc.log('LoaderScene 입장');
        var size = cc.winSize;

        var json = ccs.load('res/LoaderScene.json');
        var node = json.node;
        this.addChild(node);
    },
});
