
var EMPTY = 0;

var SpritesGrid = [];

var SpriteTileX = TileDimX /2;
var SpriteTileZ = TileDimZ /2;

var setSpriteGrid = function(x,z,val) {
    SpritesGrid[lenx*2*z+x] = val;
}

function initSpritesGrid() {
    // sprites grid are 2x2 cells for each cell of the map - for finer sprite collision and movement
    for (var z=0; z<lenz*2; z++) {
        for (var x=0; x<lenx*2; x++) {
            var map_val= get_map_xy(x>>1, z>>1);
            if (map_val>0) {
                setSpriteGrid(x,z, NOT_ALLOWED);
            }
            else {
                setSpriteGrid(x,z, EMPTY);
            }
        }
    }
}


function MovingCollision(entity) {

    this.entity = entity;

    this.x1 = null;
    this.x2 = null;
    this.z1 = null;
    this.z2 = null;
}


MovingCollision.prototype = {

    moveTo: function(cx, cz) {  // move to coordinate cx,cz

        var _x1 = Math.floor(cx / SpriteTileX + lenx);
        var _z1;
        if (_x1 == this.x1) {
            _z1 = Math.floor(cz / SpriteTileZ + lenz);
            if (_z1 == this.z1) {
                // sprite didn't move tile yet - nothing to do
                return;
            }
        }
        if (this.x1 != null) {
            // clear the previous mark
            for (var z= this.z1;  z<=this.z2; z++) {
                for (var x= this.x1;  x<=this.x2; x++) {
                    setSpriteGrid(x,z, EMPTY);
                }
            }
        }

        this.x1 = _x1;
        this.x2 = _x1+1;
        this.z1 = _z1;
        this.z2 = _z1+1;
        // mark sprite in new location
        for (var z= this.z1;  z<=this.z2; z++) {
            for (var x= this.x1;  x<=this.x2; x++) {
                setSpriteGrid(x,z, this.entity);
            }
        }
    },

    // if the location (cx,cz) is blocked - return what is blocking it
    isBlocked: function(cx, cz) {
        var x1 = Math.floor(cx / SpriteTileX + lenx);
        var x2 = x1+1;
        var z1 = Math.floor(cz / SpriteTileZ + lenz);
        var z2 = z1+1;
        for (var z= z1;  z<=z2; z++) {
            for (var x= x1;  x<=x2; x++) {
                var inCell = SpritesGrid[lenx*2*z+x];
                if (inCell != EMPTY && // will collide with something
                    inCell != this.entity) {   // and that something isn't self...
                    return inCell;
                }
            }
        }
        return EMPTY;
    }
}
