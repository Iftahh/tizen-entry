v// based on code from Udacity HTML5 Game Programming course

InputEngine = Class.extend({

    // A dictionary mapping ASCII key codes to string values
    // describing the action we want to take when that key is
    // pressed.
    bindings: {},

    // A dictionary mapping actions that might be taken in our
    // game to a boolean value indicating whether that action
    // is currently being performed.
    actions: {},

//    mouse: {
//        x: 0,
//        y: 0
//    },

    //-----------------------------
    setup: function (canvasElement) {
        this.bind(49, 'cycle-attack-up');
        this.bind(81, 'cycle-attack-down');
        this.bind(50, 'cycle-shield-up');
        this.bind(87, 'cycle-shield-down');
        this.bind(65, 'cast-attack');
        this.bind(83, 'cast-shield');
        // and arrows
        this.bind(38, 'move-up');
        this.bind(37, 'move-left');
        this.bind(40, 'move-down');
        this.bind(39, 'move-right');

        this.bind(32, 'cast-stop'); // space
        this.bind(16, 'walk'); // shift
        this.bind(90,  'cycle-target'); // 'Z'

        // Adding the event listeners for the appropriate DOM events.
//        canvasElement.addEventListener('mousemove', this.onMouseMove.bind(this));
        document.addEventListener('keydown', this.onKeyDown.bind(this));
        document.addEventListener('keyup', this.onKeyUp.bind(this));
    },

//    //-----------------------------
//    onMouseMove: function (event) {
//        this.mouse.x = event.clientX;
//        this.mouse.y = event.clientY;
//    },

    //-----------------------------
    onKeyDown: function (event) {
        if (event.target.tagName.match(/input|textarea|select/i)) {
            return;
        }
        var action = this.bindings[event.keyCode];
        if (action)
            this.actions[action] = true;
//        else {
//            console.log("key code: "+event.keyCode);
//        }
    },

    //-----------------------------
    onKeyUp: function (event) {
        if (event.target.tagName.match(/input|textarea|select/i)) {
            return;
        }
        var action = this.bindings[event.keyCode];
        if (action)
            this.actions[action] = false;
    },


    bind: function (key, action) {
        this.bindings[key] = action;
    }

});


