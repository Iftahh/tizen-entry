$(function() {

window.dijkMap = new DijkstraMap();


var dijTestLayer = {
    type: "tilelayer",
    data: []
}


var click = 0;
var target = [0,0];

var content = document.getElementById("content");
content.addEventListener('contextmenu', function(ev) {
    ev.preventDefault();
    handleClick(ev);
    return false; }, false);

var handleClick = function(e) {
    var px = e.offsetX;
    var py = e.offsetY;

    if (!dijkMap._explorationData ||  dijkMap._explorationData.length == 0)
        dijkMap.generateExploration(cellGen._map);

    var xy = offsetPixel(px,py);
    px = xy[0];
    py = xy[1];


    var txy = isoGeom.calcTileByPixel(px,py);
    var x = txy[0];
    var y = txy[1];
    var map = tiling;

    if (click==3 || dijTestLayer.data.length < map.numXTiles * map.numYTiles) {
        dijkMap.generateExploration(cellGen._map);
        dijTestLayer.data = [];
        click = 0;
        for (var i=0; i<map.numXTiles * map.numYTiles; i++) {
            dijTestLayer.data.push(0);
        }
    }
    if (click == 0) {
        var explored = dijkMap.explore(x,y);
        if (explored) {
            dijTestLayer.data[y*map.numXTiles + x] = 201;
            target = [x,y];
            console.log("Setting target to "+x+", "+y);
            click++;
        }
    }
    else if (click == 1) {
        if (dijkMap._get(x,y) == dijkMap.NOT_ALLOWED) {
            console.log("Not allowed");
            return;
        }
        if (dijkMap._get(x,y) == dijkMap.NOT_EXPLORED) {
            console.log("Not explored !!!");
            return;
        }
        var loops = 0;
        dijTestLayer.data[y*map.numXTiles + x] = 201;
        while(x != target[0] || y!= target[1]) {
            var result = dijkMap.smallestNeighbor(x,y)
//            console.log(result);
            x = result.moveTo[0];
            y = result.moveTo[1];
            dijTestLayer.data[y*map.numXTiles + x] = 201;
            loops++;
            if (loops > 5000) {
                console.log("Breaking because too long");
                break;
            }
        }
        click++;
    }
    else if (click == 2) {
        for (var y=0; y<map.numYTiles; y++) {
            for (var x=0; x<map.numXTiles; x++) {
                dijTestLayer.data[y*map.numXTiles + x] =  dijkMap._get(x,y) == dijkMap.NOT_ALLOWED ? 201 : 0;
            }
        }
        click++;
    }

    if (map.currMapData.layers.length < 3) {
        map.currMapData.layers.push(dijTestLayer);
    }
};

});
