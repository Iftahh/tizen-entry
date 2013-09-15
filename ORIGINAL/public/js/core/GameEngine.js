

GameEngine = Class.extend({
    context: null,
    generatedMap: null,
    loader: null,
    soundManager: null,
    isoGeom: null,
    inputEngine: null,
    hero: null,
    miniGame: null,
    dijkMap: null,  // dijkstra map around the hero
    tiling:null,
    factory: null,
    obstacleMap: null,
    lastProgress: 0,
    startTimestamp: -1,
    boundStep: null,

    addMonsterEvery: 45000, // 45 seconds
    lastAddedMonster: 0,

    sprites: [],

    init: function(context, container, generatedMap, loader, soundManager) {
        this.context = context;
        this.generatedMap = generatedMap;
        this.loader = loader;
        this.soundManager = soundManager;

        this.miniGame = new WhichSmallerSprite(1);
        this.dijkMap = new DijkstraMap();
        this.tiling = new IsometricMap();
        this.inputEngine = new InputEngine();
        this.inputEngine.setup(container);
        this.factory = new SpritesFactory(this.loader);
        this.hero = this.factory.createHero( 1730, 1250, this.miniGame);
        this.sprites.push(this.hero);

        var generator = new IsometricGenerator();
        var isoMap = generator.generateIsoMapFromIsoArray(this.generatedMap);
        var numOfRows = isoMap[3];
        var numOfCols = isoMap[2];
        var mapJSON = generator.generateJSON(isoMap, numOfRows, numOfCols );
        var tiling = this.tiling;
        tiling.loadJSON(mapJSON, this.loader);
        this.isoGeom = new IsometricGeometry(tiling.tileSize.x, tiling.tileSize.y);

        window.isoGeom = this.isoGeom;   // leaking globals, but easier than to refactor all code...

        this.contentWidth = tiling.pixelSize.x;
        this.contentHeight = tiling.pixelSize.y;
        this.loadedTileMap(contentWidth, contentHeight);
        this.setDimensions(this.clientWidth, this.clientHeight);
    },

    setDimensions: function(clientWidth, clientHeight) {
        this.clientWidth = clientWidth;
        this.clientHeight = clientHeight;
        // redraw?
        tiling.renderWidth = clientWidth;
        tiling.renderHeight = clientHeight;
    },


    start: function() {
        console.log("Game starting!");

        this.startTimestamp = performance.now();
        this.boundStep = this.step.bind(this);
        requestAnimationFrame(this.boundStep);
    },


    canMoveTo: function(x,y) {
        if (y === undefined) {
            y = x[1];
            x = x[0];
        }
        var dijkMap = this.dijkMap;
        if (  x < 0 || x >= dijkMap._numOfCols || y < 0 || y >= dijkMap._numOfRows) {
            return false;
        }
        return dijkMap._get(x,y) != dijkMap.NOT_ALLOWED;
        // TODO: check also blocking sprites
    },


    updateSpritesHash: function() {
        // TODO: move this to Tiling, have only one layer, and Get/Set
        var spriteHash = {}

        for (var i=0; i<this.sprites.length; i++) {
            var sprite = this.sprites[i];
            var txy = this.isoGeom.calcTileByPixel(sprite.x, sprite.y);
            if (!spriteHash[txy[1]]) {
                spriteHash[txy[1]] = {}
            }
            if (spriteHash[txy[1]][txy[0]]) {
                spriteHash[txy[1]][txy[0]].push(sprite)
            }
            else {
                spriteHash[txy[1]][txy[0]] = [sprite]
            }
        }

        this.tiling.sprites = spriteHash; // place sprites in tile layer 1 (above ground, potentially behind walls)
    },



    step: function(timestamp) {
        var progress = timestamp - this.startTimestamp;
        var dt = progress - this.lastProgress;
        this.lastProgress = progress;

        if (progress - this.lastAddedMonster > this.addMonsterEvery) {
            this.exploreArroundCharacter(); // make monster high chance appear far away
            this.addMonster();
            this.lastAddedMonster = progress;
        }

        for (var i=0; i<this.sprites.length; i++ ) {
            this.sprites[i].update(progress, dt);
        }
        this.updateSpritesHash();

        this.context.clearRect(0, 0, this.clientWidth, this.clientHeight);

//        scroller.setPosition(this.hero.x - clientWidth/2, this.hero.y - clientHeight/2);
        this.render(this.context, this.hero.x, this.hero.y);
        var _step = this.boundStep;
        requestAnimationFrame(_step);
    },

    render: function(context, centerX, centerY) {
        gameEngine.worldLeft = centerX - this.clientWidth /2;
        gameEngine.worldTop = centerY - this.clientHeight /2;
        this.tiling.render(context, centerX, centerY); // this also renders the sprites - because they have to be in between the isometric rendering
    },


    lastMonster: {
        life: 10,
        damageMin: 1,
        damageMax: 2,
        attackDelay: 3300,
        speedMove: 0.6,
        speedAttack: 1.0,
        radiusFind: 9,
        addLife:2
    },



    addMonster: function() {
        var randChance = {}
        var dijkMap = this.dijkMap;
        for (var _y=0; _y<dijkMap._numOfRows; _y++) {
            for (var _x=0; _x<dijkMap._numOfCols; _x++) {
                var score = dijkMap._get(_x,_y);
                if (score != dijkMap.NOT_ALLOWED && score != dijkMap.NOT_EXPLORED) {
                    randChance[_x+","+_y] = score*1.5;
                }
            }
        }

        var lastMonster = this.lastMonster;
        if (RNG.getUniform() < 0.4) {
            lastMonster.addLife++;
            if (RNG.getUniform() < 0.3) {
                lastMonster.addLife++;
            }
        }

        if (RNG.getUniform() < 0.5) {
            lastMonster.life += lastMonster.addLife;
        }
        if (RNG.getUniform() < 0.2) {
            lastMonster.damageMin++;
            lastMonster.damageMax++;
        }
        if (RNG.getUniform() < 0.2) {
            lastMonster.damageMax++;
        }
        if (RNG.getUniform() < 0.25) {
            if (lastMonster.attackDelay > 1200) {
                lastMonster.attackDelay -= 50;
            }
        }
        if (RNG.getUniform() < 0.3) {
            if (lastMonster.speedMove < 1.2) {
                lastMonster.speedMove += 0.05;
            }
        }
        if (RNG.getUniform() < 0.3) {
            if (lastMonster.speedAttack < 1.5) {
                lastMonster.speedAttack += 0.05;
            }
        }
        if (RNG.getUniform() < 0.1) {
            if (lastMonster.radiusFind < 30)
                lastMonster.radiusFind++;
        }

        var xy = RNG.getWeightedValue(randChance).split(",");
        var x = parseInt(xy[0]);
        var y = parseInt(xy[1]);
        var spider = this.factory.createRedSpider(this.isoGeom.getMidX(x,y), this.isoGeom.getMidY(y), lastMonster);
        this.soundManager.playSound("/sounds/Monster-2.ogg");
        this.sprites.push(spider)
    },


    exploreArroundCharacter: function(maxDist) {
        this.dijkMap._explorationData = this.obstacleMap.slice();
        var txy = this.isoGeom.calcTileByPixel(this.hero.x,this.hero.y);
        var x = txy[0];
        var y = txy[1];

        var iterations = 0;
        do {
            var explored = this.dijkMap.explore(x.floor(), y.floor(), maxDist);
            iterations++;
            x += RNG.getUniform()*2 - 1;
            y += RNG.getUniform()*2 - 1;
        }
        while (!explored && iterations < 500);
        return explored;
    },


    loadedTileMap: function(contentWidth, contentHeight) {
        this.hero.x = contentWidth /2;
        this.hero.y = contentHeight/2;

        var dijkMap = this.dijkMap;
        if (!dijkMap._explorationData ||  dijkMap._explorationData.length == 0) {
            dijkMap.generateExploration(this.generatedMap);
            this.obstacleMap = dijkMap._explorationData.slice();
        }

        this.exploreArroundCharacter();

        var randChance = {}
        for (var _y=0; _y<dijkMap._numOfRows; _y++) {
            for (var _x=0; _x<dijkMap._numOfCols; _x++) {
                var score = dijkMap._get(_x,_y);
                if (score != dijkMap.NOT_ALLOWED && score != dijkMap.NOT_EXPLORED) {
                    randChance[_x+","+_y] = score;
                }
            }
        }

        var numOfSpiders = 4;
        var numOfRedSpiders = 20;
        var numOfWorms = 7;
        //    var numOfBats = 4;

        for (var i=0; i<numOfRedSpiders; i++) {
            var xy = RNG.getWeightedValue(randChance).split(",");
            var x = parseInt(xy[0]);
            var y = parseInt(xy[1]);
            var spider = this.factory.createRedSpider(this.isoGeom.getMidX(x,y), this.isoGeom.getMidY(y),  this.lastMonster);
            this.sprites.push(spider)
        }

        this.updateSpritesHash();

    }

})
