
var gSpiderTexture = null;



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
            this.spiderMaterial.uvOffset.x = spriteData.fx;
            this.spiderMaterial.uvOffset.y = spriteData.fy;
            this.spiderMaterial.uvScale.x = spriteData.fw;
            this.spiderMaterial.uvScale.y = spriteData.fh;
//            gSpiderTexture.repeat.x = spriteData.w;
//            gSpiderTexture.repeat.y = spriteData.h;
//            gSpiderTexture.offset.x = spriteData.x;
//            gSpiderTexture.offset.y = spriteData.y;
            this.sprite.scale.set( 2*spriteData.w, 2*spriteData.h, 1.0 ); // imageWidth, imageHeight
        },

        init: function(x,y,z) {
            if (gSpiderTexture == null) {
                gSpiderTexture = THREE.ImageUtils.loadTexture(this.atlas.imgUrl);
                gSpiderTexture.wrapS     = THREE.ClampToEdgeWrapping;
                gSpiderTexture.wrapT     = THREE.ClampToEdgeWrapping;

            }
            this.spiderMaterial =  new THREE.SpriteMaterial( {
                map:gSpiderTexture,
                useScreenCoordinates: false,
                alignment: THREE.SpriteAlignment.bottomCenter,
                affectedByDistance: false
            } );
            var sprite = new THREE.Sprite( this.spiderMaterial );
            this.sprite = sprite;

            sprite.position.set( x,y,z );
            this.animation.setCurrentAnimation('walking_', EAST);
            this.updateFrame();
        },

        update: function(dt) {
            var needUpdate = this.animation.update(dt/10);
            if (needUpdate) {
                this.updateFrame();
            }

        }


    };

    result.init(x,y,z);
    return result;
}
