
$(function() {

    var container = document.getElementById("container");

   RNG.setSeed(123);//Date.now());


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

    window.scroller = new Scroller();

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
    var seed = 123; //parseInt(document.getElementById("mazeSeed").value);

    var generate = function() {
        //m = new MersenneTwister(seed);
        //random = function() { return m.random() }
        var x = RNG.setSeed(seed);//Date.now());
        var w =  80; //parseInt(document.getElementById("mazeWidth").value);
        var h =  60; //parseInt(document.getElementById("mazeHeight").value);
        walkGen._width = w;
        walkGen._height = h;
        walkGen._minPercentDugDone = 30;//parseInt(document.getElementById("min-percent-done").value);
        walkGen._maxPercentDugDone = 35;//parseInt(document.getElementById("max-percent-done").value);
        if (w != lastW || h != lastH || seed != lastSeed) {
            walkGen.create();
            lastW = w; lastH = h;  lastSeed = seed;
        }
        var map = walkGen._map;
        cellGen._width = w;
        cellGen._height = h;
        cellGen._map = map;
        //cellGen._randomize(parseFloat(document.getElementById("random-chance").value));
        for (var i=0; i< 3/*parseInt(document.getElementById("iterations").value)*/; i++) {
            cellGen.create();
        }
        var map = cellGen._map;

        var generator = new IsometricGenerator();
        var isoMap = generator.generateIsoMapFromIsoArray(map);
        var numOfRows = isoMap[3];
        var numOfCols = isoMap[2];
        var mapJSON = generator.generateJSON(isoMap, numOfRows, numOfCols );
        tiling.loadJSON(mapJSON);
        ready = true;
        reflow();
    }


    window.isoGeom = new IsometricGeometry(64, 32);

    var checkLoaded = setInterval(function() {
        console.log(".")
        if (tiling.fullyLoaded) {
            window.isoGeom = new IsometricGeometry(tiling.tileSize.x, tiling.tileSize.y);
            contentWidth = tiling.pixelSize.x;
            contentHeight = tiling.pixelSize.y;
            loadedTileMap(contentWidth, contentHeight);
            scroller.setDimensions(clientWidth, clientHeight, contentWidth, contentHeight);
            clearInterval(checkLoaded);
        }
    }, 200);


    window.character = new Character( 1730, 1250);

    window.sprites = [character];

    var updateSpritesHash = function() {
        // TODO: move this to Tiling, have only one layer, and Get/Set
        tiling.sprites = {};
        var spriteHash = {}

        for (var i=0; i<window.sprites.length; i++) {
            var sprite = window.sprites[i];
            var txy = isoGeom.calcTileByPixel(sprite.x, sprite.y);
            if (!spriteHash[txy[1]]) {
                spriteHash[txy[1]] = {}
            }
            if (spriteHash[txy[1]][txy[0]]) {
                spriteHash[txy[1]][txy[0]].push(sprite)
            }
            else {
                spriteHash[txy[1]][txy[0]] = [sprite]
            }
        }

        tiling.sprites[1] = spriteHash; // place sprites in tile layer 1 (above ground, potentially behind walls)

    }

    window.inputEngine = new InputEngine();

    inputEngine.setup(container)


    var start = window.mozAnimationStartTime  || 0;

    var clientWidth = 100;
    var clientHeight= 100;



    var lastProgress = start;
    function step(timestamp) {
        var progress = timestamp - start;
        var dt = progress - lastProgress;
        lastProgress = progress;

        $('#debug_text').html("Frame " +character.player.currentFrame +"\n"
            + "Actions: "+JSON.stringify(inputEngine.actions, false, 4) + "\n\nScroller: \n"+
                "  "+scroller.__scrollLeft+ ",\n  "+scroller.__scrollTop+"\n");
//        if (character.player.currentFrame.floor() != prev) {
//            prev = character.player.currentFrame.floor();
//
//            if (!ready) {
//                context.fillStyle = "yellow";
//                context.font = "bold 20px Arial";
//                context.fillText("Loading...", 10, 10);
//            }
//        }
        for (var i=0; i<window.sprites.length; i++ ) {
            window.sprites[i].update(progress, dt);
        }
        updateSpritesHash();


        scroller.setPosition(character.x - clientWidth/2, character.y - clientHeight/2);
        setTimeout(function() {
            requestAnimationFrame(step);
        }, 15); // avoid high cpu

    }

    requestAnimationFrame(step);

//// not sure why this doesn't show...
//    context.fillStyle = "yellow";
//    context.font = "bold 20px Arial";
//    context.fillText("Loading...", 10, 10);

// Intialize layout
    var clientWidth = 0;
    var clientHeight = 0;

// Initialize Scroller
    window.scroller = new Scroller(
        function(left, top, zoom) {
            // Full clearing
            context.clearRect(0, 0, clientWidth, clientHeight);
            tiling.render(context, left, top, zoom);
            if (!ready) {
                context.fillStyle = "yellow";
                context.font = "bold 30px Arial";
                context.fillText("Loading...", 100, 100);
            }
            //tiling.draw(context);
        } , {
            zooming: true
        });



$('#add-monster').click(function() {
    var randChance = {}
    for (var _y=0; _y<dijkMap._numOfRows; _y++) {
        for (var _x=0; _x<dijkMap._numOfCols; _x++) {
            var score = dijkMap._get(_x,_y);
            if (score != dijkMap.NOT_ALLOWED && score != dijkMap.NOT_EXPLORED) {
                randChance[_x+","+_y] = score;
            }
        }
    }

    var xy = getWeightedValue(randChance).split(",");
    var x = parseInt(xy[0]);
    var y = parseInt(xy[1]);
    $('#debug_text').text("Monster created at tile "+x+", "+y);
    var spider = createRedSpider(isoGeom.getMidX(x,y), isoGeom.getMidY(y));
    window.sprites.push(spider)
})

    var rect = container.getBoundingClientRect();
    scroller.setPosition(rect.left + container.clientLeft, rect.top + container.clientTop);


// Reflow handling
    var reflow = function() {
        clientWidth = container.clientWidth;
        clientHeight = container.clientHeight;
        content.width = clientWidth;
        content.height = clientHeight;
        contentWidth = tiling.pixelSize.x;
        contentHeight = tiling.pixelSize.y;
        tiling.setup(clientWidth, clientHeight);
        scroller.setDimensions(clientWidth, clientHeight, contentWidth, contentHeight);
//    if (!ready) {
//        context.fillStyle = "yellow";
//        context.font = "bold 20px Arial";
//        context.fillText("Loading...", 10, 10);
//    }
    };

    window.addEventListener("resize", reflow, false);
    reflow();


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
