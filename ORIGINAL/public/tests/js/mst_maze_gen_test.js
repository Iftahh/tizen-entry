
var W = 600;
var H = 400;

var ctx = document.getElementById('canvas').getContext("2d");

var seed = 123;
var m = new MersenneTwister(seed);
var random = function() { return m.random() };

function getRandomInt (min, max) {
    return Math.floor(random() * (max - min + 1)) + min;
}

lastShown = [-1,-1];
mouseX = 100;
mouseY = 100;

var drawMaze = function(maze) {

    ctx.fillStyle = "#000";
    var w = maze.options.w;
    var h = maze.options.h;
    var cellWidth = Math.min((W-20)/w, (H-20)/h);
    var halfWidth = Math.round(cellWidth/2)
    var cellX = Math.round((mouseX-10-halfWidth)/cellWidth);
    var cellY = Math.round((mouseY-10-halfWidth)/cellWidth);
    if (lastShown[0] == cellX && lastShown[1] == cellY) {
        return;
    }
    lastShown[0] = cellX;
    lastShown[1] = cellY;
    ctx.fillRect(0,0, W, H);
    ctx.lineWidth = halfWidth;
    ctx.strokeStyle = "#ffff00";
    var line = function(x1,y1, x2,y2) {
        ctx.beginPath();
        ctx.moveTo(10+x1*cellWidth+halfWidth, 10+y1*cellWidth+halfWidth);
        ctx.lineTo(10+x2*cellWidth+halfWidth, 10+y2*cellWidth+halfWidth);
        ctx.stroke();
    }

    for (var i=0; i<maze.edges.length; i++) {
        var edge = maze.edges[i];
        var c1 = edge.cid1;
        var c2 = edge.cid2;
        var x1 = c1 % w;
        var y1 = Math.floor(c1/w);
        var x2 = c2 % w;
        var y2 = Math.floor(c2/w);

        line(x1,y1, x2,y2);
    }
    ctx.fillStyle = "rgba(200, 200, 55, 0.5)";
    for (var i=0; i<maze.rooms.length; i++) {
        var room = maze.rooms[i];
        ctx.fillRect(10+room.x*cellWidth, 10+room.y*cellWidth, room.w*cellWidth, room.h*cellWidth);
    }

    try {
        var debug_text = "Data for cell ("+cellX+", "+cellY+")\n\n" ;
        var allEdges = maze.allEdges;
        var mazeEdges = {};
        for (var i=0; i<maze.edges.length; i++) {
            var e = maze.edges[i];
            mazeEdges[e.edgeId] = e;
        }
        var w = maze.options.w;
        var c1 = cellX+cellY*w;

        if (cellX < w-1) {
            var cr = cellX+1+cellY*w;
            var e1 = _edge(c1, cr);
            if (mazeEdges[e1]) {
                ctx.strokeStyle = "rgba(50, 255, 50, 0.9)";
                debug_text += "East: yes, score "+mazeEdges[e1].score + "\n";
            }
            else {
                ctx.strokeStyle = "rgba(255, 50, 50, 0.9)";
                debug_text += "East: no, score "+allEdges[e1].score + "\n";
            }
            line(cellX, cellY, cellX+1, cellY);
        }

        if (cellX > 0) {
            var cl = cellX-1+cellY*w;
            var e2 = _edge(c1, cl);
            if (mazeEdges[e2]) {
                ctx.strokeStyle = "rgba(50, 255, 50, 0.6)";
                debug_text += "West: yes, score "+mazeEdges[e2].score + "\n";
            }
            else {
                ctx.strokeStyle = "rgba(255, 50, 50, 0.6)";
                debug_text += "West: no, score "+allEdges[e2].score + "\n";
            }
            line(cellX, cellY, cellX-1, cellY);
        }


        if (cellY < h-1) {
            var cd = cellX+(cellY+1)*w;
            var e3 = _edge(c1, cd);
            if (mazeEdges[e3]) {
                ctx.strokeStyle = "rgba(50, 255, 50, 0.6)";
                debug_text += "South: yes, score "+mazeEdges[e3].score + "\n";
            }
            else {
                ctx.strokeStyle = "rgba(255, 50, 50, 0.6)";
                debug_text += "South: no, score "+allEdges[e3].score + "\n";
            }
            line(cellX, cellY, cellX, cellY+1);
        }

        if (cellY > 0) {
            var cu = cellX+(cellY-1)*w;
            var e4 = _edge(c1, cu);
            if (mazeEdges[e4]) {
                ctx.strokeStyle = "rgba(50, 255, 50, 0.6)";
                debug_text += "North: yes, score "+mazeEdges[e4].score + "\n";
            }
            else {
                ctx.strokeStyle = "rgba(255, 50, 50, 0.6)";
                debug_text += "North: no, score "+allEdges[e4].score + "\n";
            }
            line(cellX, cellY, cellX, cellY-1);
        }

        document.getElementById("debug-text").innerText = debug_text;
    }
    catch(e) {

    }

}

var genMaze = function() {


    var options =  {
        w: parseInt(document.getElementById("mazeWidth").value),
        h: parseInt(document.getElementById("mazeHeight").value),
        minRooms: parseInt(document.getElementById("mazeMinRooms").value),
        maxRooms: parseInt(document.getElementById("mazeMaxRooms").value),
        minRoomWidth: parseInt(document.getElementById("mazeMinRoomWidth").value),
        maxRoomWidth: parseInt(document.getElementById("mazeMaxRoomWidth").value),
        minRoomHeight: parseInt(document.getElementById("mazeMinRoomHeight").value),
        maxRoomHeight: parseInt(document.getElementById("mazeMaxRoomHeight").value),
        roomWall: parseFloat(document.getElementById("roomWall").value),
        roomOpening: parseFloat(document.getElementById("roomOpening").value)
    }
    console.log("Maze Gen ", options)
    var seed = parseInt(document.getElementById("mazeSeed").value);

    m = new MersenneTwister(seed);
    random = function() { return m.random() }
    window.maze = maze_gen(options);
    window.lastShown = [-1,-1];
    drawMaze(maze);
}

var mouseMove = function(e) {
    window.mouseX = e.offsetX;
    window.mouseY = e.offsetY;
    drawMaze(maze);
}

genMaze();

document.getElementById('canvas').onmousemove = mouseMove;

$('#properties input').change(genMaze);
