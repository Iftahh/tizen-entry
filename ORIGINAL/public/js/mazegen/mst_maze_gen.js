// Uses Kruskal MST (minimal spanning tree) to generate random maze


(function() {

// from c1, c2 to edge-id
    var _edge = function(c1, c2) {
        if (c1 > c2) {
            return c1+'_'+c2;
        }
        return c2+'_'+c1;
    };


    window.maze_gen = function  (options) {
        var t0 = new Date();
        var w = options.w = options.w || 40,
            h = options.h = options.h || 40,
            minRooms = options.minRooms = options.minRooms || 0,
            maxRooms = options.maxRooms = options.maxRooms || 0,
            minRoomWidth = options.minRoomWidth = options.minRoomWidth || 3,
            maxRoomWidth = options.maxRoomWidth = options.maxRoomWidth || 8,
            minRoomHeight = options.minRoomHeight = options.minRoomHeight || 3,
            maxRoomHeight = options.maxRoomHeight = options.maxRoomHeight || 8,
            roomWall = options.roomWall = options.roomWall || 0.8,
            roomOpening = options.roomOpening = options.roomOpening || 0.2,

            topology = options.topology = options.topology || rectTopology;

        console.log("Generating maze with w: "+w + " h:"+h + " rooms: "+minRooms + "-"+maxRooms+
            "  room-width: "+minRoomWidth+"-"+maxRoomWidth+"   room-height: "+minRoomHeight+"-"+maxRoomHeight);
        // from x,y to cell-id
        var _cell = function(x,y) {
            return (y*w) + x;
        }


        // use Kruskal algorithm for minimal spanning tree
        /*
         KRUSKAL(G):
         1 A = ∅
         2 foreach v ∈ G.V:
         3   MAKE-SET(v)
         4 foreach (u, v) ordered by weight(u, v), increasing:
         5    if FIND-SET(u) ≠ FIND-SET(v):
         6       A = A ∪ {(u, v)}
         7       UNION(u, v)
         8 return A */

        var cells = {}
        for (var c=0; c<=_cell(w-1,h-1); c++) {
            cells[c] = MakeSet({ cellId: c });
        }



        var A = [];
        var rooms = [];

        // generate a grid of edges
        var _edges = {};
        // put random weights
        for (var x=0; x<w; x++) {
            for (var y=0; y<h; y++) {
                var c = _cell(x,y);
                var neighbor = topology.moveCoord(x,y, topology.X_DIR);
                if (neighbor[0]<w && neighbor[1]<h) {
                    var cr = _cell(neighbor[0], neighbor[1]);
                    var eid = _edge(c, cr);
                    var ee = {
                        score: RNG.getUniform(),
                        edgeId: eid,
                        cid1: c,
                        cid2: cr,
                        c1: cells[c],
                        c2: cells[cr]
                    };
                    _edges[eid] = ee;
                }
                neighbor = topology.moveCoord(x,y, topology.Y_DIR);
                if (neighbor[0]<w && neighbor[1]<h) {
                    var cd = _cell(neighbor[0], neighbor[1]);
                    var eid2 = _edge(c, cd);
                    var ee2 = {
                        score: RNG.getUniform(),
                        edgeId: eid2,
                        cid1: c,
                        cid2: cd,
                        c1: cells[c],
                        c2: cells[cd]
                    }
                    _edges[eid2] = ee2;
                }
            }
        }

        var edgeScore = function(c1,c2, v) {
            if (v) {
                _edges[_edge(c1,c2)].score = v;
            }
            else {
                return _edges[_edge(c1,c2)].score;
            }
        }

        // generate rooms:
        var numRooms = getRandomInt(minRooms, maxRooms);
        console.log("Generating "+numRooms+ " rooms")
        for (var r=0; r<numRooms; r++) {
            var rw = getRandomInt(minRoomWidth, maxRoomWidth);
            var rh = getRandomInt(minRoomHeight, maxRoomHeight);
            var x0 = getRandomInt(1, w-rw-2);
            var y0 = getRandomInt(1, h-rh-2);
            rooms.push({x:x0, y:y0, w:rw, h:rh});
            console.log("Room "+r+ "  x,y: "+x0+","+y0+"  w,h: "+rw+","+rh);
            for (var x=0; x<rw; x++) {
                for (var y=0; y<rh; y++) {
                    var c = _cell(x0+x,y0+y);       // todo: use topology
                    if (x < rw-1) {
                        var cr = _cell(x0+x+1, y0+y);
                        var eid1 = _edge(c,cr);
                        var e1 = _edges[eid1];
                        A.push(e1);
                        Union(e1.c1, e1.c2);
                    }
                    if (y<rh-1) {
                        var cd = _cell(x0+x, y0+y+1);
                        var eid2 = _edge(c,cd);
                        var e2 = _edges[eid2];
                        A.push(e2);
                        Union(e2.c1, e2.c2);
                    }


                }
            }
            // place "barricades" around the room - make it harder to connect to outside the room
            for (var x=-1; x<rw+2; x++) {
                var c1 = _cell(x0+x,y0);
                var cd1 = _cell(x0+x, y0-1);
                var c2 = _cell(x0+x,y0+rh-1);
                var cd2 = _cell(x0+x, y0+rh);
                edgeScore(c1,cd1, RNG.getUniform()< roomOpening ?  roomOpening :  RNG.getUniform()*(1-roomWall)+roomWall);
                edgeScore(c2,cd2, RNG.getUniform()< roomOpening ?  roomOpening : RNG.getUniform()*(1-roomWall)+roomWall);
            }
            for (var y=-1; y<rh+2; y++) {
                var c1 = _cell(x0,y0+y);
                var cr1 = _cell(x0-1, y0+y);
                var c2 = _cell(x0+rw-1,y0+y);
                var cr2 = _cell(x0+rw, y0+y);
                edgeScore(c1,cr1, RNG.getUniform()< roomOpening ?  roomOpening : RNG.getUniform()*(1-roomWall)+roomWall);
                edgeScore(c2,cr2, RNG.getUniform()< roomOpening ?  roomOpening : RNG.getUniform()*(1-roomWall)+roomWall);
            }
        }

        var candidates = new BinaryHeap(function(e) { return e.score});
        for (var eid in _edges) {
            var ee = _edges[eid];
            candidates.push(ee);
        }


        while (candidates.size() > 0) {
            var minEdge = candidates.pop();
            if (Find(minEdge.c1) != Find(minEdge.c2)) {
                A.push(minEdge);
                Union(minEdge.c1, minEdge.c2);
            }
        }
        var maze = {
            edges: A,
            rooms: rooms,
            allEdges: _edges,
            options: options
        }
        console.log("generated in "+(new Date() - t0)+"ms");
        return maze;
    }

    // maze gen - but return as cells array and not edges array
    window.maze_gen_cells = function(options) {
        var w = options.w || 40;
        var hw = Math.ceil(w / 2);
        options.w = hw;
        var h = options.h || 40;
        var hh = Math.ceil(h / 2);
        options.h = hh;
        var maze = maze_gen(options);
        options.w = w;
        options.h = h;

        var cells = [];
        for (var i=0; i<w *h; i++) {
            cells.push(1);
        }
        // double each "cell" to 2x2 cells, and
        // convert each east-edge to  000     and south-edge to 01
        //                            11                        01
        //  if both then  000   but room areas to  00           0
        //                01                       00
        //                0
        for (var i=0; i<maze.edges.length; i++) {
            var edge = maze.edges[i];
            var c1 = edge.cid1;
            var c2 = edge.cid2;
            var x1 = 2*(c1 % hw);
            var y1 = 2*(Math.floor(c1/hw));
            var x2 = 2*(c2 % hw);
            var y2 = 2*(Math.floor(c2/hw));
            var minX = Math.min(x1,x2);
            var maxX = Math.max(x1,x2);
            var minY = Math.min(y1,y2);
            var maxY = Math.max(y1,y2)
            if (maxX > minX && minY == maxY) {
                cells[y1*w + minX*2] = 0;
                cells[y1*w + minX*2 + 1] = 0;
                cells[y1*w + minX*2 + 2] = 0;
            }
            if (minX == maxX && minY < maxY) {
                cells[minY*w + x1*2] = 0;
                cells[(minY+1)*w + x1*2] = 0;
                cells[(minY+2)*w + x1*2] = 0;
            }
        }
        for (var i=0; i<maze.rooms.length; i++) {
            var room = maze.rooms[i];
            for (var y= room.y*2; x<room.y+room.h*2; y++) {
                for (var x= room.x*2; x<room.x+room.w*2; x++) {
                    cells[y*options.w + x] = 0;
                }
            }
        }

        maze.cells = cells;
        return maze;
    }
})();

