'use strict';
var LoaderScene = cc.Scene.extend({
    onEnter: function() {
        this._super();

        cc.log('LoaderScene 입장');
        const size = cc.winSize;

        const json = ccs.load('res/LoaderScene.json');
        const node = json.node;
        this.addChild(node);

        node.getChildByTag(132).addTouchEventListener(function(sender, type) {
            if (type === ccui.Widget.TOUCH_ENDED) {
                //cc.log('button');
                cc.game.restart();
            }
        }, this);

        cc.eventManager.addListener({
            event: cc.EventListener.KEYBOARD,
            onKeyPressed: (function(keyCode, event) {

            }).bind(this),
            onKeyReleased: (function(keyCode, event) {

            }).bind(this)
        }, this);

        this.startAmUpdate();
    },
    onExit: function() {
        cc.log('LoaderScene 퇴장');
        this.am.release();
        this._super();
    },
    startAmUpdate: function() {

        const manifestPath = 'res/scene1/project.manifest';
        const storagePath = ((jsb.fileUtils ? jsb.fileUtils.getWritablePath() : "/")) + 'am/scene1/';
        this.am = new jsb.AssetsManager(manifestPath, storagePath);
        this.am.retain();

        if (!this.am.getLocalManifest().isLoaded()) {
            cc.log('local manifest NOT loaded.');
        } else {
            cc.log('local manifest loaded.');
            let that = this;
            var listener = new jsb.EventListenerAssetsManager(this.am, function(event) {
                let ec = event.getEventCode();
                switch (ec) {
                    case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                        cc.log('ERROR_NO_LOCAL_MANIFEST');
                        break;
                    case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
                        cc.log('ERROR_DOWNLOAD_MANIFEST');
                        break;
                    case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                        cc.log('ERROR_PARSE_MANIFEST');
                        break;
                    case jsb.EventAssetsManager.NEW_VERSION_FOUND:
                        cc.log('NEW_VERSION_FOUND');
                        break;
                    case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                        cc.log('ALREADY_UP_TO_DATE');
                        require(storagePath + 'Scene1.js');
                        cc.log('SCENE1_CODE = ' + SCENE1_CODE);
                        break;
                    case jsb.EventAssetsManager.UPDATE_PROGRESSION:
                        cc.log('UPDATE_PROGRESSION ' + event.getPercent() + '% ' + event.getPercentByFile() + "% " + event.getMessage());
                        break;
                    case jsb.EventAssetsManager.ASSET_UPDATED:
                        cc.log('ASSET_UPDATED');
                        break;
                    case jsb.EventAssetsManager.ERROR_UPDATING:
                        cc.log('ERROR_UPDATING');
                        break;
                    case jsb.EventAssetsManager.UPDATE_FINISHED:
                        cc.log('UPDATE_FINISHED');
                        require(storagePath + 'Scene1.js');
                        cc.log('SCENE1_CODE = ' + SCENE1_CODE);
                        break;
                    case jsb.EventAssetsManager.UPDATE_FAILED:
                        cc.log('UPDATE_FAILED');
                        break;
                    case jsb.EventAssetsManager.ERROR_DECOMPRESS:
                        cc.log('ERROR_DECOMPRESS');
                        break;
                    default:
                        cc.log('*UNKNOWN* - CODE=' + ec);
                        break;
                }
            });

            cc.eventManager.addListener(listener, 1);

            this.am.update();
        }
    },
});
