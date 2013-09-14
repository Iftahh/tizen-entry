
$(function() {

    var container = document.getElementById("container");

//var seed = 123;
//var m = new MersenneTwister(seed);
//var random = function() { return m.random() };


var content = document.getElementById('content');
var context = content.getContext('2d');

Scroller = Class.extend({
    __zoomLevel: 1,
    __scrollLeft: 0,
    __scrollTop:0,
    contentWidth: 1000,
    contentHeight: 1000,
    clientHeight: 100,
    clientWidth: 100,

    render: function() {},

    init: function(render) {
        this.render = render;
    },
    setDimensions: function(clientWidth, clientHeight, contentWidth, contentHeight)  {
        this.clientWidth = clientWidth;
        this.clientHeight = clientHeight;
        this.contentWidth = contentWidth;
        this.contentHeight = contentHeight;

        this.render(this.__scrollLeft, this.__scrollTop, this.__zoomLevel);
    },

    setPosition: function(left, top) {
        this.__scrollLeft = left;
        this.__scrollTop = top;
        this.render(left, top, this.__zoomLevel);
    }
})



// Settings
var contentWidth = 2000;    // actual size of world
var contentHeight = 2000;


window.tiling = new IsometricMap();

var walkGen = new WalkerMazeGen();
window.cellGen = new CellularMazeGen();
var lastW = -1;
var lastH = -1;
var lastSeed = -1;
var ready = false;
var generate = function() {

    var seed = parseInt(document.getElementById("mazeSeed").value);
    //m = new MersenneTwister(seed);
    //random = function() { return m.random() }
    var x = RNG.setSeed(seed);//Date.now());
    random = function() { return x.getUniform() }
    var w =  parseInt(document.getElementById("mazeWidth").value);
    var h =  parseInt(document.getElementById("mazeHeight").value);
    walkGen._width = w;
    walkGen._height = h;
    walkGen._minPercentDugDone = parseInt(document.getElementById("min-percent-done").value);
    walkGen._maxPercentDugDone = parseInt(document.getElementById("max-percent-done").value);
    if (w != lastW || h != lastH || seed != lastSeed) {
        walkGen.create();
        lastW = w; lastH = h;  lastSeed = seed;
    }
    var map = walkGen._map;
    cellGen._width = w;
    cellGen._height = h;
    cellGen._map = map;
    //cellGen._randomize(parseFloat(document.getElementById("random-chance").value));
    for (var i=0; i< parseInt(document.getElementById("iterations").value); i++) {
        cellGen.create();
    }
    var map = cellGen._map;

    var generator = new IsometricGenerator();
    var isoMap = generator.generateIsoMapFromIsoArray(map, [2,0,1,3]);
    var numOfRows = isoMap[3];
    var numOfCols = isoMap[2];
    var mapJSON = generator.generateJSON(isoMap, numOfRows, numOfCols );
    tiling.loadJSON(mapJSON);
    ready = true;
    reflow();
}


$('#cell-create').val(cellGen._born.join(","))
$('#cell-create').keyup(function() {
    var $this = $(this);
    var last = $this.data('last');
    if (last == $this.val()) {
        return;
    }
    var x = toArray($this.val());
    if (!x) return;
    console.log("Setting create to ", x)
    $this.data('last', $this.val())
    cellGen._born = x;
    generate();
})


$('#cell-survive').val(cellGen._survive.join(","))
$('#cell-survive').keyup(function() {
    var $this = $(this);
    var last = $this.data('last');
    if (last == $this.val()) {
        return;
    }
    var x = toArray($this.val());
    if (!x) return;
    console.log("Setting survive to ", x)
    $this.data('last', $this.val())
    cellGen._survive = x;
    generate();
})

var toArray = function(text) {
    var x = text.split(',');
    var res = [];
    for (var i=0; i< x.length; i++) {
        var n = parseInt(x[i]);
        if (isNaN(n)) {
            return;
        }
        res.push(n);
    }
    return res;
}


$('#properties input').change(generate);


    window.isoGeom = new IsometricGeometry(64, 32);

var checkLoaded = setInterval(function() {
    console.log(".")
    if (tiling.fullyLoaded) {
        window.isoGeom = new IsometricGeometry(tiling.tileSize.x, tiling.tileSize.y);
        contentWidth = tiling.pixelSize.x;
        contentHeight = tiling.pixelSize.y;
        character.x = contentWidth /2;
        character.y = contentHeight/2;
        try {
            reflow();
        }
        catch(e) {
            console.log(e);
        }
        clearInterval(checkLoaded);
    }
}, 200);


    var showTile = document.getElementById("show-tile");

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

    var character = new IsoSprite( 1730, 1250, stanAtlas, animations)
    character.currentAnimation = WALK;
    character.currentDir = DIRS.EAST;
    character.player.numFrames = animations[WALK];
    character.player.frameDelay = 100;
    var hit = false;
    $('#hit').click(function() {
        hit = true;
    })
    var die = false;
    $('#die').click(function() {
        die = true;
    })

    var updateSprites = function() {
        tiling.sprites = {};

        var txy = [character.tx, character.ty];// isoGeom.calcTileByPixel(character.x, character.y);
        var spriteHash = {}
        spriteHash[txy[1]] = {}
        spriteHash[txy[1]][txy[0]] = [character];

        tiling.sprites[1] = spriteHash; // place sprites in tile layer 1 (above ground, potentially behind walls)


        if (showTile.checked) {
            if (txy[0] != hoverTile[0] || txy[1] != hoverTile[1]) {
                if (hoverTile[2] != -1) {
                    tiling.currMapData.layers[0].data[hoverTile[1]*tiling.numXTiles+hoverTile[0]] = hoverTile[2];
                }
                hoverTile[0] = txy[0];
                hoverTile[1] = txy[1];
                hoverTile[2] = tiling.currMapData.layers[0].data[hoverTile[1]*tiling.numXTiles+hoverTile[0]];
                tiling.currMapData.layers[0].data[hoverTile[1]*tiling.numXTiles+hoverTile[0]] = 201;
            }
        }


    }

    var inputEngine = new InputEngine();

    inputEngine.setup(container)


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

//    var prev = -1;
    var speed = 1.2;
    var runSpeed = 2.5;
    var lastDie = false;


    var lastProgress = start;
    function step(timestamp) {
        var progress = timestamp - start;
        var dt = progress - lastProgress;
        lastProgress = progress;
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
            character.player.addFinishCB(function() {
                hit = die = false;
            });
            lastDie = true;
        }
        else if (hit) {
            character.currentAnimation = HIT;
            character.player.start(progress);
            character.update(progress);
            character.player.addFinishCB( function() {
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
            var newX = character.x;
            var newY = character.y;
            // speed times time-delta is the distance
            var dtn = dt/30; // normalize - expected ~30ms between updates
            dx *= dtn;
            dy *= dtn;
            if (inputEngine.actions['run']) {
                character.currentAnimation = RUN;
                newX += dx*runSpeed;
                newY += dy*runSpeed;
            }
            else {
                character.currentAnimation = WALK;
                newX += dx*speed;
                newY += dy*speed;
            }
            var txy = isoGeom.calcTileByPixel(newX, newY);
            var map = cellGen._map;
            if (map[txy[1]] && map[txy[1]][txy[0]] == 0) { // ground
                character.x = newX;
                character.y = newY;
                character.tx = txy[0];
                character.ty = txy[1];
            }
            else {
                var m = map[txy[1]] && map[txy[1]][txy[0]];
                console.log("Collided at "+txy[0]+", "+txy[1]+"    x="+newX+"  y="+newY+"  map="+m)
            }
            character.update(progress);
            updateSprites();
        }
//        if (character.player.currentFrame.floor() != prev) {
//            prev = character.player.currentFrame.floor();
//
//            if (!ready) {
//                context.fillStyle = "yellow";
//                context.font = "bold 20px Arial";
//                context.fillText("Loading...", 10, 10);
//            }
//        }
        try {
            scroller.setPosition(character.x, character.y );
    //        setTimeout(function() {
                requestAnimationFrame(step);
    //        }, 15); // avoid high cpu
        }
        catch(e) {
            console.log(e.stack);
            setTimeout(function() { requestAnimationFrame(step)}, 15000)
        }

    }

    requestAnimationFrame(step);

    setInterval(function() {
        $('#debug_text').html(
            "Tile: "+character.tx+","+character.ty+"\n"+
//            "Frame " +character.player.currentFrame +"\n"
//            + "Actions: "+JSON.stringify(inputEngine.actions, false, 4) + "\n\n" +
                "Scroller: \n"+
                "  "+scroller.__scrollLeft+ ",\n  "+scroller.__scrollTop+"\n"
        );
    }, 1000)

//// not sure why this doesn't show...
//    context.fillStyle = "yellow";
//    context.font = "bold 20px Arial";
//    context.fillText("Loading...", 10, 10);

// Intialize layout
var clientWidth = 0;
var clientHeight = 0;

gameEngine = {
    worldTop: 0,
    worldLeft: 0
}

// Initialize Scroller
window.scroller = new Scroller(
    function(left, top, zoom) {
        // Full clearing
//        context.clearRect(0, 0, clientWidth, clientHeight);
        tiling.renderWidth = clientWidth;
        tiling.renderHeight = clientHeight;
        tiling.render(context, left, top, zoom);
        context.strokeStyle = "#FF0";
        gameEngine.worldTop = character.y - clientHeight/2;
        gameEngine.worldLeft = character.x - clientWidth/2;
        context.strokeRect(character.screenX()-1, character.screenY()-1, 3,3)
        if (!ready) {
            context.fillStyle = "yellow";
            context.font = "bold 20px Arial";
            context.fillText("Loading...", 10, 10);
        }
        //tiling.draw(context);
    } , {
    zooming: true
});





var rect = container.getBoundingClientRect();
//scroller.setPosition(rect.left + container.clientLeft, rect.top + container.clientTop);


// Reflow handling
var reflow = function() {
    clientWidth = container.clientWidth;
    clientHeight = container.clientHeight;
    content.width = clientWidth;
    content.height = clientHeight;
    contentWidth = tiling.pixelSize.x;
    contentHeight = tiling.pixelSize.y;
//    tiling.setup(clientWidth, clientHeight);
    scroller.setDimensions(clientWidth, clientHeight, contentWidth, contentHeight);
//    if (!ready) {
//        context.fillStyle = "yellow";
//        context.font = "bold 20px Arial";
//        context.fillText("Loading...", 10, 10);
//    }
};

window.addEventListener("resize", reflow, false);


window.hoverTile = [0,0,-1];
window.offX = 32-3; // half tile and border
window.offY = -3; // border
//
//window.offsetPixel = function(x,y) {
//
//    x += -3; // offset border of canvas
//    y += -3;
//    x += scroller.__scrollLeft; // scrolling offset
//    y += scroller.__scrollTop;
//
//    // not sure why this is necessary
//    x += 32;
//    if (scroller.__scrollTop == 0) {
//        y += 16;
//        window.offY = 13;
//    }
//    else {
//        window.offY = -3;
//    }
//
//    return [x,y]
//}
//
//var debug = function(x,y) {
//
//    var dbg = "Debug: \nMouse: "+x+", "+y + "\n";
//    dbg += "Scroller: \n";
//    dbg += "  "+scroller.__scrollLeft+ ",\n  "+scroller.__scrollTop+"\n";
//
//    dbg += "offset "+offX+", "+offY+"\n";
//    var xy = offsetPixel(x,y);
//    x = xy[0];
//    y = xy[1];
//    var txy = isoGeom.calcTileByPixel(x,y);
//    dbg += "tile: "+txy[0]+", "+txy[1]+"\n\n";
//    dbg += txy[2];
//    if (txy[0] != hoverTile[0] || txy[1] != hoverTile[1]) {
//        if (hoverTile[2] != -1) {
//            tiling.currMapData.layers[0].data[hoverTile[1]*tiling.numXTiles+hoverTile[0]] = hoverTile[2];
//        }
//        hoverTile[0] = txy[0];
//        hoverTile[1] = txy[1];
//        hoverTile[2] = tiling.currMapData.layers[0].data[hoverTile[1]*tiling.numXTiles+hoverTile[0]];
//        tiling.currMapData.layers[0].data[hoverTile[1]*tiling.numXTiles+hoverTile[0]] = 201;
//        scroller.scrollBy(0,0);
//    }
//
//    var dbgElement = document.getElementById("debug_text");
//    dbgElement.innerText = dbg;
//
//}
//
//if ('ontouchstart' in window) {
//
//    container.addEventListener("touchstart", function(e) {
//        // Don't react if initial down happens on a form element
//        if (e.touches[0] && e.touches[0].target && e.touches[0].target.tagName.match(/input|textarea|select/i)) {
//            return;
//        }
//
//        scroller.doTouchStart(e.touches, e.timeStamp);
//        e.preventDefault();
//    }, false);
//
//    document.addEventListener("touchmove", function(e) {
//        scroller.doTouchMove(e.touches, e.timeStamp, e.scale);
//    }, false);
//
//    document.addEventListener("touchend", function(e) {
//        scroller.doTouchEnd(e.timeStamp);
//    }, false);
//
//    document.addEventListener("touchcancel", function(e) {
//        scroller.doTouchEnd(e.timeStamp);
//    }, false);
//
//} else {
//
//
//    var mousedown = false;
//
//    container.addEventListener("mousedown", function(e) {
//        if (e.target.tagName.match(/input|textarea|select/i)) {
//            return;
//        }
//
//        scroller.doTouchStart([{
//            pageX: e.pageX,
//            pageY: e.pageY
//        }], e.timeStamp);
//
//        mousedown = true;
//    }, false);
//
//    document.addEventListener("mousemove", function(e) {
//        if (!mousedown) {
////            debug(e.offsetX, e.offsetY);
//            return;
//        }
//
//        scroller.doTouchMove([{
//            pageX: e.pageX,
//            pageY: e.pageY
//        }], e.timeStamp);
//
//        mousedown = true;
//    }, false);
//
//    document.addEventListener("mouseup", function(e) {
//        if (!mousedown) {
//            return;
//        }
//
//        scroller.doTouchEnd(e.timeStamp);
//
//        mousedown = false;
//    }, false);
//
//    container.addEventListener(navigator.userAgent.indexOf("Firefox") > -1 ? "DOMMouseScroll" :  "mousewheel", function(e) {
//        scroller.doMouseZoom(e.detail ? (e.detail * -120) : e.wheelDelta, e.timeStamp, e.pageX, e.pageY);
//    }, false);
//
//}


generate();

});
