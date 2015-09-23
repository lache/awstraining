'use strict';
var nickname = '';
var did = '';
var nicknameQueried = false;
var SERVER_URL = 'http://192.168.0.180:3000';

var StartLayer = cc.Layer.extend({
    sprite: null,
    ctor: function() {
        this._super();
        var size = cc.winSize;
        var json = ccs.load('res/StartScene.json');
        var node = json.node;
        this.addChild(node);
        this.startBtn = node.getChildByTag(46).getChildByTag(30);
        this.startBtn.getChildByTag(31).setString('재시도');
        this.startBtn.addTouchEventListener(function(sender, type) {
            if (type === ccui.Widget.TOUCH_ENDED) {
                this.queryNickname();
            }
        }, this);
        this.stateString = node.getChildByTag(83);
        this.stateString.setString('');
        this.node = node;
        this.queryNickname();

        cc.log('start!');
        Q.delay(1000).then(function() {
            cc.log('huuuuu');
        });

        return true;
    },
    queryNickname: function() {
        this.startBtn.setVisible(false);
        if (cc.sys.os == cc.sys.OS_ANDROID) {
            // 아직 구현되지 않은 부분!
            jsb.reflection.callStaticMethod(
                'org/cocos2dx/js_tests/AppActivity',
                'showAlertDialog',
                '(Ljava/lang/String;Ljava/lang/String;)V',
                'How are you ?',
                "I'm great !");
        } else if (cc.sys.os == cc.sys.OS_IOS || cc.sys.os == cc.sys.OS_OSX) {
            did = jsb.reflection.callStaticMethod(
                'NativeOcClass',
                'callNativeWithReturnString');

            did = did + '2';

            cc.log('did ret val is ' + did);
        }

        if (did) {
            this.startQueryNickname(did);
        }
    },
    changeToNextScene: function(dt) {
        if (nickname.length > 0) {
            PushScene(new MatchingScene());
        } else {
            PushScene(new NicknameScene());
        }
    },
    startQueryNickname: function(did) {
        this.node.getChildByTag(56).setString(did);
        var startBtn = this.node.getChildByTag(46).getChildByTag(30);

        this.stateString.setString('접속중');
        RequestXhrAsync('getNickname', {
            did: did
        }, 'nickname').then((function(r) {
            // 응답 받았을 때 (성공 응답일 수도 있고 실패 응답일 수도 있다)
            //startBtn.setVisible(true);
            console.log('hehe');
            if (r.result == 'ok') {
                nickname = r.nickname;
                nicknameQueried = true;
                this.scheduleOnce(this.changeToNextScene, 1.0);
            } else {
                this.stateString.setString('서버에 오류가 있습니다.');
                this.startBtn.setVisible(true);
            }
        }).bind(this)).catch((function(error) {
            console.log('ERROR! ' +
                error.message + ' - ' +
                error.fileName + '(' +
                error.lineNumber + ':' +
                error.columnNumber + ')');
            console.log('=== ERROR STACK BEGIN ===');
            console.log(error.stack);
            console.log('=== ERROR STACK END ===');
            // 응답 받지 못했을 때
            if (error.message == 'error') {
                this.stateString.setString('서버에 접속할 수 없습니다.');
            } else if (error.message == 'timeout') {
                this.stateString.setString('서버와 접속이 원활하지 않습니다.');
            } else {
                this.stateString.setString('Error - ' + error.message);
            }
            this.startBtn.setVisible(true);
        }).bind(this)).finally(function() {
            cc.log('FINALLY');
        }).done();
    },
});

var StartScene = cc.Scene.extend({
    onEnter: function() {
        this._super();
        var layer = new StartLayer();
        this.addChild(layer);
    }
});
