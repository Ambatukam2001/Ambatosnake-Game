const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const grid = 20;
let snake = [{ x: 1, y: 1 }];
let dx = 0;
let dy = 0;
let food = { x: Math.floor(Math.random() * grid), y: Math.floor(Math.random() * grid) };
let score = 0;
const scoreDisplay = document.getElementById("scoreValue");
let paused = false;

const snakeHeadImg = new Image();
snakeHeadImg.src = "file/omaygot.jpg";

const headSize = 150;

function drawSnake() {
  snake.forEach((segment, index) => {
    if (index === 0) {
      ctx.drawImage(snakeHeadImg, segment.x * grid, segment.y * grid, grid, grid);
    } else {
      ctx.fillStyle = "green";
      ctx.fillRect(segment.x * grid, segment.y * grid, grid, grid);
    }
  });
}

function drawFood() {
  ctx.fillStyle = "red";
  ctx.fillRect(food.x * grid, food.y * grid, grid, grid);
}

function moveSnake() {
  const head = { x: snake[0].x + dx, y: snake[0].y + dy };
  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score++;
    scoreDisplay.textContent = score;
    food = { x: Math.floor(Math.random() * grid), y: Math.floor(Math.random() * grid) };
  } else {
    snake.pop();
  }
}

function checkCollision() {
  if (
    snake[0].x < 0 ||
    snake[0].x >= grid ||
    snake[0].y < 0 ||
    snake[0].y >= grid ||
    snake.slice(1).some((segment) => segment.x === snake[0].x && segment.y === snake[0].y)
  ) {
    return true;
  }
  return false;
}

function draw() {
  if (checkCollision()) {
    window.location.href = "gameover.html";
    clearInterval(gameLoop);
  }

  if (!paused) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawSnake();
    drawFood();
    moveSnake();
  }
}

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowUp" && dy !== 1) {
    dx = 0;
    dy = -1;
  } else if (event.key === "ArrowDown" && dy !== -1) {
    dx = 0;
    dy = 1;
  } else if (event.key === "ArrowLeft" && dx !== 1) {
    dx = -1;
    dy = 0;
  } else if (event.key === "ArrowRight" && dx !== -1) {
    dx = 1;
    dy = 0;
  } else if (event.key === " ") { 
    paused = !paused;
  }
});

const gameLoop = setInterval(draw, 150);