const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreDisplay = document.getElementById("scoreValue");
const highScoreDisplay = document.getElementById("highScore");
const pauseOverlay = document.getElementById("pause-overlay");

const gridSize = 30; // 30px per cell
const gridCount = 20; // 20x20 cells

let snake = [{ x: 5, y: 10 }, { x: 4, y: 10 }, { x: 3, y: 10 }];
let dx = 1;
let dy = 0;
let nextDx = 1;
let nextDy = 0;
let food = { x: 15, y: 10 };
let score = 0;
let highScore = localStorage.getItem("ambato_highScore") || 0;
let paused = false;
let gameLoop;

const snakeHeadImg = new Image();
snakeHeadImg.src = "file/omaygot.jpg";

const pauseSound = new Audio("file/pause.mp3");
pauseSound.volume = 0.5;

const eatSound = new Audio("file/eat.mp3");
eatSound.volume = 0.7;

const backgroundMusic = document.getElementById("gameMusic");

highScoreDisplay.textContent = highScore;

function drawSnake() {
  snake.forEach((segment, index) => {
    if (index === 0) {
      // Draw head image
      ctx.drawImage(snakeHeadImg, segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
    } else {
      // Draw body with gradient
      const alpha = 1 - (index / snake.length) * 0.7;
      ctx.fillStyle = `rgba(0, 255, 13, ${alpha})`;
      ctx.strokeStyle = "rgba(0,0,0,0.2)";
      ctx.lineWidth = 1;
      
      const x = segment.x * gridSize;
      const y = segment.y * gridSize;
      const r = 4; // Rounded corners
      
      ctx.beginPath();
      ctx.roundRect(x+1, y+1, gridSize-2, gridSize-2, r);
      ctx.fill();
      ctx.stroke();
    }
  });
}

function drawFood() {
  const x = food.x * gridSize;
  const y = food.y * gridSize;
  
  ctx.fillStyle = "#ff3333";
  ctx.shadowBlur = 15;
  ctx.shadowColor = "#ff3333";
  
  ctx.beginPath();
  ctx.roundRect(x + 4, y + 4, gridSize - 8, gridSize - 8, 8);
  ctx.fill();
  
  ctx.shadowBlur = 0; // reset
}

function moveSnake() {
  dx = nextDx;
  dy = nextDy;
  
  const head = { x: snake[0].x + dx, y: snake[0].y + dy };
  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score++;
    scoreDisplay.textContent = score;
    eatSound.cloneNode().play();
    if (score > highScore) {
      highScore = score;
      highScoreDisplay.textContent = highScore;
      localStorage.setItem("ambato_highScore", highScore);
    }
    spawnFood();
  } else {
    snake.pop();
  }
}

function spawnFood() {
  let newFood;
  while (true) {
    newFood = { 
      x: Math.floor(Math.random() * gridCount), 
      y: Math.floor(Math.random() * gridCount) 
    };
    // Don't spawn on snake
    if (!snake.some(s => s.x === newFood.x && s.y === newFood.y)) break;
  }
  food = newFood;
}

function checkCollision() {
  const head = snake[0];
  if (
    head.x < 0 || head.x >= gridCount ||
    head.y < 0 || head.y >= gridCount ||
    snake.slice(1).some((segment) => segment.x === head.x && segment.y === head.y)
  ) {
    return true;
  }
  return false;
}

function draw() {
  if (paused) return;

  if (checkCollision()) {
    localStorage.setItem("last_score", score);
    window.location.href = "gameover.html";
    clearInterval(gameLoop);
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw subtle grid lines
  ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
  ctx.lineWidth = 1;
  for(let i=0; i<=gridCount; i++) {
    ctx.beginPath(); ctx.moveTo(i*gridSize, 0); ctx.lineTo(i*gridSize, canvas.height); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i*gridSize); ctx.lineTo(canvas.width, i*gridSize); ctx.stroke();
  }

  drawFood();
  drawSnake();
  moveSnake();
}

document.addEventListener("keydown", (event) => {
  switch(event.key) {
    case "ArrowUp":
      if (dy !== 1) { nextDx = 0; nextDy = -1; }
      break;
    case "ArrowDown":
      if (dy !== -1) { nextDx = 0; nextDy = 1; }
      break;
    case "ArrowLeft":
      if (dx !== 1) { nextDx = -1; nextDy = 0; }
      break;
    case "ArrowRight":
      if (dx !== -1) { nextDx = 1; nextDy = 0; }
      break;
    case " ":
      event.preventDefault();
      paused = !paused;
      pauseOverlay.classList.toggle("visible", paused);
      
      if (paused) {
          pauseSound.play().catch(() => {});
          if (backgroundMusic) backgroundMusic.pause();
      } else {
          if (backgroundMusic) backgroundMusic.play().catch(() => {});
      }
      break;
  }
});

window.togglePause = function() {
    paused = !paused;
    pauseOverlay.classList.toggle("visible", paused);
    const btn = document.getElementById("mobilePauseBtn");
    if (btn) btn.textContent = paused ? "Resume Game" : "Pause Game";
    
    if (paused) {
        pauseSound.play().catch(() => {});
        if (backgroundMusic) backgroundMusic.pause();
    } else {
        if (backgroundMusic) backgroundMusic.play().catch(() => {});
    }
}

window.handleMobileMove = function(dir) {
    if (paused) return;
    switch(dir) {
        case 'up': if (dy !== 1) { nextDx = 0; nextDy = -1; } break;
        case 'down': if (dy !== -1) { nextDx = 0; nextDy = 1; } break;
        case 'left': if (dx !== 1) { nextDx = -1; nextDy = 0; } break;
        case 'right': if (dx !== -1) { nextDx = 1; nextDy = 0; } break;
    }
}

gameLoop = setInterval(draw, 100); // 10 FPS