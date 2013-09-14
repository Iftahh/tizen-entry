DIRS = {  // directions
    EAST: 0,
    SOUTH_EAST: 1,
    SOUTH: 2,
    SOUTH_WEST: 3,
    WEST: 4,
    NORTH_WEST: 5,
    NORTH: 6,
    NORTH_EAST: 7,
    UP: 8,
    DOWN: 9
};

REVERSE_DIRS = [DIRS.WEST, DIRS.NORTH_WEST, DIRS.NORTH, DIRS.NORTH_EAST, DIRS.EAST, DIRS.SOUTH_EAST, DIRS.SOUTH, DIRS.SOUTH_WEST];

FLAT_DIRS = [DIRS.EAST, DIRS.SOUTH_EAST, DIRS.SOUTH, DIRS.SOUTH_WEST, DIRS.WEST, DIRS.NORTH_WEST, DIRS.NORTH, DIRS.NORTH_EAST];

isoTopology = {
    X_DIR: DIRS.NORTH_EAST,
    Y_DIR: DIRS.SOUTH_EAST,
    AX_DIR: DIRS.SOUTH_WEST,
    AY_DIR: DIRS.NORTH_WEST,

    closeNeighbors: [DIRS.NORTH_EAST, DIRS.SOUTH_EAST, DIRS.SOUTH_WEST, DIRS.NORTH_WEST],
    farNeighbors: [DIRS.NORTH, DIRS.SOUTH, DIRS.WEST, DIRS.EAST],

    moveCoord: function(x,y,dir) {
        switch (dir)
        {
            case DIRS.EAST: 	return [x+1,y];
            case DIRS.SOUTH:	return [x,y+2];
            case DIRS.WEST:	return [x-1,y];
            case DIRS.NORTH:	return [x,y-2];
        }

        if (y%2 != 0)
        {
            // if odd row
            switch (dir)
            {
                case DIRS.SOUTH_EAST:	return [x+1,y+1];
                case DIRS.SOUTH_WEST:	return [x,y+1];
                case DIRS.NORTH_WEST:	return [x,y-1];
                case DIRS.NORTH_EAST:	return [x+1,y-1];
            }
        }
        else
        {
            // even row
            switch (dir)
            {
                case DIRS.SOUTH_EAST:	return [x,y+1];
                case DIRS.SOUTH_WEST:	return [x-1,y+1];
                case DIRS.NORTH_WEST:	return [x-1,y-1];
                case DIRS.NORTH_EAST:	return [x,y-1];
            }
        }
        // shouldn't get here
        return [x,y];
    }
};


rectTopology = {
    X_DIR: DIRS.EAST,
    Y_DIR: DIRS.SOUTH,
    AX_DIR: DIRS.WEST,
    AY_DIR: DIRS.NORTH,

    closeNeighbors: [DIRS.NORTH, DIRS.SOUTH, DIRS.WEST, DIRS.EAST],
    farNeighbors: [DIRS.NORTH_EAST, DIRS.SOUTH_EAST, DIRS.SOUTH_WEST, DIRS.NORTH_WEST],

    moveCoord: function(x,y,dir) {
        switch (dir)
        {
            case DIRS.EAST: 	return [x+1,y];
            case DIRS.SOUTH:	return [x,y+1];
            case DIRS.WEST:	return [x-1,y];
            case DIRS.NORTH:	return [x,y-1];
            case DIRS.SOUTH_EAST:	return [x+1,y+1];
            case DIRS.SOUTH_WEST:	return [x-1,y+1];
            case DIRS.NORTH_WEST:	return [x-1,y-1];
            case DIRS.NORTH_EAST:	return [x+1,y-1];
        }
        // shouldn't get here
        return [x,y];
    }
}
