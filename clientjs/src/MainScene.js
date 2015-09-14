
var MainScene = cc.Scene.extend({
    onEnter: function() {
        this._super();
        //var layer = new StartLayer();
        //this.addChild(layer);
        cc.log('MainScene 입장');
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
                //cc.director.popScene();
                break;
            default:
                break;
        }
    }
});
