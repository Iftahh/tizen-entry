
// based on rot.js  Map.Cellular - but modified to use Topology for isometric staggered maps
CellularMazeGen = Class.extend({

    _map: [],
    _width: 100, // default width
    _height: 80, // default height
    _topology: isoTopology,

    _born: [3,4],
    _survive: [2,3,4],

    _wall: 2,
    _ground: 0,

    /**
     * Fill the map with random values
     * @param {float} probability Probability for a cell to become alive;
     */
    _randomize: function(probability) {
        this._map = this._fillMap(0);
        for (var i=0;i<this._width;i++) {
            for (var j=0;j<this._height;j++) {
                this._set(i,j, (RNG.getUniform() < probability ? this._wall : this._ground));
            }
        }
    },

    _fillMap: function(value) {
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
            console.log("error");
        }
       this._map[y][x] = value;
    },

    _get: function(x,y) {
        if (!this._map[y]) {
            console.log("error");
        }
        return this._map[y][x];
    },

    create: function(options, callback) {
        if (!options) { options = {}; }
        var w = this._width = options.w || this._width;
        var h = this._height = options.h || this._height;
        this._topology = options.topology || this._topology;

        var newMap = this._fillMap(this._ground);
        var born = this._born = options.born || this._born;
        var survive = this._survive = options.survive || this._survive;


        for (var j=0;j<this._height;j++) {
            for (var i=0; i<this._width; i++) {
                var cur = this._get(i,j);
                var ncount = this._getNeighbors(i, j);

                var val = this._ground;
                if (cur && survive.indexOf(ncount) != -1) { /* survive */
                    val = this._wall;
                    newMap[j][i] = val;
                } else if (!cur && born.indexOf(ncount) != -1) { /* born */
                    val = this._wall;
                    newMap[j][i] = val;
                }

                if (callback) { callback(i, j, val); }
            }
        }

        this._map = newMap;
        return this._map;
    },

    /**
     * Get neighbor count at [i,j] in this._map
     */
    _getNeighbors: function(cx, cy) {
        var result = 0;
        var topo = this._topology;
        var dirs = topo.closeNeighbors;
        for (var i=0; i<dirs.length; i++) {
            var dir = dirs[i];
            var xy = this._topology.moveCoord(cx,cy, dir);
            var x = xy[0];
            var y = xy[1];

            if (x < 0 || x >= this._width || y < 0 || y >= this._height) {
                // out of border counts same as current cell
                x = cx;
                y = cy;
            }
            if (this._get(x,y) == this._wall) {
                result++;
            }
        }

        return result;
    }
});
