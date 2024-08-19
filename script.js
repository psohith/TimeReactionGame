const gameBoard = document.getElementById('game-board');
const playButton = document.getElementById('play-button');
const scoreDisplay = document.getElementById('score-display');
const clickTimerDisplay = document.getElementById('click-timer-display');
const levelDisplay = document.getElementById('level-display');
const leaderboardList = document.getElementById('leaderboard-list');
const msg = document.getElementById('msg')


let score = 0;
let level = 1;
let boxCount = 3;
let reactionTime = 2000;
let clicksRequired = 10;
let currentClicks = 0;
let timeoutId = null;
let clickTimerId = null;
let clickStartTime = null;

const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];

displayLeaderboard();
resetBoard();
playButton.addEventListener('click', startGame);


function updateScoreDisplay() {
    scoreDisplay.textContent = `Score: ${score}`;
}

function updateClickTimerDisplay(remainingTime) {
    clickTimerDisplay.textContent = `Time Left: ${remainingTime.toFixed(2)}ms`;
}

function updateLevelDisplay() {
    levelDisplay.textContent = `Level: ${level}`;
}

function updateClickTimer() {
    const clickEndTime = performance.now();
    const elapsedTime = clickEndTime - clickStartTime;
    const remainingTime = reactionTime - elapsedTime;
    if (remainingTime <= 0) {
        clearInterval(clickTimerId);
    } else {
        updateClickTimerDisplay(remainingTime);
    }
}


function levelUp() {
    level++;
    boxCount++;
    reactionTime = Math.max(500, reactionTime / 1.5);
    clicksRequired += 5;
    currentClicks = 0;
    resetBoard();
    spawnBlackBox();
    updateLevelDisplay();
}


function displayLeaderboard() {
    leaderboardList.innerHTML = '';

    leaderboard.forEach(entry => {
        const row = document.createElement('tr');

        const scoreCell = document.createElement('td');
        scoreCell.textContent = entry.score;
        row.appendChild(scoreCell);

        const dateCell = document.createElement('td');
        dateCell.textContent = entry.date;
        row.appendChild(dateCell);

        const timeCell = document.createElement('td');
        timeCell.textContent = entry.time;
        row.appendChild(timeCell);

        leaderboardList.appendChild(row);
    });
}

function boxClicked(event) {
    if (event.target.classList.contains('black-box')) {
        clearTimeout(timeoutId);
        clearInterval(clickTimerId);
        event.target.classList.remove('black-box');
        event.target.classList.add('success');
        setTimeout(() => {
            event.target.classList.remove('success');
        }, 150);

        score++;
        currentClicks++;

        updateScoreDisplay();
        updateClickTimerDisplay(reactionTime);

        if (currentClicks >= clicksRequired) {
            levelUp();
        } else {
            spawnBlackBox();
        }
    }
}


function startGame() {
    msg.textContent = ''
    playButton.disabled = true;
    playButton.textContent = 'Restart';
    resetBoard();
    score = 0;
    level = 1;
    currentClicks = 0;
    updateScoreDisplay();
    updateClickTimerDisplay(reactionTime);
    updateLevelDisplay();
    spawnBlackBox();
}

function resetBoard() {
    gameBoard.innerHTML = '';
    gameBoard.style.gridTemplateColumns = `repeat(${boxCount}, 1fr)`;
    gameBoard.style.gridTemplateRows = `repeat(${boxCount}, 1fr)`;

    for (let i = 0; i < boxCount * boxCount; i++) {
        const box = document.createElement('div');
        box.addEventListener('click', boxClicked);
        gameBoard.appendChild(box);
    }
}

function spawnBlackBox() {
    const boxes = Array.from(gameBoard.children);
    const randomIndex = Math.floor(Math.random() * boxes.length);
    const box = boxes[randomIndex];
    box.classList.add('black-box');
    clickStartTime = performance.now();

    if (clickTimerId) clearInterval(clickTimerId);
    clickTimerId = setInterval(updateClickTimer, 10);

    timeoutId = setTimeout(() => {
        gameOver();
        resetBoard();
    }, reactionTime);
}



function gameOver() {
    clearInterval(clickTimerId);
    updateClickTimerDisplay(0);
    saveScore(score);
    playButton.disabled = false;
    displayLeaderboard();
    msg.textContent = 'Game Over..!'
    score = 0;
    level = 1;
    boxCount = 3;
    reactionTime = 2000;
    clicksRequired = 10;
    currentClicks = 0;
}

function saveScore(score) {
    const date = new Date();
    const formattedDate = date.toLocaleDateString();
    const time = date.toLocaleTimeString();

    leaderboard.push({ score, date: formattedDate, time });
    leaderboard.sort((a, b) => b.score - a.score);

    if (leaderboard.length > 7) {
        leaderboard.pop();
    }

    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
}



