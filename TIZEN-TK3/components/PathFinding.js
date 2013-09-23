

PlayerChaseMap = new DijkstraMap()

// requires the container has "sprite.position"  and "speed"

PathFinding = function(container, dijkstraMap) {

    this.dijkstraMap = dijkstraMap;

    this.container = container;

    this.nextTileX = null;  // next tile to move to (in map)
    this.nextTileZ = null;
    //this.nextX = -1;  // next coordinate to move to (in world)
    //this.nextZ = -1;
    var tileXZ = coordinateToTile(container.sprite.position.x, container.sprite.position.z)
    this.currTileX= tileXZ[0];
    this.currTileZ= tileXZ[1];
    this.vx = 0;  // how much to move each step
    this.vz = 0;
    this.directionVector = { x:0, z:1 } // no need for y - we walk in 2d floor
}


PathFinding.prototype = {

    update: function(dt) {
        var container = this.container;

        if (this.nextTileX === null) {
            var tileXZ = coordinateToTile(container.sprite.position.x, container.sprite.position.z)

            // need to search next tile to move to
            var result = this.dijkstraMap.smallestNeighbor(tileXZ[0], tileXZ[1]);
            if (result.moveTo) {
                this.nextTileX = result.moveTo[0];
                this.nextTileZ = result.moveTo[1];
                var xz = tileToCoordinate(this.nextTileX, this.nextTileZ);
                this.nextX = xz[0];
                this.nextZ = xz[1];

                var dx = this.nextX - container.sprite.position.x;
                var dz = this.nextZ - container.sprite.position.z;
                var r = Math.sqrt(dx*dx + dz*dz);
                this.directionVector = {x: dx/r,  z:dz/r}
                this.vx = this.container.speed * this.directionVector.x;
                this.vz = this.container.speed * this.directionVector.z;
            }
        }

        if (this.nextTileX != null) {
            // we have a next tile to move to - start moving
            var dx = this.nextX - container.sprite.position.x;
            var dz = this.nextZ - container.sprite.position.z;
            if (Math.abs(dx) < Math.abs(this.vx) ||  Math.abs(dz) < Math.abs(this.vz)) {
                container.sprite.position.x = this.nextX;
                container.sprite.position.z = this.nextZ;
                this.nextTileX = null;
            }
            else {
                container.sprite.position.x += this.vx;
                container.sprite.position.z += this.vz;
            }
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
        //         this.vx = this.container.speed * this.directionVector.x;
        //         this.vz = this.container.speed * this.directionVector.z;
        //     }
        // }

        // if (this.nextTileX != null) {
        //     // we have a next tile to move to - start moving
        //     var nextTileXZ = coordinateToTile(container.sprite.position.x+this.vx, container.sprite.position.z+this.vz)
        //     var nextTileX= nextTileXZ[0];
        //     var nextTileZ= nextTileXZ[1];
        //     if ((nextTileX!=this.currTileX)||(nextTileZ!=this.currTileZ)) {
        //         this.currTileX= nextTileX;
        //         this.currTileZ= nextTileZ;
        //         this.nextTileX = null;
        //     }
        //     container.sprite.position.x += this.vx;
        //     container.sprite.position.z += this.vz;
        // }

    }



}
