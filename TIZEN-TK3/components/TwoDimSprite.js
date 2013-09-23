
// requires the container has "atlas" and "animation"  and "rotationSpeed" components

var TwoDimSprite = function(container) {

    this.container = container;

    this.texture = THREE.ImageUtils.loadTexture(container.atlas.imgUrl);
    this.texture.wrapS     = THREE.ClampToEdgeWrapping;
    this.texture.wrapT     = THREE.ClampToEdgeWrapping;

    this.material =  new THREE.MeshBasicMaterial( {
//    this.material =  new THREE.MeshBasicMaterial( {

        map: this.texture,
        side:THREE.DoubleSide,
        transparent: true
    } );

    this.angle = this.targetAngle = -Math.PI/2;
    this.vr = 0; // rotation velocity;

    var sprite =   new THREE.Mesh(gSpiderGeom, this.material); //new THREE.Sprite( this.spiderMaterial );
    sprite.rotation.x = -Math.PI/2;
    sprite.rotation.z = 4*Math.PI/3;// account for camera-world angle - want the plane to be aligned with screen x axis not world x axis
    sprite.receiveShadow = true;
    //sprite.matrixAutoUpdate = false;
    sprite.updateMatrix();
    this.sprite = sprite;
    container.sprite = sprite;
}

var USE_RESIDUE_ANGLE = false;

TwoDimSprite.prototype = {

    setSpriteTexture: function(spriteData) {
        this.texture.repeat.x = spriteData.fw;
        this.texture.repeat.y = spriteData.fh;
        this.texture.offset.x = spriteData.fx;
        this.texture.offset.y = 1-spriteData.fy-spriteData.fh;
    },


    setDirection: function(vector) {
        this.targetAngle = Math.atan2(vector.x, vector.z) + 4*Math.PI/3; // acount for camera-world angle
        this.angle = this.targetAngle;
//        var angle = this.angle - this.targetAngle;
//        while (angle < 0) {
//            angle += Math.PI*2;
//        }
//        while(angle > Math.PI*2) {
//            angle -= Math.PI*2;
//        }
//        if (angle > Math.PI) {
//            this.vr = -this.container.rotationSpeed;
//        }
//        else {
//            this.vr = this.container.rotationSpeed;
//        }
    },


    update: function(dt) {
//        if (Math.abs(this.angle - this.targetAngle)%(Math.PI*2) < Math.abs(this.vr)) {
//            this.angle = this.targetAngle;
//            this.vr = 0;
//        }
//        else {
//            this.angle += this.vr;
//        }

        var dir = Math.floor(this.angle / (Math.PI/4));
        if (USE_RESIDUE_ANGLE) {
            var resi = this.angle % (Math.PI/4);  // TODO: rotate sprite a bit by residue of angle
            this.sprite.rotation.z = 4*Math.PI/3 + resi - Math.PI/8;
        }
        dir = (12-dir)%8;
        var animation = this.container.animation;
        if (dir != animation.currentDirection) {
            animation.setCurrentAnimation(animation.currentAnimation, dir );
        }
    }

}
