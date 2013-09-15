// based on ROT.Map.Digger - modified to work with staggered isometric topology



/**
 * @class Room
 * @augments ROT.Map.Feature
 * @param {int} x1
 * @param {int} y1
 * @param {int} x2
 * @param {int} y2
 * @param {int} [doorX]
 * @param {int} [doorY]
 */
Room = Class.extend({
    init: function(x1, y1, x2, y2, doorX, doorY) {
        this._x1 = x1;
        this._y1 = y1;
        this._x2 = x2;
        this._y2 = y2;
        this._doors = {};
        if (arguments.length > 4) { this.addDoor(doorX, doorY); }
    },

/**
 * Room of random size, with a given doors and direction
 */
    createRandomAt: function(x, y, dx, dy, options) {
        var min = options.roomWidth[0];
        var max = options.roomWidth[1];
        var width = min + Math.floor(ROT.RNG.getUniform()*(max-min+1));

        var min = options.roomHeight[0];
        var max = options.roomHeight[1];
        var height = min + Math.floor(ROT.RNG.getUniform()*(max-min+1));

        if (dx == 1) { /* to the right */
            var y2 = y - Math.floor(ROT.RNG.getUniform() * height);
            return new this(x+1, y2, x+width, y2+height-1, x, y);
        }

        if (dx == -1) { /* to the left */
            var y2 = y - Math.floor(ROT.RNG.getUniform() * height);
            return new this(x-width, y2, x-1, y2+height-1, x, y);
        }

        if (dy == 1) { /* to the bottom */
            var x2 = x - Math.floor(ROT.RNG.getUniform() * width);
            return new this(x2, y+1, x2+width-1, y+height, x, y);
        }

        if (dy == -1) { /* to the top */
            var x2 = x - Math.floor(ROT.RNG.getUniform() * width);
            return new this(x2, y-height, x2+width-1, y-1, x, y);
        }
    },

/**
 * Room of random size, positioned around center coords
 */
    createRandomCenter: function(cx, cy, options) {
        var min = options.roomWidth[0];
        var max = options.roomWidth[1];
        var width = min + Math.floor(ROT.RNG.getUniform()*(max-min+1));

        var min = options.roomHeight[0];
        var max = options.roomHeight[1];
        var height = min + Math.floor(ROT.RNG.getUniform()*(max-min+1));

        var x1 = cx - Math.floor(ROT.RNG.getUniform()*width);
        var y1 = cy - Math.floor(ROT.RNG.getUniform()*height);
        var x2 = x1 + width - 1;
        var y2 = y1 + height - 1;

        return new this(x1, y1, x2, y2);
    },

/**
 * Room of random size within a given dimensions
 */
    createRandom: function(availWidth, availHeight, options) {
        var min = options.roomWidth[0];
        var max = options.roomWidth[1];
        var width = min + Math.floor(ROT.RNG.getUniform()*(max-min+1));

        var min = options.roomHeight[0];
        var max = options.roomHeight[1];
        var height = min + Math.floor(ROT.RNG.getUniform()*(max-min+1));

        var left = availWidth - width - 1;
        var top = availHeight - height - 1;

        var x1 = 1 + Math.floor(ROT.RNG.getUniform()*left);
        var y1 = 1 + Math.floor(ROT.RNG.getUniform()*top);
        var x2 = x1 + width - 1;
        var y2 = y1 + height - 1;

        return new this(x1, y1, x2, y2);
    },

    addDoor: function(x, y) {
        this._doors[x+","+y] = 1;
    },

/**
 * @param {function}
 */
    getDoors: function(callback) {
        for (var key in this._doors) {
            var parts = key.split(",");
            callback(parseInt(parts[0]), parseInt(parts[1]));
        }
    },

    clearDoors: function() {
        this._doors = {};
        return this;
    },

    debug: function() {
        console.log("room", this._x1, this._y1, this._x2, this._y2);
    },

    isValid: function(isWallCallback, canBeDugCallback) {
        var left = this._x1-1;
        var right = this._x2+1;
        var top = this._y1-1;
        var bottom = this._y2+1;

        for (var x=left; x<=right; x++) {
            for (var y=top; y<=bottom; y++) {
                if (x == left || x == right || y == top || y == bottom) {
                    if (!isWallCallback(x, y)) { return false; }
                } else {
                    if (!canBeDugCallback(x, y)) { return false; }
                }
            }
        }

        return true;
    },

/**
 * @param {function} digCallback Dig callback with a signature (x, y, value). Values: 0 = empty, 1 = wall, 2 = door. Multiple doors are allowed.
 */
    create: function(digCallback) {
        var left = this._x1-1;
        var right = this._x2+1;
        var top = this._y1-1;
        var bottom = this._y2+1;

        var value = 0;
        for (var x=left; x<=right; x++) {
            for (var y=top; y<=bottom; y++) {
                if (x+","+y in this._doors) {
                    value = 2;
                } else if (x == left || x == right || y == top || y == bottom) {
                    value = 1;
                } else {
                    value = 0;
                }
                digCallback(x, y, value);
            }
        }
    },

    getCenter: function() {
        return [Math.round((this._x1 + this._x2)/2), Math.round((this._y1 + this._y2)/2)];
    },

    getLeft: function() {
        return this._x1;
    },

    getRight: function() {
        return this._x2;
    },

    getTop: function() {
        return this._y1;
    },

    getBottom: function() {
        return this._y2;
    }
});

/**
 * @class Corridor
 * @augments ROT.Map.Feature
 * @param {int} startX
 * @param {int} startY
 * @param {int} endX
 * @param {int} endY
 */
Corridor = Class.extend({
    init: function(startX, startY, endX, endY) {
        this._startX = startX;
        this._startY = startY;
        this._endX = endX;
        this._endY = endY;
        this._endsWithAWall = true;
    },

    createRandomAt: function(x, y, dx, dy, options) {
        var min = options.corridorLength[0];
        var max = options.corridorLength[1];
        var length = min + Math.floor(ROT.RNG.getUniform()*(max-min+1));

        return new this(x, y, x + dx*length, y + dy*length);
    },

    debug: function() {
        console.log("corridor", this._startX, this._startY, this._endX, this._endY);
    },

    isValid: function(isWallCallback, canBeDugCallback){
        var sx = this._startX;
        var sy = this._startY;
        var dx = this._endX-sx;
        var dy = this._endY-sy;
        var length = 1 + Math.max(Math.abs(dx), Math.abs(dy));

        if (dx) { dx = dx/Math.abs(dx); }
        if (dy) { dy = dy/Math.abs(dy); }
        var nx = dy;
        var ny = -dx;

        var ok = true;
        for (var i=0; i<length; i++) {
            var x = sx + i*dx;
            var y = sy + i*dy;

            if (!canBeDugCallback(     x,      y)) { ok = false; }
            if (!isWallCallback  (x + nx, y + ny)) { ok = false; }
            if (!isWallCallback  (x - nx, y - ny)) { ok = false; }

            if (!ok) {
                length = i;
                this._endX = x-dx;
                this._endY = y-dy;
                break;
            }
        }

        /**
         * If the length degenerated, this corridor might be invalid
         */

        /* not supported */
        if (length == 0) { return false; }

        /* length 1 allowed only if the next space is empty */
        if (length == 1 && isWallCallback(this._endX + dx, this._endY + dy)) { return false; }

        /**
         * We do not want the corridor to crash into a corner of a room;
         * if any of the ending corners is empty, the N+1th cell of this corridor must be empty too.
         *
         * Situation:
         * #######1
         * .......?
         * #######2
         *
         * The corridor was dug from left to right.
         * 1, 2 - problematic corners, ? = N+1th cell (not dug)
         */
        var firstCornerBad = !isWallCallback(this._endX + dx + nx, this._endY + dy + ny);
        var secondCornerBad = !isWallCallback(this._endX + dx - nx, this._endY + dy - ny);
        this._endsWithAWall = isWallCallback(this._endX + dx, this._endY + dy);
        if ((firstCornerBad || secondCornerBad) && this._endsWithAWall) { return false; }

        return true;
    },

/**
 * @param {function} digCallback Dig callback with a signature (x, y, value). Values: 0 = empty.
 */
    create: function(digCallback) {
        var sx = this._startX;
        var sy = this._startY;
        var dx = this._endX-sx;
        var dy = this._endY-sy;
        var length = 1+Math.max(Math.abs(dx), Math.abs(dy));

        if (dx) { dx = dx/Math.abs(dx); }
        if (dy) { dy = dy/Math.abs(dy); }
        var nx = dy;
        var ny = -dx;

        for (var i=0; i<length; i++) {
            var x = sx + i*dx;
            var y = sy + i*dy;
            digCallback(x, y, 0);
        }

        return true;
    },

    createPriorityWalls: function(priorityWallCallback) {
        if (!this._endsWithAWall) { return; }

        var sx = this._startX;
        var sy = this._startY;

        var dx = this._endX-sx;
        var dy = this._endY-sy;
        if (dx) { dx = dx/Math.abs(dx); }
        if (dy) { dy = dy/Math.abs(dy); }
        var nx = dy;
        var ny = -dx;

        priorityWallCallback(this._endX + dx, this._endY + dy);
        priorityWallCallback(this._endX + nx, this._endY + ny);
        priorityWallCallback(this._endX - nx, this._endY - ny);
    }
});


/**
 * @class Random dungeon generator using human-like digging patterns.
 * Heavily based on Mike Anderson's ideas from the "Tyrant" algo, mentioned at
 * http://www.roguebasin.roguelikedevelopment.org/index.php?title=Dungeon-Building_Algorithm.
 * @augments ROT.Map.Dungeon
 */
Digger = Class.extend({

    init: function(width, height, options) {

        this._options = {
            roomWidth: [3, 9], /* room minimum and maximum width */
            roomHeight: [3, 5], /* room minimum and maximum height */
            corridorLength: [3, 10], /* corridor minimum and maximum length */
            dugPercentage: 0.2, /* we stop after this percentage of level area has been dug out */
            timeLimit: 1000 /* we stop after this much time has passed (msec) */
        }
        for (var p in options) { this._options[p] = options[p]; }

        this._features = {
            "Room": 4,
            "Corridor": 4
        }
        this._featureAttempts = 20; /* how many times do we try to create a feature on a suitable wall */
        this._walls = {}; /* these are available for digging */

        this._digCallback = this._digCallback.bind(this);
        this._canBeDugCallback = this._canBeDugCallback.bind(this);
        this._isWallCallback = this._isWallCallback.bind(this);
        this._priorityWallCallback = this._priorityWallCallback.bind(this);
    },

    _fillMap: function(value) {     // todo: move to base class
        var map = [];
        for (var y=0; y<this._height;y++) {
            var row = [];
            for (var x=0;x<this._width; x++) {
                row.push(value);
            }
            map.push(row);
        }
        return map;
    },

    // TODO: move to isometric "room" class
    /**
     * Room of random size, positioned around center coords
     */
    _createRandomCenter: function(cx, cy, options) {
        var min = options.roomWidth[0];
        var max = options.roomWidth[1];
        var width = min + Math.floor(RNG.getUniform()*(max-min+1));

        var min = options.roomHeight[0];
        var max = options.roomHeight[1];
        var height = min + Math.floor(RNG.getUniform()*(max-min+1));

        var x1 = cx - Math.floor(RNG.getUniform()*width);
        var y1 = cy - Math.floor(RNG.getUniform()*height);
        var x2 = x1 + width - 1;
        var y2 = y1 + height - 1;

        return new this(x1, y1, x2, y2);
    },

    /**
     * Create a map
     * @see ROT.Map#create
     */
    create: function(callback) {
        this._rooms = [];
        this._corridors = [];
        this._map = this._fillMap(1);
        this._walls = {};
        this._dug = 0;
        var area = (this._width-2) * (this._height-2);

        this._firstRoom();

        var t1 = Date.now();

        do {
            var t2 = Date.now();
            if (t2 - t1 > this._options.timeLimit) { break; }

            /* find a good wall */
            var wall = this._findWall();
            if (!wall) { break; } /* no more walls */

            var parts = wall.split(",");
            var x = parseInt(parts[0]);
            var y = parseInt(parts[1]);
            var dir = this._getDiggingDirection(x, y);
            if (!dir) { continue; } /* this wall is not suitable */

    //		console.log("wall", x, y);

            /* try adding a feature */
            var featureAttempts = 0;
            do {
                featureAttempts++;
                if (this._tryFeature(x, y, dir[0], dir[1])) { /* feature added */
                    if (this._rooms.length + this._corridors.length == 2) { this._rooms[0].addDoor(x, y); } /* first room oficially has doors */
                    this._removeSurroundingWalls(x, y);
                    this._removeSurroundingWalls(x-dir[0], y-dir[1]);
                    break;
                }
            } while (featureAttempts < this._featureAttempts);

            var priorityWalls = 0;
            for (var id in this._walls) {
                if (this._walls[id] > 1) { priorityWalls++; }
            }

        } while (this._dug/area < this._options.dugPercentage || priorityWalls); /* fixme number of priority walls */

        if (callback) {
            for (var i=0;i<this._width;i++) {
                for (var j=0;j<this._height;j++) {
                    callback(i, j, this._map[i][j]);
                }
            }
        }

        this._walls = {};
        this._map = null;
    },

    _digCallback: function(x, y, value) {
        if (value == 0 || value == 2) { /* empty */
            this._map[x][y] = 0;
            this._dug++;
        } else { /* wall */
            this._walls[x+","+y] = 1;
        }
    },

    _isWallCallback: function(x, y) {
        if (x < 0 || y < 0 || x >= this._width || y >= this._height) { return false; }
        return (this._map[x][y] == 1);
    },

    _canBeDugCallback: function(x, y) {
        if (x < 1 || y < 1 || x+1 >= this._width || y+1 >= this._height) { return false; }
        return (this._map[x][y] == 1);
    },

    _priorityWallCallback: function(x, y) {
        this._walls[x+","+y] = 2;
    },

    _firstRoom: function() {
        var cx = Math.floor(this._width/2);
        var cy = Math.floor(this._height/2);
        var room = this._createRandomCenter(cx, cy, this._options);
        this._rooms.push(room);
        room.create(this._digCallback);
    },

    /**
     * Get a suitable wall
     */
    _findWall: function() {
        var prio1 = [];
        var prio2 = [];
        for (var id in this._walls) {
            var prio = this._walls[id];
            if (prio == 2) {
                prio2.push(id);
            } else {
                prio1.push(id);
            }
        }

        var arr = (prio2.length ? prio2 : prio1);
        if (!arr.length) { return null; } /* no walls :/ */

        var id = arr.random();
        delete this._walls[id];

        return id;
    },

    /**
     * Tries adding a feature
     * @returns {bool} was this a successful try?
     */
    _tryFeature: function(x, y, dx, dy) {
        var feature = null;
        var total = 0;
        for (var p in this._features) { total += this._features[p]; }
        var random = Math.floor(ROT.RNG.getUniform()*total);

        var sub = 0;
        for (var p in this._features) {
            sub += this._features[p];
            if (random < sub) {
                feature = ROT.Map.Feature[p];
                break;
            }
        }

        feature = feature.createRandomAt(x, y, dx, dy, this._options);

        if (!feature.isValid(this._isWallCallback, this._canBeDugCallback)) {
    //		console.log("not valid");
    //		feature.debug();
            return false;
        }

        feature.create(this._digCallback);
    //	feature.debug();

        if (feature instanceof ROT.Map.Feature.Room) { this._rooms.push(feature); }
        if (feature instanceof ROT.Map.Feature.Corridor) {
            feature.createPriorityWalls(this._priorityWallCallback);
            this._corridors.push(feature);
        }

        return true;
    },

    _removeSurroundingWalls: function(cx, cy) {
        var deltas = ROT.DIRS[4];

        for (var i=0;i<deltas.length;i++) {
            var delta = deltas[i];
            var x = cx + delta[0];
            var y = cy + delta[1];
            delete this._walls[x+","+y];
            var x = cx + 2*delta[0];
            var y = cy + 2*delta[1];
            delete this._walls[x+","+y];
        }
    },

    /**
     * Returns vector in "digging" direction, or false, if this does not exist (or is not unique)
     */
    _getDiggingDirection: function(cx, cy) {
        var result = null;
        var deltas = ROT.DIRS[4];

        for (var i=0;i<deltas.length;i++) {
            var delta = deltas[i];
            var x = cx + delta[0];
            var y = cy + delta[1];

            if (x < 0 || y < 0 || x >= this._width || y >= this._width) { return null; }

            if (!this._map[x][y]) { /* there already is another empty neighbor! */
                if (result) { return null; }
                result = delta;
            }
        }

        /* no empty neighbor */
        if (!result) { return null; }

        return [-result[0], -result[1]];
    }

});
