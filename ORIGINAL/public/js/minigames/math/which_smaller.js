


WhichSmaller = Class.extend({

    level: 2,   // 1-10 scale
    operations: ["+","-"],
    digits: [0,1,2,3,4,5,6,7,8,9],
    nonZero: [1,2,3,4,5,6,7,8,9],

    init: function(level) {
        this.level = level;
    },

    ndigit: function(d) {
        var res = this.nonZero.random();
        d--;
        var digits = this.digits;
        while (d > 0) {
            res = res*10;
            res += digits.random();
            d--;
        }
        return res;
    },

    calc: function(operator, d1, d2) {
        var s1,n1, s2,n2;
        if (typeof d1 == "number") {
            n1 = this.ndigit(d1);
            s1 = n1.toString();
        }
        else {
            s1 = d1[0];
            n1 = d1[1];
        }
        if (typeof d2 == "number") {
            n2 = this.ndigit(d2);
            s2 = n2.toString();
        }
        else {
            s2 = d2[0];
            n2 = d2[1];
        }
        if (operator == "+") {
            if (RNG.getUniform() < 0.5) {
                return [s1+ " + "+s2, n1+n2];
            }
            else {
                return [s2+ " + "+s1, n1+n2];
            }
        }
        else if (operator == "-") {
            return [s1+ " - "+s2, n1-n2];
        }
        else {
            console.log("Error operator "+operator+" not supported")
        }
    },

    gameTemplates: {
        1:  [
            60, ["+",1,1],   // 60% add one digit,
            40, ["-",1,1]    // 40% sub one digit
        ],
        2:  [
            40, ["+",2,1],  // 40%  add two digits to one digit
            30, ["-",2,1],
            30, ["+", 3,1]
        ],
        3: [
            30, ["+", 2,2],
            20, ["-", 2,2],
            20, ["+", ["+", 1,1], 1],
            15, ["+", ["-", 1,1], 1],
            15, ["-", 2, ["-", 1,1]]
        ],
        4: [
            20, ["+", 3,2],
            20, ["-", 3,2],
            20, ["+", ["+", 2,1], 1],
            20, ["+", ["-", 2,1], 1],
            20, ["-", ["+", 2,1], 1],
        ]
    },

    generateTemplate: function(template) {
        var n1 = template[1];
        var n2 = template[2];
        if (typeof n1 !== "number") {
            n1 = this.generateTemplate(n1);
        }
        if (typeof n2 !== "number") {
            n2 = this.generateTemplate(n2);
        }

        return this.calc(template[0], n1,n2);
    },

    numTemplate: 4,
    numOther: 3,

    generate: function() {
//        var n1 = RNG.getMinMax(1, 20);
//        var n2 = RNG.getMinMax(1, 20);
//        return [[""+n1,n1], [""+n2,n2]];
        var results = [];
        var level = this.level;
        var numTemplate = this.numTemplate;
        var numOther = this.numOther;

        // get random template for level
        var templates = this.gameTemplates[level];
        var p = RNG.getPercentage();
        for (var i=0; i<templates.length; i += 2) {
            var weight = templates[i];
            var template = templates[i+1];
            var num;
            if (p <= weight) {
                num = numTemplate;
            }
            else {
                p -= weight;
                num = numOther;
            }
            for (var j=0; j<num; j++) {
                results.push(this.generateTemplate(template))
            }
        }

        // attempt to close values, but no more than 33% equals
        var equals = true;
        if (RNG.getUniform() > 0.33) {
            equals = false;
        }

        var minDist = Infinity;
        var t1, t2;
        for (var i=0; i<results.length; i++) {
            for (var j=i+1; j< results.length; j++) {
                var dist = Math.abs(results[i][1] - results[j][1])
                if (dist == 0) {
                    if (!equals) {
                        continue;
                    }
                    t1 = results[i];
                    t2 = results[j];
                    return [t1,t2]; // no need to keep looking
                }
                if (dist < minDist) {
                    minDist = dist;
                    t1 = results[i];
                    t2 = results[j];
                }
            }
        }
        return [t1, t2]
    }
});




WhichSmallerSprite = Sprite.extend({
    whichSmaller: null,
    pair: null,

    instruction: "Choose which side results in a smaller number - use the arrow keys,  press `Down` if both are equal.",

    correct: 0,
    incorrect: 0,

    smaller: 0,
    larger: 0,
    equal: 0,

    timeToSolveBonus: 3000, // 2 seconds for bonus
    timeToShowSolution: 750,

    SHOW_QUESTION_BONUS: 0,
    SHOW_QUESTION: 1,
    SHOW_ANSWER: 2,

    state: null,
    lastStateChange: 0,
    lastChosen: 0, // 0 smaller, 1 equal, 2 larger
    lastTsUpdated: 0,

    init: function(level) {
        Sprite.prototype.init.call(this);
        this.state = this.SHOW_QUESTION_BONUS;
        this.whichSmaller = new WhichSmaller(level);
        this.generate();
    },

    setLevel: function(level, progress) {
        if (level != this.whichSmaller.level) {
            this.whichSmaller.level = level;
            this.startNextQuestion(progress);
        }
    },

    getLevel: function() {
        return this.whichSmaller.level;
    },

    cachedImg: null,
    cachedParams: {
        shade: null,
        state: null
    },

    render: function( context, x,y) {

        var shade =null;
        if (this.state == this.SHOW_QUESTION_BONUS) {  // show bonus
            if (this.lastTsUpdated > this.lastStateChange + this.timeToSolveBonus) {
                this.state = this.SHOW_QUESTION;
                this.lastStateChange = this.lastTsUpdated;
            }
            else {
                shade = 100 - 70 *(1 - (this.lastStateChange + this.timeToSolveBonus - this.lastTsUpdated) / this.timeToSolveBonus);
                shade = shade.floor();
            }
        }
        context.save();

        if (this.state != this.cachedParams.state || shade != this.cachedParams.shade) {
            // draw into cache
            var text1 = this.pair[0][0];
            var text2 = this.pair[1][0];
            context.font = "20px Arial";
            var text1Width = context.measureText(text1 ).width;
            var text2Width = context.measureText(text2 ).width;
            var MARGIN = 12;
            var SYMBOL_WIDTH = 30;
            var BLUR = 5;
            var textWidth = Math.max(text1Width, text2Width);
            var width = 4*BLUR+4*MARGIN + SYMBOL_WIDTH + 2*textWidth;
            var height = 65;

            this.x = x - width/2;
            this.y = y - height - 80; // above player head

            var that = this;
            this.cachedImg = renderToCanvas(width, height, function(ctx) {
                var y = 0;
                // no else here - state=0 can change above to 1
                var correct;
                if (that.state == that.SHOW_QUESTION_BONUS) {
                    ctx.fillStyle = "#"+(shade * 0x10101).toString(16);
                }
                else if (that.state == that.SHOW_QUESTION) {
                    ctx.fillStyle = "#1D1D1D";  // no bonus
                }
                else if (that.state == that.SHOW_ANSWER) { // show solution
                    correct = that.isCorrect();
                    ctx.fillStyle = correct ? "#559055" : "#905555";
                }
                ctx.fillRect(0, y, width, height);
                y += 25;
                // TODO: use text effects from http://www.html5rocks.com/en/tutorials/canvas/texteffects/Text-Effects.html
                ctx.fillStyle = "#FFF";
                ctx.textAlign = "center";
                ctx.shadowColor = "#00F";
                ctx.font = "20px Arial";
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
                ctx.shadowBlur = BLUR*2;
                ctx.strokeStyle = '#558';
                ctx.lineWidth = 2;
                ctx.strokeText(text1, BLUR+MARGIN + textWidth/2, y);
                ctx.strokeText(text2, width -BLUR - MARGIN - textWidth/2, y);
                ctx.fillText(text1, BLUR+MARGIN + textWidth/2, y);
                ctx.fillText(text2, width -BLUR - MARGIN - textWidth/2, y);
                ctx.fillStyle = "#AAB";
                ctx.font = "bold 18px Arial";
                var operator = "?";
                if (that.state == that.SHOW_ANSWER) {
                    if (correct) {
                        operator = "\u2713";
                    }
                    else {
                        operator = "\u2718";
                    }
                }
                ctx.fillText(operator, width/2, y);

                if (that.state == that.SHOW_QUESTION_BONUS || that.state == that.SHOW_QUESTION) {
                    ctx.fillText("<       =       >", width/2, y+30);
                }
                else {
                    var num1 = that.pair[0][1];
                    var num2 = that.pair[1][1];
                    var operator = "<";
                    if (num1 == num2) {
                        operator = "=";
                    }
                    else if (num1 > num2) {
                        operator = ">";
                    }
                    ctx.fillText(num1+"  "+operator+"  "+num2, width/2, y+30);
                }

            })

        }

        context.globalAlpha = 0.8;

        // draw from cache
        context.drawImage(this.cachedImg, this.screenX(), this.screenY());
        context.restore();

    },

    lastCorrect: null,
    isCorrect: function() {
        return this.lastCorrect;
    },

    lastBonus: false,
    isBonus: function() {
        return this.lastBonus;
    },

    update: function(ts, dt) {
        this.lastTsUpdated = ts;
        if (this.state == this.SHOW_QUESTION_BONUS || this.state == this.SHOW_QUESTION) { //waiting for solution }
            var done = false;
            var inputEngine = window.gameEngine.inputEngine;
            if (inputEngine.actions['move-left']) {
                done = true;
                this.lastChosen = 0;
            }
            if (inputEngine.actions['move-down']) {
                done = true;
                this.lastChosen = 1;
            }
            if (inputEngine.actions['move-right']) {
                done = true;
                this.lastChosen = 2;
            }
            if (done) {
                var n1 = this.pair[0][1];
                var n2 = this.pair[1][1];
                var correct = null;
                if (this.lastChosen == 0) {
                    correct = n1 < n2;
                }
                else if (this.lastChosen == 1) {
                    correct = n1 == n2;
                }
                else if (this.lastChosen == 2) {
                    correct = n1 > n2;
                }
                this.lastCorrect = correct;

                this.lastBonus = false;
                if (correct) {
                    if (this.state == this.SHOW_QUESTION_BONUS) {
                        this.lastBonus = true;
                    }
                    this.correct++;
                }
                else {
                    this.incorrect++;
                }
                this.state = this.SHOW_ANSWER;
                this.lastStateChange = ts;
            }
        }
        else if (this.state == this.SHOW_ANSWER) {
            // showing solution
            if (ts > this.lastStateChange + this.timeToShowSolution) {
                this.startNextQuestion(ts);
            }
        }
    },

    startNextQuestion: function(ts) {
        this.state = this.SHOW_QUESTION_BONUS;
        this.lastStateChange = ts;
        this.generate();
    },

    generate: function() {
        this.pair =  this.whichSmaller.generate();
        var n1 = this.pair[0][1];
        var n2 = this.pair[1][1];
        if (n1 == n2) {
            this.equal++;
        }
        else if (n1 < n2) {
            this.smaller++
        }
        else {
            this.larger++;
        }
    }
})
