var nickname = '';
var did = '';
var SERVER_URL = 'http://192.168.0.180:3000';

function EncodeQueryData(data) {
    var ret = [];
    for (var d in data) {
        ret.push(encodeURIComponent(d) + "=" + encodeURIComponent(data[d]));
    }
    return ret.join("&");
}

function Command(command, args) {
    return SERVER_URL + '/' + command + '?' + EncodeQueryData(args);
}

var HelloWorldLayer = cc.Layer.extend({
    sprite: null,
    ctor: function() {
        //////////////////////////////
        // 1. super init first
        this._super();

        /////////////////////////////
        // 2. add a menu item with 'X' image, which is clicked to quit the program
        //    you may modify it.
        // ask the window size
        var size = cc.winSize;

        /////////////////////////////
        // 3. add your codes below...
        // add a label shows 'Hello World'
        // create and initialize a label
        var helloLabel = new cc.LabelTTF('Hello World', 'Arial', 38);
        // position the label on the center of the screen
        helloLabel.x = size.width / 2;
        helloLabel.y = size.height / 2 + 200;
        // add the label as a child to this layer
        //this.addChild(helloLabel, 5);

        // add 'HelloWorld' splash screen'
        /*
        this.sprite = new cc.Sprite(res.HelloWorld_png);
        this.sprite.attr({
            x: size.width / 2,
            y: size.height / 2
        });
        this.addChild(this.sprite, 0);
        */

        var json = ccs.load('res/StartScene.json');
        var node = json.node;
        this.addChild(node);

        //var widget = node.getChildByTag(10025).getComponent('GUIComponent').getNode();
        //var button = widget.getChildByName('Button_156');
        //button.addTouchEventListener(this.touchEvent, this);
        var startBtn = node.getChildByTag(46).getChildByTag(30);
        startBtn.setVisible(false);
        startBtn.getChildByTag(31).setString('시작하기');
        startBtn.addTouchEventListener(this.touchEvent, this);

        this.node = node;

        this.printDeviceId();
        return true;
    },
    touchEvent: function(sender, type) {
        switch (type) {
            case ccui.Widget.TOUCH_BEGAN:
                break;
            case ccui.Widget.TOUCH_ENDED:
                if (nickname.length > 0) {
                    cc.director.pushScene(new cc.TransitionSlideInR(1, new MatchingScene()));
                } else {
                    cc.director.pushScene(new cc.TransitionSlideInR(1, new NicknameScene()));
                }
                break;
            default:
                break;
        }
    },
    printDeviceId: function() {
        if (cc.sys.os == cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod(
                'org/cocos2dx/js_tests/AppActivity',
                'showAlertDialog',
                '(Ljava/lang/String;Ljava/lang/String;)V',
                'How are you ?',
                "I'm great !");
        } else if (cc.sys.os == cc.sys.OS_IOS || cc.sys.os == cc.sys.OS_OSX) {
            /*
            var ret = jsb.reflection.callStaticMethod(
                'NativeOcClass',
                'callNativeUIWithTitle:andContent:',
                'cocos2d-js',
                'Yes! you call a Native UI from Reflection');
            cc.log('callNativeUIWithTitle ret val is '+ret);
            */

            did = jsb.reflection.callStaticMethod(
                'NativeOcClass',
                'callNativeWithReturnString');
            cc.log('did ret val is ' + did);
            this.node.getChildByTag(56).setString(did);
            var startBtn = this.node.getChildByTag(46).getChildByTag(30);

            var xhr = cc.loader.getXMLHttpRequest();
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status <= 207)) {
                    var httpStatus = xhr.statusText;
                    var response = xhr.responseText.substring(0, 100) + '...';
                    cc.log('GET Response (100 chars):)');
                    cc.log(response);
                    cc.log('Status: Got GET response! ' + httpStatus);
                } else {
                    cc.log('onreadystatechange unknown result');
                }

                var r = JSON.parse(xhr.responseText);
                if (r.type == 'nickname') {
                    startBtn.setVisible(true);
                    nickname = r.nickname;
                }
            }
            xhr.timeout = 5000;
            ['loadstart', 'abort', 'error', 'load', 'loadend', 'timeout'].forEach(function(eventname) {
                xhr['on' + eventname] = function() {
                    cc.log('\nEvent : ' + eventname);
                }
            });
            xhr.open('GET', Command('getNickname', {
                did: did
            }), true);
            xhr.send();
        }
    },
});

var HelloWorldScene = cc.Scene.extend({
    onEnter: function() {
        this._super();
        var layer = new HelloWorldLayer();
        this.addChild(layer);
    }
});

var NicknameScene = cc.Scene.extend({
    onEnter: function() {
        this._super();
        //var layer = new HelloWorldLayer();
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
        var xhr = cc.loader.getXMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status <= 207)) {
                var httpStatus = xhr.statusText;
                var response = xhr.responseText.substring(0, 100) + '...';
                cc.log('GET Response (100 chars):)');
                cc.log(response);
                cc.log('Status: Got GET response! ' + httpStatus);
            } else {
                cc.log('onreadystatechange unknown result');
            }

            var r = JSON.parse(xhr.responseText);
            if (r.type == 'nicknameSet') {
                cc.director.pushScene(new cc.TransitionSlideInR(1, new MatchingScene()));

            }
        }
        xhr.timeout = 5000;
        ['loadstart', 'abort', 'error', 'load', 'loadend', 'timeout'].forEach(function(eventname) {
            xhr['on' + eventname] = function() {
                cc.log('\nEvent : ' + eventname);
            }
        });

        var nickname = this.node.getChildByTag(74).getChildByTag(72).getString();

        xhr.open('GET', Command('setNickname', {
            did: did,
            nickname: nickname
        }), true);
        xhr.send();

        //cc.director.runScene(new cc.TransitionSlideInR(0.33, new MainScene()));
    }
});


var MatchingScene = cc.Scene.extend({
    onEnter: function() {
        this._super();
        //var layer = new HelloWorldLayer();
        //this.addChild(layer);
        cc.log('MatchingScene 입장');

        var json = ccs.load('res/MatchingScene.json');
        var node = json.node;
        this.addChild(node);
        this.node = node;
        /*
        var nextBtn = node.getChildByTag(77).getChildByTag(30);
        nextBtn.getChildByTag(31).setString('다음으로');
        nextBtn.addTouchEventListener(this.touchEvent, this);
        */
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
});

var MainScene = cc.Scene.extend({
    onEnter: function() {
        this._super();
        //var layer = new HelloWorldLayer();
        //this.addChild(layer);
        cc.log('NicknameScene 입장');
        var size = cc.winSize;

        var json = ccs.load('res/MainScene.json');
        var node = json.node;
        this.addChild(node);
        this.node = node;
        var retBtn = node.getChildByTag(64);
        retBtn.addTouchEventListener(this.touchEvent, this);

        var board = node.getChildByTag(23);
        var boardSize0 = board.getContentSize();
        var cellWidth0 = 84;
        var cellHeight0 = 85;
        var cellCountX = 7;
        var cellCountY = 7;
        var boardScale = board.getScale();
        var dCellWidth = cellWidth0 * boardScale;
        var dCellHeight = cellHeight0 * boardScale;
        var boardX0 = board.getPosition().x;
        var boardY0 = board.getPosition().y;
        cc.log(boardSize0.width);
        cc.log(boardSize0.height);
        cc.log(board.getScale());
        cc.log(boardX0);
        cc.log(boardY0);

        var nicknameText = node.getChildByTag(69).getChildByTag(67);
        nicknameText.setString(nickname);

        var cellCountXHalf = Math.floor(cellCountX / 2);
        var cellCountYHalf = Math.floor(cellCountY / 2);

        for (var iy = 0; iy < cellCountY; ++iy) {
            for (var ix = 0; ix < cellCountX; ++ix) {
                var f = Math.random() > 0.5 ? 'res/Red.json' : 'res/Blue.json';
                var red = ccs.load(f).node;
                red.attr({
                    x: boardX0 + (ix - cellCountXHalf) * dCellWidth,
                    y: boardY0 + (cellCountYHalf - iy) * dCellHeight
                });
                red.ix = ix;
                red.iy = iy;
                red.getChildByTag(1).addTouchEventListener(function(sender, type) {
                    switch (type) {
                        case ccui.Widget.TOUCH_BEGAN:
                            break;
                        case ccui.Widget.TOUCH_ENDED:
                            cc.log(this.ix);
                            cc.log(this.iy);
                            break;
                        default:
                            break;
                    }
                }, red);
                this.addChild(red);
            }
        }
    },
    touchEvent: function(sender, type) {
        switch (type) {
            case ccui.Widget.TOUCH_BEGAN:
                break;
            case ccui.Widget.TOUCH_ENDED:
                cc.director.popScene();
                break;
            default:
                break;
        }
    }
});
