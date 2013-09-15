DijkstraMap = Class.extend({

    _explorationData: [],
    _numOfCols: 0,
    _numOfRows: 0,

    NOT_EXPLORED: 2147483647,
    NOT_ALLOWED: 2147483646,

    _topology:  isoTopology,

    init: function(exploreData, topology) {
        if (topology)
            this._topology = topology;
        this._explorationData = exploreData;
    },

    generateExploration: function(mapData)  {  // same as mapData passed to IsoGenerator.generateIsoMapFromIsoArray
        // 0 - ground  1-water   2-wall
        var numOfRows = this._numOfRows = mapData.length;
        var numOfCols = this._numOfCols = mapData[0].length;
        console.log("Generating explore data - "+numOfCols+"x"+numOfRows);
        var NOT_EXPLORED = this.NOT_EXPLORED;
        var NOT_ALLOWED = this.NOT_ALLOWED;
        this._explorationData = new Array(numOfRows*numOfCols);
        var index =0;
        for (var y=0; y<numOfRows; y++) {
            var row = mapData[y];
            for (var x=0; x<numOfCols; x++) {
                if (row[x] == 0 ) {  // IsometricGenerator.INPUT_GROUND
                    this._explorationData[index] = NOT_EXPLORED;
                }
                else {
                    this._explorationData[index] = NOT_ALLOWED;
                }
                index++;
            }
        }
    },

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
        if (this._get(ex,ey) == this.NOT_ALLOWED) {
            console.log("Can't explore around "+ex+","+ey+" because not allowed there");
            return false;
        }

        var pointsToExplore = new BinaryHeap(function(xys) {
            return xys[2];
        } );

        this._explorationData[ey*this._numOfCols+ex] = 0;
        pointsToExplore.push([ex,ey, 0]);
        var NOT_EXPLORED = this.NOT_EXPLORED;

        var explored = 0;
        while (pointsToExplore.size() > 0) {
            var xys = pointsToExplore.pop(); // explore around smallest tile explored so far
            if (xys[2] > maxDist) {
                //console.log("breaking after "+explored+" explored, because reached score "+xys[2])
                break;
            }
            var newScore = xys[2]+1;
            var closeNeighbors = this._topology.closeNeighbors;
            for (var i=0; i<closeNeighbors.length; i++) {
                var dir = closeNeighbors[i];
                var xy = this._topology.moveCoord(xys[0], xys[1], dir);
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
            var farNeighbors = this._topology.farNeighbors;
            for (var i=0; i<farNeighbors.length; i++) {
                var dir = farNeighbors[i];
                var xy = this._topology.moveCoord(xys[0], xys[1], dir);
                if (  xy[0] < 0 || xy[0] >= this._numOfCols || xy[1] < 0 || xy[1] >= this._numOfRows) {
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


    smallestNeighbor: function(x, y) {
        var smallestVal = 2147483600;
        var result = {
            searchAround: [x, y]
        };

        // check the dirs in random order
        var dirs = FLAT_DIRS.slice();
        var searchAround = [x,y]
        // loop neighbors in random order - find smallest value
        while (dirs.length > 0) {
            // start from random neighbor
            var i= (RNG.getUniform()*dirs.length).floor();
            var dir = dirs[i];
            dirs.splice(i, 1);
            var xy = this._topology.moveCoord(searchAround[0], searchAround[1], dir);
            if (  xy[0] < 0 || xy[0] >= this._numOfCols || xy[1] < 0 || xy[1] >= this._numOfRows) {
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

});
