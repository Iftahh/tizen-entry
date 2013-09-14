
// This isn't a useful factory for data-oriented programming - but this is ok since the game is procedual generated,
// TODO: refactor to be plugin style factory, allowing creation by name (string)
(function() {


    var MonsterClass = IsoSprite.extend({
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

        inHeroRange: false,

        randomWalk: {
            dir: 0,
            num: 3
        },

        DIE: "tipping_over_",
        HIT: "been_hit_",

        die: false,
        hit: false,
        lastAttack: 0,

        fullHealth: 10,
        blocking: true,     //  true if this monster blocks the player and or other monsters
        life: 10,         // number of health the monster has
        damageMin: 1,       // attack player does min-max damage
        damageMax: 3,
        speedAttack: 1.2,   // speed while chasing player
        speedMove: 0.8,     // speed while idle moving

        radiusFind: 10,     // find player if within 10 sq radius
        attackDelay: 3000,  // attack every 3 seconds

        init: function(x,y, atlas, anim) {
            IsoSprite.prototype.init.call(this,x,y, atlas, anim, 10);
            var txy = isoGeom.calcTileByPixel(this.x, this.y);
            this.tileX = txy[0];
            this.tileY = txy[1];
        },

        takeDamage: function(howMuch) {
            this.life -= howMuch;
//            this.currentDir = REVERSE_DIRS[fromDir];
            if (this.life <= 0) {
                this.life = 0;
                this.die = true;
                gameEngine.soundManager.playSound("/sounds/monster-17.ogg");
                gameEngine.hero.removeFromRange(this);
            }
            else {
                this.hit = true;
            }
        },

        _move: function(progress, dt, moveToTile, direction, speed) {
            var mt = moveToTile;
            var spritesHash = gameEngine.tiling.sprites; // TODO
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
                switch(direction) {
                    case DIRS.EAST: dx += 2; break;
                    case DIRS.WEST: dx -= 2; break;
                    case DIRS.NORTH: dy--; break;
                    case DIRS.SOUTH: dy++; break;
                    case DIRS.NORTH_EAST: dx += 1.4142135623731; dy -= 0.70710678118655; break;
                    case DIRS.NORTH_WEST: dx -= 1.4142135623731; dy -= 0.70710678118655; break;
                    case DIRS.SOUTH_EAST: dx += 1.4142135623731; dy += 0.70710678118655; break;
                    case DIRS.SOUTH_WEST: dx -= 1.4142135623731; dy += 0.70710678118655; break;
                }
                this.dx = speed*dx;
                this.dy = speed*dy;
                this.absDx = Math.abs(this.dx);
                this.absDy = Math.abs(this.dy);
                this.nextTargetX = isoGeom.getMidX(mt[0], mt[1]);
                this.nextTargetY = isoGeom.getMidY(mt[1]);
                this.nextTargetTileX = mt[0];
                this.nextTargetTileY = mt[1];
            }
            this.currentDir = direction;
            this.setAnimation("walking_");
            this.player.start(progress);
        },

        savedTargetX: null,
        lastDie: false,
        update: function(progress, dt) {
            var that = this;
            if (this.die) {
                if (!this.lastDie) {
                    this.player.start(progress);
                    gameEngine.hero.score += this.fullHealth;
                }
                this.setAnimation(this.DIE);
                this.nextTargetX = -2; // avoid trying to move
                this.player.addFinishCB( function() {
                    that.player.currentFrame = 8;
                    that.player.stop();
                    setTimeout(function() {
                        gameEngine.sprites.erase(that);
                    }, 5000);
                });
                this.lastDie = true;
            }
            else if (this.hit) {
                if (that.savedTargetX == null) {
                    this.player.start(progress);
                    this.setAnimation(this.HIT);
                    that.savedTargetX = that.nextTargetX;
                    this.nextTargetX = -2; // avoid trying to move
                    this.player.replaceFinishCB(function() {
                        that.hit = false;
                        that.nextTargetX = that.savedTargetX; // restore
                        that.savedTargetX = null;
                        that.player.stop();
                    });
                }
            }
            else if (this.nextTargetX != -1) {
                // moving to target location
                this.x += this.dx;
                this.y += this.dy; // not normalizing for dt - this is problematic for collision and target reaching checks

                var hero = gameEngine.hero;
                var inHeroRange = hero.isInRange(this.x,this.y);
                if (this.inHeroRange && !inHeroRange) {
                    hero.removeFromRange(this);
                    this.inHeroRange = inHeroRange;
                }
                else if (inHeroRange && !this.inHeroRange) {
                    hero.addToRange(this);
                    this.inHeroRange = inHeroRange;
                }
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
                var dijkMap = gameEngine.dijkMap;
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
                            gameEngine.hero.takeDamage(RNG.getMinMax(that.damageMin, that.damageMax), that.currentDir);

                            that.player.stop();
                        });
                    }
                }
                else if (score <= this.radiusFind ) {
                    // walk towards player
                    //console.log("walk")
                    var result = dijkMap.smallestNeighbor(this.tileX, this.tileY);
                    this._move(progress, dt, result.moveTo, result.direction, this.speedAttack);
                }
                else {
                    // walk randomally
                    if (this.randomWalk.num <= 0 || RNG.getUniform() < 0.2) {
                        //switch direction
                        this.randomWalk.dir = FLAT_DIRS.random();
                        this.randomWalk.num = RNG.getMinMax(2,6);
                    }
                    this.randomWalk.num--;
                    // attempt to move at dir
                    var xy = isoTopology.moveCoord(this.tileX, this.tileY, this.randomWalk.dir);
                    if (gameEngine.canMoveTo(xy[0],xy[1])) {
                        this._move(progress, dt, xy, this.randomWalk.dir, this.speedMove);
                    }
                }
            }
            IsoSprite.prototype.update.call(this, progress, dt)
        },


        render: function( ctx, layer) {
            if (layer == 1) {
                if (this == gameEngine.hero.monstersInRange[0]) {
                    ctx.save()
                    ctx.fillStyle = "rgba(150,150,25,0.4)";
                    ctx.strokeStyle = "rgba(200,200,100,0.6)";

                    ctx.translate(this.screenX(), this.screenY());
                    ctx.scale(1, 0.5);
                    ctx.beginPath();
                    ctx.arc(0, 0, 24, 0, 2*Math.PI);
                    ctx.fill();
                    ctx.stroke();
                    ctx.restore();
                }
            }
            if (layer == 2) {
                IsoSprite.prototype.render.call(this, ctx, layer);
                if (this.casting) {
                    this.miniGame.render(ctx, this.x, this.y);
                }
            }

        }
    });





    window.SpritesFactory = Class.extend({

        redSpiderAtlas: null,
        redSpiderAnimations: {
            'attack_': 9,
            'walking_':8,
            'been_hit_':9,
            'spit_':9,
            'tipping_over_':9
        },

        spiderAnimation: {
            'attack_': 9,
            'lNuft_':9,  // walk
            'stirbt':9 // die -  no dir!
        },


        heroAnimations: {
            'kippt_um_' : 9,
            'lNuft_': 9,
            'noarmstan_treffer_': 7,
            'rennt_': 9,
            'stan_spricht_': 7
        },
        heroAtlas: null,


        init: function(loader) {
            this.heroAtlas = new Atlas();
            this.redSpiderAtlas = new Atlas();
            this.redSpiderAtlas.parseAtlasDefinition(loader.get('/atlas/red_spider.json'));
            this.heroAtlas.parseAtlasDefinition(loader.get('/atlas/stan.json'));
        },


        createRedSpider: function(x,y, params) {
            var spider = new MonsterClass(x,y, this.redSpiderAtlas, this.redSpiderAnimations);
            spider.currentDir = DIRS.SOUTH;
            spider.currentAnimation = "walking_";
            for (var k in params) {
                spider[k] = params[k];
            }
            spider.fullHealth = spider.life; // initial life
            console.log("Create spider at tile "+spider.tileX+","+spider.tileY+" with params "+JSON.stringify(params));
            return spider;
        },

        createHero: function(x,y, minigame) {
            var hero = new HeroClass(x,y, this.heroAtlas, this.heroAnimations, minigame);
            hero.currentDir = DIRS.SOUTH;
            hero.currentAnimation = hero.WALK;
            return hero;
        }
    });



})();
