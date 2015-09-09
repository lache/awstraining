
var HelloWorldLayer = cc.Layer.extend({
    sprite:null,
    ctor:function () {
        //////////////////////////////
        // 1. super init first
        this._super();

        /////////////////////////////
        // 2. add a menu item with "X" image, which is clicked to quit the program
        //    you may modify it.
        // ask the window size
        var size = cc.winSize;

        /////////////////////////////
        // 3. add your codes below...
        // add a label shows "Hello World"
        // create and initialize a label
        var helloLabel = new cc.LabelTTF("Hello World", "Arial", 38);
        // position the label on the center of the screen
        helloLabel.x = size.width / 2;
        helloLabel.y = size.height / 2 + 200;
        // add the label as a child to this layer
        //this.addChild(helloLabel, 5);

        // add "HelloWorld" splash screen"
        this.sprite = new cc.Sprite(res.HelloWorld_png);
        this.sprite.attr({
            x: size.width / 2,
            y: size.height / 2
        });
        this.addChild(this.sprite, 0);

        var json = ccs.load('res/StartScene.json');
        var node = json.node;
        this.addChild(node);

        //var widget = node.getChildByTag(10025).getComponent("GUIComponent").getNode();
        //var button = widget.getChildByName("Button_156");
        //button.addTouchEventListener(this.touchEvent, this);
        var startBtn = node.getChildByTag(46).getChildByTag(30);
        startBtn.getChildByTag(31).setString('시작하기');
        startBtn.addTouchEventListener(this.touchEvent, this);

        this.printDeviceId();

        return true;
    },
    touchEvent: function (sender, type) {
        switch (type) {
            case ccui.Widget.TOUCH_BEGAN:
                break;
            case ccui.Widget.TOUCH_ENDED:
                cc.director.pushScene(new cc.TransitionSlideInR(1, new NicknameScene()));
                break;
            default:
                break;
        }
    },
    printDeviceId: function () {
        if (cc.sys.os == cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod("org/cocos2dx/js_tests/AppActivity", "showAlertDialog", "(Ljava/lang/String;Ljava/lang/String;)V", "How are you ?", "I'm great !");
        } else if (cc.sys.os == cc.sys.OS_IOS || cc.sys.os == cc.sys.OS_OSX) {

            var ret = jsb.reflection.callStaticMethod(
                "NativeOcClass",
                "callNativeUIWithTitle:andContent:",
                "cocos2d-js",
                "Yes! you call a Native UI from Reflection");
            cc.log("callNativeUIWithTitle ret val is "+ret);

            var did = jsb.reflection.callStaticMethod(
                "NativeOcClass",
                "callNativeWithReturnString");
            cc.log("did ret val is " + did);
        }
    },
});

var HelloWorldScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new HelloWorldLayer();
        this.addChild(layer);
    }
});

var MainScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        //var layer = new HelloWorldLayer();
        //this.addChild(layer);
        cc.log('NicknameScene 입장');

        var json = ccs.load('res/MainScene.json');
        var node = json.node;
        this.addChild(node);

        var retBtn = node.getChildByTag(64);
        retBtn.addTouchEventListener(this.touchEvent, this);
    },
    touchEvent: function (sender, type) {
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

var NicknameScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        //var layer = new HelloWorldLayer();
        //this.addChild(layer);
        cc.log('NicknameScene 입장');

        var json = ccs.load('res/NicknameScene.json');
        var node = json.node;
        this.addChild(node);

        var nextBtn = node.getChildByTag(77).getChildByTag(30);
        nextBtn.getChildByTag(31).setString('다음으로');
        nextBtn.addTouchEventListener(this.touchEvent, this);
    },
    touchEvent: function (sender, type) {
        switch (type) {
            case ccui.Widget.TOUCH_BEGAN:
                break;
            case ccui.Widget.TOUCH_ENDED:
                cc.director.runScene(new cc.TransitionSlideInR(1, new MainScene()));
                break;
            default:
                break;
        }
    }
});
