
var NicknameScene = cc.Scene.extend({
    onEnter: function() {
        this._super();
        //var layer = new StartLayer();
        //this.addChild(layer);
        cc.log('NicknameScene 입장');

        var json = ccs.load('res/NicknameScene.json');
        var node = json.node;
        this.addChild(node);
        this.node = node;

        var nextBtn = node.getChildByTag(77).getChildByTag(30);
        nextBtn.getChildByTag(31).setString('다음으로');
        nextBtn.addTouchEventListener(this.touchEvent, this);
    },
    touchEvent: function(sender, type) {
        switch (type) {
            case ccui.Widget.TOUCH_BEGAN:
                break;
            case ccui.Widget.TOUCH_ENDED:
                this.onNicknameChangeButton();
                break;
            default:
                break;
        }
    },
    onNicknameChangeButton: function() {
        var nickname = this.node.getChildByTag(74).getChildByTag(72).getString();

        RequestXhr('setNickname', {
            did: did,
            nickname: nickname
        }, 'nicknameSet', function(r) {
            cc.director.pushScene(new cc.TransitionSlideInR(1, new MatchingScene()));
        });
    }
});
