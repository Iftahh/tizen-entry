
// requires the container has "atlas" and "animation" components

var TwoDimSprite = function(container) {

    this.container = container;

    this.texture = THREE.ImageUtils.loadTexture(container.atlas.imgUrl);
    this.texture.wrapS     = THREE.ClampToEdgeWrapping;
    this.texture.wrapT     = THREE.ClampToEdgeWrapping;

    this.material =  new THREE.MeshLambertMaterial( {
        map:this.texture,
        side:THREE.DoubleSide,
        transparent: true
    } );

    var sprite =   new THREE.Mesh(gSpiderGeom, this.material); //new THREE.Sprite( this.spiderMaterial );
    sprite.rotation.x-=Math.PI/2;
    sprite.rotation.z += 4*Math.PI/3;// account for camera-world angle - want the plane to be aligned with screen x axis not world x axis
    sprite.receiveShadow = true;

    container.sprite = sprite;
}


TwoDimSprite.prototype = {

    setSpriteTexture: function(spriteData) {
        this.texture.repeat.x = fw=spriteData.fw;
        this.texture.repeat.y = fh=spriteData.fh;
        this.texture.offset.x = fx=spriteData.fx;
        this.texture.offset.y = fy=1-spriteData.fy-fh;
    },


    setDirection: function(vector) {
        var angle = Math.atan2(vector.x, vector.y) + 4*Math.PI/3; // acount for camera-world angle
        var dir = Math.floor(angle / (Math.PI/4));
        //var resi = angle % (Math.PI/4);  // TODO: rotate sprite a bit by residue of angle
        dir = (12-dir)%8;
        var animation = this.container.animation;
        if (dir != animation.currentDirection) {
            animation.setCurrentAnimation(animation.currentAnimation, dir );
        }
    }

}
