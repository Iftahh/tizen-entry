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

        atlas: Atlas('red_spider.json'),
        twoDimSprite: null,
        speed: 1,
        rotationSpeed:1,

        updateFrame: function() {
            var imgName = this.animation.getCurrentFrame();
            var spriteData = this.atlas.sprites[imgName];
            this.twoDimSprite.setSpriteTexture(spriteData);
        },

        init: function(x,y,z) {
            if (gSpiderGeom == null) {
                gSpiderGeom = new THREE.PlaneGeometry(64, 64);
            }
            this.twoDimSprite = new TwoDimSprite(this, gSpiderGeom);

            this.sprite.position.set( x,y,z );

            this.pathFinding = new PathFinding(this, PlayerChaseMap);

            this.animation.setCurrentAnimation('walking_', SOUTH);
            this.updateFrame();
        },


        update: function(dt) {
            if (!hero.mesh) {
                return;
            }

            var needUpdate = this.animation.update(dt);
            if (needUpdate) {
                this.updateFrame();
            }

            this.pathFinding.update(dt);

            this.twoDimSprite.setDirection(this.pathFinding.directionVector);
            this.twoDimSprite.update(dt);
        }


    };

    result.init(x,y,z);
    return result;
}
