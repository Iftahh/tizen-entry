var NOT_EXPLORED= 2147483647;
var NOT_ALLOWED= 2147483646;

DijkstraMap = function() {

    this._preExplore= [];
    this._explorationData= [];
    this._numOfCols= 0;
    this._numOfRows= 0;


    var numOfRows = this._numOfRows = lenz;
    var numOfCols = this._numOfCols = lenx;
    console.log("Generating explore data - "+numOfCols+"x"+numOfRows);
    this._preExplore = new Array(numOfRows*numOfCols);

    var index =0;
    for (var y=0; y<numOfRows; y++) {
        for (var x=0; x<numOfCols; x++) {
            if (get_map_xz(x,y) == 0 ) {
                this._preExplore[index] = NOT_EXPLORED;
            }
            else {
                this._preExplore[index] = NOT_ALLOWED;
            }
            index++;
        }
    }
}

DijkstraMap.prototype = {
    _set: function(x,y, val) {
        this._explorationData[y*this._numOfCols + x] = val;
    },

    _get: function(x, y) {
//        if (x < 0 || x>= this._numOfCols || y<0 || y>= this._numOfRows) {
//            console.log("Error - "+x+","+y);
//            return this.NOT_ALLOWED;
//        }
        return this._explorationData[y*this._numOfCols + x];
    },

    explore: function(ex, ey, maxDist) {
        var t0 = Date.now();
        if (!maxDist) {
            maxDist = 99999;
        }
        this._explorationData = this._preExplore.slice();
        if (this._get(ex,ey) == this.NOT_ALLOWED) {
            console.log("Can't explore around "+ex+","+ey+" because not allowed there");
            return false;
        }

        var pointsToExplore = new BinaryHeap(function(xys) {
            return xys[2];
        } );

        this._explorationData[ey*this._numOfCols+ex] = 0;
        pointsToExplore.push([ex,ey, 0]);

        var explored = 0;
        while (pointsToExplore.size() > 0) {
            var xys = pointsToExplore.pop(); // explore around smallest tile explored so far
            if (xys[2] > maxDist) {
                //console.log("breaking after "+explored+" explored, because reached score "+xys[2])
                break;
            }
            var newScore = xys[2]+1;
            var closeNeighbors = Topology.closeNeighbors;
            for (var i=0; i<closeNeighbors.length; i++) {
                var dir = closeNeighbors[i];
                var xy = Topology.moveCoord(xys[0], xys[1], dir);
                if (  xy[0] < 0 || xy[0] >= this._numOfCols || xy[1] < 0 || xy[1] >= this._numOfRows) {
                    continue;
                }

                if (this._get(xy[0], xy[1]) ==  NOT_EXPLORED) {
                    this._explorationData[xy[1]*this._numOfCols+xy[0]] = newScore;
                    explored++;
                    pointsToExplore.push([xy[0],xy[1], newScore]);
                }
            }
            newScore = xys[2]+1.414213562;  // sqrt(2) for diagnoals - hopefully this will make the moving more natural - instead of zig-zagging diagonally
            var farNeighbors = Topology.farNeighbors;
            for (var i=0; i<farNeighbors.length; i++) {
                var dir = farNeighbors[i];
                var xy = Topology.moveCoord(xys[0], xys[1], dir);
                if (  xy[0] < 0 || xy[0] >= this._numOfCols || xy[1] < 0 || xy[1] >= this._numOfRows
                      || this._get(xys[0], xy[1]) ==  NOT_ALLOWED || this._get(xy[0], xys[1]) ==  NOT_ALLOWED
                ) {
                    continue;
                }

                if (this._get(xy[0], xy[1]) ==  NOT_EXPLORED) {
                    this._explorationData[xy[1]*this._numOfCols+xy[0]] = newScore;
                    explored++;
                    pointsToExplore.push([xy[0],xy[1], newScore]);
                }
            }
        }
        if (maxDist == 99999)
            console.log("Explored around "+ex+","+ey+"  in "+(Date.now() - t0)+"ms,  "+explored+" tiles explored");
        return true;
    },


    smallestNeighbor: function(x, y, ignoreDirs) {
        var smallestVal = 2147483600;
        var result = {
            searchAround: [x, y]
        };

        // check the dirs in random order
        var dirs = FLAT_DIRS.slice();
        if (ignoreDirs) {
            // don't check these dirs
            for (var di=0; di<ignoreDirs.length; di++) {
                var dirToIgnore = ignoreDirs[di];
                dirs.splice(dirs.indexOf(dirToIgnore), 1);
            }
        }
        var searchAround = [x,y];
        // loop neighbors in random order - find smallest value
        while (dirs.length > 0) {
            // start from random neighbor -
            var i= Math.floor(Math.random()*dirs.length);
            var dir = dirs[i];
            dirs.splice(i, 1);
            var xy = Topology.moveCoord(searchAround[0], searchAround[1], dir);
            if (  xy[0] < 0 || xy[0] >= this._numOfCols || xy[1] < 0 || xy[1] >= this._numOfRows
                      || this._get(x, xy[1]) ==  NOT_ALLOWED || this._get(xy[0],y) ==  NOT_ALLOWED
            ) {
                continue;
            }

            var val = this._get(xy[0], xy[1]);
            if (val < smallestVal) {
                smallestVal = val;
                result.direction = dir;
                result.smallestVal = val;
                result.moveTo = xy;
            }
        }

        return result;
    }

};
