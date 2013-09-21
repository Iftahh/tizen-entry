
function TextureAnimator(texture, tilesHoriz, tilesVert, numTiles, tileDispDuration)
{
    // note: texture passed by reference, will be updated by the update function.

    this.tilesHorizontal = tilesHoriz;
    this.tilesVertical = tilesVert;
    // how many images does this spritesheet contain?
    //  usually equals tilesHoriz * tilesVert, but not necessarily,
    //  if there at blank tiles at the bottom of the spritesheet.
    this.numberOfTiles = numTiles;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set( 1 / this.tilesHorizontal, 1 / this.tilesVertical );

    // how long should each image be displayed?
    this.tileDisplayDuration = tileDispDuration;

    // how long has the current image been displayed?
    this.currentDisplayTime = 0;

    // which image is currently being displayed?
    this.currentTile = 0;

    this.update = function( milliSec )
    {
        this.currentDisplayTime += milliSec;
        while (this.currentDisplayTime > this.tileDisplayDuration)
        {
            this.currentDisplayTime -= this.tileDisplayDuration;
            this.currentTile++;
            if (this.currentTile == this.numberOfTiles)
                this.currentTile = 0;
            var currentColumn = this.currentTile % this.tilesHorizontal;
            texture.offset.x = currentColumn / this.tilesHorizontal;
            var currentRow = Math.floor( this.currentTile / this.tilesHorizontal );
            texture.offset.y = currentRow / this.tilesVertical;
        }
    };
}


hero = {

    animations: {      // name of animation files to number of frames in each
        'kippt_um_' : 9,
        'lNuft_': 9,
        'noarmstan_treffer_': 7,
        'rennt_': 9,
        'stan_spricht_': 7
    },

    heroAtlas: null,

    init: function(x,y,z) {
        this.heroAtlas = Atlas()
        this.heroAtlas.parseAtlasDefinition(gAssetLoader.get('atlas/stan.json'))

        var animation = Animation();
        var frame = animation.getFrame('lNuft_', 0, 1);
        frame = this.heroAtlas.sprites[frame];

        var runnerTexture = new THREE.ImageUtils.loadTexture('imgs/stan.png');
        console.log(frame)
//        runnerTexture.offset.x = frame.fx;
//        runnerTexture.offset.y = frame.fy;
//        runnerTexture.repeat.x = frame.fw;
//        runnerTexture.repeat.y = frame.fh;

        // https://gist.github.com/calvintennant/2008730 is good for 3d texture - but I want sprite

//        var runnerMaterial = new THREE.SpriteMaterial( { map: runnerTexture, useScreenCoordinates: false, color: 0x00ff00 } );
//        runnerMaterial.uvOffset.x = frame.x;
//        runnerMaterial.uvOffset.y = frame.y;
//        runnerMaterial.uvScale.x = frame.fw;
//        runnerMaterial.uvScale.y = frame.fh;
//        this.runner = new THREE.Sprite(runnerMaterial);

        
        this.runner.position.set(x,y,z);
        //this.runner.scale.set( frame.w, frame.h, 1.0 );
        scene.add(this.runner);
    },

    updatePosition: function(pos) {
        this.runner.position = pos;
    },

    update: function(dt) {
        var delta = clock.getDelta();

        //annie.update(1000 * delta);
    },


    render: function() {

    }
}
