'use strict';
var Match3Scene = cc.Scene.extend({
    initBoardConfiguration: function(boardSprite) {
        let r = {}
        r.cellWidth0 = 86;
        r.cellHeight0 = 86;
        r.boardScale = boardSprite.getScale();
        cc.log('r.boardScale=' + r.boardScale);
        r.dCellWidth = r.cellWidth0 * r.boardScale;
        r.dCellHeight = r.cellHeight0 * r.boardScale;
        r.boardX0 = boardSprite.getPosition().x;
        r.boardY0 = boardSprite.getPosition().y;
        return r;
    },
    onEnter: function() {
        this._super();

        cc.log('Match3Scene 입장');
        var size = cc.winSize;

        var json = ccs.load('res/Match3Scene.json');
        var node = json.node;
        this.addChild(node);

        this.boardConf = this.initBoardConfiguration(node.getChildByTag(23));
        this.board = this.createBoard();
        this.cells = [];
        this.cellsDict = {};
        this.cellInstances = {};
        this.precreateCells(this.cellInstances, this.boardConf, true);
        this.refreshAllCells(this.board, this.cells, this.cellsDict, this.cellInstances, this.boardConf);

        let tags = [10001, 10002, 10003];
        for (let i = 0; i < tags.length; i++) {
            let tag = tags[i];
            this.enemyBoardConf = this.initBoardConfiguration(node.getChildByTag(tag));
            this.enemyBoard = this.createBoard();
            this.enemyCells = [];
            this.enemyCellsDict = {};
            this.enemyCellInstances = {};
            this.precreateCells(this.enemyCellInstances, this.enemyBoardConf, false);
            this.refreshAllCells(this.enemyBoard, this.enemyCells, this.enemyCellsDict, this.enemyCellInstances, this.enemyBoardConf);
        }


        cc.eventManager.addListener({
            event: cc.EventListener.KEYBOARD,
            onKeyPressed: (function(keyCode, event) {
                //var label = event.getCurrentTarget();
                //label.setString("Key " + (cc.sys.isNative ? that.getNativeKeyName(keyCode) : String.fromCharCode(keyCode) ) + "(" + keyCode.toString()  + ") was pressed!");
            }).bind(this),
            onKeyReleased: (function(keyCode, event) {
                this.stepAndRefresh(this.enemyBoard, this.enemyCells, this.enemyCellsDict, this.enemyCellInstances, this.enemyBoardConf);
            }).bind(this)
        }, this);

        this.startGame();
        /*
        var spineBoy = new sp.SkeletonAnimation('res/spine/spineboy.json', 'res/spine/spineboy.atlas');
        spineBoy.setPosition(cc.p(size.width / 2, size.height / 2 - 150));
        //spineBoy.setMix('walk', 'jump', 0.2);
        //spineBoy.setMix('jump', 'run', 0.2);
        spineBoy.setAnimation(0, 'run', true);
        spineBoy.setScale(0.5);
        this.addChild(spineBoy, 4);
         */
    },
    precreateCells: function(cellInstances, boardConf, canControl) {
        for (let type = 1; type <= 7; type++) {
            cellInstances[type] = [];
            let count = (canControl ? (7 * 7) : 15);
            for (let i = 0; i < count; i++) {
                let cell = this.createNewCell(type, canControl);
                cell.attr({
                    scale: boardConf.boardScale,
                });
                cell.type = type;
                //cell.retain();
                cell.setVisible(false);
                this.addChild(cell);
                cellInstances[type].push(cell);
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

            this.stepAndRefresh(this.board, this.cells, this.cellsDict, this.cellInstances, this.boardConf);

            if (!this.isStable()) {
                this.runAction(cc.sequence(cc.delayTime(0.25),
                    cc.callFunc(this.stepAndRefreshUntilStable, this)));
            } else {
                this.startHintWatchdog();
            }
        } else {
            this.startHintWatchdog();
        }
    },
    startHintWatchdog: function() {
        this.unschedule(this.showHint);
        this.possibleMove = this.board.getPossibleMove();
        if (this.possibleMove) {
            this.hintSchedule = this.scheduleOnce(this.showHint, 2.0);
        } else {
            this.shuffleAndRefreshUntilStable();
        }
    },
    shuffleAndRefreshUntilStable: function() {
        cc.log('SHUFFLE~~');
        this.board.randomRelax();
        this.moved = true;
        this.stepAndRefreshUntilStable();
    },
    showHint: function() {
        if (this.possibleMove) {
            cc.log('HINT!');
            let x = this.possibleMove[0];
            let y = this.possibleMove[1];
            let x2 = this.possibleMove[2];
            let y2 = this.possibleMove[3];
            //this.cellsDict[x][y].

            var action = cc.repeatForever(cc.sequence(cc.tintTo(0.5, 200, 200, 200), cc.tintTo(0.5, 255, 255, 255)));
            let c1 = this.cellsDict[x + ',' + y];
            let c2 = this.cellsDict[x2 + ',' + y2];

            if (c1) {
                c1.runAction(action);
            } else {
                cc.log('*** C1 cellsDict=' + x + ',' + y + ' is null?!');
            }

            if (c2) {
                c2.runAction(action.clone());
            } else {
                cc.log('*** C2 cellsDict=' + x2 + ',' + y2 + ' is null?!');
            }
        }
    },
    stepAndRefresh: function(board, cells, cellsDict, cellInstances, boardConf) {
        board.nextStep();
        cc.log('Next step - TURN: ' + board.getTurn() +
            '    STEP: ' + board.getStep());

        this.refreshAllCells(board, cells, cellsDict, cellInstances, boardConf);
    },
    refreshAllCells: function(board, cells, cellsDict, cellInstances, boardConf) {
        for (let i = 0; i < cells.length; i++) {
            let cellToBeRemoved = cells[i];
            cellToBeRemoved.setColor(cc.color.WHITE);
            cellToBeRemoved.stopAllActions();
            //cellToBeRemoved.removeFromParent();
            cellToBeRemoved.setVisible(false);
            cellInstances[cellToBeRemoved.type].push(cellToBeRemoved);
        }

        cells.length = 0;
        for (var prop in cellsDict) {
            if (cellsDict.hasOwnProperty(prop)) {
                delete cellsDict[prop];
            }
        }
        for (let iy = 0; iy < board.getHeight(); iy++) {
            for (let ix = 0; ix < board.getWidth(); ix++) {
                var g = board.getBoard(ix, iy);
                // 0은 빈칸이다~
                if (g > 0) {
                    let c = this.processPlaceCmd(board.getBoard(ix, iy), ix, iy, cellInstances, boardConf);
                    cells.push(c);
                    cellsDict[ix + ',' + iy] = c;
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
    processPlaceCmd: function(type, x, y, cellInstances, boardConf) {
        var cellCountX = this.board.getWidth();
        var cellCountY = this.board.getHeight();
        var cellCountXHalf = Math.floor(cellCountX / 2);
        var cellCountYHalf = Math.floor(cellCountY / 2);
        let ix = x;
        let iy = y;

        //let cell = this.createNewCell(type);
        //cc.log('processPlaceCmd - type=' + type);
        let cell = cellInstances[type].pop();

        cell.ix = ix;
        cell.iy = iy;
        cell.attr({
            x: boardConf.boardX0 + (ix - cellCountXHalf) * boardConf.dCellWidth,
            y: boardConf.boardY0 + (cellCountYHalf - iy) * boardConf.dCellHeight,
            //scale: 0.7,
        });

        //this.addChild(cell);
        cell.setVisible(true);
        return cell;
    },
    createNewCell: function(type, canControl) {
        var f = 'res/gem' + type + '.json';
        //let cell = new ccui.ImageView('#gem/gem' + type + '.png');
        //let cell = new ccui.ImageView('res/back1.png');
        //let cell = new ccui.ImageView('#gem/gem' + type + '.png');

        //let cell = new ccui.Button();
        //cell.loadTextures('#gem/gem' + type + '.png', '#gem/gem' + type + '.png', '#gem/gem' + type + '.png');

        let cell = ccs.load(f).node;
        if (canControl) {
            cell.getChildByTag(294).addTouchEventListener(
                this.cellTouchEventListener, cell);
        }

        //cell.addTouchEventListener(this.cellTouchEventListener, cell);

        cell.moveTo = (function(dx, dy) {
            console.log('(' + cell.ix + ',' + cell.iy + ') -> (' + (cell.ix + dx) + ',' + (cell.iy + dy) + ')');
            return this.board.move(cell.ix, cell.iy, cell.ix + dx, cell.iy + dy);
        }).bind(this);
        cell.stepAndRefresh = (function() {
            this.stepAndRefresh(this.board, this.cells, this.cellsDict, this.cellInstances, this.boardConf);
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
