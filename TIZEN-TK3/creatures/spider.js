
var gSpiderMaterial = null;
var gSpiderGeom = null;



Spider = function(x,y,z) {
    var result= {

        animation: Animation({
            'attack_': 9,
            'walking_':8,
            'been_hit_':9,
            'spit_':9,
            'tipping_over_':9
        }),

        atlas: Atlas('atlas/red_spider.json'),
        texture: null,
        material: null,
        sprite: null,

        updateFrame: function() {
            var imgName = this.animation.getCurrentFrame();
            var spriteData = this.atlas.sprites[imgName];
//            this.spiderMaterial.uvOffset.x = spriteData.fx;
//            this.spiderMaterial.uvOffset.y = spriteData.fy;
//            this.spiderMaterial.uvScale.x = spriteData.fw;
//            this.spiderMaterial.uvScale.y = spriteData.fh;
            this.texture.repeat.x = fw=spriteData.fw;
            this.texture.repeat.y = fh=spriteData.fh;
            this.texture.offset.x = fx=spriteData.fx;
            this.texture.offset.y = fy=1-spriteData.fy-fh;
            //this.sprite.scale.set( 2*spriteData.w, 2*spriteData.h, 1.0 ); // imageWidth, imageHeight
        },

        init: function(x,y,z) {
            this.texture = THREE.ImageUtils.loadTexture(this.atlas.imgUrl);
            this.texture.wrapS     = THREE.ClampToEdgeWrapping;
            this.texture.wrapT     = THREE.ClampToEdgeWrapping;

            if (gSpiderGeom == null) {
                gSpiderGeom = new THREE.PlaneGeometry(64, 64);
            }
            this.material =  new THREE.MeshLambertMaterial( {
                map:this.texture,
                side:THREE.DoubleSide,
                transparent: true
            } );
            var sprite =   new THREE.Mesh(gSpiderGeom, this.material); //new THREE.Sprite( this.spiderMaterial );
            this.sprite = sprite;
            sprite.rotation.x-=Math.PI/2;
            sprite.rotation.z += 4*Math.PI/3;// account for camera-world angle - want the plane to be aligned with screen x axis not world x axis
            sprite.receiveShadow = true;

            sprite.position.set( x,y-30,z );
            this.animation.setCurrentAnimation('walking_', SOUTH);
            this.updateFrame();
        },

        lastDir:-999,

        update: function(dt) {
            if (!hero.mesh) {
                return;
            }
            var dx = hero.mesh.position.x - this.sprite.position.x;
            var dy = hero.mesh.position.z - this.sprite.position.z;
            var angle = Math.atan2(dx,dy) + 4*Math.PI/3; // acount for camera-world angle

            var dir = Math.floor(angle / (Math.PI/4));
            var resi = angle % (Math.PI/4);
            if (dir != this.lastDir) {
                console.log("Dir: "+dir+"  angle: "+angle + " "+resi);
                this.lastDir = dir;
                this.animation.setCurrentAnimation('walking_', (12-dir)%8 );
            }

            var needUpdate = this.animation.update(dt);
            if (needUpdate) {
                this.updateFrame();
            }

        }


    };

    result.init(x,y,z);
    return result;
}
