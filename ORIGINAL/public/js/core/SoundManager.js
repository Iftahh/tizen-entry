// based on code from Udacity HTML5 Game Programming course


SoundManager = Class.extend({
    clips: {},
    enabled: true,
    _context: null,
    _mainNode: null,

    //----------------------------
    init: function () {
        try {
            this._context = new webkitAudioContext();
        } catch (e) {
            alert('Web Audio API is not supported in this browser');
        }

        this._mainNode = this._context.createGainNode(0);
        this._mainNode.connect(this._context.destination);
    },

    //----------------------------
    // Parameters:
    //	1) path: a string representing the path to the sound
    //           file.
    //  2) callbackFcn: a function to call once loading the sound file
    //                  at 'path' is complete. This should take a Sound
    //                  object as a parameter.
    //----------------------------
    loadAsync: function (path, callbackFcn) {
        if (this.clips[path]) {
            callbackFcn(this.clips[path].s);
            return this.clips[path].s;
        }

        var clip = {
            b: null,
            l: false,
            p: path
        };
        this.clips[path] = clip;

        var request = new XMLHttpRequest();
        request.open('GET', path, true);
        request.responseType = 'arraybuffer';
        var that = this;
        request.onload = function () {
            that._context.decodeAudioData(request.response,

                function (buffer) {
                    that.clips[path].b = buffer;
                    that.clips[path].l = true;
                    callbackFcn(that.clips[path]);
                },

                function (data) {});

        };
        request.send();


        return clip;

    },

    //----------------------------
    muted: false,
    offlineVolume: 1,
    togglemute: function() {
        if(!this.muted) {
            this.muted = true;
            this.offlineVolume = this._mainNode.gain.value;
            this._mainNode.gain.value = 0;
        }
        else {
            this.muted = false;
            this._mainNode.gain.value = this.offlineVolume;
        }
    },

    setVolume: function(val) {
        this.offlineVolume = val;
        if (!this.muted)  {
            this._mainNode.gain.value = val;
        }
    },

    //----------------------------
    stopAll: function()
    {
        // Disconnect the main node, then create a new
        // Gain Node, attach it to the main node, and
        // connect it to the audio context's destination.
        this._mainNode.disconnect();
        this._mainNode = this._context.createGainNode(0);
        this._mainNode.connect(this._context.destination);
    },

    //----------------------------
    // Parameters:
    //	1) path: a string representing the path to the sound
    //           file.
    //  2) settings: a dictionary representing any game-specific
    //               settings we might have for playing this
    //               sound. In our case the only ones we'll be
    //               concerned with are:
    //               {
    //                   looping: a boolean indicating whether to
    //                            loop.
    //                   volume: a number between 0 and 1.
    //               }
    //----------------------------
    playSound: function (path, settings) {
        // Check if the Sound Manager has been enabled,
        // return false if not.
        if (!this.enabled) return false;

        // Set default values for looping and volume.
        var looping = false;
        var volume = 0.2;

        // Check if the given settings specify the volume
        // and looping, and update those appropriately.
        if (settings) {
            if (settings.looping) looping = settings.looping;
            if (settings.volume) volume = settings.volume;
        }

        // Check if the path has an associated sound clip,
        // and whether the sound has been loaded yet.
        // Return false if either of these sanity checks
        // fail.
        var sd = this.clips[path];
        if (sd === undefined || sd.l === false) {
            console.log("Sound "+path+" not loaded");
            return false;
        }


        // create a new buffer source for the sound we want
        // to play. We can do this by calling the 'createBufferSource'
        // method of this._context.
        var currentClip = this._context.createBufferSource();

        // Set the properties of currentClip appropriately in order to
        // play the sound.
        currentClip.buffer = sd.b; // tell the source which sound to play
        currentClip.gain.value = volume;
        currentClip.loop = looping;

        // Connect currentClip to the main node, then play it. We can do
        // this using the 'connect' and 'noteOn' methods of currentClip.
        currentClip.connect(this._mainNode);
        currentClip.noteOn(0);

        return true;
    }
});

//----------------------------
