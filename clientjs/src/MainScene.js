'use strict';
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
        this.cellWidth0 = 84;
        this.cellHeight0 = 85;
        this.boardScale = board.getScale();
        this.dCellWidth = this.cellWidth0 * this.boardScale;
        this.dCellHeight = this.cellHeight0 * this.boardScale;
        this.boardX0 = board.getPosition().x;
        this.boardY0 = board.getPosition().y;

        var nicknameText = node.getChildByTag(69).getChildByTag(67);
        nicknameText.setString(nickname);

        var opponentNicknameText = node.getChildByTag(82).getChildByTag(67);
        opponentNicknameText.setString(opponentNickname);

        this.redScoreText = node.getChildByTag(19);
        this.blueScoreText = node.getChildByTag(20);
        this.redScoreText.setString(0);
        this.blueScoreText.setString(0);

        this.initBoard();

        this.processAllDeltas(); // 화면 보이기 전에 한번 플러시 한다.
        this.scheduleUpdate();
    },
    initBoard: function() {
        var board = new CHARLIE.ataxx.Board();
        var dl = new CHARLIE.ataxx.DeltaLogger();
        board.setDeltaLogger(dl);
        board.setSize(fullState.width, fullState.height);
        board.userList = [];
        var userMap = new Map();
        for (var i in fullState.userList) {
            var u = new CHARLIE.ataxx.User(fullState.userList[i].name);
            board.userList.push(u);
            userMap.set(fullState.userList[i].name, u);
        }
        for (var row in fullState.cells) {
            for (var col in fullState.cells[row]) {
                var u = fullState.cells[row][col];
                if (u != null) {
                    board.place(userMap.get(u.name), col, row);
                }
            }
        }
        board.turnCount = fullState.turnCount;

        cc.log('board.getWidth() = ' + board.getWidth());
        cc.log('board.getHeight() = ' + board.getHeight());

        this.dl = dl;
        this.board = board;
        this.userMap = userMap;
    },
    updateScoreText: function() {
        var playerScore = this.board.getCellCount(this.userMap.get(nickname));
        var opponentScore = this.board.getCellCount(this.userMap.get(opponentNickname));

        this.redScoreText.setString(playerScore);
        this.blueScoreText.setString(opponentScore);
    },
    processAllDeltas: function() {
        while (this.dl) {
            var d = this.dl.pop();
            if (d == null) {
                break;
            } else {
                cc.log('DL:' + d.toString());
                var t = d.toString().split(' ');
                var cmd = t[0];
                if (cmd == 'size') {
                    this.processSizeCmd(t[1], t[2]);
                } else if (cmd == 'place') {
                    this.processPlaceCmd(t[1], t[2], t[3]);
                    this.updateScoreText();
                } else {
                }
            }
        }
    },
    processSizeCmd: function(width, height) {

    },
    processPlaceCmd: function(nn, x, y) {
        var cellCountX = this.board.getWidth();
        var cellCountY = this.board.getHeight();
        var cellCountXHalf = Math.floor(cellCountX / 2);
        var cellCountYHalf = Math.floor(cellCountY / 2);
        var ix = x;
        var iy = y;
        // TODO 플레이어는 무조건 빨간색?
        var f = (nn == nickname) ? 'res/Red.json' : 'res/Blue.json';
        var red = ccs.load(f).node;
        red.attr({
            x: this.boardX0 + (ix - cellCountXHalf) * this.dCellWidth,
            y: this.boardY0 + (cellCountYHalf - iy) * this.dCellHeight
        });
        red.ix = ix;
        red.iy = iy;
        red.getChildByTag(1).addTouchEventListener(function(sender, type) {
            switch (type) {
                case ccui.Widget.TOUCH_BEGAN:
                    break;
                case ccui.Widget.TOUCH_ENDED:
                    cc.log('Touched - (' + this.ix + ',' + this.iy + ')');
                    break;
                default:
                    break;
            }
        }, red);
        this.addChild(red);
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
    },
    update: function(dt) {
        this.processAllDeltas();
    },
});
