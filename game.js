const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

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
let spawnEvery = 70; // frames
let score = 0;
let best = 0;
let gameOver = false;

// Utilities
function rectsOverlap(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

function resetGame() {
  obstacles = [];
  speed = 6;
  spawnTimer = 0;
  spawnEvery = 70;
  score = 0;
  gameOver = false;

  player.y = groundY - player.h;
  player.vy = 0;
  player.onGround = true;
}

function jump() {
  if (gameOver) return;
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
  // Simple cactus block
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
  if (gameOver) return;

  // Player physics
  player.vy += gravity;
  player.y += player.vy;

  if (player.y >= groundY - player.h) {
    player.y = groundY - player.h;
    player.vy = 0;
    player.onGround = true;
  }

  // Spawn logic
  spawnTimer++;
  if (spawnTimer >= spawnEvery) {
    spawnTimer = 0;
    spawnObstacle();

    // Randomize spawn gap a bit
    spawnEvery = 55 + Math.floor(Math.random() * 40);
  }

  // Move obstacles
  for (const o of obstacles) {
    o.x -= speed;
    if (!o.passed && o.x + o.w < player.x) {
      o.passed = true;
      score += 1;
      if (score % 10 === 0) speed += 0.6; // ramp difficulty
    }
  }

  // Remove offscreen
  obstacles = obstacles.filter((o) => o.x + o.w > -40);

  // Collision
  for (const o of obstacles) {
    if (rectsOverlap(player, o)) {
      gameOver = true;
      best = Math.max(best, score);
      break;
    }
  }
}

// Draw
function draw() {
  ctx.clearRect(0, 0, W, H);

  // Sky-ish background
  ctx.fillStyle = "#101418";
  ctx.fillRect(0, 0, W, H);

  // Ground line
  ctx.strokeStyle = "#444";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  ctx.lineTo(W, groundY);
  ctx.stroke();

  // Player
  ctx.fillStyle = "#eaeaea";
  ctx.drawimage(playerimg, player.x, player.y, player.w, player.h);

  // Obstacles
  ctx.fillStyle = "#4cff7a";
  for (const o of obstacles) {
    ctx.drawimage(o.x, o.y, o.w, o.h);
  }

  // HUD
  ctx.fillStyle = "#cfcfcf";
  ctx.font = "16px system-ui, Arial";
  ctx.fillText(`Score: ${score}`, 16, 26);
  ctx.fillText(`Best: ${best}`, 16, 48);

  if (gameOver) {
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = "#fff";
    ctx.font = "bold 30px system-ui, Arial";
    ctx.fillText("Game Over", W / 2 - 90, H / 2 - 10);

    ctx.font = "16px system-ui, Arial";
    ctx.fillText("Press R to restart", W / 2 - 75, H / 2 + 22);
  }
}

// Loop
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

resetGame();
loop();
