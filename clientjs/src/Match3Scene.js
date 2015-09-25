'use strict';
var Match3Scene = cc.Scene.extend({
    onEnter: function() {
        this._super();

        cc.log('Match3Scene 입장');
        var size = cc.winSize;

        var json = ccs.load('res/Match3Scene.json');
        var node = json.node;
        this.addChild(node);

        var boardSprite = node.getChildByTag(23);
        var boardSize0 = boardSprite.getContentSize();
        this.cellWidth0 = 86;
        this.cellHeight0 = 86;
        this.boardScale = boardSprite.getScale();
        this.dCellWidth = this.cellWidth0 * this.boardScale;
        this.dCellHeight = this.cellHeight0 * this.boardScale;
        this.boardX0 = boardSprite.getPosition().x;
        this.boardY0 = boardSprite.getPosition().y;

        this.board = this.createBoard();
        // this.sprite = new cc.Sprite("#gem/gem2.png");
        // this.sprite.attr({
        //     scale:0.8
        // });
        // this.addChild(this.sprite);

        for (let iy = 0; iy < this.board.getHeight(); iy++) {
            for (let ix = 0; ix < this.board.getWidth(); ix++) {
                this.processPlaceCmd(this.board.getBoard(ix, iy), ix, iy);
            }
        }

        cc.eventManager.addListener({
            event: cc.EventListener.KEYBOARD,
            onKeyPressed: (function(keyCode, event) {
                //var label = event.getCurrentTarget();
                //label.setString("Key " + (cc.sys.isNative ? that.getNativeKeyName(keyCode) : String.fromCharCode(keyCode) ) + "(" + keyCode.toString()  + ") was pressed!");
            }).bind(this),
            onKeyReleased: (function(keyCode, event) {
                this.board.nextStep();
                cc.log('Next step - TURN: ' + this.board.getTurn() +
                    '    STEP: ' + this.board.getStep());

                //var label = event.getCurrentTarget();
                //label.setString("Key " + (cc.sys.isNative ? that.getNativeKeyName(keyCode) : String.fromCharCode(keyCode) ) + "(" + keyCode.toString()  + ") was released!");
            }).bind(this)
        }, this);
    },
    createBoard: function() {
        let board = new CHARLIE.match3.Board();
        let width = 7;
        let height = 7;
        board.setSize(width, height);
        let entireBoard = this.createRandomEntireBoard(width, height);
        board.setEntireBoard(entireBoard);
        board.setNewCells(this.createRandomNewCells(100));
        return board;
    },
    random: function(a, b) {
        return Math.floor((Math.random() * b) + a);
    },
    createRandomEntireBoard: function(w, h) {
        let r = []
        for (let j = 0; j < h; j++) {
            r.push(this.createRandomNewCells(w));
        }
        return r;
    },
    createRandomNewCells: function(c) {
        let r = [];
        for (let i = 0; i < c; i++) {
            r.push(this.random(1, 7));
        }
        return r;
    },
    processPlaceCmd: function(type, x, y) {
        var cellCountX = this.board.getWidth();
        var cellCountY = this.board.getHeight();
        var cellCountXHalf = Math.floor(cellCountX / 2);
        var cellCountYHalf = Math.floor(cellCountY / 2);
        var ix = x;
        var iy = y;
        // TODO 플레이어는 무조건 빨간색?
        var f = 'res/gem' + type + '.json';
        var red = ccs.load(f).node;
        red.attr({
            x: this.boardX0 + (ix - cellCountXHalf) * this.dCellWidth,
            y: this.boardY0 + (cellCountYHalf - iy) * this.dCellHeight
        });
        red.ix = ix;
        red.iy = iy;
        red.getChildByTag(294).addTouchEventListener(
            this.cellTouchEventListener, red);
        this.addChild(red);
    },
    cellTouchEventListener: function(sender, type, touch) {
        switch (type) {
            case ccui.Widget.TOUCH_BEGAN:
                {
                    var touchPoint = sender.getTouchBeganPosition();
                    cc.log('Began - (' + this.ix + ',' + this.iy + ') - ' + touchPoint.x + ' ' + touchPoint.y);
                    break;
                }
            case ccui.Widget.TOUCH_MOVED:
                {
                    let touchBeganPoint = sender.getTouchBeganPosition();
                    let touchPoint = sender.getTouchMovePosition();
                    let d = cc.math.vec3Sub(touchPoint, touchBeganPoint);
                    let dLen = Math.sqrt(d.x * d.x + d.y * d.y);
                    if (dLen > 15) {
                        let ang = Math.atan2(d.y, d.x);
                        let halfAng = Math.PI / 20;
                        if (-halfAng < ang && ang < halfAng) {
                            // 왼쪽으로 드래그
                            cc.log('[' + this.ix + ',' + this.iy + '] LEFT');
                        } else if (Math.PI / 2 - halfAng < ang && ang < Math.PI / 2 + halfAng) {
                            // 윗쪽으로 드래그
                            cc.log('[' + this.ix + ',' + this.iy + '] UP');
                        } else if (Math.PI - halfAng < ang || ang < -Math.PI + halfAng) {
                            // 오른쪽으로 드래그
                            cc.log('[' + this.ix + ',' + this.iy + '] RIGHT');
                        } else if (-Math.PI / 2 - halfAng < ang && ang < -Math.PI / 2 + halfAng) {
                            // 아랫쪽으로 드래그
                            cc.log('[' + this.ix + ',' + this.iy + '] DOWN');
                        }
                    }
                    cc.log('Moved - (' + this.ix + ',' + this.iy + ') - ' +
                        touchPoint.x + ' ' + touchPoint.y + ' '
                        //d.x + ' ' + d.y + ' ' +
                        //dLen
                    );


                    break;
                }
            case ccui.Widget.TOUCH_ENDED:
                cc.log('Touched - (' + this.ix + ',' + this.iy + ')');
                break;
            case ccui.Widget.TOUCH_CANCELED:
                cc.log('Canceled - (' + this.ix + ',' + this.iy + ')');
                break;
            default:
                break;
        }
    },
});
