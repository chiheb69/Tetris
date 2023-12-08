"use strict";
const canvas = document.getElementById("tetris");
const context = canvas.getContext("2d"); 
let dropInterval = level(); 
let scoreGoal = 100;

let isGameRunning = false;

context.scale(20, 20);

function level() {
    const selectElement = document.getElementById('level');

    const selectedValue = selectElement.value;

    if (selectedValue === 'hard') {
        return 60;
    } else if (selectedValue === 'normal') {
        return 120;
    } else if (selectedValue === 'easy') {
        return 250;
    } else {
        return 0;
    }
    
}

function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

function createPiece(type) {
    if (type === "I") {
        return [
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
        ];
    } else if (type === "L") {
        return [
            [0, 2, 0],
            [0, 2, 0],
            [0, 2, 2],
        ];
    } else if (type === "J") {
        return [
            [0, 3, 0],
            [0, 3, 0],
            [3, 3, 0],
        ];
    } else if (type === "O") {
        return [
            [4, 4],
            [4, 4],
        ];
    } else if (type === "Z") {
        return [
            [5, 5, 0],
            [0, 5, 5],
            [0, 0, 0],
        ];
    } else if (type === "S") {
        return [
            [0, 6, 6],
            [6, 6, 0],
            [0, 0, 0],
        ];
    } else if (type === "T") {
        return [
            [0, 7, 0],
            [7, 7, 7],
            [0, 0, 0],
        ];
    }
}

function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                const color = colors[value];
                context.fillStyle = color;
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
                context.lineJoin = "round"

                // Add a border
                context.strokeStyle = 'black'; // Change the border color as needed
                context.lineWidth = 0.1; // Adjust the border width as needed
                context.strokeRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

// Function to merge Tetrimino into the arena
function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

// Function to rotate a matrix
function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
        }
    }
    if (dir > 0) {
        matrix.forEach((row) => row.reverse());
    } else {
        matrix.reverse();
    }
}

// Function to check for collisions
function collide(arena, player) {
    const m = player.matrix;
    const o = player.pos;
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
                (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

const colors = [
    null,
    "#ff0d72",
    "#0dc2ff",
    "#0dff72",
    "#f538ff",
    "#ff8e0d",
    "#ffe138",
    "#3877ff",
];

const arena = createMatrix(12, 20);
const player = {
    pos: { x: 0, y: 0 },
    matrix: null,
    score: 0,
};

let dropCounter = 0;

let lastTime = 0;

let isPaused = false; // Track pause state
let animationId; // Store the animation frame ID

// Function to start/restart the game
// Function to start/restart the game
function startGame() {
    if (isGameRunning) {
        stopGame(); // Stop the game if it's already running
    }

    // Clear the canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Clear the arena
    arena.forEach((row) => row.fill(0));

    // Initialize game variables and start the game loop
    playerReset();
    updateScore();
    update();
    pauseButton.disabled = false;
    startButton.innerText = "Restart";
    isGameRunning = true;
}
        playerReset();
        updateScore();
        context.clearRect(0, 0, canvas.width, canvas.height);
        arena.forEach((row) => row.fill(0));
        dropInterval = level();
        
         // Change button text to "Restart"
        // Disable the Start/Restart button during gameplay


// Event listener for the Start/Restart button
const startButton = document.getElementById("startBtn");
startButton.addEventListener("click", startGame);


// Function to pause/resume the game
function pauseGame() {
    isPaused = !isPaused; // Toggle pause state
    if (isPaused) {
        // Pause the game (stop updating)
        cancelAnimationFrame(animationId);
        pauseButton.innerText = "Resume";
    } else {
        // Resume the game (restart updating)
        update();
        pauseButton.innerText = "Pause";
    }
}

// Event listener for the Pause button
const pauseButton = document.getElementById("pauseBtn");
pauseButton.addEventListener("click", pauseGame);

// Event listener for the Stop button
const stopButton = document.getElementById("stopBtn");
stopButton.addEventListener("click",stopGame);
    // Clear the canvas
function stopGame(){
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Clear the arena
    arena.forEach((row) => row.fill(0));

    // Reset the player
    playerReset();

    // Update the score (set to 0)
    player.score = 0;
    updateScore();

    // Disable the Pause button
    pauseButton.disabled = true;
    
    // Enable the Start button
    isGameRunning = false; // Set the game as not running
    
    startButton.innerHTML = "Start Game"
    pauseButton.innerHTML = "Pause"
    pauseButton.disabled = true
    isPaused = false

    
    // Stop the game loop
    cancelAnimationFrame(animationId);
}

// Function to reset the player
function playerReset() {
    const pieces = "TJLOSZI";
    player.matrix = createPiece(pieces[(pieces.length * Math.random()) | 0]);
    player.pos.y = 0;
    player.pos.x = ((arena[0].length / 2) | 0) - ((player.matrix[0].length / 2) | 0);
    if (collide(arena, player)) {
        // Only reset the player's score when the game is over
        arena.forEach((row) => row.fill(0));
        player.score = 0;
        updateScore();
    }
}



// Function to update the player's score on the web page
function updateScore() {
    const scoreGoalInput = document.getElementById("scoreGoalInput");
    const newScoreGoal = parseInt(scoreGoalInput.value, 10);

    if (!isNaN(newScoreGoal) && newScoreGoal % 10 === 0) {
        scoreGoal = newScoreGoal;
        document.getElementById("score").innerText = "Score: " + player.score + " / Goal: " + scoreGoal;
    } else {
        console.log("Invalid score goal input. Please enter a multiple of 10.");
    }

    // Check if the player has reached the dynamically set score goal
    if (player.score >= scoreGoal) {
        // Display a congratulatory message
        alert('Congratulations! You reached the score goal: ' + scoreGoal);

        // Optionally, you can reset the score goal after achieving it
        // scoreGoal = // set a new score goal here;

        stopGame(); // Stop the game after reaching the score goal
    }
}

const setScoreGoalButton = document.getElementById("setScoreGoalBtn");
setScoreGoalButton.addEventListener("click", updateScore);




// Event listener for keyboard input
document.addEventListener("keydown", (event) => {
    if (event.keyCode === 37) {
        playerMove(-1);
    } else if (event.keyCode === 39) {
        playerMove(1);
    } else if (event.keyCode === 40) {
        playerDrop();
    } else if (event.keyCode === 81) {
        playerRotate(-1);
    } else if (event.keyCode === 87) {
        playerRotate(1);
    }
});

// Function to start the game loop
function update(time = 0) {
    if (!isPaused) {
        const deltaTime = time - lastTime;
        dropCounter += deltaTime;
        if (dropCounter > dropInterval) {
            playerDrop();
        }
        lastTime = time;
        draw();
    }

    animationId = requestAnimationFrame(update);
}

// Function to move the player horizontally
function playerMove(offset) {
    player.pos.x += offset;
    if (collide(arena, player)) {
        player.pos.x -= offset;
    }
}

// Function to drop the player's Tetrimino
function playerDrop() {
    
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        if (player.pos.y <= 1) {
            // Game over condition
            gameOver();
            return;
        }
        playerReset();
        arenaSweep();
        updateScore();
    }
    dropCounter = 0;
}



function gameOver() {
    console.log('Game Over! Your score: ' + player.score);
    // Update the score before displaying the alert
    updateScore();

    // Use a small delay to ensure that the score is updated before showing the alert
    setTimeout(function () {
        console.log('Alert is about to show');
        alert('Game Over! Your score: ' + player.score);
        console.log('Alert was shown');
        stopGame(); // Stop the game after showing the alert
    }, 1); // Adjust the delay time as needed
}





// Function to rotate the player's Tetrimino
function playerRotate(dir) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}

function arenaSweep() {
    let rowCount = 0;
    for (let y = arena.length - 1; y >= 0; --y) {
        if (arena[y].every((value) => value !== 0)) {
            // Clear the row and move all rows above it down
            arena.splice(y, 1);
            arena.unshift(new Array(arena[0].length).fill(0));
            ++rowCount;
            ++y; // Skip the next iteration to re-check the current row
        }
    }

    if (rowCount > 0) {
        // Update the score based on the number of cleared rows
        player.score += Math.pow(2, rowCount - 1) * 10;
        updateScore();
    }
}




// Function to draw the game state
function draw() {
    context.fillStyle = "#F5F5F5";
    context.fillRect(0, 0, canvas.width, canvas.height);
    drawMatrix(arena, { x: 0, y: 0 });
    drawMatrix(player.matrix, player.pos);
}
const setScoreGoalBtn = document.getElementById("setScoreGoalBtn");
setScoreGoalBtn.addEventListener("click", function () {
    // Get the value from the input field and validate it
    const scoreGoalInput = document.getElementById("scoreGoalInput");
    const newScoreGoal = parseInt(scoreGoalInput.value, 10);

    // Check if the value is a multiple of 10
    if (!isNaN(newScoreGoal) && newScoreGoal % 10 === 0) {
        scoreGoal = newScoreGoal;
        console.log("Score goal set to:", scoreGoal);
    } else {
        console.log("Invalid score goal input. Please enter a multiple of 10.");
    }
});


// Start the game when the page loads
