/****
 * Convert from input array (simple 2d iso/rect map) to full graphics iso map
 * @type {*}
 */

IsometricGenerator = Class.extend({

    GROUND_LEVEL: 3,    // ground layer
    WATER: 0,           // ground layer

    GROUND_OBJECT: 2,   // object layer
    WALL: 1,            // object layer

    rules: [                                // built using Tiled terrain editor
        // ground layer
          { id:0,  terrain: "3,3,3,3" },
          { id:1,  terrain: "3,3,3,3" },
          { id:2,  terrain: "3,3,3,3" },
          { id:3,  terrain: "3,3,3,3" },
          { id:4,  terrain: "3,3,3,3" },
          { id:5,  terrain: "3,3,3,3" },
          { id:6,  terrain: "3,3,3,3" },
          { id:7,  terrain: "3,3,3,3" },
          { id:8,  terrain: "3,3,3,3" },
          { id:9,  terrain: "3,3,3,3" },
          { id:10,  terrain: "3,3,3,3" },
          { id:11,  terrain: "3,3,3,3" },
          { id:12,  terrain: "3,3,3,3" },
          { id:13,  terrain: "3,3,3,3" },
          { id:14,  terrain: "3,3,3,3" },
          { id:15,  terrain: "3,3,3,3" },
          { id:32,  terrain: "3,3,3,3" },
          { id:33,  terrain: "3,3,3,3" },
          { id:34,  terrain: "3,3,3,3" },
          { id:35,  terrain: "3,3,3,3" },
          { id:36,  terrain: "3,3,3,3" },
          { id:37,  terrain: "3,3,3,3" },
          { id:38,  terrain: "3,3,3,3" },
          { id:39,  terrain: "3,3,3,3" },

        { id:176,  terrain: "3,0,3,0" }, // water
        { id:177,  terrain: "3,3,0,0" },
        { id:178,  terrain: "0,3,0,3" },
        { id:179,  terrain: "0,0,3,3" },
        { id:180,  terrain: "3,0,3,0" },
        { id:181,  terrain: "3,3,0,0" },
        { id:182,  terrain: "0,3,0,3" },
        { id:183,  terrain: "0,0,3,3" },
        { id:184,  terrain: "3,0,3,3" },
        { id:185,  terrain: "3,3,3,0" },
        { id:186,  terrain: "3,3,0,3" },
        { id:187,  terrain: "0,3,3,3" },
        { id:188,  terrain: "3,0,3,3" },
        { id:189,  terrain: "3,3,3,0" },
        { id:190,  terrain: "3,3,0,3" },
        { id:191,  terrain: "0,3,3,3" },
        { id:192,  terrain: "0,0,3,0" },
        { id:193,  terrain: "3,0,0,0" },
        { id:194,  terrain: "0,3,0,0" },
        { id:195,  terrain: "0,0,0,3" },
        { id:196,  terrain: "0,0,3,0" },
        { id:197,  terrain: "3,0,0,0" },
        { id:198,  terrain: "0,3,0,0" },
        { id:199,  terrain: "0,0,0,3" },
        { id:200,  terrain: "0,0,0,0" },
        { id:201,  terrain: "0,0,0,0" },
        { id:202,  terrain: "0,0,0,0" },
        { id:203,  terrain: "0,0,0,0" },

    //wall rules
          { id:48,  terrain: "1,2,1,2" },  // wall to ground
          { id:49,  terrain: "1,1,2,2" },
          { id:50,  terrain: "2,1,2,1" },
          { id:51,  terrain: "2,2,1,1" },
          { id:52,  terrain: "1,2,1,2" },
          { id:53,  terrain: "1,1,2,2" },
          { id:54,  terrain: "2,1,2,1" },
          { id:55,  terrain: "2,2,1,1" },
          { id:56,  terrain: "1,1,1,2" },
          { id:57,  terrain: "1,1,2,1" },
          { id:58,  terrain: "2,1,1,1" },
          { id:59,  terrain: "1,2,1,1" },
          { id:60,  terrain: "1,1,1,2" },
          { id:61,  terrain: "1,1,2,1" },
          { id:62,  terrain: "2,1,1,1" },
          { id:63,  terrain: "1,2,1,1" },
          { id:64,  terrain: "1,2,2,2" },
          { id:65,  terrain: "2,1,2,2" },
          { id:66,  terrain: "2,2,2,1" },
          { id:67,  terrain: "2,2,1,2" },
          { id:68,  terrain: "1,2,2,2" },
          { id:69,  terrain: "2,1,2,2" },
          { id:70,  terrain: "2,2,2,1" },
          { id:71,  terrain: "2,2,1,2" },
          { id:80,  terrain: "1,2,1,2" },
          { id:81,  terrain: "1,1,2,2" },
          { id:82,  terrain: "1,1,1,2" },
          { id:83,  terrain: "1,2,2,2" },
          { id:84,  terrain: "1,2,1,2" },
          { id:85,  terrain: "1,1,2,2" },
          { id:86,  terrain: "1,1,1,2" },
          { id:87,  terrain: "1,2,2,2" },
          { id:88,  terrain: "1,2,1,2" },
          { id:89,  terrain: "1,1,2,2" },
          { id:90,  terrain: "2,1,2,1" },
          { id:91,  terrain: "2,2,1,1" },
          { id:92,  terrain: "1,2,1,2" },
          { id:93,  terrain: "1,1,2,2" },
          { id:96,  terrain: "1,2,1,2" },
          { id:97,  terrain: "1,1,2,2" },
          { id:98,  terrain: "1,1,1,2" },
          { id:99,  terrain: "1,2,2,2" },
          { id:130,  terrain: "2,2,2,2" }, // blocking Objects
          { id:131,  terrain: "2,2,2,2" },
          { id:132,  terrain: "2,2,2,2" },
          { id:133,  terrain: "2,2,2,2" },
          { id:134,  terrain: "2,2,2,2" },
          { id:137,  terrain: "2,2,2,2" }

    ],

    mushrooms: [117,118,119,120],

    tileset: '',
    rulesHash: {},
    vertexDirs: [2,0,1,3],

    init: function(tilset) {
        this.tilset = tilset;

        // process rules
        for (var i=0; i<this.rules.length; i++) {
            var rule = this.rules[i];
            if (this.rulesHash[rule.terrain]) {
                this.rulesHash[rule.terrain].push(rule.id+1);
            }
            else {
                this.rulesHash[rule.terrain] = [rule.id+1];
            }
        }
    },

    generateJSON: function(isoMapData, numOfRows, numOfCols) {
        var json = {
            "height":numOfRows,
            "layers":[
                {
                    "data": isoMapData[0],
                    "height":numOfRows,
                    "name":"Ground",
                    "opacity":1,
                    "type":"tilelayer",
                    "visible":true,
                    "width":numOfCols,
                    "x":0,
                    "y":0
                },
                {
                    "data": [],
                    "height":numOfRows,
                    "name":"sub-sprites",
                    "opacity":1,
                    "type":"spritelayer",
                    "visible":true,
                    "width":numOfCols,
                    "x":0,
                    "y":0
                },
                {
                    "data": isoMapData[1],
                    "height":numOfRows,
                    "name":"Object",
                    "opacity":1,
                    "type":"tilelayer",
                    "visible":true,
                    "width":numOfCols,
                    "x":0,
                    "y":0
                }],
            "orientation":"staggered",
            "properties":
            {

            },
            "tileheight":32,
            "tilesets":[
                {
                    "firstgid":1,
                    "image":"\/imgs\/tiled_cave_1_mod2.png",
                    "imageheight":1920,
                    "imagewidth":1024,
                    "margin":0,
                    "name":"tiled_cave_1",
                    "properties":
                    {

                    },
                    "spacing":0,
                    "tileheight":128,
                    "tilewidth":64
                }],
            "tilewidth":64,
            "version":1,
            "width":numOfCols
        }
        return json;
    },

    INPUT_WALL: 2,
    INPUT_WATER: 1,
    INPUT_GROUND: 0,

    // TODO: find a way to combine the generateIsoMaps logic for two input types (abstract the input, and abstract the output placement)
    generateIsoMapFromRectArray: function(mapData) {
        // mapData is array of row-arrays
        // 0 - ground  1-water   2-wall
        var numOfRows = mapData.length;
        var numOfCols = mapData[0].length;
        var isoNumRows = numOfRows+numOfCols-1;
        var isoNumCols = isoNumRows;

        var GROUND_LEVEL =  this.GROUND_LEVEL,
            WATER = this.WATER,
            GROUND_OBJECT = this.GROUND_OBJECT,
            WALL = this.WALL;

        var waterTile = [WATER,WATER,WATER,WATER].join(",");
        var groundLevelTile = [GROUND_LEVEL,GROUND_LEVEL,GROUND_LEVEL,GROUND_LEVEL].join(",");
        var groundObjectTile = [GROUND_OBJECT,GROUND_OBJECT,GROUND_OBJECT,GROUND_OBJECT].join(",");

        var groundLayer = [];
        var objectLayer = [];
        for (var i=0; i<isoNumRows*isoNumCols; i++) {
            groundLayer.push(0);
            objectLayer.push(0);
        }

        var vertDIRS = this.vertexDirs;
        var V_WEST= vertDIRS[0],  // vertex order
            V_NORTH= vertDIRS[1],
            V_EAST= vertDIRS[2],
            V_SOUTH= vertDIRS[3];


        var neighbors = [
            [ DIRS.WEST, [V_WEST, V_SOUTH]],
            [ DIRS.NORTH, [V_NORTH, V_WEST]],
            [ DIRS.EAST, [V_EAST, V_NORTH]],
            [ DIRS.SOUTH, [V_SOUTH, V_EAST]],
            [ DIRS.SOUTH_WEST,  [V_SOUTH]],   // neighbor to vertices
            [ DIRS.SOUTH_EAST,  [V_EAST]],
            [ DIRS.NORTH_WEST,  [V_WEST]],
            [ DIRS.NORTH_EAST,  [V_NORTH]]
        ];

        var isoX = 0;
        var isoY = numOfCols;

        for (var y=0; y<numOfRows; y++) {
            for (var x=0; x<numOfCols; x++) {
                var isoTid = isoY*isoNumCols + isoX;
                if (mapData[y][x] == 1) {
                    // water
                    groundLayer[isoTid] = this.rulesHash[waterTile].random();
                    //objectLayer[isoTid] = 0; // nothing above water so far
                }
                else if (mapData[y][x] == 2) {
                    // wall
                    var objectFlags = [WALL, WALL, WALL, WALL];
                    for (var i=0; i< neighbors.length; i++) {
                        var neighborToVertices = neighbors[i];
                        var neighbor = rectTopology.moveCoord(x,y, neighborToVertices[0]);
                        if (neighbor[0] >=0 && neighbor[1] >= 0 && neighbor[1] < numOfRows && neighbor[0] < numOfCols) {
                            if (mapData[neighbor[1]][neighbor[0]] == 0) {  // neighbor is ground
                                for (var vertInd=0; vertInd<neighborToVertices[1].length; vertInd++) {
                                    var vert = neighborToVertices[1][vertInd];
                                    objectFlags[vert] = GROUND_OBJECT;
                                }
                            }
                        }
                    }
                    objectFlags = objectFlags.join(",");
                    if (this.rulesHash[objectFlags]) {
                        objectLayer[isoTid] = this.rulesHash[objectFlags].random();
                        //groundLayer[isoTid] = 1;
                    }
                    if (objectFlags == groundObjectTile) {
                        // special case for blocking objects - fill ground too
                        groundLayer[isoTid] = this.rulesHash[groundLevelTile].random();
                    }
                }
                else {
                    // ground - choose tile based on neighbors
                    var groundFlags = [GROUND_LEVEL,GROUND_LEVEL,GROUND_LEVEL,GROUND_LEVEL];
                    for (var i=0; i< neighbors.length; i++) {
                        var neighborToVertices = neighbors[i];
                        var neighbor = rectTopology.moveCoord(x,y, neighborToVertices[0]);
                        if (neighbor[0] >=0 && neighbor[1] >= 0 && neighbor[1] < numOfRows && neighbor[0] < numOfCols) {
                            if (mapData[neighbor[1]][neighbor[0]] == 1) {  // neighbor is water
                                for (var vertInd=0; vertInd<neighborToVertices[1].length; vertInd++) {
                                    var vert = neighborToVertices[1][vertInd];
                                    groundFlags[vert] = WATER;
                                }
                            }
                        }
                    }

                    groundFlags = groundFlags.join(",");

                    if (this.rulesHash[groundFlags]) {
                        groundLayer[isoTid] = this.rulesHash[groundFlags].random();
                    }
                    if (RNG.getUniform() < 0.05) {
                        // place mushrooms in random
                        objectLayer[isoTid] = this.mushrooms.random();
                    }
                }

                var p = isoTopology.moveCoord(isoX, isoY, DIRS.NORTH_EAST);
                isoX = p[0];
                isoY = p[1];
                if (isoX < 0 || isoY < 0 || isoX > isoNumCols || isoY > isoNumRows) {
                    console.log("Errror!");
                }
            }
            isoX = (y/2).floor();
            isoY = numOfCols+y;
        }
        return [groundLayer, objectLayer, isoNumCols, isoNumRows];
    },


    // Note - walls that are too thin will be converted to blocking objects - not ideal but simple fix
    generateIsoMapFromIsoArray: function(mapData) {
        // mapData is array of row-arrays
        // 0 - ground  1-water   2-wall
        var numOfRows = mapData.length;
        var numOfCols = mapData[0].length;
        var isoNumRows = numOfRows;
        var isoNumCols = numOfCols;

        var GROUND_LEVEL =  this.GROUND_LEVEL,
            WATER = this.WATER,
            GROUND_OBJECT = this.GROUND_OBJECT,
            WALL = this.WALL;

        var waterTile = [WATER,WATER,WATER,WATER].join(",");
        var groundLevelTile = [GROUND_LEVEL,GROUND_LEVEL,GROUND_LEVEL,GROUND_LEVEL].join(",");
        var groundObjectTile = [GROUND_OBJECT,GROUND_OBJECT,GROUND_OBJECT,GROUND_OBJECT].join(",");

        var groundLayer = [];
        var objectLayer = [];
        for (var i=0; i<isoNumRows*isoNumCols; i++) {
            groundLayer.push(0);
            objectLayer.push(0);
        }

        var vertDIRS = this.vertexDirs;
        var V_WEST= vertDIRS[0],  // vertex order
            V_NORTH= vertDIRS[1],
            V_EAST= vertDIRS[2],
            V_SOUTH= vertDIRS[3];

        var neighbors = [
            [ DIRS.SOUTH_WEST, [V_WEST, V_SOUTH]],
            [ DIRS.NORTH_WEST, [V_NORTH, V_WEST]],
            [ DIRS.NORTH_EAST, [V_EAST, V_NORTH]],
            [ DIRS.SOUTH_EAST, [V_SOUTH, V_EAST]],
            [ DIRS.SOUTH,  [V_SOUTH]],   // neighbor to vertices
            [ DIRS.EAST,  [V_EAST]],
            [ DIRS.WEST,  [V_WEST]],
            [ DIRS.NORTH,  [V_NORTH]]
        ];

        for (var y=0; y<numOfRows; y++) {
            for (var x=0; x<numOfCols; x++) {
                var isoTid = y*isoNumCols + x;
                if (mapData[y][x] == 1) {
                    // water
                    groundLayer[isoTid] = this.rulesHash[waterTile].random();
                    //objectLayer[isoTid] = 0; // nothing above water so far
                }
                else if (mapData[y][x] == 2) {
                    // wall

                    var objectFlags = [WALL, WALL, WALL, WALL];
                    for (var i=0; i< neighbors.length; i++) {
                        var neighborToVertices = neighbors[i];
                        var neighbor = isoTopology.moveCoord(x,y, neighborToVertices[0]);
                        if (neighbor[0] >=0 && neighbor[1] >= 0 && neighbor[1] < numOfRows && neighbor[0] < numOfCols) {
                            if (mapData[neighbor[1]][neighbor[0]] == 0) {  // neighbor is ground
                                for (var vertInd=0; vertInd<neighborToVertices[1].length; vertInd++) {
                                    var vert = neighborToVertices[1][vertInd];
                                    objectFlags[vert] = GROUND_OBJECT;
                                }
                            }
                        }
                    }
                    objectFlags = objectFlags.join(",");
                    if (this.rulesHash[objectFlags]) {
                        objectLayer[isoTid] = this.rulesHash[objectFlags].random();
                        //groundLayer[isoTid] = 1;
                    }
                    if (objectFlags == groundObjectTile) {
                        // special case for blocking objects - fill ground too
                        groundLayer[isoTid] = this.rulesHash[groundLevelTile].random();
                    }
                }
                else {
                    // ground - choose tile based on neighbors

                    var groundFlags = [GROUND_LEVEL,GROUND_LEVEL,GROUND_LEVEL,GROUND_LEVEL];

                    for (var i=0; i< neighbors.length; i++) {
                        var neighborToVertices = neighbors[i];
                        var neighbor = isoTopology.moveCoord(x,y, neighborToVertices[0]);
                        if (neighbor[0] >=0 && neighbor[1] >= 0 && neighbor[1] < numOfRows && neighbor[0] < numOfCols) {
                            if (mapData[neighbor[1]][neighbor[0]] == 1) {  // neighbor is water
                                for (var vertInd=0; vertInd<neighborToVertices[1].length; vertInd++) {
                                    var vert = neighborToVertices[1][vertInd];
                                    groundFlags[vert] = WATER;
                                }
                            }
                        }
                    }

                    groundFlags = groundFlags.join(",");

                    if (this.rulesHash[groundFlags]) {
                        groundLayer[isoTid] = this.rulesHash[groundFlags].random();
                    }
                    if (RNG.getUniform() < 0.03) {
                        // place mushrooms in random
                        objectLayer[isoTid] = this.mushrooms.random();
                    }
                }

            }
        }
        return [groundLayer, objectLayer, isoNumCols, isoNumRows];
    }
})
