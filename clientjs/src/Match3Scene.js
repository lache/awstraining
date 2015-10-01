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
        this.cells = [];

        this.cellInstances = {};

        this.precreateCells();

        this.refreshAllCells();

        cc.eventManager.addListener({
            event: cc.EventListener.KEYBOARD,
            onKeyPressed: (function(keyCode, event) {
                //var label = event.getCurrentTarget();
                //label.setString("Key " + (cc.sys.isNative ? that.getNativeKeyName(keyCode) : String.fromCharCode(keyCode) ) + "(" + keyCode.toString()  + ") was pressed!");
            }).bind(this),
            onKeyReleased: (function(keyCode, event) {
                this.stepAndRefresh();
            }).bind(this)
        }, this);

        this.startGame();
    },
    precreateCells: function() {
        for (let type = 1; type <= 7; type++) {
            this.cellInstances[type] = [];
            for (let i = 0; i < 7*7; i++) {
                let cell = this.createNewCell(type);
                cell.type = type;
                cell.retain();
                this.cellInstances[type].push(cell);
            }
        }
    },
    startGame: function() {
        this.stepAndRefreshUntilStable();
    },
    isStable: function() {
        let notStable = (this.board.getTurn() == 0 && this.board.getStep() == 0) ||
            (this.board.getStep() != 0) ||
            this.moved;

        return !notStable;
    },
    stepAndRefreshUntilStable: function() {
        cc.log('unstable?');

        if (!this.isStable()) {
            this.moved = false;

            this.stepAndRefresh();

            if (!this.isStable()) {
                this.runAction(cc.sequence(cc.delayTime(0.1),
                    cc.callFunc(this.stepAndRefreshUntilStable, this)));
            }
        }
    },
    stepAndRefresh: function() {
        this.board.nextStep();
        cc.log('Next step - TURN: ' + this.board.getTurn() +
            '    STEP: ' + this.board.getStep());

        this.refreshAllCells();
    },
    refreshAllCells: function() {
        for (let i = 0; i < this.cells.length; i++) {
            let cellToBeRemoved = this.cells[i];
            cellToBeRemoved.removeFromParent();
            this.cellInstances[cellToBeRemoved.type].push(cellToBeRemoved);
        }

        this.cells = [];
        for (let iy = 0; iy < this.board.getHeight(); iy++) {
            for (let ix = 0; ix < this.board.getWidth(); ix++) {
                var g = this.board.getBoard(ix, iy);
                // 0은 빈칸이다~
                if (g > 0) {
                    let c = this.processPlaceCmd(this.board.getBoard(ix, iy), ix, iy);
                    this.cells.push(c);
                }
            }
        }
    },
    createBoard: function() {
        let board = new CHARLIE.match3.Board();
        let width = 7;
        let height = 7;
        board.setSize(width, height);
        let entireBoard = this.createRandomEntireBoard(width, height);
        board.setEntireBoard(entireBoard);
        board.setNewCells(this.createRandomNewCells(1000));
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
        let ix = x;
        let iy = y;

        //let cell = this.createNewCell(type);
        //cc.log('processPlaceCmd - type=' + type);
        let cell = this.cellInstances[type].pop();

        cell.ix = ix;
        cell.iy = iy;
        cell.attr({
            x: this.boardX0 + (ix - cellCountXHalf) * this.dCellWidth,
            y: this.boardY0 + (cellCountYHalf - iy) * this.dCellHeight,
            //scale: 0.7,
        });

        this.addChild(cell);
        return cell;
    },
    createNewCell: function(type) {
        var f = 'res/gem' + type + '.json';
        //let cell = new ccui.ImageView('#gem/gem' + type + '.png');
        //let cell = new ccui.ImageView('res/back1.png');
        //let cell = new ccui.ImageView('#gem/gem' + type + '.png');

        //let cell = new ccui.Button();
        //cell.loadTextures('#gem/gem' + type + '.png', '#gem/gem' + type + '.png', '#gem/gem' + type + '.png');

        let cell = ccs.load(f).node;
        cell.getChildByTag(294).addTouchEventListener(
            this.cellTouchEventListener, cell);

        //cell.addTouchEventListener(this.cellTouchEventListener, cell);

        cell.moveTo = (function(dx, dy) {
            console.log('(' + cell.ix + ',' + cell.iy + ') -> (' + (cell.ix + dx) + ',' + (cell.iy + dy) + ')');
            return this.board.move(cell.ix, cell.iy, cell.ix + dx, cell.iy + dy);
        }).bind(this);
        cell.stepAndRefresh = (function() {
            this.stepAndRefresh();
        }).bind(this);
        cell.stepAndRefreshUntilStable = (function() {
            this.moved = true;
            this.stepAndRefreshUntilStable();
        }).bind(this);
        cell.canMove = (function() {
            return this.canMove();
        }).bind(this);

        return cell;
    },
    canMove: function() {
        return this.board.getTurn() > 0 && this.board.getStep() == 0;
    },
    cellTouchEventListener: function(sender, type) { // this는 각 cell
        switch (type) {
            case ccui.Widget.TOUCH_BEGAN:
                {
                    if (this.canMove()) {
                        this.handleTouchMoved = true;
                        var touchPoint = sender.getTouchBeganPosition();
                        cc.log('Began - (' + this.ix + ',' + this.iy + ') - ' + touchPoint.x + ' ' + touchPoint.y);
                    }
                    break;
                }
            case ccui.Widget.TOUCH_MOVED:
                {
                    if (this.canMove() && this.handleTouchMoved) {
                        let touchBeganPoint = sender.getTouchBeganPosition();
                        let touchPoint = sender.getTouchMovePosition();
                        let d = cc.math.vec3Sub(touchPoint, touchBeganPoint);
                        let dLen = Math.sqrt(d.x * d.x + d.y * d.y);
                        if (dLen > 10) {
                            let ang = Math.atan2(d.y, d.x);
                            let halfAng = Math.PI / 10;
                            if (-halfAng < ang && ang < halfAng) {
                                // 오른쪽으로 드래그
                                cc.log('[' + this.ix + ',' + this.iy + '] RIGHT');
                                this.handleTouchMoved = false;
                                let r = this.moveTo(1, 0);
                                cc.log('move result = ' + r);
                                this.stepAndRefreshUntilStable();
                            } else if (Math.PI / 2 - halfAng < ang && ang < Math.PI / 2 + halfAng) {
                                // 윗쪽으로 드래그
                                cc.log('[' + this.ix + ',' + this.iy + '] UP');
                                this.handleTouchMoved = false;
                                let r = this.moveTo(0, -1);
                                cc.log('move result = ' + r);
                                this.stepAndRefreshUntilStable();
                            } else if (Math.PI - halfAng < ang || ang < -Math.PI + halfAng) {
                                // 왼쪽으로 드래그
                                cc.log('[' + this.ix + ',' + this.iy + '] LEFT');
                                this.handleTouchMoved = false;
                                let r = this.moveTo(-1, 0);
                                cc.log('move result = ' + r);
                                this.stepAndRefreshUntilStable();
                            } else if (-Math.PI / 2 - halfAng < ang && ang < -Math.PI / 2 + halfAng) {
                                // 아랫쪽으로 드래그
                                cc.log('[' + this.ix + ',' + this.iy + '] DOWN');
                                this.handleTouchMoved = false;
                                let r = this.moveTo(0, 1);
                                cc.log('move result = ' + r);
                                this.stepAndRefreshUntilStable();
                            }
                        }
                    }
                    break;
                }
            case ccui.Widget.TOUCH_ENDED:
                //cc.log('Touched - (' + this.ix + ',' + this.iy + ')');
                break;
            case ccui.Widget.TOUCH_CANCELED:
                //cc.log('Canceled - (' + this.ix + ',' + this.iy + ')');
                break;
            default:
                break;
        }
    },
});
