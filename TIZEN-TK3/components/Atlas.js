// based on code from Udacity HTML5 Game Programming course
gAtlasCache = {}


Atlas = function(atlasUrl) {
    if (gAtlasCache[atlasUrl]) {
        return gAtlasCache[atlasUrl];
    }

    var result= {

        // The Image object that we created for our atlas.
        img: null,
        imgUrl: '',
        imgW: 0,
        imgH: 0,

        // An array of all the sprites in our atlas.
        sprites: {}
    };

    //-----------------------------------------
    // Parse the JSON file passed in as 'atlasJSON'
    // that is associated to this atlas.
    var atlasJSON = gAssetLoader.get(atlasUrl);
    result.imgUrl = atlasJSON.meta.image;
    result.img = gAssetLoader.get(atlasJSON.meta.image);

    result.imgW = atlasJSON.meta.size.w;
    result.imgH = atlasJSON.meta.size.h;

    // For each sprite in the atlasJSON JSON,
    // 'chaingun.png', chaingun_impact.png',
    // etc....
    for (var key in atlasJSON.frames) {
        // Grab the sprite from the atlasJSON JSON...
        var sprite = atlasJSON.frames[key];

        // The fx and fy are fractional coordinates of the sprite and fw,fh are the fractional width and height of the sprite in
        // the atlas.
        //
        // for example:  if the image is 800x600 px,
        //  and the sprite is 80x120  located at 200,200
        //  fx=0.25, fy=0.3333, fw=0.1, fh=0.2)
        result.sprites[key]= {
            id: key,
            fx: sprite.frame.x / result.imgW,
            fy: sprite.frame.y / result.imgH,
            fw: sprite.frame.w / result.imgW,
            fh: sprite.frame.h / result.imgH,
            x: sprite.frame.x,
            y: sprite.frame.y,
            w: sprite.frame.w,
            h: sprite.frame.h
        };
    }

    gAtlasCache[atlasUrl] = result;
    return result;
};




