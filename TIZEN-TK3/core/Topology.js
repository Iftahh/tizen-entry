
var EAST= 0,
    SOUTH_EAST= 1,
    SOUTH= 2,
    SOUTH_WEST= 3,
    WEST= 4,
    NORTH_WEST= 5,
    NORTH= 6,
    NORTH_EAST= 7;
    //UP= 8,
    //DOWN= 9;

DIR_TO_STR = [ "e", "se", "s", "sw", "w", "nw", "n", "ne"];
REVERSE_DIRS = [WEST, NORTH_WEST, NORTH, NORTH_EAST, EAST, SOUTH_EAST, SOUTH, SOUTH_WEST];
FLAT_DIRS = [EAST, SOUTH_EAST, SOUTH, SOUTH_WEST, WEST, NORTH_WEST, NORTH, NORTH_EAST];

Topology = {
    X_DIR: EAST,
    Y_DIR: SOUTH,
    AX_DIR: WEST,
    AY_DIR: NORTH,

    closeNeighbors: [NORTH, SOUTH, WEST, EAST],  // neighbors distance 1
    farNeighbors: [NORTH_EAST, SOUTH_EAST, SOUTH_WEST, NORTH_WEST], // neighbors of distance 1.414  (ie. sqrt(2))

    moveCoord: function(x,y,dir) {
        switch (dir)
        {
            case EAST: 	        return [x+1,y];
            case SOUTH:	        return [x,y+1];
            case WEST:	        return [x-1,y];
            case NORTH:	        return [x,y-1];
            case SOUTH_EAST:	return [x+1,y+1];
            case SOUTH_WEST:	return [x-1,y+1];
            case NORTH_WEST:	return [x-1,y-1];
            case NORTH_EAST:	return [x+1,y-1];
        }
        // shouldn't get here
        return [x,y];
    }
}
