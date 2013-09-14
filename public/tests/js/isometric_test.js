




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

tiling.loadURL("/maps/cave.json");

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
