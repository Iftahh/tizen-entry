
$(function() {
    window.dijkMap = new DijkstraMap();

//    var spiderAtlas = new Atlas();
//    $.get('/atlas/spider.json', function(atlasJSON) {
//        spiderAtlas.parseAtlasDefinition(atlasJSON);
//    })
    var redSpiderAtlas = new Atlas();
    $.get('/atlas/red_spider.json', function(atlasJSON) {
        redSpiderAtlas.parseAtlasDefinition(atlasJSON);
    })
//    var wormAtlas = new Atlas();
//    $.get('/atlas/worm.json', function(atlasJSON) {
//        wormAtlas.parseAtlasDefinition(atlasJSON);
//    })

    var spiderAnimations = {
        'attack_': 9,
        'lNuft_':9,  // walk
        'stirbt':9, // die -  no dir!
    }

    var redSpiderAnimations = {
        'attack_': 9,
        'walking_':8,
        'been_hit_':9,
        'spit_':9,
        'tipping_over_':9
    }

    var wormAnimations = {

    }

    window.createRedSpider = function(x,y) {
        console.log("Creating spider at "+x+", "+y);
        var spider = new Monster(x,y, redSpiderAtlas, redSpiderAnimations)
        spider.currentDir = DIRS.SOUTH;
        spider.currentAnimation = "walking_";
        return spider;
    }


    var stanAtlas = new Atlas();

    $.get('/atlas/stan.json', function(atlasJSON) {
        stanAtlas.parseAtlasDefinition(atlasJSON);
    })


    var actionsToDir = {
        1: DIRS.EAST,
        2: DIRS.SOUTH,
        3: DIRS.SOUTH_EAST,
        4: DIRS.WEST,
        6: DIRS.SOUTH_WEST,
        7: DIRS.SOUTH,
        8: DIRS.NORTH,
        9: DIRS.NORTH_EAST,
        11: DIRS.EAST,
        12: DIRS.NORTH_WEST,
        14: DIRS.WEST
    }




    Character = IsoSprite.extend({

        isCasting: false,
        lastCastSwitch: 0,
        miniGame: null,

        life: 20,

        init: function(x,y, miniGame) {
            this.DIE = 'kippt_um_';
            this.WALK = 'lNuft_';
            this.HIT = 'noarmstan_treffer_';
            this.RUN = 'rennt_';
            this.CAST = 'stan_spricht_';

            var animations = {};
            animations[this.DIE] = 9;
            animations[this.WALK] = 9;
            animations[this.HIT] = 7;
            animations[this.RUN] = 9;
            animations[this.CAST] = 7;

            this.speed = 0.8;
            this.runSpeed = 1.6;

            this.tileX = -1;
            this.tileY = -1;

            this.miniGame = miniGame;

            IsoSprite.prototype.init.call(this, x,y, stanAtlas, animations);
            IsoSprite.prototype.setAnimation.call(this, this.WALK);
            this.lastDie = false;
            this.currentDir = DIRS.EAST;
            this.player.frameDelay = 100;
        },

        update: function(progress, dt) {  // total progress and delta progress
            var that = this;
            if (this.die) {
                this.player.start(progress);
                this.setAnimation(this.DIE);
                this.player.addFinishCB(function() {
                    that.hit = that.die = false;
                });
                this.lastDie = true;
            }
            else if (this.hit) {
                this.player.start(progress);
                this.setAnimation(this.HIT);
                this.player.addFinishCB(function() {
                    that.hit = that.die = false;
                });
            }
            else if (inputEngine.actions['cast'] && progress > this.lastCastSwitch+250) {
                this.isCasting = !this.isCasting;
                if (this.isCasting) {
                    this.miniGame.startNextQuestion(progress);
                }
                this.setAnimation(this.DIE);
                this.player.currentFrame = this.lastDie? 7 : 0;
                this.player.stop()
                this.lastCastSwitch = progress;
            }
            else {
                if (this.isCasting) {
                    this.miniGame.update(progress, dt)
                    if (this.miniGame.state == this.miniGame.SHOW_ANSWER && this.miniGame.lastStateChange == progress) {
                        // changed just now to answer
                        if (this.miniGame.isCorrect()) {
                            this.player.start(progress);
                            this.setAnimation(this.CAST); // TODO check if in bonus
                            this.life += 10;
                            this.player.addFinishCB(function() {
                                that.player.currentFrame = that.lastDie? 7 : 0;
                                that.player.stop()
                            })
                        }
                    }
                }
                else {
                    var dirCode = 0;
                    var dx = 0;
                    var dy = 0;
                    if (inputEngine.actions['move-up']) {
                        dirCode = 8;
                        dy--;
                    }
                    if (inputEngine.actions['move-left']) {
                        dirCode += 4;
                        dx -= 2;
                    }
                    if (inputEngine.actions['move-down']) {
                        dirCode += 2;
                        dy++;
                    }
                    if (inputEngine.actions['move-right']) {
                        dirCode++;
                        dx += 2;
                    }
                    var dir = actionsToDir[dirCode];
                    if (dir !== undefined) {
                        this.currentDir = dir;
                    }
                    if (dirCode == 0) {
                        this.setAnimation(this.DIE);
                        this.player.currentFrame = this.lastDie? 7 : 0;
                        this.player.stop()
                    }
                    else {
                        this.player.start(progress);
                        this.lastDie = false;
                        var newX = this.x;
                        var newY = this.y;
                        // speed times time-delta is the distance
                        var dtn = dt/30; // normalize - expected ~30ms between updates
                        dx *= dtn;
                        dy *= dtn;
                        if (inputEngine.actions['run']) {
                            this.setAnimation(this.RUN);
                            newX += dx*this.runSpeed;
                            newY += dy*this.runSpeed;
                        }
                        else {
                            this.setAnimation(this.WALK);
                            newX += dx*this.speed;
                            newY += dy*this.speed;
                        }
                        var txy = isoGeom.calcTileByPixel(newX, newY);
                        if (this.tileX != txy[0] || this.tileY != txy[1]) {
                            var map = cellGen._map;
                            if (map[txy[1]] && map[txy[1]][txy[0]] == 0) { // ground
                                var spritesHash = tiling.sprites[1]; // TODO
                                var spritesInCell = spritesHash[txy[1]] && spritesHash[txy[1]][txy[0]];
                                var blocking = false;
                                if (spritesInCell) {
                                    for (var i=0; i<spritesInCell.length; i++) {
                                        if (spritesInCell[i].blocking) {
                                            blocking = true;
                                            break;
                                        }
                                    }
                                }
                                if (!blocking) { // no blocking sprites in that tile
                                    this.x = newX;
                                    this.y = newY;
                                    exploreArroundCharacter(12);
                                    this.tileX = txy[0];
                                    this.tileY = txy[1];
                                }
                            }
                        }
                        else {
                            this.x = newX;
                            this.y = newY;
                        }
                    }
                }
            }
            IsoSprite.prototype.update.call(this, progress, dt)
        },

        render: function( ctx) {
            IsoSprite.prototype.render.call(this, ctx);
            if (this.isCasting) {
                this.miniGame.render(ctx, this.x, this.y);
            }
        }
    })

Monster = IsoSprite.extend({
    radiusFind: 10,
    tileX: -1,
    tileY: -1,

    nextTargetX: -1,
    nextTargetY: -1,
    nextTargetTileX: -1,
    nextTargetTileY: -1,
    dx: 0,
    dy: 0,
    absDx: 0,
    absDy: 0,

    blocking: true,
    lastAttack: 0,
    attackDelay: 3000,

    init: function(x,y, atlas, anim) {
        IsoSprite.prototype.init.call(this,x,y, atlas, anim);
        var txy = isoGeom.calcTileByPixel(this.x, this.y);
        this.tileX = txy[0];
        this.tileY = txy[1];
    },

    update: function(progress, dt) {

        if (this.nextTargetX != -1) {
            // moving to target location
            this.x += this.dx;
            this.y += this.dy;
            // check if reached target
            if (Math.abs(this.nextTargetX - this.x) < this.absDx+0.1  &&
                Math.abs(this.nextTargetY - this.y) < this.absDy+0.1 ) {
                this.x = this.nextTargetX;
                this.y = this.nextTargetY;
                this.tileX = this.nextTargetTileX;
                this.tileY = this.nextTargetTileY;
                this.nextTargetX = -1;
            }
        }

        if (this.nextTargetX == -1) {
            // reached target
            var score = dijkMap._get(this.tileX, this.tileY);
            if (score < 2) {
                // attack player
                //console.log("attack")
                var result = dijkMap.smallestNeighbor(this.tileX, this.tileY)
                this.currentDir = result.direction;
                this.setAnimation("attack_");
                if (progress > this.lastAttack + this.attackDelay) {
                    this.lastAttack = progress;
                    this.player.start(progress);
                    var that = this;
                    this.player.addFinishCB(function() {
                        if (that.currentAnimation != "attack_") {
                            return;
                        }
                        character.currentDir = REVERSE_DIRS[that.currentDir];
                        character.life -= 5;
                        if (character.life <= 0) {
                            character.die = true;
                        }
                        else {
                            character.hit = true;
                        }
                        that.player.stop();
                    });
                }
            }
            else if (score <= this.radiusFind ) {
                // walk towards player
                //console.log("walk")
                var result = dijkMap.smallestNeighbor(this.tileX, this.tileY)
                var mt = result.moveTo;
                var spritesHash = tiling.sprites[1]; // TODO
                var spritesInCell = spritesHash[mt[1]] && spritesHash[mt[1]][mt[0]];
                var blocking = false;
                if (spritesInCell) {
                    for (var i=0; i<spritesInCell.length; i++) {
                        if (spritesInCell[i].blocking) {
                            blocking = true;
                            break;
                        }
                    }
                }
                if (!blocking) {
                    var dx = 0;
                    var dy = 0;
                    switch(result.direction) {
                        case DIRS.EAST: dx += 2; break;
                        case DIRS.WEST: dx -= 2; break;
                        case DIRS.NORTH: dy--; break;
                        case DIRS.SOUTH: dy++; break
                        case DIRS.NORTH_EAST: dx += 1.4142135623731; dy -= 0.70710678118655; break;
                        case DIRS.NORTH_WEST: dx -= 1.4142135623731; dy -= 0.70710678118655; break;
                        case DIRS.SOUTH_EAST: dx += 1.4142135623731; dy += 0.70710678118655; break;
                        case DIRS.SOUTH_WEST: dx -= 1.4142135623731; dy += 0.70710678118655; break;
                    }
                    var speed = 0.9 * dt/30;
                    this.dx = speed*dx;
                    this.dy = speed*dy;
                    this.absDx = Math.abs(this.dx);
                    this.absDy = Math.abs(this.dy);
                    this.x += this.dx;
                    this.y += this.dy;
                    this.nextTargetX = isoGeom.getMidX(mt[0], mt[1]);
                    this.nextTargetY = isoGeom.getMidY(mt[1]);
                    this.nextTargetTileX = mt[0];
                    this.nextTargetTileY = mt[1];
                }
                this.currentDir = result.direction;
                this.player.start(progress);
                this.setAnimation("walking_");
            }
            else {
                // walk randomally
                //console.log("wander")
                this.player.stop();
                this.setAnimation("walking_");
            }
        }
        IsoSprite.prototype.update.call(this, progress, dt)
    }
})


    /**
     * @param {object} data key=whatever, value=weight (relative probability)
     * @returns {string} whatever
     */
    getWeightedValue=  function(data) {
        var total = 0;

        for (var id in data) {
            total += data[id];
        }
        var _random = Math.floor(RNG.getUniform()*total);

        var part = 0;
        for (var id in data) {
            part += data[id];
            if (_random < part) { return id; }
        }

        return null;
    }


    var exploreArroundCharacter = function(maxDist) {
        dijkMap._explorationData = window.obstacleMap.slice();
        var txy = isoGeom.calcTileByPixel(character.x,character.y);
        var x = txy[0];
        var y = txy[1];

        // can't use that - because dijkstra is used for hearing the player
        // need to use a separate A* map from monsters to player where they would block
//        for (var i=0; i<window.sprites.length; i++) {
//            var sprite = window.sprites[i];
//            if (sprite.blocking) {
//                dijkMap._set(sprite.tileX, sprite.tileY, dijkMap.NOT_ALLOWED);
//            }
//        }

        var iterations = 0;
        do {
            var explored = dijkMap.explore(x.floor(), y.floor(), maxDist);
            iterations++;
            x += RNG.getUniform()*2 - 1;
            y += RNG.getUniform()*2 - 1;
        }
        while (!explored && iterations < 500);
        return explored;
    }

    window.loadedTileMap = function(contentWidth, contentHeight) {
        window.character.x = contentWidth /2;
        window.character.y = contentHeight/2;


        if (!dijkMap._explorationData ||  dijkMap._explorationData.length == 0) {
            dijkMap.generateExploration(cellGen._map);
            window.obstacleMap = dijkMap._explorationData.slice();
        }

        var explored = exploreArroundCharacter();
        console.log("explored "+explored)

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
        var numOfRedSpiders = 4;
        var numOfWorms = 7;
    //    var numOfBats = 4;

        for (var i=0; i<numOfRedSpiders; i++) {
            var xy = getWeightedValue(randChance).split(",");
            var x = parseInt(xy[0]);
            var y = parseInt(xy[1]);
            var spider = createRedSpider(isoGeom.getMidX(x,y), isoGeom.getMidY(y));
            window.sprites.push(spider)
        }
//        var txy = isoGeom.calcTileByPixel(character.x,character.y);
//        var x = txy[0]+3;
//        var y = txy[1]+6;
//
//        window.sprites.push(createRedSpider(isoGeom.getMidX(x,y), isoGeom.getMidY(y)));
    }
})
