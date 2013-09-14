
ANIM = {
    WALK: 0,
    ATTACK: 1,
    BEEN_HIT: 2,
    DIE: 3,
    RUN: 4
}


Sprite = Class.extend({
    x: 10,
    y: 10,

    init: function(x,y) {
        this.x = x;
        this.y = y;
    },

    update: function(ts, dt) {
    },

    render: function(ctx) {
    },

    screenX: function() {
        return this.x - gameEngine.worldLeft - 32; // not sure why the 32
    },
    screenY: function() {
        var y = this.y - gameEngine.worldTop ;
        if (gameEngine.worldTop == 0) {
            y -= 16; // not sure why
        }
        return y;
    }
})

IsoSprite = Sprite.extend({
    atlas: null,
    animations: {},  // name to number of frames
    player: null,
    currentAnimation: '',
    currentDir: 0,
    offsetY: 0,

    init: function(x,y, atlas, animations, offsetY) {
        Sprite.prototype.init.call(this, x,y);
        this.atlas = atlas;
        this.animations = animations;
        this.player = new Animation();
        this.offsetY = offsetY || 0;
    },

    setAnimation: function(anim) {
        if (anim == this.currentAnimation) {
            return;
        }
        this.currentAnimation = anim;
        this.player.numFrames = this.animations[anim];
        this.player.currentFrame = 0;
    },

    update: function(ts, dt) {
        this.player.update(ts);
    },

    render: function(ctx, layer) {
        var img = this.player.getCurrentFrame(this.currentAnimation, this.currentDir);
        this.atlas.drawSprite(ctx,  img, this.screenX(),this.screenY()+this.offsetY);
//        ctx.fill();
//        ctx.stroke("#ff0");
//        ctx.fillRect(x-1,y-1,3,3);
    }
})



