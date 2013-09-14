
$(function() {
    var content = document.getElementById('content');
    var context = content.getContext('2d');

    var toArray = function(text) {
        var x = text.split(',');
        var res = [];
        for (var i=0; i< x.length; i++) {
            var n = parseFloat(x[i]);
            if (isNaN(n)) {
                return;
            }
            res.push(n);
        }
        return res;
    }

    var clientWidth=100,clientHeight= 100;
    // Reflow handling
    var reflow = function() {
        clientWidth = container.clientWidth;
        clientHeight = container.clientHeight;
        content.width = clientWidth;
        content.height = clientHeight;
    };
    window.addEventListener("resize", reflow, false);
    reflow();


    var parEmt = new ParticlePointEmitter(300);
    parEmt.active = false;

    $("#update").click(function() {
        RNG.setSeed(parseInt(document.getElementById("seed").value));

        $('#properties input').each(function() {
            var id = this.id;
            var val = this.value;
            if (this.type =="text") {
                val = toArray(val);
            }
            else {
                val = parseFloat(val);
            }
            parEmt[id] = val;
        })

        parEmt.active = true;
    })


    var start = window.mozAnimationStartTime  || 0;
    var lastProgress = start;
    context.fillStyle = "#000";
    function step(timestamp) {
        var progress = timestamp - start;
        var dt = progress - lastProgress;
        lastProgress = progress;


        context.fillRect(0,0, clientWidth, clientHeight);
        parEmt.update(dt);
        context.save();
        context.globalCompositeOperation = "lighter";
        parEmt.renderParticles(context);
        context.restore();
        setTimeout(function() {
            requestAnimationFrame(step);
        }, 15); // avoid high cpu

    }

    requestAnimationFrame(step);

})


