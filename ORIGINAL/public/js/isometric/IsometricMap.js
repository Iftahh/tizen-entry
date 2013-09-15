/*
 Handles Isometric Map  loading (from json data) and rendering of map portion

 Note other features done by other classes:
    tile selection - IsometricGeometry
 */


var IsometricMap = Class.extend({
    // This is where we store the full parsed
    // JSON of the map.json file.
    currMapData: null,

    // tilesets stores each individual tileset
    // from the map.json's 'tilesets' Array.
    // The structure of each entry of this
    // Array is explained below in the
    // parseAtlasDefinition method.
    tilesets: [],

    // This is where we store the width and
    // height of the map in tiles. This is
    // in the 'width' and 'height' fields
    // of map.json, respectively.
    // The values 100 here are just set
    // so these fields are initialized to
    // something, rather than null.
    numXTiles: 100,
    numYTiles: 100,

    // The size of each individual map
    // tile, in pixels. This is in the
    // 'tilewidth' and 'tileheight' fields
    // of map.json, respectively.
    // The values 64 here are just set
    // so these fields are initialized to
    // something, rather than null.
    tileSize: {
        "x": 64,
        "y": 64
    },

    // The size of the entire map,
    // in pixels. This is calculated
    // based on the 'numXTiles', 'numYTiles',
    // and 'tileSize' parameters.
    // The values 64 here are just set
    // so these fields are initialized to
    // something, rather than null.
    pixelSize: {
        "x": 64,
        "y": 64
    },

    // Counter to keep track of how many tile
    // images we have successfully loaded.
    imgLoadCount: 0,

    // Boolean flag we set once our tile images
    // has finished loading.
    fullyLoaded: false,
    onLoad: null,

    groundRenderer: null,
    wallsRenderer: null,

    init: function() {
    },

    //-----------------------------------------
    // Load the json file at the url 'map' into
    // memory. This is similar to the requests
    // we've done in the past using
    // XMLHttpRequests.
    loadURL: function (map) {

        var that = this;
        // Perform an XMLHttpRequest to grab the
        // JSON file at url 'map'.
        $.get(map, function(mapJSON) {
            that.loadJSON(mapJSON);
        });
    },

    loadJSON: function (mapJSON, loader) {
        var that = this;
        // Once the XMLHttpRequest loads, call the
        // parseMapJSON method.
        // Call JSON.parse on 'mapJSON' and store
        // the resulting map data
        that.currMapData = mapJSON;

        var map = that.currMapData;

        // Set 'numXTiles' and 'numYTiles' from the
        // 'width' and 'height' fields of our parsed
        // map data.
        that.numXTiles = map.width;
        that.numYTiles = map.height;

        // Set the 'tileSize.x' and 'tileSize.y' fields
        // from the 'tilewidth' and 'tileheight' fields
        // of our parsed map data.
        that.tileSize.x = map.tilewidth;
        that.tileSize.y = map.tileheight;
        that.rowHeight = that.tileSize.y / 2; // staggered isometric

        // Set the 'pixelSize.x' and 'pixelSize.y' fields
        // by multiplying the number of tiles in our map
        // by the size of each tile in pixels.
        that.pixelSize.x = that.numXTiles * that.tileSize.x;
        that.pixelSize.y = (1+that.numYTiles) * that.rowHeight;

        // Loop through 'map.tilesets', an Array...
        for(var i = 0; i < map.tilesets.length; i++) {
            // ...loading each of the provided tilesets as
            // Images...

            var img;
            if (loader) {
                img = loader.get(map.tilesets[i].image);
                if (!img) {
                    console.log("Should be loaded already!");
                }
                else {
                    that.imgLoadCount++;
                    if (that.imgLoadCount === map.tilesets.length) {
                        that.fullyLoaded = true;
                        that.groundRenderer = new FlatLayer(that);
                        that.wallsRenderer = new WallLayer(that);
                    }
                }
            }
            else {
                img = new Image();
                img.onload = function () {
                    // ...Increment the above 'imgLoadCount'
                    // field of 'TILEDMap' as each tileset is
                    // loading...
                    that.imgLoadCount++;
                    if (that.imgLoadCount === map.tilesets.length) {
                        // ...Once all the tilesets are loaded,
                        // set the 'fullyLoaded' flag to true...
                        that.fullyLoaded = true;
                        that.groundRenderer = new FlatLayer(that);
                        that.wallsRenderer = new WallLayer(that);
                    }
                };

                // The 'src' value to load each new Image from is in
                // the 'image' property of the 'tilesets'.
                img.src = map.tilesets[i].image;
            }

            // this is the javascript object we'll create for
            // the 'tilesets' Array above. First, fill in the
            // given fields with the corresponding fields from
            // the 'tilesets' Array in 'currMapData'.
            var tileset = that.currMapData.tilesets[i];
            var ts = {
                "firstgid": tileset.firstgid,

                // 'image' should equal the Image object we
                // just created.

                "image": img,
                "imageheight": tileset.imageheight,
                "imagewidth": tileset.imagewidth,
                "name": that.currMapData.tilesets[i].name,

                // These next two fields are tricky. You'll
                // need to calculate this data from the
                // width and height of the overall image and
                // the size of each individual tile.
                //
                // Remember: This should be an integer, so you
                // might need to do a bit of manipulation after
                // you calculate it.

                "numXTiles": Math.floor(tileset.imagewidth / tileset.tilewidth),
                "numYTiles": Math.floor(tileset.imageheight / tileset.tileheight),
                "tilewidth": tileset.tilewidth,
                "tileheight": tileset.tileheight
            };

            // After that, push the newly created object into
            // the 'tilesets' Array above. Javascript Arrays
            // have a handy method called, appropriately, 'push'
            // that does exactly this. It takes the object
            // we'd like to put into the Array as a parameter.
            //
            // YOUR CODE HERE
            that.tilesets.push(ts);
        }
    },


    tilePacketCache: {},
    //-----------------------------------------
    // Grabs a tile from our 'layer' data and returns
    // the 'pkt' object for the layer we want to draw.
    // It takes as a parameter 'tileIndex', which is
    // the id of the tile we'd like to draw in our
    // layer data.
    getTilePacket: function (tileIndex) {
        var res = this.tilePacketCache[tileIndex];
        if (res) {
            return res;
        }
        // We define a 'pkt' object that will contain
        //
        // 1) The Image object of the given tile.
        // 2) The (x,y) values that we want to draw
        //    the tile to in map coordinates.
        var pkt = {
            "img": null,
            "px": 0,
            "py": 0,
            "w": 0,
            "h": 0
        };

        // The first thing we need to do is find the
        // appropriate tileset that we want to draw
        // from.
        //
        // Remember, if the tileset's 'firstgid'
        // parameter is less than the 'tileIndex'
        // of the tile we want to draw, then we know
        // that tile is not in the given tileset and
        // we can skip to the next one.
        var tile = 0;
        for(tile = this.tilesets.length - 1; tile >= 0; tile--) {
            if(this.tilesets[tile].firstgid <= tileIndex) break;
        }

        var tileset = this.tilesets[tile];
        if (!tileset) {
            console.log("no tilset");
            return;
        }

        // Next, we need to set the 'img' parameter
        // in our 'pkt' object to the Image object
        // of the appropriate 'tileset' that we found
        // above.
        pkt.img = tileset.image;


        // Finally, we need to calculate the position to
        // draw to based on:
        //
        // 1) The local id of the tile, calculated from the
        //    'tileIndex' of the tile we want to draw and
        //    the 'firstgid' of the tileset we found earlier.
        var localIdx = tileIndex - tileset.firstgid;

        // 2) The (x,y) position of the tile in terms of the
        //    number of tiles in our tileset. This is based on
        //    the 'numXTiles' of the given tileset. Note that
        //    'numYTiles' isn't actually needed here. Think about
        //    how the tiles are arranged if you don't see this,
        //    It's a little tricky. You might want to use the
        //    modulo and division operators here.
        var lTileX = Math.floor(localIdx % tileset.numXTiles);
        var lTileY = Math.floor(localIdx / tileset.numXTiles);

        // 3) the (x,y) pixel position in our tileset image of the
        //    tile we want to draw. This is based on the tile
        //    position we just calculated and the (x,y) size of
        //    each tile in pixels.
        pkt.px = (lTileX * tileset.tilewidth);
        pkt.py = (lTileY * tileset.tileheight);

        pkt.w = tileset.tilewidth;
        pkt.h = tileset.tileheight;

        this.tilePacketCache[tileIndex] = pkt;
        return pkt;
    },

    sprites: {}, // from tile layer to sprites  of the layer - split as hash of rows and cols
    drawSprites: function(ctx, layer, sprites, row, col) {
        if (!sprites[row]){
            return;
        }
        var toDraw = sprites[row][col];
        if (!toDraw) {
            return;
        }
        for (var i=0; i<toDraw.length; i++) {
            var sprite = toDraw[i];
            sprite.render(ctx, layer);
        }
    },

    paintTile: function(ctx,img, px,py, w,h, screenX, screenY, screenW, screenH) {
        ctx.drawImage(img, px,py, w,h, screenX, screenY, screenW, screenH);
    },

    renderWidth: 0,
    renderHeight: 0,

    render: function(context, centerX, centerY) {
        if(!this.fullyLoaded) return;


        //var wallRows = rows+4; // few extra for the tall wall tiles

        var sprites = this.sprites;



//        var drawSpriteLayer = function(ctx, layerIdx) {
//
//            for (var row = startRow; row < (rows + startRow); row++) {
//                for (var col = startCol; col < (cols + startCol); col++) {
//
//                    this.drawSprites(ctx, layerIdx, sprites, row, col );
//                }
//            }
//        }



        var layers = this.currMapData.layers;
        this.groundRenderer.drawLayer(context,  layers[0].data,
                centerX, centerY, this.renderWidth, this.renderHeight
        );

        this.wallsRenderer.drawLayer(context,  layers[2].data,
            centerX, centerY, this.renderWidth, this.renderHeight
        );


        //drawLayer.call(that, context, 0);

        // ...Now, for every single layer in the 'layers' Array
        // of 'currMapData'...
        for(var layerIdx = 1; layerIdx < layers.length; layerIdx++) {
            if(layers[layerIdx].type == "tilelayer") {
//                drawLayer.call(that, context, layerIdx);
            }
            else {
//                drawSpriteLayer.call(this, context, layerIdx);
            }
        }

    },

    //-----------------------------------------
    // Draws all of the map data to the passed-in
    // canvas context, 'ctx'.
    drawAll: function (ctx) {
        // First, we need to check if the map data has
        // already finished loading...


        // ...Now, for every single layer in the 'layers' Array
        // of 'currMapData'...
        for(var layerIdx = 0; layerIdx < this.currMapData.layers.length; layerIdx++) {


            // ...Grab the 'data' Array of the given layer...
            var dat = this.currMapData.layers[layerIdx].data;

            // ...For each tileID in the 'data' Array...
            for(var tileIDX = 0; tileIDX < dat.length; tileIDX++) {
                // ...Check if that tileID is 0. Remember, we don't draw
                // draw those, so we can skip processing them...
                var tID = dat[tileIDX];
                if(tID === 0) continue;

                // ...If the tileID is not 0, then we grab the
                // packet data using getTilePacket.
                var tPKT = this.getTilePacket(tID);

                // Now we need to calculate the (x,y) position we want to draw
                // to in our game world.
                //
                // We've performed a similar calculation in 'getTilePacket',
                // think about how to calculate this based on the tile id and
                // various tile properties that our TILEDMapClass has.
                //
                // YOUR CODE HERE
                var lTileX = Math.floor(tileIDX % this.numXTiles);
                var lTileY = Math.floor(tileIDX / this.numXTiles);

                // Now, we're finally drawing the map to our canvas! The 'drawImage'
                // method of our 'ctx' object takes nine arguments:
                //
                // 1) The Image object to draw,
                // 2) The source x coordinate in our Image,
                // 3) The source y coordinate in our Image,
                // 4) The source width of our tile,
                // 5) The source height of our tile,
                // 6) The canvas x coordinate to draw to,
                // 7) The canvas y coordinate to draw to,
                // 8) The destination width,
                // 9) The destination height
                //
                // Note that we don't want to stretch our tiles at all, so the
                // source height and width should be the same as the destination!
                //
                // YOUR CODE HERE
                var pkt = tPKT;

                /* ile_map[][] = [[...],...]

                 for (i = 0; i < tile_map.size; i++):
                 if i is odd:
                 offset_x = tile_width / 2
                 else:
                 offset_x = 0

                 for (j = 0; j < tile_map[i].size; j++):
                 draw(
                 tile_map[i][j],
                 x = (j * tile_width) + offset_x,
                 y = i * tile_height / 2
                 )*/
                // TODO: move x-pkt.w and y-pkt.h out of loop - they are same for all tilemap
                var offsetX = (this.tileSize.x - pkt.w)  + ((lTileY % 2) == 0 ? 0 : this.tileSize.x/2);
                var offsetY = this.tileSize.y - pkt.h;

                var screenX = offsetX + (lTileX * this.tileSize.x);
                var screenY = offsetY + lTileY * this.tileSize.y/2;

                ctx.drawImage(pkt.img, pkt.px, pkt.py,
                    //this.tileSize.x, this.tileSize.y,
                    pkt.w, pkt.h,
                    screenX, screenY,
                    //this.tileSize.x, this.tileSize.y);
                    pkt.w, pkt.h);

            }
        }
    }

});


