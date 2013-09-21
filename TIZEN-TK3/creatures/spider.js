
var gSpiderTexture = null;
var gSpiderGeom = null;

DEBUG=false;
fx=fy=0;
W=2023;
H=509;
fw=50/W;
fh=50/H;

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
        spiderMaterial: null,
        sprite: null,

        updateFrame: function() {
            var imgName = this.animation.getCurrentFrame();
            var spriteData = this.atlas.sprites[imgName];
//            this.spiderMaterial.uvOffset.x = spriteData.fx;
//            this.spiderMaterial.uvOffset.y = spriteData.fy;
//            this.spiderMaterial.uvScale.x = spriteData.fw;
//            this.spiderMaterial.uvScale.y = spriteData.fh;
            if (DEBUG) {
                   gSpiderTexture.repeat.x = fw;//spriteData.fw;
            gSpiderTexture.repeat.y = fh;//spriteData.fh;
            gSpiderTexture.offset.x = fx;//spriteData.fx;
            gSpiderTexture.offset.y = fy;//spriteData.fy;
            }
            else
            {
            gSpiderTexture.repeat.x = fw=spriteData.fw;
            gSpiderTexture.repeat.y = fh=spriteData.fh;
            gSpiderTexture.offset.x = fx=spriteData.fx;
            gSpiderTexture.offset.y = fy=1-spriteData.fy-fh;
                
            }
            //this.sprite.scale.set( 2*spriteData.w, 2*spriteData.h, 1.0 ); // imageWidth, imageHeight
        },

        init: function(x,y,z) {
            if (gSpiderTexture == null) {
                gSpiderTexture = THREE.ImageUtils.loadTexture(this.atlas.imgUrl);
                gSpiderTexture.wrapS     = THREE.ClampToEdgeWrapping;
                gSpiderTexture.wrapT     = THREE.ClampToEdgeWrapping;

                gSpiderGeom = new THREE.PlaneGeometry(30, 30);
            }
            this.spiderMaterial =  new THREE.MeshBasicMaterial( {
                map:gSpiderTexture,
                side:THREE.DoubleSide,
                transparent: true
            } );
            var sprite =   new THREE.Mesh(gSpiderGeom, this.spiderMaterial); //new THREE.Sprite( this.spiderMaterial );
            this.sprite = sprite;
            sprite.rotation.y -= Math.PI/2;
            sprite.receiveShadow = true;
            //sprite.castShadow = true;


            sprite.position.set( x,y,z );
            this.animation.setCurrentAnimation('walking_', SOUTH);
            this.updateFrame();
        },

        update: function(dt) {
            var needUpdate = this.animation.update(dt);
            if (needUpdate) {
                this.updateFrame();
            }

        }


    };

    result.init(x,y,z);
    return result;
}
