
Animation = function(_animations) { return {

    frameDelay: 100,
    lastTs: 0,
    stopped: false,

    finishedCb: [],
    currentFrame: 0,
    currentDirection: 0,
    currentAnimation: '',
    numFrames: 8,

    animations: _animations,


    init: function(duration, frameDelay) {
        if (duration) {
            this.duration = duration;
        }
        this.frameDelay = frameDelay;
        this.finishedCb = [];
    },

    getFrame: function(name, dir, frame) {
        var img = name+ DIR_TO_STR[dir] +frame.toString().lpad(0,4)+'.png';
        return img;
    },

    getCurrentFrame: function() {
        var frame = Math.floor(this.currentFrame);
        if (frame >= this.numFrames) { // not sure how/why/when this happens
            console.log("frame out of bounds "+frame)
            frame = this.numFrames-1;
        }
        return this.getFrame(this.currentAnimation, this.currentDirection, frame )
    },

    setCurrentAnimation: function(anim, dir) {
        this.currentAnimation = anim;
        this.currentDirection = dir;
        this.currentFrame = 0;
        this.numFrames = this.animations[anim];
    },

    // returns true if currentFrame changed
    update: function(ts) { // called on ticks to change frame   ts= timestamp
        if (this.stopped) {
            return false;
        }
        var frameDelay = this.frameDelay || (this.duration / this.numFrames);
        var periods = (ts - this.lastTs) / frameDelay;
        this.lastTs = ts;

        var f0 = frame = Math.floor(this.currentFrame);
        this.currentFrame += periods;
        if (this.finishedCb.length && this.currentFrame >= this.numFrames) {
            iterate(this.finishedCb, function(cb,k) {
                cb(k);
            });
            this.finishedCb = [];
        }
        this.currentFrame %= this.numFrames;
        var f1 = Math.floor(this.currentFrame)
        return f1 != f0;
    },

    start: function(ts) {
        if (this.stopped) {
            this.stopped = false;
            this.lastTs = ts;
        }
    },

    stop: function() {
        this.stopped = true;
    },

    addFinishCB: function(cb) {
        this.finishedCb.push(cb);
    },
    replaceFinishCB: function(cb) {
        // pretend the anim finished - may be needed to clear flags, trigger events, etc...
        iterate( this.finishedCb, function(cb,k) {
            cb(k);
        });
        this.finishedCb = [cb];
    },
//    removeFinishCB: function(id) {
//        return this.finishCb.remove(id);
//    }
}}
