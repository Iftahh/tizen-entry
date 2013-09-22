
var gSpiderGeom = null;



Spider = function(x,y,z) {
    var result= {

        animation: new Animation({
            'attack_': 9,
            'walking_':8,
            'been_hit_':9,
            'spit_':9,
            'tipping_over_':9
        }),

        atlas: Atlas('atlas/red_spider.json'),
        twoDimSprite: null,


        updateFrame: function() {
            var imgName = this.animation.getCurrentFrame();
            var spriteData = this.atlas.sprites[imgName];
            this.twoDimSprite.setSpriteTexture(spriteData);
        },

        init: function(x,y,z) {
            if (gSpiderGeom == null) {
                gSpiderGeom = new THREE.PlaneGeometry(64, 64);
            }
            this.twoDimSprite = new TwoDimSprite(this, gSpiderGeom)

            this.sprite.position.set( x,y-30,z );
            this.animation.setCurrentAnimation('walking_', SOUTH);
            this.updateFrame();
        },

        directionVector: {x:0, z:0},  // not keeping track of the y axis - we move in a flat world for now

        update: function(dt) {
            if (!hero.mesh) {
                return;
            }
            this.directionVector = {
                x: hero.mesh.position.x - this.sprite.position.x,
                y: hero.mesh.position.z - this.sprite.position.z
            }

            this.twoDimSprite.setDirection(this.directionVector);
            var needUpdate = this.animation.update(dt);
            if (needUpdate) {
                this.updateFrame();
            }

        }


    };

    result.init(x,y,z);
    return result;
}
