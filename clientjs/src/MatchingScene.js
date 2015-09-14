
var MatchingScene = cc.Scene.extend({
    onEnter: function() {
        this._super();
        var layer = new MatchingLayer();
        this.addChild(layer);
    }
});

var MatchingLayer = cc.Layer.extend({
    ctor: function() {
        this._super();
        //var layer = new StartLayer();
        //this.addChild(layer);
        cc.log('MatchingScene 입장');

        var json = ccs.load('res/MatchingScene.json');
        var node = json.node;
        this.addChild(node);
        this.node = node;
        var commandQueue = [];
        this.commandQueue = commandQueue;
        var self = this;
        this.scheduleUpdate();

        RequestXhr('requestMatch', {
            did: did
        }, 'matchInfo', function(r) {
            if (r.result === 'ok') {
                console.log('HEHE');
                // 어느정도 시간 안기다려줬더니 장면 전환이 안되네... ㅋㅋ
                self.scheduleOnce(self.startMainScene, 1.0);

                self.commandQueue.push(function() {
                    console.log('pushed>');
                    //cc.director.pushScene(new cc.TransitionSlideInR(1, new MainScene()));
                });
            }
        });
    },
    startMainScene: function(dt) {
        cc.director.pushScene(new cc.TransitionSlideInR(1, new MainScene()));
    },
    touchEvent: function(sender, type) {
        switch (type) {
            case ccui.Widget.TOUCH_BEGAN:
                break;
            case ccui.Widget.TOUCH_ENDED:
                break;
            default:
                break;
        }
    },
    onEnterTransitionDidFinish: function() {
        console.log('11 - ' + this.commandQueue.length);
        for (var i = 0; i < this.commandQueue.length; ++i) {
            this.commandQueue[i]();
        }
        this.commandQueue = [];
    },
    update: function(dt) {
        /*
        console.log('11 - ' + this.commandQueue.length);
        for (var i = 0; i < this.commandQueue.length; ++i) {
            this.commandQueue[i]();
        }
        this.commandQueue = [];
        */
    },
});
