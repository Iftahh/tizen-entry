
// based on "Diffusion-limited aggregation" article: http://www.roguebasin.roguelikedevelopment.org/index.php?title=Diffusion-limited_aggregation
WalkerMazeGen = Class.extend({

    _map: [],
    // defaults:
    _width: 100,
    _height: 80,
    _topology: isoTopology,
    _minPercentDugDone: 30,
    _maxPercentDugDone: 40,

    _wall: 2,
    _ground: 0,

    percentDugDone: 0.35,

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

    _set: function(x, y, value) {
        if (!this._map[y]) {
            return;
        }
       this._map[y][x] = value;
    },

    _get: function(x,y) {
        if (!this._map[y]) {
            return;
        }
        return this._map[y][x];
    },

    create: function(options, progressCbk) {
        if (!progressCbk) {
            progressCbk = function(x, msg) { console.log(x+" "+(msg || ""));}
        }
        var t0 = new Date();
        if (!options) { options = {}; }
        var w = this._width = options.w || this._width;
        var h = this._height = options.h || this._height;
        var topo = this._topology = options.topology || this._topology;
        var ground = this._ground;
        var wall = this._wall;

        var percentDugDone = (this._minPercentDugDone + RNG.getUniform()*(this._maxPercentDugDone - this._minPercentDugDone)) / 100.0;
        this.percentDugDone = percentDugDone;

        this._map = this._fillMap(wall);
        var wallHash = {}
        for (var x=0; x<w; x++) {
            for (var y=0; y<h; y++) {
                wallHash[x+","+y] = true;
            }
        }

        var dug = 0;
        var that = this;
        var dig = function(x,y) {
            that._set(x,y, ground);
            delete wallHash[x+','+y];
            dug++;
        }




        var x0 = (w/2).floor();
        var y0 = (h/2).floor();
        var dugHash = {};
        var inDig = function(x,y) {
            var k = x+","+y;
            if (!dugHash[k]) {
                dig(x,y);
                dugHash[k] = true;
            }
        }
        inDig(x0,y0);

        var dig2x2 = function(x,y) {
            x = parseInt(x);
            y = parseInt(y);
            if (x < 5 || x > w-5 || y < 5 || y > h-5) {
                return;
            }
            inDig(x,y);
            var xy = topo.moveCoord(x, y, DIRS.EAST);
            inDig(xy[0], xy[1]);
            xy = topo.moveCoord(x, y, DIRS.SOUTH_EAST);
            inDig(xy[0], xy[1]);
            xy = topo.moveCoord(x, y, DIRS.NORTH_EAST);
            inDig(xy[0], xy[1]);
        }

        var lastPercent = 0;
        var total = w * h;
        var percent = dug / total;

        // dig some % from the inside
        var endPoints = [[x0,y0]];
        while (percent < 0.03) {
            if (percent - lastPercent > 0.01) {
                lastPercent = percent;
                progressCbk(percent);
            }
            var xy = endPoints.random();
            var dir = topo.closeNeighbors.random();
            var run = RNG.getMinMax(3,8);
            for (var i=0; i<run; i++) {
                var x = parseInt(xy[0]);
                var y = parseInt(xy[1]);
                xy = topo.moveCoord(x, y, dir);
                dig2x2(xy[0], xy[1]);
            }
            endPoints.push(xy);
            percent = dug/total;
        }


        var walkers = 0;
        var moves = 0;
        var dirs = topo.closeNeighbors;
        var dirHash = {} // from a direction to the other directions
        for (var i=0; i<dirs.length; i++) {
            var dir = dirs[i];
            var otherDirs = [];
            for (var j=0; j<dirs.length; j++) {
                if (j!=i) {
                    otherDirs.push(dirs[j]);
                }
            }
            dirHash[dir] = otherDirs;
        }
        // below is good for iso topology only, fix for rect-topo
        dirHash.nearTop = [DIRS.SOUTH_EAST, DIRS.SOUTH_WEST];
        dirHash.nearBottom = [DIRS.NORTH_EAST, DIRS.NORTH_WEST];
        dirHash.nearLeft = [DIRS.SOUTH_EAST, DIRS.NORTH_EAST];
        dirHash.nearRight = [DIRS.SOUTH_WEST, DIRS.NORTH_WEST];


        while (percent < percentDugDone) {
            // while not dug enough generate a walker
            var x1y1 = Object.keys(wallHash).random().split(",");
            var x2 = parseInt(x1y1[0])
            var y2 = parseInt(x1y1[1])
            var x3 = null;
            var y3 = null;
            walkers++;
            // walk until hit wall
            var dir = dirs.random();
            while (true) {
                if (x2 <= 1 || (x2<5 && RNG.getUniform()<0.4)) {
                    if (y2 <= 1 || (y2<5 && RNG.getUniform()<0.4)) {
                        dir = DIRS.SOUTH_EAST;
                    }
                    else if (y2 >= h-1 || (y2 > h-5 && RNG.getUniform()<0.4)) {
                        dir = DIRS.NORTH_EAST;
                    }
                    dir = dirHash.nearLeft.random();
                }
                else if (x2 >= w-1 || (x2 > w-5 && RNG.getUniform()<0.4)) {
                    if (y2 <= 1 || (y2<5 && RNG.getUniform()<0.4)) {
                        dir = DIRS.SOUTH_WEST;
                    }
                    else if (y2 >= h-1 || (y2 > h-5 && RNG.getUniform()<0.4)) {
                        dir = DIRS.NORTH_WEST;
                    }
                    dir = dirHash.nearRight.random();
                }
                else if (y2 <= 1 || (y2<5 && RNG.getUniform()<0.4)) {
                    dir = dirHash.nearTop.random();
                }
                else if (y2 >= h-1 || (y2 > h-5 && RNG.getUniform()<0.4)) {
                    dir = dirHash.nearBottom.random();
                }
                else {
                    dir = dirHash[dir].random();
                }

                if ((new Date() - t0) > 60000) {
                    progressCbk(-1, "ERROR::: Quiting because takes too long");
//                    console.log("quiting because too long");
                    return this._map;
                }
                moves++;
                // walk in direction
                var movedTo = topo.moveCoord(x2, y2, dir);
                var x1 = movedTo[0];
                var y1 = movedTo[1];
                if (x1 < 0 || x1 >= w || y1 < 0 || y1 >= h) {
//                    console.log("stopping walker because out of bound "+x1+","+y1)
                    break;
                }
                if (this._get(x1, y1) == ground) {
                    // dig and start new walker
                    dig(x2, y2);
                    if (x3 != null) {
                        dig(x3,y3); // speedup - dig previous one as well
                    }
                    break;
                }
                x3 = x2;
                y3 = y2;
                x2 = x1;
                y2 = y1;

            }
            percent = dug/total;
            if (percent - lastPercent > 0.01) {
                lastPercent = percent;
                progressCbk(percent);
            }
        }

        progressCbk(-1, "Generated in "+(new Date() - t0) + "ms, with "+walkers+" walkers, "+moves+" moves, and "+(dug*100 / total)+" percent dug");
//        console.log("Generated in "+(new Date() - t0) + "ms, with "+walkers+" walkers, "+moves+" moves, and "+(dug*100 / total)+" percent dug")
        return this._map;
    }
});
