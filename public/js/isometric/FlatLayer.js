


FlatLayer = Class.extend({
    map: null,
    cachedParams: {
        centerX: Infinity,
        centerY: Infinity,
        clientWidth: null,
        clientHeight: null
    },
    buffers: [{
        cacheContext: null,
        cachedGround: null
    }, {
        cacheContext: null,
        cachedGround: null
    }],
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


    _drawMap: function(ctx, layerData, left, top, renderWidth, renderHeight) {

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


        var offsetY = this.tileHeight - this.screenH;
        var offsetXEven =  this.tileWidth - this.screenW;
        var offsetXOdd =  offsetXEven + this.tileWidth/2;
        // Initialize looping variables
        var currentLeft = startLeft;
        var currentTop = startTop+offsetY;
        var tileWidth = this.tileWidth;

        for (var row = startRow; row < startRow+rows; row++) {
            var tileIDX = map.numXTiles * row + startCol;
            currentLeft = startLeft + ((row % 2) == 0 ? offsetXEven : offsetXOdd);
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

                map.paintTile(ctx, pkt.img, pkt.px, pkt.py,
                    //this.tileSize.x, this.tileSize.y,
                    pkt.w, pkt.h,
                    currentLeft, currentTop,
                    //this.tileSize.x, this.tileSize.y);
                    this.screenW, this.screenH);

                //                this.drawSprites(ctx, layerIdx, sprites, row, col, zoom);

                currentLeft += tileWidth;
                tileIDX++;
            }


            currentTop += this.rowHeight;
        }
    },

    drawLayer: function(ctx, layerData,
                        centerX, centerY, clientWidth, clientHeight) {

//        ctx.fillRect(0,0, clientWidth, clientHeight);
//        this._drawMap(ctx, layerData, centerX - clientWidth/2, centerY - clientHeight/2, clientWidth, clientHeight);
//        return;

        var drawn = this.buffers[this.drawingBuffer];

        // TODO: cache each strip (row) of tiles as well...
        // optimization for higher FPS
        // special handling for layer 0 - this layer is simple to cache because it has no isometric 3d affects (nothing draws over something else)
        var cachedParams = this.cachedParams;
        if (clientWidth != cachedParams.clientWidth || clientHeight != cachedParams.clientHeight) {
            console.log("Creating cache")
            this.bufferWidth = clientWidth * this.buffer_extra;
            this.bufferHeight = clientHeight * this.buffer_extra;
            var bw = Math.round(this.bufferWidth);
            var bh = Math.round(this.bufferHeight);
            drawn.cachedGround = document.createElement('canvas');
            drawn.cachedGround.width = bw;
            drawn.cachedGround.height = bh;
            drawn.cacheContext = drawn.cachedGround.getContext('2d');
            drawn.cacheContext.fillStyle = "#000";

            var backBuffer = this.buffers[1-this.drawingBuffer];
            backBuffer.cachedGround = document.createElement('canvas');
            backBuffer.cachedGround.width = bw;
            backBuffer.cachedGround.height = bh;
            backBuffer.cacheContext = backBuffer.cachedGround.getContext('2d');
            backBuffer.cacheContext.fillStyle = "#000";

            //this.drawn = [this.cacheContext2, this.cachedGround2];
            cachedParams.centerX = Infinity; // just to trigger redraw
        }

        var qcw = this.padding*clientWidth;   // padding of current client width
        var qch = this.padding*clientHeight;
        var dx = centerX - cachedParams.centerX;
        var dy = centerY - cachedParams.centerY;
        var adx = Math.abs(dx);
        var ady = Math.abs(dy);
        if (adx > qcw || ady > qch) {

            // draw into cache

            var cctx = drawn.cacheContext;

            if (cachedParams.centerX != Infinity) {
                // already has image in cache
                var x,sx, y,sy;
                if (dx < 0) {
                    // moved to left - set screen x to dx and source-x to 0
                    x = adx;
                    sx = 0;
                }
                else {
                    // moved to right
                    x = 0;
                    sx = adx;
                }
                if (dy < 0) {
                    // moved to top
                    y = ady;
                    sy = 0;
                }
                else {
                    // moved to bottom
                    sy = ady;
                    y = 0;
                }

                var reuseWidth = this.bufferWidth - adx;
                var reuseHeight = this.bufferHeight - ady;

                console.log("reuse drawing at "+x+", "+y+ "   sxy="+sx+","+sy+ " wh:"+reuseWidth+","+reuseHeight);
                var backBuffer = this.buffers[1-this.drawingBuffer];
                var cctx2 = backBuffer.cacheContext;

                cctx2.fillRect(0,0, this.bufferWidth, this.bufferHeight);

                cctx2.drawImage(drawn.cachedGround,sx,sy, reuseWidth, reuseHeight,
                        x, y, reuseWidth, reuseHeight);


                var top  = centerY - this.bufferHeight/2;
                var left = centerX - this.bufferWidth /2;
                cctx2.save();
                if (dy < 0) {
                    // draw horizontal strip at top of buffer
                    console.log("horiz strip at "+left+", "+top+ "   w,h="+this.bufferWidth+","+ady+ " (top of buffer)");
                    this._drawMap(cctx2, layerData, left, top, this.bufferWidth, ady);
                    // the vertical strip should DY down
                    cctx2.translate(0, ady);
                    top += ady;
                }
                else {
                    console.log("horiz strip at "+left+", "+(top+this.bufferHeight-ady)+ "   w,h="+this.bufferWidth+","+ady + " (bottom of buffer)");
                    // draw horizontal strip at bottom of buffer
                    cctx2.save();
                    cctx2.translate(0, this.bufferHeight-ady);
                    this._drawMap(cctx2, layerData, left, top+this.bufferHeight-ady, this.bufferWidth, ady);
                    cctx2.restore();
                    // the vertical strip should start at top - no need for modifying top or translating context
                }

                if (dx < 0) {
                    console.log("vert strip at "+left+", "+top+ "   w,h="+adx+","+(this.bufferHeight-ady) + " (left of buffer)");
                    // draw vertical strip on the left of buffer
                    this._drawMap(cctx2, layerData, left, top, adx, this.bufferHeight-ady);
                }
                else {
                    console.log("vert strip at "+(left+this.bufferWidth-adx)+", "+top+ "   w,h="+adx+","+(this.bufferHeight-ady) + " (right of buffer)");
                    // draw vertical strip on the right of buffer
                    cctx2.translate(this.bufferWidth-adx, 0)
                    this._drawMap(cctx2, layerData, left+this.bufferWidth-adx, top, adx, this.bufferHeight-ady);
                }
                cctx2.restore();


                this.drawingBuffer = 1-this.drawingBuffer;
                drawn = this.buffers[this.drawingBuffer];
            }
            else {
                var top  = centerY - this.bufferHeight/2;
                var left = centerX - this.bufferWidth /2;

                // clearRect isn't good for some reason
                cctx.fillRect(0,0, this.bufferWidth, this.bufferHeight);

                this._drawMap(cctx, layerData, left, top, this.bufferWidth, this.bufferHeight);
            }

//            var tmp = this.drawn;
//            this.drawn = this.toDraw;
//            this.toDraw = tmp;
//            this.cachedParams = renderParams;
            this.cachedParams.centerX = centerX;
            this.cachedParams.centerY = centerY;
            this.cachedParams.clientWidth = clientWidth;
            this.cachedParams.clientHeight = clientHeight;
        }
        // draw from cache

        var x = centerX - cachedParams.centerX + this.cachedParams.clientWidth*this.padding;
        var y = centerY - cachedParams.centerY + this.cachedParams.clientHeight*this.padding;

        ctx.drawImage(drawn.cachedGround, x,y, clientWidth, clientHeight, 0, 0, clientWidth, clientHeight);


    }

})
