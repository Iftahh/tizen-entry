


IsometricGeometry = Class.extend({

    tileWidth: 64,
    tileHeight: 32,

    init: function(tileWidth, tileHeight) {
        this.tileWidth = tileWidth;
        this.tileHeight= tileHeight;
    },

    getMidX: function(tx, ty) {
        var rowOffsetX = this.tileWidth/2;
        if (ty %2 != 0)  {
            rowOffsetX = this.tileWidth;
        }
        return tx*this.tileWidth+rowOffsetX;
    },

    getMidY: function(ty) {
        return ty*this.tileHeight/2.0;
    },

    calcTileByPixel: function(pixelX, pixelY) {
        /***********************************************
         *  +-------+-------+
         *  |a  _ / | \ _  d|
         *  | /  b  |  c  \ |             a= "above /"
         *  +-------+-------+             b= "below /"
         *  | \ _ d |a  _ / |             c= "below \"
         *  | c   \ | /   b |   <-- rY    d= "above \"
         *  +-------+-------+
         *     ^
         *     rX         (rx,ry) = coordinate of rectangle of (size/2)
         */
        //var dbg = '';
        var halfSizeX = this.tileWidth / 2;
        var halfSizeY = this.tileHeight / 2;

        pixelY += halfSizeY; // not sure why

        // index of rectangle (of size sizeX/2 * sizeY/2)
        var rX = (pixelX / halfSizeX).floor();
        var rY = (pixelY / halfSizeY).floor();

        var inRX = pixelX - rX*halfSizeX; // in the Rectangle (rX,rY)
        var inRY = pixelY - rY*halfSizeY;

        var slope = halfSizeY / halfSizeX;

        var _tileHoverX = (rX/2).floor();
        var _tileHoverY = (rY/2).floor() * 2;

        // check if its a the rectangle is "/" diagonal or "\" diagonal
        // and adjust indX,indY accordingly
        if ((rX+rY) % 2 == 0) {
            // this is a "/" diagonal
            var y = halfSizeY - slope*inRX;
            if (inRY < y) {
                // above /
                //_quarter = Quarter.ABOVE_SLASH;
                //dbg += ("above /\n")
                if (rX %2 == 0) {
                    //dbg += ("moving x-- y--\n");
                    _tileHoverX--;
                    _tileHoverY--;
                }
            }
            else {
                // below /
                //_quarter = Quarter.BELOW_SLASH;
                //dbg += ("below /\n")
                if (rX %2 == 1) {
                    //dbg += ("moving y++\n")
                    _tileHoverY++;
                }
            }
        }
        else {
            // this is a "\" diagonal
            var y = slope*inRX;
            if (inRY > y) {
                //dbg += ("below \\ \n");
                // below \
                //_quarter = Quarter.BELOW_BACKSLASH;
                if (rX % 2 == 0) {
                   // dbg += ("moving x-- y++\n")
                    _tileHoverX--;
                    _tileHoverY++;
                }
            }
            else {
                // above \
                //_quarter = Quarter.ABOVE_BACKSLASH;
                //dbg += ("above \\ \n");
                if (rX % 2 == 1) {
                    //dbg += ("moving y--\n")
                    _tileHoverY--;
                }
            }
        }
        return [_tileHoverX, _tileHoverY];//, dbg];
    }
})
