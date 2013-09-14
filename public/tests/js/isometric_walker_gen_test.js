
$(function() {



var content = document.getElementById('content');
var context = content.getContext('2d');

// Settings
var contentWidth = 2000;    // actual size of world
var contentHeight = 2000;
var cellWidth = 100;
var cellHeight = 100;


var context = content.getContext('2d');


window.tiling = new IsometricMap();

var walkGen = new WalkerMazeGen();
window.cellGen = new CellularMazeGen();
var walkResult = null;
var lastW = -1;
var lastH = -1;
var lastSeed = -1;

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
        scroller.setDimensions(clientWidth, clientHeight, contentWidth, contentHeight);
        clearInterval(checkLoaded);
    }
}, 200)





// Intialize layout
var container = document.getElementById("container");
var content = document.getElementById("content");
var clientWidth = 0;
var clientHeight = 0;

// Initialize Scroller
window.scroller = new Scroller(
    function(left, top, zoom) {
        // Full clearing
        context.clearRect(0, 0, clientWidth, clientHeight);
        tiling.render(context, left, top, zoom);
        //tiling.draw(context);
    } , {
    zooming: true
});





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
};

window.addEventListener("resize", reflow, false);
reflow();


window.hoverTile = [0,0,-1];
window.offX = 32-3; // half tile and border
window.offY = -3; // border

window.offsetPixel = function(x,y) {

    x += -3; // offset border of canvas
    y += -3;
    x += scroller.__scrollLeft; // scrolling offset
    y += scroller.__scrollTop;

    // not sure why this is necessary
    x += 32;
    if (scroller.__scrollTop == 0) {
        y += 16;
        window.offY = 13;
    }
    else {
        window.offY = -3;
    }

    return [x,y]
}

var debug = function(x,y) {

    var dbg = "Debug: \nMouse: "+x+", "+y + "\n";
    dbg += "Scroller: \n";
    dbg += "  "+scroller.__scrollLeft+ ",\n  "+scroller.__scrollTop+"\n";

    dbg += "offset "+offX+", "+offY+"\n";
    var xy = offsetPixel(x,y);
    x = xy[0];
    y = xy[1];
    var txy = isoGeom.calcTileByPixel(x,y);
    dbg += "tile: "+txy[0]+", "+txy[1]+"\n\n";
    dbg += txy[2];
    if (txy[0] != hoverTile[0] || txy[1] != hoverTile[1]) {
        if (hoverTile[2] != -1) {
            tiling.currMapData.layers[0].data[hoverTile[1]*tiling.numXTiles+hoverTile[0]] = hoverTile[2];
        }
        hoverTile[0] = txy[0];
        hoverTile[1] = txy[1];
        hoverTile[2] = tiling.currMapData.layers[0].data[hoverTile[1]*tiling.numXTiles+hoverTile[0]];
        tiling.currMapData.layers[0].data[hoverTile[1]*tiling.numXTiles+hoverTile[0]] = 201;
        scroller.scrollBy(0,0);
    }

    var dbgElement = document.getElementById("debug_text");
    dbgElement.innerText = dbg;

}

if ('ontouchstart' in window) {

    container.addEventListener("touchstart", function(e) {
        // Don't react if initial down happens on a form element
        if (e.touches[0] && e.touches[0].target && e.touches[0].target.tagName.match(/input|textarea|select/i)) {
            return;
        }

        scroller.doTouchStart(e.touches, e.timeStamp);
        e.preventDefault();
    }, false);

    document.addEventListener("touchmove", function(e) {
        scroller.doTouchMove(e.touches, e.timeStamp, e.scale);
    }, false);

    document.addEventListener("touchend", function(e) {
        scroller.doTouchEnd(e.timeStamp);
    }, false);

    document.addEventListener("touchcancel", function(e) {
        scroller.doTouchEnd(e.timeStamp);
    }, false);

} else {


    var mousedown = false;

    container.addEventListener("mousedown", function(e) {
        if (e.target.tagName.match(/input|textarea|select/i)) {
            return;
        }

        scroller.doTouchStart([{
            pageX: e.pageX,
            pageY: e.pageY
        }], e.timeStamp);

        mousedown = true;
    }, false);

    document.addEventListener("mousemove", function(e) {
        if (!mousedown) {
            debug(e.offsetX, e.offsetY);
            return;
        }

        scroller.doTouchMove([{
            pageX: e.pageX,
            pageY: e.pageY
        }], e.timeStamp);

        mousedown = true;
    }, false);

    document.addEventListener("mouseup", function(e) {
        if (!mousedown) {
            return;
        }

        scroller.doTouchEnd(e.timeStamp);

        mousedown = false;
    }, false);

    container.addEventListener(navigator.userAgent.indexOf("Firefox") > -1 ? "DOMMouseScroll" :  "mousewheel", function(e) {
        scroller.doMouseZoom(e.detail ? (e.detail * -120) : e.wheelDelta, e.timeStamp, e.pageX, e.pageY);
    }, false);

}


generate();

});
