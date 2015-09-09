function Board() {
}

Board.prototype.setSize = function (width, height) {
    if (width <= 0 || height <= 0) {
        throw new Error('Size error');
    }
    if (width < 3 && height < 3) {
        throw new Error('Too small');
    }
    if (width > 10 || height > 10) {
        throw new Error('Too large');
    }

    this.width = width;
    this.height = height;
    this.turn = 0;
    this.step = 0;
    this.cells = null;
    this.newCells = [];
    this.pendingMove = null;
    return true;
}

Board.prototype.getBoard = function (x, y) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
        return undefined;
    }
    return this.cells[y][x];
}

Board.prototype.setBoard = function (x, y, v) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
        throw new Error('Out of bounds');
    }
    this.cells[y][x] = v;
}

Board.prototype.getEntireBoard = function () {
    return this.cells;
}

Board.prototype.setEntireBoard = function (cells) {
    if (!cells) {
        return false;
    }

    if (cells.length != this.height) {
        return false;
    }

    for (var i = 0; i < this.height; ++i) {
        if (cells[i].length != this.width) {
            return false;
        }
    }

    this.cells = cells
    return true;
}

Board.prototype.getPendingMove = function () {
    return this.pendingMove;
}

Board.prototype.move = function (x, y, x2, y2) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
        throw new Error('Out of bounds');
    }
    if (x2 < 0 || x2 >= this.width || y2 < 0 || y2 >= this.height) {
        throw new Error('Out of bounds');
    }

    var v1 = this.getBoard(x, y);
    if (v1 == 0) {
        throw new Error('Empty');
    }

    var v2 = this.getBoard(x2, y2);
    if (v2 == 0) {
        throw new Error('Empty');
    }

    if (Math.abs(x - x2) + Math.abs(y - y2) != 1) {
        throw new Error('Wrong move');
    }

    // 값을 바꾸고
    this.setBoard(x, y, v2);
    this.setBoard(x2, y2, v1);

    // 유효한 움직임인지 확인
    var matches = this.getMatches();
    if (Object.keys(matches).length < 1) {
        return false;
    }

    // 값을 다시 돌려놓는다.
    this.setBoard(x, y, v1);
    this.setBoard(x2, y2, v2);

    this.pendingMove = [x, y, x2, y2];

    return true;
}

Board.prototype.getWidth = function () {
    return this.width;
}

Board.prototype.getHeight = function () {
    return this.height;
}

Board.prototype.getTurn = function () {
    return this.turn;
}

Board.prototype.getStep = function () {
    return this.step;
}

Board.prototype.processPendingMove = function () {
    var x = this.pendingMove[0];
    var y = this.pendingMove[1];
    var x2 = this.pendingMove[2];
    var y2 = this.pendingMove[3];
    var v1 = this.getBoard(x, y);
    var v2 = this.getBoard(x2, y2);
    // 뒤바꾼다.
    this.setBoard(x, y, v2);
    this.setBoard(x2, y2, v1);
    this.pendingMove = null;
    return this.cells;
}

Board.prototype.nextStep = function () {
    if (this.pendingMove != null) {
        this.step = this.step + 1;
        return this.processPendingMove();
    }

    if (this.collapse()) {
        this.step = this.step + 1;
        return this.cells;
    }

    if (this.fillEmpties()) {
        this.step = this.step + 1;
        return this.cells;
    }

    if (this.removeMatches() > 0) {
        this.step = this.step + 1;
        return this.cells;
    }

    this.step = 0;
    this.turn = this.turn + 1;
    return null;
}

Board.prototype.collapse = function () {
    var collapsed = false;
    for (y = this.height - 1; y >= 0; --y) {
        for (x = 0; x < this.width; ++x) {
            if (this.getBoard(x, y) != 0) {
                // (x, y)칸의 모든 아랫칸인 (x, y+1) .. (x, height-1)칸에서
                // 0이 아닌칸 바로 위에까지 셀을 이동시킨다.
                var destY = this.height;
                for (y2 = y; y2 < this.height; ++y2) {
                    if (this.getBoard(x, y2) == 0) {
                        destY = y2;
                    }
                }
                if (destY != this.height) {
                    this.setBoard(x, destY, this.getBoard(x, y));
                    this.setBoard(x, y, 0);
                    collapsed = true;
                }
            }
        }
    }
    return collapsed;
}

Board.prototype.getNewCells = function () {
    return this.newCells;
}

Board.prototype.setNewCells = function (newCells) {
    this.newCells = newCells;
}

Board.prototype.fillEmpties = function () {
    var len = this.newCells.length
    for (y = this.height - 1; y >= 0; --y) {
        for (x = 0; x < this.width; ++x) {
            if (this.getBoard(x, y) == 0) {
                if (this.newCells.length <= 0) {
                    throw new Error('Not enough new cells');
                } else {
                    this.setBoard(x, y, this.newCells.shift());
                }
            }
        }
    }
    return len - this.newCells.length;
}

Board.prototype.getSameLengthWidth = function (x, y) {
    var left = 0;
    var right = 0;
    var v = this.getBoard(x, y);
    if (v != 0) {
        // 왼쪽 방향으로
        for (k = x - 1; k >= 0; --k) {
            if (this.getBoard(k, y) != v) {
                break;
            } else {
                ++left;
            }
        }
        // 오른쪽 방향으로
        for (k = x + 1; k < this.width; ++k) {
            if (this.getBoard(k, y) != v) {
                break;
            } else {
                ++right;
            }
        }
    }

    return {
        left: left,
        right: right,
    };
}

Board.prototype.getSameLengthHeight = function (x, y) {
    var top = 0;
    var bottom = 0;
    var v = this.getBoard(x, y);
    if (v != 0) {
        // 윗 방향으로
        for (k = y - 1; k >= 0; --k) {
            if (this.getBoard(x, k) != v) {
                break;
            } else {
                ++top;
            }
        }
        // 아랫 방향으로
        for (k = y + 1; k < this.height; ++k) {
            if (this.getBoard(x, k) != v) {
                break;
            } else {
                ++bottom;
            }
        }
    }

    return {
        top: top,
        bottom: bottom,
    };
}

Board.prototype.getMatches = function () {
    var removed = {};
    for (y = this.height - 1; y >= 0; --y) {
        for (x = 0; x < this.width; ++x) {

            var sameWidth = this.getSameLengthWidth(x, y);
            var sameHeight = this.getSameLengthHeight(x, y);

            // 가로 방향으로 삭제되어야 할 것 removed에 추가
            if (sameWidth.left + sameWidth.right >= 2) {
                for (k = x - sameWidth.left; k <= x + sameWidth.right; ++k) {
                    removed[[k, y]] = [k, y];
                }
            }

            // 세로 방향으로 삭제되어야 할 것 removed에 추가
            if (sameHeight.top + sameHeight.bottom >= 2) {
                for (k = y - sameHeight.top; k <= y + sameHeight.bottom; ++k) {
                    removed[[x, k]] = [x, k];
                }
            }
        }
    }

    return removed;
}

Board.prototype.removeMatches = function () {
    var matches = this.getMatches();
    var matchesKeys = Object.keys(matches);
    var matchesKeysLength = matchesKeys.length
    for (var i = 0; i < matchesKeysLength; ++i) {
        var xy = matches[matchesKeys[i]];
        this.setBoard(xy[0], xy[1], 0);
    }
    return matchesKeysLength;
}

Board.prototype.getAppendingPossibleMoveAtPoint = function (x, y) {
    var v = this.getBoard(x, y);
    if (this.isEmptyValue(v) == true) {
        return null;
    }

    var dxy = [[-1,0],[1,0],[0,-1],[0,1]];
    var ddxy = [
        [ [-1,0],[0,-1],[0,1] ],
        [ [1,0],[0,-1],[0,1] ],
        [ [0,-1],[-1,0],[1,0] ],
        [ [0,1],[-1,0],[1,0] ]
    ];

    for (var i = 0; i < dxy.length; ++i) {
        var wx = x + dxy[i][0];
        var wy = y + dxy[i][1];
        var w = this.getBoard(wx, wy);
        if (v === w) {
            for (var j = 0; j < ddxy[i].length; ++j) {
                var kx = wx + dxy[i][0]
                var ky = wy + dxy[i][1]
                var zx = kx + ddxy[i][j][0];
                var zy = ky + ddxy[i][j][1];
                var z = this.getBoard(zx, zy);

                if (w === z) {
                    if (kx > zx || ky > zy) {
                        return [zx, zy, kx, ky];
                    } else {
                        return [kx, ky, zx, zy];
                    }
                }
            }
        }
    }

    return null;
}

Board.prototype.getInsertingPossibleMoveAtPoint = function (x, y) {
    var v = this.getBoard(x, y);
    if (this.isEmptyValue(v) == true) {
        return null;
    }

    var dxy = [[-1,0],[1,0],[0,-1],[0,1]];
    var ddxy = [
        [ [ 0,-1],[ 0, 1] ],
        [ [ 0,-1],[ 0, 1] ],
        [ [-1, 0],[ 1, 0] ],
        [ [-1, 0],[ 1, 0] ]
    ];

    for (var i = 0; i < dxy.length; ++i) {
        var kx = x + dxy[i][0];
        var ky = y + dxy[i][1];
        var wx = kx + dxy[i][0];
        var wy = ky + dxy[i][1];
        var w = this.getBoard(wx, wy);
        if (v === w) {
            for (var j = 0; j < ddxy[i].length; ++j) {
                var zx = kx + ddxy[i][j][0];
                var zy = ky + ddxy[i][j][1];
                var z = this.getBoard(zx, zy);

                if (w === z) {
                    if (kx > zx || ky > zy) {
                        return [zx, zy, kx, ky];
                    } else {
                        return [kx, ky, zx, zy];
                    }
                }
            }
        }
    }

    return null;
}

Board.prototype.getPossibleMove = function () {
    for (var y = this.height - 1; y >= 0; --y) {
        for (var x = 0; x < this.width; ++x) {
            var r1 = this.getInsertingPossibleMoveAtPoint(x, y);
            if (r1 != null) {
                return r1;
            }

            var r2 = this.getAppendingPossibleMoveAtPoint(x, y);
            if (r2 != null) {
                return r2;
            }
        }
    }
    return null;
}

Board.prototype.isStuck = function () {
    return this.getPossibleMove() == null;
}

Board.prototype.isEmpty = function (x, y) {
    return this.isEmptyValue(this.getBoard(x, y));
}

Board.prototype.isEmptyValue = function (v) {
    if (v === undefined) {
        throw new Error('Argument error');
    } else {
        return v == null || v == 0;
    }
}

Array.prototype.extend = function (other_array) {
    /* you should include a test to check whether other_array really is an array */
    other_array.forEach(function(v) {this.push(v)}, this);
}

Board.prototype.getFlattenedCells = function () {
    var a = []
    for (var y = this.height - 1; y >= 0; --y) {
        a.extend(this.cells[y]);
    }
    return a;
}

Board.prototype.removeFirst3 = function (a, v) {
    var c = 0;
    for (var i = 0; i < a.length && c < 3; /*empty*/) {
        if (a[i] == v) {
            a.splice(i, 1);
            ++c;
        } else {
            ++i;
        }
    }

    return c == 3;
}

Board.prototype.getRelaxPattern = function (type, x, y, dir1, dir2) {
    var dirMap = {
        left: [-1,0],
        right: [1,0],
        up: [0,-1],
        down: [0,1]
    };
    var dirMap2 = {
        horizontal: [ [-1,0], [1,0] ],
        vertical: [ [0,-1], [0,1] ]
    };

    var a = [];

    if (type == 'appending') {
        var d1 = dirMap[dir1];
        if (d1 === undefined) {
            throw new Error('Unknown dir1');
        }
        var d2 = dirMap[dir2];
        if (d2 === undefined) {
            throw new Error('Unknown dir2');
        }
        if (dir1 == 'left' && dir2 == 'right'
            || dir1 == 'right' && dir2 == 'left'
            || dir1 == 'up' && dir2 == 'down'
            || dir1 == 'down' && dir2 == 'up') {
            throw new Error('Argument combination error');
        }
        a.push([x, y]);
        a.push([x+d1[0]        , y+d1[1]        ]);
        a.push([x+d1[0]*2+d2[0], y+d1[1]*2+d2[1]]);
    } else if (type == 'inserting') {
        var d1 = dirMap2[dir1];
        if (d1 === undefined) {
            throw new Error('Unknown dir1');
        }
        var d2 = dirMap[dir2];
        if (d2 === undefined) {
            throw new Error('Unknown dir2');
        }
        if ((dir1 == 'horizontal' && (dir2 == 'left' || dir2 == 'right'))
            || (dir1 == 'vertical' && (dir2 == 'up' || dir2 == 'down'))) {
            throw new Error('Argument combination error');
        }
        a.push([x + d1[0][0], y + d1[0][1]]);
        a.push([x + d2[0]   , y + d2[1]   ]);
        a.push([x + d1[1][0], y + d1[1][1]]);
    } else {
        throw new Error('Unknown type');
    }

    return a;
}

Board.prototype.removeAllCells = function () {
    for (var y = this.height - 1; y >= 0; --y) {
        for (var x = 0; x < this.width; ++x) {
            this.setBoard(x, y, 0);
        }
    }
}

Board.prototype.getCellCount = function (v) {
    var c = 0;
    for (var y = this.height - 1; y >= 0; --y) {
        for (var x = 0; x < this.width; ++x) {
            if (this.getBoard(x, y) == v) {
                c++;
            }
        }
    }
    return c;
}

Board.prototype.relax = function (type, v, x, y, dir1, dir2) {
    if (v === 0 || v === null || v === undefined) {
        throw new Error('First argument error');
    }
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
        throw new Error('Out of bounds');
    }
    if (this.getCellCount(v) < 3) {
        throw new Error('Not enough cells to match');
    }

    var pattern = this.getRelaxPattern(type, x, y, dir1, dir2);

    return this.relaxWithPattern(v, pattern);
}

Board.prototype.randomRelax = function () {
    var x = Math.floor((Math.random() * (this.width - 1)) + 0);
    var y = Math.floor((Math.random() * (this.height - 1)) + 0);
    var valueCandidates = this.getRelaxCandidates();
    if (valueCandidates.length == 0) {
        throw new Error('Dead board');
    }
    var vi = Math.floor((Math.random() * (valueCandidates.length - 1)) + 0);
    var v = valueCandidates[vi];

    var patterns = this.getRelaxPatternCandidiates(x, y);
    var pi = Math.floor((Math.random() * (patterns.length - 1)) + 0);
    var pattern = patterns[pi];

    return this.relaxWithPattern(v, pattern);
}

Board.prototype.relaxWithPattern = function (v, pattern) {
    var flattened = this.getFlattenedCells();
    if (this.removeFirst3(flattened, v) == false) {
        throw new Error('Not enough match');
    }
    this.removeAllCells();
    for (var i = 0; i < pattern.length; ++i) {
        this.setBoard(pattern[i][0], pattern[i][1], v);
    }
    this.setNewCells(flattened);
    this.fillEmpties();
    return this.cells;
}

Board.prototype.insertingRelax = function (v, x, y, dir1, dir2) {
    return this.relax('inserting', v, x, y, dir1, dir2);
}

Board.prototype.appendingRelax = function (v, x, y, dir1, dir2) {
    return this.relax('appending', v, x, y, dir1, dir2);
}

Board.prototype.getDistribution = function () {
    var d = {};
    for (var y = this.height - 1; y >= 0; --y) {
        for (var x = 0; x < this.width; ++x) {
            var v = this.getBoard(x, y);
            if (d[v] !== undefined) {
                ++d[v];
            } else {
                d[v] = 1;
            }
        }
    }
    return d;
}

Board.prototype.getRelaxCandidates = function () {
    var d = this.getDistribution();
    var keys = Object.keys(d);
    var a = [];
    for (var i = 0; i < keys.length; ++i) {
        if (d[keys[i]] >= 3) {
            a.push(Number(keys[i]));
        }
    }
    return a;
}

Board.prototype.getRelaxPatternCandidiates = function (x, y) {
    var cand = [
        this.getRelaxPattern('appending', x, y, 'right', 'up'),
        this.getRelaxPattern('appending', x, y, 'right', 'right'),
        this.getRelaxPattern('appending', x, y, 'right', 'down'),
        this.getRelaxPattern('appending', x, y, 'left', 'up'),
        this.getRelaxPattern('appending', x, y, 'left', 'left'),
        this.getRelaxPattern('appending', x, y, 'left', 'down'),
        this.getRelaxPattern('appending', x, y, 'up', 'left'),
        this.getRelaxPattern('appending', x, y, 'up', 'right'),
        this.getRelaxPattern('appending', x, y, 'up', 'up'),
        this.getRelaxPattern('appending', x, y, 'down', 'left'),
        this.getRelaxPattern('appending', x, y, 'down', 'right'),
        this.getRelaxPattern('appending', x, y, 'down', 'down'),
        this.getRelaxPattern('inserting', x, y, 'horizontal', 'up'),
        this.getRelaxPattern('inserting', x, y, 'horizontal', 'down'),
        this.getRelaxPattern('inserting', x, y, 'vertical', 'left'),
        this.getRelaxPattern('inserting', x, y, 'vertical', 'right'),
    ];

    for (var i = 0; i < cand.length; /*empty*/) {
        var remove = false;
        for (var j = 0; j < cand[i].length; ++j) {
            var x = cand[i][j][0];
            var y = cand[i][j][1];
            if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
                remove = true;
                break;
            }
        }

        if (remove == true) {
            cand.splice(i, 1);
        } else {
            ++i;
        }
    }

    return cand;
}

module.exports = Board;
