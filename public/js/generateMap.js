
importScripts(
    "/js/core/core.js",
    "/js/isometric/Topology.js",
    "/js/mazegen/walker_maze_gen.js",
    "/js/mazegen/cellular_maze_gen.js"
)

self.generatedWidth = null;
self.generatedHeight = null;
self.generatedSeed = null;

self.addEventListener('message', function(e) {
    self.postMessage("0 "+JSON.stringify(e.data));

    var walkGen = new WalkerMazeGen();
    var cellGen = new CellularMazeGen();

    var data = e.data;
    RNG.setSeed(data.seed);
    var w =  data.width;
    var h =  data.height;
    walkGen._width = w;
    walkGen._height = h;
    walkGen._minPercentDugDone = data.minPercentDug || 30;
    walkGen._maxPercentDugDone = data.maxPercentDug || 35;
    if (w != self.generatedWidth || h != self.generatedHeight || data.seed != self.generatedSeed) {
        self.postMessage("starting walker generator")
        walkGen.create(null, function(p, msg) {
            if (p != -1) {
                var progress = p / walkGen.percentDugDone;
                progress = progress * 0.98; // keep 2% for final cellular generator...
                self.postMessage("PROGRESS::: "+progress);
            }
            if (msg) {
                // just before end - msg
                self.postMessage("WALKER msg: "+msg);
            }
        });
        self.generatedWidth = w; self.generatedHeight = h;  self.generatedSeed = data.seed;
    }
    var map = walkGen._map;
    cellGen._width = w;
    cellGen._height = h;
    cellGen._map = map;
    for (var i=0; i< (data.iterations || 3); i++) {
        cellGen.create();
    }
    map = cellGen._map;
    self.postMessage("DONE::: "+JSON.stringify(map));
    self.close()
}, false);
