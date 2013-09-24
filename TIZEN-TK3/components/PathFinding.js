

PlayerChaseMap = new DijkstraMap()

// requires the entity has "sprite.position"  and "speed",  "movingCollision"

PathFinding = function(entity, dijkstraMap) {

    this.dijkstraMap = dijkstraMap;

    this.entity = entity;

    this.nextTileX = null;  // next tile to move to (in map)
    this.nextTileZ = null;
    //this.nextX = -1;  // next coordinate to move to (in world)
    //this.nextZ = -1;
    var tileXZ = coordinateToTile(entity.sprite.position.x, entity.sprite.position.z)
    this.currTileX= tileXZ[0];
    this.currTileZ= tileXZ[1];
    this.vx = 0;  // how much to move each step
    this.vz = 0;
    this.directionVector = { x:0, z:1 } // no need for y - we walk in 2d floor
}


PathFinding.prototype = {

    update: function(dt) {
        var entity = this.entity;

        if (this.nextTileX === null) {
            var tileXZ = coordinateToTile(entity.sprite.position.x, entity.sprite.position.z)

            // need to search next tile to move to
            var ignoreDirs = [];
            while(true) {
                var result = this.dijkstraMap.smallestNeighbor(tileXZ[0], tileXZ[1], ignoreDirs);
                if (!result.moveTo) {
                    break;
                }

                var nextTileX = result.moveTo[0];
                var nextTileZ = result.moveTo[1];
                var xz = tileToCoordinate(nextTileX, nextTileZ);
                var nextX = xz[0];
                var nextZ = xz[1];

                var dx = nextX - entity.sprite.position.x;
                var dz = nextZ - entity.sprite.position.z;

                // check if at location 0.25 of the way to next tile the sprite is blocked by a moving collision
                var checkX = entity.sprite.position.x + dx*.25;
                var checkZ = entity.sprite.position.z + dz*.25;
                var blockedBy = entity.movingCollision.isBlocked(checkX, checkZ)
                if (blockedBy != EMPTY && blockedBy != NOT_ALLOWED) {
                    // moving to this tile is ok by the walls - but the way is blocked by moving sprite - try to find another route
                    ignoreDirs.push(result.direction);
                    continue;
                }

                this.nextTileX = nextTileX;
                this.nextTileZ = nextTileZ;
                this.nextX = nextX;
                this.nextZ = nextZ;
                var r = Math.sqrt(dx*dx + dz*dz);
                this.directionVector = {x: dx/r,  z:dz/r}
                this.vx = this.entity.speed * this.directionVector.x;
                this.vz = this.entity.speed * this.directionVector.z;
                break;
            }
        }

        if (this.nextTileX != null) {
            // we have a next tile to move to - start moving
            var dx = this.nextX - entity.sprite.position.x;
            var dz = this.nextZ - entity.sprite.position.z;
            if (Math.abs(dx) < Math.abs(this.vx) ||  Math.abs(dz) < Math.abs(this.vz)) {
                entity.sprite.position.x = this.nextX;
                entity.sprite.position.z = this.nextZ;
                this.nextTileX = null;
            }
            else {
                var px = entity.sprite.position.x + this.vx;
                var pz = entity.sprite.position.z + this.vz;
                var blockedBy = entity.movingCollision.isBlocked(px, pz);
                if (blockedBy != EMPTY && blockedBy != NOT_ALLOWED) {
                    // moving here will collide with a moving-collision - change direction
                    this.nextTileX = null;
                }
                else {
                    entity.sprite.position.x = px;
                    entity.sprite.position.z = pz;
                }
            }

            entity.movingCollision.moveTo(entity.sprite.position.x, entity.sprite.position.z )
        }

        // velocity field         
        // if (this.nextTileX === null) {
        //     // need to search next tile to move to
        //     var result = this.dijkstraMap.smallestNeighbor(this.currTileX, this.currTileZ);
        //     if (result.moveTo) {
        //         this.nextTileX = result.moveTo[0];
        //         this.nextTileZ = result.moveTo[1];

        //         var dx = this.nextTileX - this.currTileX;
        //         var dz = this.nextTileZ - this.currTileZ;
        //         var r = Math.sqrt(dx*dx + dz*dz);
        //         this.directionVector = {x: dx/r,  z:dz/r}
        //         this.vx = this.entity.speed * this.directionVector.x;
        //         this.vz = this.entity.speed * this.directionVector.z;
        //     }
        // }

        // if (this.nextTileX != null) {
        //     // we have a next tile to move to - start moving
        //     var nextTileXZ = coordinateToTile(entity.sprite.position.x+this.vx, entity.sprite.position.z+this.vz)
        //     var nextTileX= nextTileXZ[0];
        //     var nextTileZ= nextTileXZ[1];
        //     if ((nextTileX!=this.currTileX)||(nextTileZ!=this.currTileZ)) {
        //         this.currTileX= nextTileX;
        //         this.currTileZ= nextTileZ;
        //         this.nextTileX = null;
        //     }
        //     entity.sprite.position.x += this.vx;
        //     entity.sprite.position.z += this.vz;
        // }

    }



}
