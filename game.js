const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const moth1 = new Image();
const moth2 = new Image();
const moth3 = new Image();

moth1.src = "moth1.png";
moth2.src = "moth2.png";
moth3.src = "moth3.png";

const mothFrames = [moth1, moth2, moth3];
let mothFrame = 0;
let mothFrameTimer = 0;

const menuUI = document.getElementById("menuUI");
const controls = document.getElementById("controls");

const playBtn = document.getElementById("playBtn");
const jumpBtn = document.getElementById("jumpBtn");
const darkToggle = document.getElementById("darkToggle");

const W = canvas.width;
const H = canvas.height;

const groundY = H - 120;

let scene = "menu"; // menu | game | gameover

const player = {
  x: 68,
  y: groundY - 42,
  w: 34,
  h: 42,
  vy: 0,
  onGround: true
};

let obstacles = [];
let speed = 6;
let gravity = 0.75;
let jumpPower = 13;
let spawnTimer = 0;
let spawnEvery = 85;
let score = 0;
let best = Number(localStorage.getItem("mothcoin-best") || 0);

function setTheme() {
  if (darkToggle.checked) {
    document.body.classList.add("dark");
  } else {
    document.body.classList.remove("dark");
  }
}

darkToggle.addEventListener("change", setTheme);

function showMenuUI(show) {
  menuUI.style.display = show ? "flex" : "none";
}

function showControls(show) {
  controls.classList.toggle("show", show);
}

function resetGame() {
  obstacles = [];
  speed = 6;
  spawnEvery = 85;
  spawnTimer = 0;
  score = 0;

  player.x = 68;
  player.y = groundY - player.h;
  player.vy = 0;
  player.onGround = true;
}

function startGame() {
  resetGame();
  scene = "game";
  showMenuUI(false);
  showControls(true);
}

function goToMenu() {
  scene = "menu";
  showMenuUI(true);
  showControls(false);
}

function jump() {
  if (scene === "menu") {
    startGame();
    return;
  }

  if (scene === "gameover") {
    startGame();
    return;
  }

  if (scene !== "game") return;

  if (player.onGround) {
    player.vy = -jumpPower;
    player.onGround = false;
  }
}

playBtn.addEventListener("click", startGame);

jumpBtn.addEventListener("pointerdown", (e) => {
  e.preventDefault();
  jump();
});

window.addEventListener("keydown", (e) => {
  if (e.code === "Space" || e.code === "ArrowUp") {
    e.preventDefault();
    if (!e.repeat) jump();
  }
});

function rectsOverlap(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

function spawnObstacle() {
  const sizeRoll = Math.random();

  if (sizeRoll < 0.5) {
    obstacles.push({
      x: W + 20,
      y: groundY - 30,
      w: 22,
      h: 30
    });
  } else {
    obstacles.push({
      x: W + 20,
      y: groundY - 42,
      w: 18,
      h: 42
    });
  }
}

function updateDifficulty() {
  speed = 6 + Math.min(4, Math.floor(score / 250) * 0.35);
  spawnEvery = Math.max(52, 85 - Math.floor(score / 180) * 2);
}

function updateGame() {
  updateDifficulty();

  player.vy += gravity;
  player.y += player.vy;

  if (player.y + player.h >= groundY) {
    player.y = groundY - player.h;
    player.vy = 0;
    player.onGround = true;
  }

  spawnTimer++;
  if (spawnTimer >= spawnEvery) {
    spawnTimer = 0;
    spawnObstacle();
  }

  for (let i = 0; i < obstacles.length; i++) {
    const o = obstacles[i];
    o.x -= speed;

    if (rectsOverlap(player, o)) {
      scene = "gameover";
      showControls(true);

      if (score > best) {
        best = score;
        localStorage.setItem("mothcoin-best", best);
      }
    }
  }

  obstacles = obstacles.filter((o) => o.x + o.w > 0);

  if (scene === "game") {
    score++;

    if (score > best) {
      best = score;
      localStorage.setItem("mothcoin-best", best);
    }
  }
}

function drawSky() {
  const dark = document.body.classList.contains("dark");

  ctx.fillStyle = dark ? "#1a1a1a" : "#ececec";
  ctx.fillRect(0, 0, W, H);

  ctx.beginPath();
  ctx.fillStyle = dark ? "#d9d9a8" : "#e6ea6d";
  ctx.arc(W - 72, 78, 30, 0, Math.PI * 2);
  ctx.fill();

  drawCloud(70, 150, 1.1);
  drawCloud(250, 170, 0.8);
  drawCloud(345, 330, 1.3);
  drawCloud(60, 460, 0.95);
}

function drawCloud(x, y, scale) {
  const dark = document.body.classList.contains("dark");

  ctx.fillStyle = dark ? "#8a8a8a" : "#ffffff";

  ctx.beginPath();

  // left puff
  ctx.arc(x - 28 * scale, y + 6 * scale, 18 * scale, 0, Math.PI * 2);

  // middle puffs
  ctx.arc(x - 8 * scale, y - 4 * scale, 22 * scale, 0, Math.PI * 2);
  ctx.arc(x + 16 * scale, y - 2 * scale, 20 * scale, 0, Math.PI * 2);

  // right puff
  ctx.arc(x + 38 * scale, y + 8 * scale, 16 * scale, 0, Math.PI * 2);

  ctx.fill();
}

function drawGround() {
  const dark = document.body.classList.contains("dark");

  ctx.strokeStyle = dark ? "#d0d0d0" : "#5a5a5a";
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.moveTo(0, groundY);
  ctx.lineTo(W, groundY);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, groundY + 34);
  ctx.lineTo(W, groundY + 34);
  ctx.stroke();

  for (let i = 0; i < 40; i++) {
    const x = (i * 18 + (scene === "game" ? score * 0.8 : 0)) % (W + 20);
    const drawX = W - x;
    ctx.fillStyle = dark ? "#bdbdbd" : "#727272";
    ctx.fillRect(drawX, groundY + 18 + (i % 3), 3, 2);
  }
}

function drawFence() {
  const dark = document.body.classList.contains("dark");
  const baseX = 240;
  const baseY = groundY;

  ctx.strokeStyle = dark ? "#bbbbbb" : "#9b9b9b";
  ctx.lineWidth = 3;

  ctx.strokeRect(baseX, baseY - 54, 110, 50);

  for (let i = 1; i < 4; i++) {
    const x = baseX + i * 27;
    ctx.beginPath();
    ctx.moveTo(x, baseY - 58);
    ctx.lineTo(x, baseY);
    ctx.stroke();
  }

  for (let i = 1; i < 3; i++) {
    const y = baseY - i * 16;
    ctx.beginPath();
    ctx.moveTo(baseX, y);
    ctx.lineTo(baseX + 110, y);
    ctx.stroke();
  }
}

function drawDecorCactus(x, h) {
  const dark = document.body.classList.contains("dark");
  ctx.fillStyle = dark ? "#dddddd" : "#585858";

  const y = groundY - h;

  ctx.fillRect(x, y, 10, h);
  ctx.fillRect(x - 8, y + 18, 8, 10);
  ctx.fillRect(x + 10, y + 10, 8, 10);
}

function drawRocks() {
  const dark = document.body.classList.contains("dark");
  ctx.fillStyle = dark ? "#cfcfcf" : "#686868";

  ctx.fillRect(185, groundY - 6, 20, 6);
  ctx.fillRect(188, groundY - 12, 12, 6);

  ctx.fillRect(394, groundY - 8, 18, 8);
  ctx.fillRect(404, groundY - 14, 10, 6);

  ctx.fillRect(154, groundY - 4, 6, 4);
}

function drawMenuScene() {
  drawSky();
  drawGround();
  drawFence();
  drawDecorCactus(90, 34);
  drawDecorCactus(365, 42);
  drawDecorCactus(389, 26);
  drawRocks();

  const dark = document.body.classList.contains("dark");
  ctx.fillStyle = dark ? "#e9e9e9" : "#4c4c4c";

  const dx = 28;
  const dy = groundY - 38;

  ctx.fillRect(dx, dy, 22, 24);
  ctx.fillRect(dx + 12, dy - 12, 14, 14);
  ctx.fillRect(dx + 4, dy + 24, 5, 16);
  ctx.fillRect(dx + 14, dy + 24, 5, 16);
  ctx.fillRect(dx - 10, dy + 8, 10, 5);

  ctx.fillStyle = dark ? "#1a1a1a" : "#ececec";
  ctx.fillRect(dx + 20, dy - 8, 2, 2);
}

function drawPlayer() {
  mothFrameTimer++;

  if (mothFrameTimer > 6) {
    mothFrameTimer = 0;
    mothFrame++;

    if (mothFrame >= mothFrames.length) {
      mothFrame = 0;
    }
  }

  const img = mothFrames[mothFrame];

  if (img.complete && img.naturalWidth > 0) {
    ctx.drawImage(img, player.x, player.y, player.w, player.h);
  } else {
    const dark = document.body.classList.contains("dark");
    ctx.fillStyle = dark ? "#f1f1f1" : "#303030";
    ctx.fillRect(player.x, player.y, player.w, player.h);
  }
}

function drawObstacles() {
  const dark = document.body.classList.contains("dark");
  ctx.fillStyle = dark ? "#f1f1f1" : "#3f3f3f";

  for (let i = 0; i < obstacles.length; i++) {
    const o = obstacles[i];
    ctx.fillRect(o.x, o.y, o.w, o.h);
    ctx.fillRect(o.x - 6, o.y + 14, 6, 8);
    ctx.fillRect(o.x + o.w, o.y + 8, 6, 8);
  }
}

function drawHud() {
  const dark = document.body.classList.contains("dark");
  ctx.fillStyle = dark ? "#f1f1f1" : "#2b2b2b";
  ctx.font = "bold 18px Arial";
  ctx.fillText("SCORE " + score, 16, 34);
  ctx.fillText("BEST " + best, 16, 58);
}

function drawGameOverText() {
  if (scene !== "gameover") return;

  const dark = document.body.classList.contains("dark");

  ctx.fillStyle = dark ? "rgba(0,0,0,0.38)" : "rgba(255,255,255,0.45)";
  ctx.fillRect(60, 230, 300, 110);

  ctx.strokeStyle = dark ? "#dddddd" : "#444444";
  ctx.lineWidth = 2;
  ctx.strokeRect(60, 230, 300, 110);

  ctx.fillStyle = dark ? "#f1f1f1" : "#222222";
  ctx.textAlign = "center";

  ctx.font = "bold 26px Arial";
  ctx.fillText("GAME OVER", W / 2, 273);

  ctx.font = "bold 16px Arial";
  ctx.fillText("Press JUMP to restart", W / 2, 308);

  ctx.textAlign = "left";
}

function drawGameScene() {
  drawSky();
  drawGround();
  drawPlayer();
  drawObstacles();
  drawHud();
  drawGameOverText();
}

function update() {
  if (scene === "game") {
    updateGame();
  }
}

function draw() {
  if (scene === "menu") {
    drawMenuScene();
  } else {
    drawGameScene();
  }
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

setTheme();
goToMenu();
loop();
