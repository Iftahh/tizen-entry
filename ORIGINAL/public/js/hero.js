

HeroClass = IsoSprite.extend({

    casting: 0,
    lastCastSwitch: 0,
    lastCycleLevel: 0,
    lastTargetCycle: 0,

    availableLevels: 3,
    attackLevel: 1,
    shieldLevel: 1,
    miniGame: null,
    monstersInRange: [],
    fireRadius: {
        x: 320,
        xs: 320*320,
        y: 160,
        ys: 160*160
    },

    renderAttackRange: 0,
    SPELL_ATTACK: 1,
    SPELL_SHIELD: 2,

    message: "",

    life: 20,
    maxLife: 50,

    score: 0,

    DIE:  'kippt_um_',
    WALK: 'lNuft_',
    HIT:  'noarmstan_treffer_',
    RUN:  'rennt_',
    CAST: 'stan_spricht_',

    actionsToDir: {  // convert bit-field of actions to direction
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
    },

    particleEmitters: null, // of  emitter, alive and active acounters


    init: function(x,y, atlas, animations, miniGame) {
        this.speed = 1.1;
        this.runSpeed = 2.2;
        this.particleEmitters = new MinArray();

        this.tileX = -1;
        this.tileY = -1;

        this.miniGame = miniGame;

        IsoSprite.prototype.init.call(this, x,y, atlas, animations, 10);
        IsoSprite.prototype.setAnimation.call(this, this.WALK);
        this.lastDie = false;
        this.currentDir = DIRS.EAST;
        this.player.frameDelay = 100;

        
    },

    takeDamage: function(howMuch, fromDir) {
        this.life -= howMuch;
        this.currentDir = REVERSE_DIRS[fromDir];
        if (this.life <= 0) {
            this.life = 0;
            if (!this.die) {
                gameEngine.soundManager.playSound("/sounds/deathh.ogg");
            }
            this.die = true;
        }
        else {
            this.hit = true;
        }
    },

    heal: function(level, bonus) {
        var activeCounter = (bonus ? 5 : 0) + 20+level*5 ;
        var liveCounter = (bonus ? 5 : 0) + 40+level*8 ;
        var particles = new ParticlePointEmitter((bonus ? 5 : 0)+10*level, {
            gravity: false,
            position: [this.screenX(), this.screenY()-20],
            forcePoints: [[-0.01, [this.screenX(), this.screenY()-20]]],
            positionRandom: [50+5*level,50+5*level],
            size: (bonus ? 1 : 0)+8+2*level,
            sizeRandom: 2+level,
            speed: 0.1,
            speedRandom: 0.05,
            startColor: [ 140+5*level, 168+5*level, 230+5*level, 0.9 ],
            finishColor: [ 10, 45, 235, 0 ],
            lifeSpan: 1,
            lifeSpanRandom: 0.2
        }
        );
        this.particleEmitters.insert({ particles:particles,  active:activeCounter, alive: liveCounter})
        
        gameEngine.soundManager.playSound("/sounds/spell1_0.ogg");
        this.life += 10*(level-1)+RNG.getMinMax(5,10);
        if (bonus) {
            this.life += 2*level;
            if (this.maxLife < 50*level) {
                this.maxLife++;
            }
        }
        if (this.life > this.maxLife) {
            this.life = this.maxLife;
        }
    },

    attack: function(monster, level, bonus) {
        gameEngine.soundManager.playSound("/sounds/foom_0.ogg");
        var dam = 5*level+RNG.getMinMax(1,7);
        if (bonus) {
            dam += 2*level;
        }
        var activeCounter = (bonus ? 5 : 0) + 20+level*5 ;
        var liveCounter = (bonus ? 5 : 0) + 40+level*8 ;
        var particles = new ParticlePointEmitter((bonus ? 10 : 5)+5*level, {
                gravity: false,
                position: [this.screenX(), this.screenY()-20],
                forcePoints: [ [0.01, [this.screenX(), this.screenY()-20]],
                               [-0.01, [monster.screenX(), monster.screenY()-15]]
                ],
                positionRandom: [15,15],
                size: (bonus ? 1 : 0)+8+2*level,
                sizeRandom: 2+level,
                speed: 0.3,
                speedRandom: 0.05,
                startColor: [ 220+5*level, 168+5*level, 130+5*level, 0.9 ],
                finishColor: [ 235, 45, 10, 0 ],
                lifeSpan: 1.1,
                lifeSpanRandom: 0.3
            }
        );
        this.particleEmitters.insert({ particles:particles,  active:activeCounter, alive: liveCounter})

        monster.takeDamage(dam);
    },

    update: function(progress, dt) {  // total progress and delta progress
        var that = this;
        this.particleEmitters.iterate(function(pe, id) {
            if (pe.active-- == 0) {
                pe.particles.active = false;
            }
            if (pe.alive-- == 0) {
                that.particleEmitters.remove(id);
            }
            else {
                pe.particles.update(dt);
            }
        });
        var fallback = null;
        var inputEngine = window.gameEngine.inputEngine;
        if (this.die) {
            if (!this.lastDie) {
                this.player.start(progress);
            }
            this.setAnimation(this.DIE);
            this.player.replaceFinishCB(function() {
                that.player.currentFrame = 7;
                that.player.stop();
            });
            this.lastDie = true;
            fallback = false;
        }
        else if (this.hit && this.currentAnimation != this.HIT) {
            this.player.start(progress);
            this.setAnimation(this.HIT);
            this.player.addFinishCB(function() {
                that.hit = false;
            });
        }

        if (inputEngine.actions['cast-stop'] && this.casting) {
            this.casting = 0;
            this.setAnimation(this.DIE);
            this.player.currentFrame = this.lastDie? 7 : 0;
            this.player.stop()
            this.lastCastSwitch = progress;
        }
        else if (this.monstersInRange.length && inputEngine.actions['cycle-target'] && progress > this.lastTargetCycle+150) {
            var m = this.monstersInRange.shift();
            this.monstersInRange.push(m);
            this.lastTargetCycle = progress;
        }
        else if (inputEngine.actions['cast-attack'] && progress > this.lastCastSwitch+150) {
            if (this.casting == this.SPELL_ATTACK) {
                this.casting = 0;
            }
            else {
                if (this.monstersInRange.length) {
                    this.casting = this.SPELL_ATTACK;
                    this.miniGame.setLevel(this.attackLevel, progress);
                    this.setAnimation(this.DIE);
                    this.player.currentFrame = this.lastDie? 7 : 0;
                    this.player.stop();
                    this.lastCastSwitch = progress;
                }
                else {
                    this.renderAttackRange = 5;
                    if (fallback == null)
                        fallback = true;
                }
            }
        }
        else if (inputEngine.actions['cast-shield'] && progress > this.lastCastSwitch+150) {
            if (this.casting == this.SPELL_SHIELD) {
                this.casting = 0;
            }
            else {
                this.casting = this.SPELL_SHIELD;
                this.miniGame.setLevel(this.shieldLevel, progress);
            }
            this.setAnimation(this.DIE);
            this.player.currentFrame = this.lastDie? 7 : 0;
            this.player.stop()
            this.lastCastSwitch = progress;
        }
        else {
            if (fallback == null)
                fallback = true;
        }

        if ((inputEngine.actions['cycle-attack-up'] || inputEngine.actions['cycle-attack-down']) && progress > this.lastCycleLevel+150) {
            this.lastCycleLevel = progress;
            var addition = 1;
            if (inputEngine.actions['cycle-attack-down']) {
                addition = -1;
            }
            this.attackLevel = 1+ (this.attackLevel-1+addition).mod(this.availableLevels);
            if (this.casting == this.SPELL_ATTACK) {
                this.miniGame.setLevel(this.attackLevel, progress);
            }
        }
        if ((inputEngine.actions['cycle-shield-up'] || inputEngine.actions['cycle-shield-down']) && progress > this.lastCycleLevel+150) {
            this.lastCycleLevel = progress;
            var addition = 1;
            if (inputEngine.actions['cycle-shield-down']) {
                addition = -1;
            }
            this.shieldLevel = 1+ ((this.shieldLevel-1+addition).mod(this.availableLevels));
            if (this.casting == this.SPELL_SHIELD) {
                this.miniGame.setLevel(this.shieldLevel, progress);
            }
        }

        if (fallback) {
            if (this.casting) {
                this.miniGame.update(progress, dt)
                if (this.miniGame.state == this.miniGame.SHOW_ANSWER && this.miniGame.lastStateChange == progress) {
                    // changed just now to answer
                    if (this.miniGame.isCorrect()) {
                        if (!this.hit) {
                            this.player.start(progress);
                            this.setAnimation(this.CAST); // TODO check if in bonus
                        }
                        if (this.casting == this.SPELL_SHIELD) {
                            this.heal(this.miniGame.getLevel(), this.miniGame.isBonus());
                        }
                        else if (this.casting == this.SPELL_ATTACK) {
                            var monster = this.monstersInRange[0];
                            if (monster) {
                                this.attack(monster, this.miniGame.getLevel(), this.miniGame.isBonus());
                            }
                            if (this.monstersInRange.length == 0) {
                                // killed last one in range - stop the attack casting
                                this.casting = 0;
                            }
                        }
                        this.player.addFinishCB(function() {
                            if (that.currentAnimation == that.CAST) {
                                that.player.currentFrame = that.lastDie? 7 : 0;
                                that.player.stop();
                            }
                        });
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
                var dir = this.actionsToDir[dirCode];
                if (dir !== undefined) {
                    this.currentDir = dir;
                }
                if (dirCode == 0) {
                    if (!this.hit) {
                        this.setAnimation(this.DIE);
                        this.player.currentFrame = this.lastDie? 7 : 0;
                        this.player.stop()
                    }
                }
                else {
                    this.player.start(progress);
                    this.lastDie = false;
                    var newX = this.x;
                    var newY = this.y;
                    // speed times time-delta is the distance
//                        var dtn = dt/30; // normalize - expected ~30ms between updates
//                        dx *= dtn;
//                        dy *= dtn; // not normalizing - this is problematic for collision checks
                    if (inputEngine.actions['walk']) {
                        this.setAnimation(this.WALK);
                        newX += dx*this.speed;
                        newY += dy*this.speed;
                    }
                    else {
                        this.setAnimation(this.RUN);
                        newX += dx*this.runSpeed;
                        newY += dy*this.runSpeed;

                    }
                    var txy = isoGeom.calcTileByPixel(newX, newY);
                    if (this.tileX != txy[0] || this.tileY != txy[1]) {
                        var map = gameEngine.generatedMap;
                        if (map[txy[1]] && map[txy[1]][txy[0]] == 0) { // ground
                            var spritesHash = gameEngine.tiling.sprites; // TODO
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
                                gameEngine.exploreArroundCharacter(gameEngine.lastMonster.radiusFind+1);
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

    isInRange: function(x,y) {
        var dx = x - this.x;
        var dy = y - this.y;
        var result =  (dx*dx/this.fireRadius.xs + dy*dy/this.fireRadius.ys) <= 1;
        return result;
    },

    removeFromRange: function(monster) {
        this.monstersInRange.erase(monster);
    },

    addToRange: function(monster) {
        this.monstersInRange.push(monster);
    },

    cacheHeading: null,
    cacheParams: {
        life: null,
        casting: null,
        level: null,
        score: null,
        message: null
    },

    render: function( ctx, layer) {
        if (layer == 1) {
            if (this.renderAttackRange) {
                this.renderAttackRange--;
                ctx.save();
                ctx.fillStyle = "rgba(250,50,50,0."+this.renderAttackRange+")";
                ctx.strokeStyle = "rgba(220,120,120,0.5)";

                ctx.translate(this.screenX(), this.screenY());
                ctx.scale(1, 0.5);
                ctx.beginPath();
                ctx.arc(0, 0, this.fireRadius.x, 0, 2*Math.PI);
                ctx.fill();
                ctx.stroke();
                ctx.restore();
            }
        }
        if (layer == 2) {
            IsoSprite.prototype.render.call(this, ctx, layer);
            if (this.die) {
                ctx.save()
                ctx.fillStyle = "#FFF";
                ctx.textAlign = "center";
                ctx.shadowColor = "#F00";
                ctx.font = "20px Arial";
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
                ctx.shadowBlur = 10;
                ctx.strokeStyle = '#855';
                ctx.fillText("You have died... better luck next time. \n Press [Refersh] to try again", this.screenX(), this.screenY()-100);
                ctx.restore();
            }
            else {
                if (this.life != this.cacheParams.life || this.casting != this.cacheParams.casting || this.score || this.cacheParams.score ||
                    this.miniGame.getLevel() != this.cacheParams.level || this.mesage != this.cacheParams.message) {
                    var that = this;
                    this.cacheParams.casting = this.casting;
                    this.cacheParams.life = this.life;
                    this.cacheParams.level = that.miniGame.getLevel();
                    this.cacheParams.message = that.message;
                    this.cacheParams.score = that.score;
                    this.cacheHeading = renderToCanvas(gameEngine.clientWidth, 75, function(ctx2) {
                        ctx2.fillStyle = "#C44";
                        ctx2.strokeStyle = "#511";
                        ctx2.globalAlpha = 0.7;
                        ctx2.lineWidth = 2;
                        ctx2.strokeRect(10,10,202,22);
                        ctx2.fillRect(11,11, (that.life*200/that.maxLife), 20);
                        ctx2.globalAlpha = 1;
                        ctx2.fillStyle = "#FFF";
                        ctx2.font = "14px Arial";
                        ctx2.strokeStyle = '#222';
                        ctx2.textAlign = "right";
                        ctx2.fillText("Score: "+that.score, gameEngine.clientWidth-20, 26);
                        ctx2.textAlign = "center";
                        ctx2.fillText(that.life+" / "+that.maxLife, 111, 26);


                        if (that.casting) {
                            ctx2.shadowColor = "#00F";
                            ctx2.shadowOffsetX = 0;
                            ctx2.shadowOffsetY = 0;
                            ctx2.font = "16px Arial";
                            ctx2.shadowBlur = 5;
                            ctx2.strokeStyle = '#558';
                            ctx2.fillText(that.miniGame.instruction, that.screenX(), 26);
                            ctx2.fillText("Level: "+that.miniGame.getLevel(), that.screenX(), 50);;
                        }
                        else if (that.message) {
                            ctx2.shadowColor = "#FF0";
                            ctx2.shadowOffsetX = 0;
                            ctx2.shadowOffsetY = 0;
                            ctx2.font = "16px Arial";
                            ctx2.shadowBlur = 4;
                            ctx2.strokeStyle = '#222';
                            ctx2.fillText(that.message, that.screenX(), 26);
                        }
                    })
                }
                ctx.drawImage(this.cacheHeading, 0,0);

                if (this.casting) {
                    ctx.save();
                    ctx.shadowBlur = 20;
                    if (this.casting == this.SPELL_SHIELD) {
                        ctx.shadowColor = "#55F";
                    }
                    else if (this.casting == this.SPELL_ATTACK) {
                        ctx.shadowColor = "#F55";
                    }
                    this.miniGame.render(ctx, this.x, this.y);
                    ctx.restore();
                }
                this.particleEmitters.iterate(function(pe) {
                    pe.particles.renderParticles(ctx);
                });

            }
        }

    }
});
