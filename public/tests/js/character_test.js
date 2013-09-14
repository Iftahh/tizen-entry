(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
            || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = Date.now();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
                timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());


$(function() {



    var stanAtlas = new Atlas();

    $.get('/atlas/stan.json', function(atlasJSON) {
        stanAtlas.parseAtlasDefinition(atlasJSON);
    })


    var DIE = 'kippt_um_';
    var WALK = 'lNuft_';
    var HIT = 'noarmstan_treffer_';
    var RUN = 'rennt_';
    var CAST = 'stan_spricht_';

    var animations = {};
    animations[DIE] = 7;
    animations[WALK] = 7;
    animations[HIT] = 7;
    animations[RUN] = 7;
    animations[CAST] = 7;

    var character = new Sprite( 100, 100, stanAtlas, animations)
    character.currentAnimation = WALK;
    character.currentDir = DIRS.EAST;
    character.player.numFrames = animations[WALK];
    character.player.frameDelay = 100;

    $('#frameDelay').change(function() {
        character.player.frameDelay = $(this).val()
    })
    var hit = false;
    $('#hit').click(function() {
        console.log("hit!");
        hit = true;
    })
    var die = false;
    $('#die').click(function() {
        console.log("die!");
        die = true;
    })

    var inputEngine = new InputEngine();
    var container = document.getElementById("container");
    var content = document.getElementById("content");
    inputEngine.setup(container)
    var context = content.getContext("2d");


    var start = window.mozAnimationStartTime  || 0;

    var clientWidth = 100;
    var clientHeight= 100;

    var actionsToDir = {
        1: DIRS.EAST,
        2: DIRS.SOUTH,
        3: DIRS.SOUTH_EAST,
        4: DIRS.WEST,
        6: DIRS.SOUTH_WEST,
        7: DIRS.SOUTH,
        8: DIRS.NORTH,
        9: DIRS.NORTH_EAST,
        11: DIRS.EAST,
        12: DIRS.NORTH_WEST,
        14: DIRS.WEST
    }

    var prev = -1;
    var speed = 0.7;
    var runSpeed = 1.2;
    var lastDie = false;

    function step(timestamp) {
        var progress = timestamp - start;

        var dirCode = 0;
        var dx = 0;
        var dy = 0;
        if (inputEngine.actions['move-up']) {
            dirCode = 8;
            dy--;
        }
        if (inputEngine.actions['move-left']) {
            dirCode += 4;
            dx -= 2;
        }
        if (inputEngine.actions['move-down']) {
            dirCode += 2;
            dy++;
        }
        if (inputEngine.actions['move-right']) {
            dirCode++;
            dx += 2;
        }
        var dir = actionsToDir[dirCode];
        if (dir !== undefined) {
            character.currentDir = dir;
        }
        if (die) {
            character.currentAnimation = DIE;
            character.player.start(progress);
            character.update(progress);
            character.player.addFinishCB( function() {
                hit = die = false;
            });
            lastDie = true;
        }
        else if (hit) {
            character.currentAnimation = HIT;
            character.player.start(progress);
            character.update(progress);
            character.player.addFinishCB(function() {
                hit = die = false;
            });
        }
        else if (inputEngine.actions['cast']) {
            character.currentAnimation = CAST;
            character.player.start(progress);
            character.update(progress);
        }
        else if (dirCode == 0) {
            character.currentAnimation = DIE;
            character.player.currentFrame = lastDie? 7 : 0;
            character.player.stop()
        }
        else {
            character.player.start(progress);
            lastDie = false;
            if (inputEngine.actions['run']) {
                character.currentAnimation = RUN;
                character.x += dx*runSpeed;
                character.y += dy*runSpeed;
            }
            else {
                character.currentAnimation = WALK;
                character.x += dx*speed;
                character.y += dy*speed;
            }
            character.update(progress);

        }
        $('#debug_text').html("Frame " +character.player.currentFrame +"\n"
           + "Actions: "+JSON.stringify(inputEngine.actions, false, 4))
        if (character.player.currentFrame.floor() != prev) {
            prev = character.player.currentFrame.floor();
            context.clearRect(0, 0, clientWidth, clientHeight);
            character.render(context);
        }
        requestAnimationFrame(step);
    }

    requestAnimationFrame(step);



// Reflow handling
    var reflow = function() {
        clientWidth = container.clientWidth;
        clientHeight = container.clientHeight;
        content.width = clientWidth;
        content.height = clientHeight;
//        tiling.setup(clientWidth, clientHeight);
//        scroller.setDimensions(clientWidth, clientHeight, contentWidth, contentHeight);
    };

    window.addEventListener("resize", reflow, false);
    reflow();
});


