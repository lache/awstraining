'use strict';

var SCENE1_CODE = 'ㅁㄴㅇㄹ폰에서 이 변경 사항이 적용될까!';
cc.log('[^^] SCENE1_CODE = ' + SCENE1_CODE);

var DynamicScene = cc.Scene.extend({
    onEnter: function() {
        this._super();

        cc.log('DynamicScene 입장');
        let size = cc.winSize;

        let storagePath = GetHotpatchPath();

        let json = ccs.load(storagePath + 'res/DynamicScene.json');
        let node = json.node;
        this.addChild(node);

        node.getChildByTag(134).setString('코드로 변경했다~~');

        this.scheduleOnce(this.startMatch3Scene, 3);
    },
    startMatch3Scene: function(dt) {
        let storagePath = GetHotpatchPath();

        require(storagePath + 'src/Match3Scene.js');
        cc.log('SCENE1_CODE = ' + SCENE1_CODE);
        PushScene(new Match3Scene());
        cc.log('^___^');
    },
});

cc.log('[^^]');
