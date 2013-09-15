




// Settings
var contentWidth = 2000;
var contentHeight = 2000;
var cellWidth = 100;
var cellHeight = 100;

var content = document.getElementById('content');
var context = content.getContext('2d');

// Settings
var contentWidth = 2000;
var contentHeight = 2000;
var cellWidth = 100;
var cellHeight = 100;


var context = content.getContext('2d');


var tiling = new IsometricMap();


//  0 - ground  1-water   2-wall
var map = [
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
    [2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
    [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
    [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
    [2,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,2],
    [2,2,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,2],
    [2,2,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,2],
    [2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
    [2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
    [2,2,2,2,0,0,0,0,0,0,0,2,2,2,0,0,2,2],
    [2,2,2,2,0,0,0,0,0,0,0,2,2,2,0,0,2,2],
    [2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,2,2],
    [2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,2,2],
    [2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
    [2,2,0,0,0,0,0,0,0,2,2,0,0,0,0,0,0,2],
    [2,2,0,0,0,0,0,0,0,2,2,0,0,0,0,0,0,2],
    [2,2,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,2],
    [2,2,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,2],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
    [2,2,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,2],
    [2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
    [2,2,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,2],
    [2,2,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,2],
    [0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,2],
    [0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,2],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
    [0,0,0,0,0,0,0,0,0,0,2,2,2,0,0,0,0,2],
    [0,0,0,0,0,0,0,0,0,0,2,2,2,0,0,0,0,2],
    [0,0,0,0,0,0,0,0,0,0,2,2,2,0,0,0,0,2],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
    [2,2,2,2,2,2,2,2,0,0,2,2,2,2,2,2,2,2]
];


var generator = new IsometricGenerator();
var isoMap = generator.generateIsoMapFromRectArray(map, [2,0,1,3]);
var numOfRows = isoMap[3];
var numOfCols = isoMap[2];
var mapJSON = generator.generateJSON(isoMap, numOfRows, numOfCols );
tiling.loadJSON(mapJSON);

var permutation = document.getElementById("permutation");
var lastValue =  "2,0,1,3";
permutation.value = lastValue;
permutation.onkeydown = function() {
    var x = permutation.value;
    checkValue(x);
}

var checkValue = function(perm) {
    if (perm == lastValue) return;
    x = perm.split(',');
    if (x.length != 4) return;
    var res = [];
    for (var i=0; i<4; i++) {
        var n = parseInt(x[i]);
        if (isNaN(n)) {
            return;
        }
        res.push(n);
    }
    lastValue = perm;
    permutation.value = perm;
    generator.vertexDirs = res;
    var isoMap = generator.generateIsoMapFromRectArray(map);
    var numOfRows = isoMap[3];
    var numOfCols = isoMap[2];
    var mapJSON = generator.generateJSON(isoMap, numOfRows, numOfCols );
    tiling.loadJSON(mapJSON);
    reflow();
    console.log("generated "+lastValue);
}

var plist = $('#permutations-list')
for (var i1=0; i1<4; i1++) {
    for (var i2=0; i2<4; i2++) {
        if (i2== i1) { continue }
        for (var i3=0; i3<4; i3++) {
            if (i3== i2 || i3==i1) { continue }
            for (var i4=0; i4<4; i4++) {
                if (i4== i3 || i4==i2 || i4==i1) { continue }
                plist.append('<li>'+i1+','+i2+","+i3+","+i4+'</li>');
            }
        }
    }
}
plist.find('li').click(function() {
    checkValue($(this).text())
})


var checkLoaded = setInterval(function() {
    console.log(".")
    if (tiling.fullyLoaded) {
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
this.scroller = new Scroller(
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
    tiling.setup(clientWidth, clientHeight);
    scroller.setDimensions(clientWidth, clientHeight, contentWidth, contentHeight);
};

window.addEventListener("resize", reflow, false);
reflow();



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
    var debug = function(x,y) {

        dbg = "Debug: "+x+", "+y + "\n";
        dbg += "Scroller: \n";
        dbg += "  "+scroller.__scrollLeft+ ",\n  "+scroller.__scrollTop+"\n";
        dbgElement = document.getElementById("debug_text");
        dbgElement.innerText = dbg;
    }

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
            debug(e.pageX, e.pageY);
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
