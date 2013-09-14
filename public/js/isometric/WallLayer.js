


WallLayer = Class.extend({
    map: null,
    cachedParams: {
        minRowIndex: null,
        minRow: null,
        numOfRows: null,
        minCol: null,
        numOfCols: null,
        clientWidth: null,
        clientHeight: null
    },
    row_buffers: [],
    drawingBuffer: 0,
    bufferWidth: null,
    bufferHeight: null,

    screenW: null, // width/height of actual tile bitmap on screen
    screenH: null, // TODO: make tiles an atlas so this will be different for each tile

    tileWidth: null,  // width/height of tile (same for all tiles) - may be different than image dimensions for example tall Wall tiles
    tileHeight: null,

    rowHeight: null, // tileheight/2 - more useful for isometric..
    maxRows: null,
    maxCols: null,

    init: function(map) {
        this.map = map;
        this.buffer_extra = 1.5;
        this.padding = (this.buffer_extra - 1) / 2;

        this.screenW = map.tilesets[0].tilewidth;
        this.screenH = map.tilesets[0].tileheight;

        this.tileHeight = map.tileSize.y;
        this.tileWidth = map.tileSize.x;

        this.rowHeight = this.tileHeight/2;

        var contentWidth = map.pixelSize.x;
        var contentHeight = map.pixelSize.y;

        // Compute maximum rows/columns to render for content size
        this.maxRows = contentHeight / this.rowHeight;
        this.maxCols = contentWidth / this.tileWidth;

    },


    _drawWalls: function(ctx, layerData, centerX, centerY, renderWidth, renderHeight) {

        var left = centerX - renderWidth/2;
        var top = centerY - renderHeight/2;

        console.log("Drawing at ",left, ", ",top, "  ",renderWidth, ", ",renderHeight)
        // ...Grab the 'data' Array of the given layer...
        var dat = layerData;
        var map = this.map;

        // Compute starting rows/columns and support out of range scroll positions
        var startRow = Math.max(Math.floor(top / this.rowHeight), 0);
        var startCol = Math.max(Math.floor(left / this.tileWidth), 0);


        // Compute initial render offsets
        // 1. Positive scroll position: We match the starting rows/tile first so we
        //    just need to take care that the half-visible tile is fully rendered
        //    and placed partly outside.
        // 2. Negative scroll position: We shift the whole render context
        //    (ignoring the tile dimensions) and effectively reduce the render
        //    dimensions by the scroll amount.
        var startTop = top >= 0 ? (-top % this.rowHeight) : -top;
        var startLeft = left >= 0 ? -left % this.tileWidth : -left;

        startTop -= this.rowHeight;     // staggared isometric fix
        startLeft -= this.tileWidth/2;

        // Compute number of rows to render
        var rows = Math.floor(renderHeight / this.rowHeight);

        if ((top % this.rowHeight) > 0) {
            rows += 1;
        }

        if ((startTop + (rows * this.rowHeight)) < renderHeight) {
            rows += 1;
        }

        // Compute number of columns to render
        var cols = Math.floor(renderWidth / this.tileWidth);

        if ((left % this.tileWidth) > 0) {
            cols += 1;
        }

        if ((startLeft + (cols * this.tileWidth)) < renderWidth) {
            cols += 1;
        }

        // Limit rows/columns to maximum numbers
        var maxRows = this.maxRows - startRow;
        rows = Math.min(rows, maxRows);
        //            wallRows = Math.min(wallRows, maxRows);
        cols = Math.min(cols, this.maxCols - startCol);


        // todo: move 3 lines to init
        var offsetY = this.tileHeight - this.screenH;
        var offsetXEven =  this.tileWidth - this.screenW;
        var offsetXOdd =  offsetXEven + this.tileWidth/2;
        // Initialize looping variables
        var currentLeft = startLeft;
        var currentTop = startTop;
        var tileWidth = this.tileWidth;

        for (var row = startRow; row < startRow+rows; row++) {
            var tileIDX = map.numXTiles * row + startCol;
            for (var col = startCol; col < (cols + startCol); col++) {

                // draw those, so we can skip processing them...
                var tID = dat[tileIDX];
                if(!tID) {
                    //                    this.drawSprites(ctx, layerIdx, sprites, row, col, zoom );
                    currentLeft += tileWidth;
                    tileIDX++;
                    continue;
                }

                // ...If the tileID is not 0, then we grab the
                // packet data using getTilePacket.
                var pkt = map.getTilePacket(tID);

                var offsetX = (row % 2) == 0 ? offsetXEven : offsetXOdd;

                var screenX = offsetX + currentLeft;
                var screenY = offsetY + currentTop;

                map.paintTile(ctx, pkt.img, pkt.px, pkt.py,
                    //this.tileSize.x, this.tileSize.y,
                    pkt.w, pkt.h,
                    screenX, screenY,
                    //this.tileSize.x, this.tileSize.y);
                    this.screenW, this.screenH);

                //                this.drawSprites(ctx, layerIdx, sprites, row, col, zoom);

                currentLeft += tileWidth;
                tileIDX++;
            }

            currentLeft = startLeft;
            currentTop += this.rowHeight;
        }
    },

    drawLayer: function(ctx, layerData,
                        centerX, centerY, clientWidth, clientHeight) {

//        ctx.clearRect(0,0, clientWidth, clientHeight);
//        this._drawMap(ctx, layerData, centerX - clientWidth/2, centerY - clientHeight/2, clientWidth, clientHeight);
//        return;

        // optimization for higher FPS
        // special handling for layer 1+ - this layer is cached in rows, because it has isometric 3d affects (sprites draws over walls and behind other walls)
        var cachedParams = this.cachedParams;
        if (clientWidth != cachedParams.clientWidth || clientHeight != cachedParams.clientHeight) {
            this.bufferWidth = clientWidth * this.buffer_extra;
            this.bufferHeight = clientHeight * this.buffer_extra;
            var rowWidth = Math.round(this.bufferWidth);

            var rows = Math.floor(this.bufferHeight / this.rowHeight);
            console.log("Creating "+rows+" walls caches");
            this.row_buffers = [];
            for (var i=0; i< rows; i++ ) {
                var canvas = document.createElement('canvas');
                canvas.width = rowWidth;
                canvas.height = this.screenH;
                var context = canvas.getContext('2d');
                var backbuffCanvas = document.createElement('canvas');
                backbuffCanvas.width = rowWidth;
                backbuffCanvas.height = this.screenH;
                var backbuffContext = canvas.getContext('2d');
                this.row_buffers.push([
                    { canvas: canvas,         context: context },
                    { canvas: backbuffCanvas, context: backbuffContext }
                ]);
            }

            cachedParams.centerX = null; // just to trigger redraw
        }

        var top  = centerY - this.bufferHeight/2;
        var left = centerX - this.bufferWidth /2;

        //cctx.clearRect(0,0, this.bufferWidth, this.bufferHeight);

        this._drawWalls(ctx, layerData, centerX, centerY, clientWidth, clientHeight);

        this.cachedParams.centerX = centerX;
        this.cachedParams.centerY = centerY;
        this.cachedParams.clientWidth = clientWidth;
        this.cachedParams.clientHeight = clientHeight;
    }
})
