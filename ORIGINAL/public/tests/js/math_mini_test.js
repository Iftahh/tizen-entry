

RNG.setSeed(123);//Date.now());

var container = document.getElementById("container");
var content = document.getElementById('content');
var context = content.getContext('2d');

var clientWidth = 100;
var clientHeight= 100;

var reflow = function() {
    clientWidth = container.clientWidth;
    clientHeight = container.clientHeight;
    content.width = clientWidth;
    content.height = clientHeight;
};

window.addEventListener("resize", reflow, false);
reflow();


$(function() {


    var container = document.getElementById("container");

//var seed = 123;
//var m = new MersenneTwister(seed);
//var random = function() { return m.random() };



    window.scroller = { __scrollTop: 10, __scrollLeft: 10 };
    window.character = { x: 300, y: 200 };

    window.inputEngine = new InputEngine();
    inputEngine.setup(container)


    var game = new WhichSmallerSprite(2);

    $('.level-choose').click(function() {
        var lvl = parseInt(this.id.split('-')[1]);
        game.setLevel(lvl);
        game.correct = game.incorrect = game.smaller = game.larger = game.equal = 0;
    })

    var start = 0;
    var lastProgress = start;
    function step(timestamp) {
        var progress = timestamp - start;
        var dt = progress - lastProgress;
        lastProgress = progress;

        game.update(progress,dt);
        $('#debug_text').html("Corrects: "+game.correct+ "\nIncorrects: "+game.incorrect+
            "\n\nSmaller: "+game.smaller+"\nEqual: "+game.equal+"\nLarger: "+game.larger);

        context.clearRect(0, 0, clientWidth, clientHeight);
        game.render(context);

        setTimeout(function() {
            requestAnimationFrame(step);
        }, 15); // avoid high cpu

    }

    requestAnimationFrame(step);
})
