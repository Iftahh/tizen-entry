
var log = function(text) {
    var t = $('#text')
    t.text(t.text() + "\n"+(new Date())+"  "+text);
}

$(function() {
    // Reflow handling
    var container = document.getElementById("container");
    var content = $('#text');
    var reflow = function() {
        var clientWidth = container.clientWidth;
        var clientHeight = container.clientHeight;
        content.width(clientWidth);
        content.height(clientHeight);
    };
    window.addEventListener("resize", reflow, false);
    reflow();

    var assets= [
        "/atlas/spider.json",
        "/atlas/stan.json",
        "/js/algorithms/BinaryHeap.js",
        "/js/core/SoundManager.js",
        "/js/algorithms/UnionFind.js",
        "/imgs/red_spider.png",
        "/imgs/stan.png"
    ];

    var loader = new AssetLoader();

    log("loading ")
    loader.loadAssets(assets, function() {
        log("loaded")
        loader.soundManager = new SoundManager();
        var sounds = ["/sounds/foom_0", "/sounds/die1", "/sounds/pain1", "/sounds/spell1_0",
            "/music/cave_themeb4", "/music/TheLoomingBattle_0"
        ];
        var moreAssets = [];
        for (var i=0; i<sounds.length; i++) {
            var sound = sounds[i];
            moreAssets.push(sound+".ogg");
            $('#cont').append("<tr><td><button id="+sound+">"+sound+"</button></td></tr>")
        }
        $('#cont button').click(function() {
            var sound = this.id;
            var url = sound+".ogg";
            loader.soundManager.playSound(url, {});
        })
        loader.loadAssets(moreAssets, function() {
            log("Loaded More");
        })
    })
})
