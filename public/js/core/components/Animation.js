/**
 * Left pad
 * @param {string} [character="0"]
 * @param {int} [count=2]
 */
String.prototype.lpad = function(character, count) {
    var ch = character || "0";
    var cnt = count || 2;

    var s = "";
    while (s.length < (cnt - this.length)) { s += ch; }
    s = s.substring(0, cnt-this.length);
    return s+this;
}



Animation = Class.extend({

    frameDelay: 100,
    lastTs: 0,
    stopped: false,

    finishedCb: null,
    currentFrame: 0,
    numFrames: 8,

    dirToStr: [ "e", "se", "s", "sw", "w", "nw", "n", "ne"],  // must be in sync with Topology DIRS index

    init: function(duration, frameDelay) {
        if (duration) {
            this.duration = duration;
        }
        if (frameDelay) {
            this.frameDelay = frameDelay;
        }
        this.finishedCb = new MinArray();
    },

    getFrame: function(name, dir, frame) {
        var img = name+this.dirToStr[dir]+frame.toString().lpad(0,4)+'.png';
        return img;
    },

    getCurrentFrame: function(name, dir) {
        var frame = this.currentFrame.floor();
        if (frame >= this.numFrames) { // not sure how/why/when this happens
            console.log("frame out of bounds "+frame)
            frame = this.numFrames-1;
        }
        return this.getFrame(name, dir, frame )
    },

    update: function(ts) { // called on ticks to change frame   ts= timestamp
        if (this.stopped) {
            return;
        }
        var periods = (ts - this.lastTs) / this.frameDelay;
        this.lastTs = ts;

        this.currentFrame += periods;
        if (this.finishedCb.length && this.currentFrame >= this.numFrames) {
            this.finishedCb.iterate(function(cb,k) {
                cb(k);
            });
            this.finishedCb = new MinArray();
        }
        this.currentFrame %= this.numFrames;
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
        return this.finishedCb.insert(cb);
    },
    replaceFinishCB: function(cb) {
        // pretend the anim finished - may be needed to clear flags, trigger events, etc...
        this.finishedCb.iterate(function(cb,k) {
            cb(k);
        });
        this.finishedCb = new MinArray();
        this.finishedCb.insert(cb);
    },
    removeFinishCB: function(id) {
        return this.finishCb.remove(id);
    }
})
