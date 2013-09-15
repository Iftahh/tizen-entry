
$(function() {

    var workerProgress = 0;
    var loaderProgress = 0;

    var showProgress = function() {
        var p = loaderProgress * 35 + workerProgress * 65;
        $('#progress').width((5*p).floor());
        $('#progress-text').text((p).floor()+"% Loaded");

        if (p == 100) {
            $('#loading').hide();
            $('#bottom-bar').css({"margin-top":"20px"})
            $('.start-button').show();
        }
    };

    var percentLoaded = function(p) {
        loaderProgress = p / 100;
        showProgress();
    };




    (function() {
        var lastTime = 0;
        var vendors = ['ms', 'moz', 'webkit', 'o'];
        for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
            window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
                || window[vendors[x]+'CancelRequestAnimationFrame'];
        }

        if (!window.requestAnimationFrame)
            window.requestAnimationFrame = function(callback, element) {
                var currTime = Date.now();
                var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                var id = window.setTimeout(function() { callback(currTime + timeToCall); },
                    timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };

        if (!window.cancelAnimationFrame)
            window.cancelAnimationFrame = function(id) {
                clearTimeout(id);
            };
    }());



    var container = document.getElementById("container");
    var content = document.getElementById('content');
    var context = content.getContext('2d');
    var generatedMap = null;
    var loader = new AssetLoader();
    window.parEmt = null;
    window.gameEngine = null;

    $('.start-button').click(function() {
        $('#backstory').remove();
        if (parEmt)
            parEmt.active = false;
        var count = 0;

        // TODO: find way to mix songs without stopping all sounds in between

        var sections = [25, 30, 55 ];  // 0-s[0]: fade out sounds, s[0]-s[1] silence,  s[1]-s[2] fade in new song, s[2] - start
        // for dev
        //var sections = [5, 10, 15 ];
        var intervalId = setInterval(function() {
            count++;
            if (count < sections[0]) {
                // decrease volume linearly in section 1
                loader.soundManager.setVolume((sections[0]-count)/sections[0]);
            }
            if (count == sections[0]) {
                loader.soundManager.stopAll();
            }
            if (count == sections[1]) {
                loader.soundManager.playSound("/music/cave_themeb4.ogg", {volume: 0.4, looping: true});
            }
            if (count > sections[1]) {
                loader.soundManager.setVolume((count-sections[1])/(sections[2]-sections[1]));
            }
            if (count >= sections[2]) {
                clearInterval(intervalId);
                loader.soundManager.setVolume(1);
                window.cancelAnimationFrame(window.animFrameId);
                parEmt = null; // clear memory
                window.gameEngine = new GameEngine(context, container, generatedMap, loader, loader.soundManager);
                gameEngine.start();
            }
        }, 10);
        return false;
    })

    var reflow = function() {
        var clientWidth = container.clientWidth;
        var clientHeight = container.clientHeight;
        content.width = clientWidth;
        content.height = clientHeight;
        gameEngine.setDimensions(clientWidth, clientHeight);
    };

    window.addEventListener("resize", reflow, false);
    reflow();

    percentLoaded(1);

    var assets= [
        ["/js/algorithms/MinArray.js", "/js/core/SoundManager.js" ],
        ["/music/TheLoomingBattle_0.ogg", "/js/core/particle.js"],
        ["/js/isometric/Topology.js","/js/algorithms/BinaryHeap.js","/js/core/Sprite.js"],
        ["/js/algorithms/DijkstraMap.js", "/js/core/components/Animation.js",
            "/sounds/foom_0.ogg", "/js/isometric/FlatLayer.js", "/sounds/deathh.ogg",
            "/js/core/Atlas.js", "/js/hero.js", "/sounds/monster-17.ogg",
            "/js/core/InputEngine.js", "/js/isometric/IsometricGenerator.js",
            "/sounds/Monster-2.ogg", "/js/isometric/IsometricGeometry.js",
            "/sounds/spell1_0.ogg", "/js/isometric/IsometricMap.js",
            "/js/minigames/math/which_smaller.js", "/js/game_monsters.js",
            "/atlas/red_spider.json", "/atlas/stan.json",
            "/imgs/red_spider.png", "/imgs/stan.png", "/imgs/tiled_cave_1_mod2.png",
            "/js/core/GameEngine.js",
            "/music/cave_themeb4.ogg"
        ]
    ];



    var worker = new Worker('/js/generateMap.js');
    worker.addEventListener('message', function(e) {
        if (e.data.substr(0, 12) == "PROGRESS::: ") {
            workerProgress = parseFloat(e.data.substr(12));
            showProgress();
//            console.log("Worker progress: "+workerProgress);
        }
        else if (e.data.substr(0,8) == "DONE::: ") {
            workerProgress = 1.0;
            generatedMap = JSON.parse(e.data.substr(8));
            showProgress();
        }
        else {
            console.log('Worker said: ', e.data);
        }
    }, false);

    worker.postMessage({
        seed: Date.now(),//123,
        width: 100,
        height: 80,
        minPercentDug: 33,
        manPercentDug: 34,
        iterations: 3
    });

    loader.loadAssets(assets[0], function() {
        percentLoaded(5);
        loader.soundManager = new SoundManager();
        loader.loadAssets(assets[1], function() {
            percentLoaded(10);
            loader.soundManager.playSound("/music/TheLoomingBattle_0.ogg", {volume: 0.4, looping: true});


            window.parEmt = new ParticlePointEmitter(400, {
                position: Vector.create(container.clientWidth/2, container.clientHeight/2),
                gravity: Vector.create(0,0.15),
                positionRandom: Vector.create(40,40),
                size: 60,
                sizeRandom: 20,
                speed: 10,
                speedRandom: 2.8,
                lifeSpan: 12,
                lifeSpanRandom: 4,
                angle: -90,
                angleRandom: 140
            });
            var start = window.mozAnimationStartTime  || 0;
            var lastProgress = start;
            context.globalCompositeOperation = "lighter";
            function step(timestamp) {
                var progress = timestamp - start;
                var dt = progress - lastProgress;
                lastProgress = progress;

                context.fillRect(0,0, container.clientWidth, container.clientHeight);
                parEmt.update(dt);
                //context.save();
                //context.globalCompositeOperation = "lighter";
                parEmt.renderParticles(context);
                //context.restore();
                window.animFrameId = requestAnimationFrame(step);
            }
            window.animFrameId = requestAnimationFrame(step);

            loader.loadAssets(assets[2], function() {
                percentLoaded(15);
                // start worker to generate map


                loader.loadAssets(assets[3], function() {
                    percentLoaded(100);
                },
                function(batch, uri) {
                    percentLoaded(15+((batch.count / batch.total) * 83).round());
                })
            })

        })
    });
});
