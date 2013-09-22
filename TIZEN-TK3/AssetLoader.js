// based on code from Udacity html5 game programming course

gAssetLoader = {

    cachedAssets: {},
    soundManager: null,

    ImageType: 0,
    ScriptType: 1,
    SoundType: 2,
    JSONType: 3,

    loadAssets: function (assetList, callbackFcn, progressFcn) {
        // All the information we need to keep track of
        // for this batch.
        var loadBatch = {
            count: 0,
            total: assetList.length,
            cb: callbackFcn,
            progress: progressFcn
        };

        var  onLoadedCallback = function(batch, uri) {
            // If the entire batch has been loaded,
            // call the callback.
            batch.count++;
            if(batch.count == batch.total) {
                batch.cb();
            }
            else {
                if (batch.progress) {
                    batch.progress(batch, uri);
                }
            }
        }
        var that = this;

        for(var i = 0; i < assetList.length; i++) {
            var filename = assetList[i]
            if(this.cachedAssets[filename] === undefined) {
                var assetType = this.getAssetTypeFromExtension(filename);
    
                if(assetType === this.ImageType) { // Asset is an image
                    var img = new Image();
                    img.onload = function(fn) { return function () {
                        onLoadedCallback(loadBatch, fn);
                    }}(filename);
                    img.src = assetList[i];
                    this.cachedAssets[assetList[i]] = img;
    
                } else if(assetType === this.ScriptType) { // Asset is Javascript
                    var fileref = document.createElement('script');
                    fileref.setAttribute("type", "text/javascript");
                    fileref.onload = function(fn) { return function (e){
                        onLoadedCallback( loadBatch, fn);
                    }}(filename);
                    fileref.setAttribute("src", filename);
                    document.getElementsByTagName("head")[0].appendChild(fileref);
                    this.cachedAssets[assetList[i]] = fileref;
                }
                else if (assetType === this.SoundType) {
                    that.cachedAssets[filename] = true;
                    this.soundManager.loadAsync(filename, function(fn) { return function() {
                        onLoadedCallback(loadBatch,fn);
                    }}(filename))
                }
                else if (assetType === this.JSONType) {
                    that.cachedAssets[filename] = true;
                    $.get(filename, function(fn) { return function(data) {
                        if (typeof data == "string") {
                            data = JSON.parse(data);
                        }
                        that.cachedAssets[fn] = data;
                        onLoadedCallback(loadBatch, fn);
                    }}(filename))
                }
    
            } else { // Asset is already loaded
                onLoadedCallback(loadBatch);
            }
        }
    },

    get: function(asset) {
        return this.cachedAssets[asset];
    },

    getAssetTypeFromExtension: function (fname) {
        if (/\.(:?jpg|gif|png|jpeg)$/i.test(fname)) {
            // It's an image!
            return this.ImageType;
        }
        if (/\.json$/i.test(fname)) {
            return this.JSONType;
        }

        if(/\.js$/i.test(fname)) {
            return this.ScriptType;
        }

        if (/\.(:?ogg|wav|mp3)$/i.test(fname)) {
            return this.SoundType;
        }
        return -1;
    }

}
