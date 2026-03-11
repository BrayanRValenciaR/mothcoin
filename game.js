const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreText = document.getElementById("scoreText");
const bestText = document.getElementById("bestText");
const panelTitle = document.querySelector(".panel-title");
const panelSubtitle = document.querySelector(".panel-subtitle");

const W = canvas.width;
const H = canvas.height;

// Ground
const groundY = H - 40;

// Player
const player = {
  x: 80,
  y: groundY - 40,
  w: 32,
  h: 40,
  vy: 0,
  onGround: true,
};

// Game state
let obstacles = [];
let speed = 6;
let gravity = 0.75;
let jumpPower = 13;
let spawnTimer = 0;
let spawnEvery = 70;
let score = 0;
let best = 0;
let gameOver = false;
let gameStarted = false;

// Utilities
function rectsOverlap(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

function updatePanel() {
  scoreText.textContent = score;
  bestText.textContent = best;

  if (gameOver) {
    panelTitle.textContent = "Game Over";
    panelSubtitle.textContent = "Tap to play again";
  } else if (!gameStarted) {
    panelTitle.textContent = "Tap to Start";
    panelSubtitle.textContent = "Tap / Space / Up Arrow to Jump";
  } else {
    panelTitle.textContent = "Mothcoin";
    panelSubtitle.textContent = "Stay alive and keep scoring";
  }
}

function resetGame() {
  obstacles = [];
  speed = 6;
  spawnTimer = 0;
  spawnEvery = 70;
  score = 0;
  gameOver = false;
  gameStarted = false;

  player.y = groundY - player.h;
  player.vy = 0;
  player.onGround = true;

  updatePanel();
}

function jump() {
  if (!gameStarted) {
    gameStarted = true;
    updatePanel();
  }

  if (gameOver) {
    resetGame();
    gameStarted = true;
    updatePanel();
    return;
  }

  if (player.onGround) {
    player.vy = -jumpPower;
    player.onGround = false;
  }
}

// Input
window.addEventListener("keydown", (e) => {
  if (e.code === "Space" || e.code === "ArrowUp") jump();
  if (e.code === "KeyR") resetGame();
});

canvas.addEventListener("pointerdown", jump);

// Spawn obstacle
function spawnObstacle() {
  const h = 30 + Math.floor(Math.random() * 35);
  const w = 18 + Math.floor(Math.random() * 18);

  obstacles.push({
    x: W + 20,
    y: groundY - h,
    w,
    h,
    passed: false,
  });
}

// Update
function update() {
  if (!gameStarted || gameOver) return;

  player.vy += gravity;
  player.y += player.vy;

  if (player.y >= groundY - player.h) {
    player.y = groundY - player.h;
    player.vy = 0;
    player.onGround = true;
  }

  spawnTimer++;
  if (spawnTimer >= spawnEvery) {
    spawnTimer = 0;
    spawnObstacle();
    spawnEvery = 55 + Math.floor(Math.random() * 40);
  }

  for (const o of obstacles) {
    o.x -= speed;

    if (!o.passed && o.x + o.w < player.x) {
      o.passed = true;
      score += 1;
      updatePanel();

      if (score % 10 === 0) {
        speed += 0.6;
      }
    }
  }

  obstacles = obstacles.filter((o) => o.x + o.w > -40);

  for (const o of obstacles) {
    if (rectsOverlap(player, o)) {
      gameOver = true;
      best = Math.max(best, score);
      updatePanel();
      break;
    }
  }
}

// Draw
function draw() {
  ctx.clearRect(0, 0, W, H);

  // Background
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, W, H);

  // Ground
  ctx.strokeStyle = "#888";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  ctx.lineTo(W, groundY);
  ctx.stroke();

  // Player
  ctx.fillStyle = "#f5f5f5";
  ctx.fillRect(player.x, player.y, player.w, player.h);

  // Obstacles
  ctx.fillStyle = "#2faa52";
  for (const o of obstacles) {
    ctx.fillRect(o.x, o.y, o.w, o.h);
  }

  // Game over overlay
  if (gameOver) {
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillRect(0, 0, W, H);
  }
}

// Loop
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

resetGame();
updatePanel();
loop();
