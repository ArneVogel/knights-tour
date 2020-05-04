const Chessground = require('chessground').Chessground;

let visited = new Set(['d1']);

let timeRunning = false;
let interval; // the interval that updates the time 
let updateDelay = 100; // miliseconds for time update
let offset; // Date.now() from when game started
let clock; // miliseconds since start of game

const timeKey = "knightstourTime";

/* 
 * Returns all squares the knight can move to 
 * (even ones the queen attacks)
 */
function knightMoves(square) {
    let coords = square.split("");
    let validMoves = [];

    let charCodeRangeMin = 97;
    let charCodeRangeMax = 104;
    
    let moves = [[2,1],[1,2],[-1,2],[-2,1],[-2,-1],[-1,-2],[1,-2],[2,-1]];
    
    for (let i = 0; i < 8; ++i) {
        let file = coords[0].charCodeAt(0) + moves[i][0];
        let rank = parseInt(coords[1]) + moves[i][1];

        if (file >= charCodeRangeMin
         && file <= charCodeRangeMax 
         && rank >= 1
         && rank <= 8) {
            move = String.fromCharCode(file) + rank;
            validMoves.push(move);
        }
    }
    return validMoves.filter(e => !visited.has(e)); // only allow to move to unvisted squares
}

function highlightVisited() {
    let shapes = [];
    for (const square of visited) {
        shape = {};
        shape["orig"] = square;
        shape["brush"] = "green";
        shapes.push(shape)
    }
    ground.setAutoShapes(shapes);

    ground.redrawAll();
}

function updateTime() {
    let now = Date.now();
    let diff = parseInt((now-offset)/1000);
    let minutes = parseInt(diff/60);
    let seconds = diff%60;
    
    document.getElementById("time").innerText = (""+minutes).padStart(2,"0") + ":" + (""+seconds).padStart(2,"0");
}

function updateHighscore() {
    console.log("updatehighscores");
    let now = Date.now();
    let diff = parseInt((now-offset)/1000);

    let currentTime = localStorage.getItem(timeKey) || 9999;

    if (diff < currentTime) {
        localStorage.setItem(timeKey, diff);
    }    

    displayHighscore();
}

function displayHighscore() {
    let time = localStorage.getItem(timeKey) || 0;
    
    let minutes = parseInt(time/60);
    let seconds = time%60;
    
    document.getElementById("timeHighscore").innerText = (""+minutes).padStart(2,"0") + ":" + (""+seconds).padStart(2,"0");
}



function handleMove(orig, dest) {
    let knightSquare = dest;

    if (!timeRunning) {
        offset = Date.now();
        interval = setInterval(updateTime, updateDelay);
        timeRunning = true;
    }

    visited.add(knightSquare);

    if (visited.size == 64) {
        clearInterval(interval);
        updateHighscore();
    }

    validMoves = {};
    validMoves[knightSquare] = knightMoves(knightSquare);
    ground.set({movable: {dests: validMoves}});

    highlightVisited();
    ground.redrawAll();
}


function changeBoardSize(amount) {
    let size = parseInt(localStorage.getItem("chessgroundSize")) || 320;
    size += amount;
    localStorage.setItem("chessgroundSize", size)

    drawBoard();
}
window.changeBoardSize = changeBoardSize;

/* setup for the control div */
function createControl() {
    let control = document.getElementById("control");

    let br = document.createElement("br");

    // score p with two spans for # moves and time
    let score = document.createElement("p");
    score.innerText = "Time: ";
    let time_span = document.createElement("span")
    time_span.id = "time";
    time_span.innerText = "00:00";
    score.appendChild(time_span);

    // highscore p with two spans for # moves and time
    let highscore = document.createElement("p");
    highscore.innerText = "[HIGHSCORE] Time: ";
    let high_time_span = document.createElement("span")
    high_time_span.id = "timeHighscore";
    high_time_span.innerText = "00:00";
    highscore.appendChild(high_time_span);


    let restart = document.createElement("button");
    restart.textContent = "Restart";
    restart.onclick = function() {resetScore(); setup();};
    restart.classList.add("button");

    let inc_label = document.createElement("label");
    inc_label.setAttribute("for", "inc");
    inc_label.innerText = "Change Board Size: ";

    let inc = document.createElement("button");
    inc.classList.add("button");
    let dec = document.createElement("button");
    dec.classList.add("button");
    inc.textContent = "+";
    dec.textContent = "-";
    inc.onclick = function() {changeBoardSize(20)};
    dec.onclick = function() {changeBoardSize(-20)};
    inc.id = "inc"

    control.append(score);
    control.append(inc_label);
    control.append(inc);
    control.append(dec);

    control.append(document.createElement("br"));

    control.append(restart);

    control.append(br);

    control.append(highscore);
}

function drawBoard() {
    let size = parseInt(localStorage.getItem("chessgroundSize")) || 320;
    let b = document.getElementById("board");
    b.style.width = size + "px"
    b.style.height = size + "px"

    ground.redrawAll();
}


function resetScore() {
    timeRunning = false;
    clearInterval(interval);

    document.getElementById("time").innerText = "00:00";
}

function setup() {
    const config = {fen: '8/8/8/8/8/8/8/3N4 w - - 0 1',
        movable: {
            free: false,
            showDests: true,
            events: {
                after: handleMove
            },
            dests: {
                'd1': ['b2', 'c3','e3','f2']
            }
        },
    }
    const ground = Chessground(document.getElementById("board"), config);
    window.ground = ground; 
    ground.redrawAll();

    visited = new Set(['d1']);

    highlightVisited();
}

setup();
highlightVisited();
createControl();
drawBoard();
displayHighscore();
