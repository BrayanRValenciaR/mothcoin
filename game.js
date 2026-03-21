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
const moonBtn = document.getElementById("moonBtn");

const W = canvas.width;
const H = canvas.height;

let darkMode = false;
let scene = "menu";
let isFlapping = false;

let best = Number(localStorage.getItem("mothcoin-glow-best") || 0);
let score = 0;
let missed = 0;
const maxMissed = 5;

const player = {
  x: 110,
  y: H / 2,
  w: 54,
  h: 54,
  vy: 0,
  gravity: 0.22,
  flapPower: -0.42,
  maxFall: 3.2
};

let orbs = [];
let particles = [];
let spawnTimer = 0;
let spawnEvery = 48;

function setTheme() {
  if (darkMode) {
    document.body.classList.add("dark");
  } else {
    document.body.classList.remove("dark");
  }
}

function toggleMoonlight() {
  darkMode = !darkMode;
  setTheme();
}

function showMenuUI(show) {
  menuUI.style.display = show ? "flex" : "none";
}

function showControls(show) {
  controls.classList.toggle("show", show);
}

function resetGame() {
  score = 0;
  missed = 0;
  spawnTimer = 0;
  orbs = [];
  particles = [];
  isFlapping = false;

  player.x = 110;
  player.y = H / 2;
  player.vy = 0;
}

function startGame() {
  resetGame();
  scene = "game";
  showMenuUI(false);
  showControls(true);
}

function endGame() {
  scene = "gameover";
  showControls(true);

  if (score > best) {
    best = score;
    localStorage.setItem("mothcoin-glow-best", best);
  }
}

function flapStart() {
  if (scene === "menu") {
    startGame();
    return;
  }

  if (scene === "gameover") {
    startGame();
    return;
  }

  if (scene !== "game") return;
  isFlapping = true;
}

function flapEnd() {
  isFlapping = false;
}

playBtn.addEventListener("pointerdown", (e) => {
  e.preventDefault();
  startGame();
});

moonBtn.addEventListener("pointerdown", (e) => {
  e.preventDefault();
  toggleMoonlight();
});

jumpBtn.addEventListener("pointerdown", (e) => {
  e.preventDefault();
  flapStart();
});

jumpBtn.addEventListener("pointerup", flapEnd);
jumpBtn.addEventListener("pointerleave", flapEnd);
jumpBtn.addEventListener("pointercancel", flapEnd);

window.addEventListener("keydown", (e) => {
  if (e.code === "Space" || e.code === "ArrowUp") {
    e.preventDefault();
    if (!e.repeat) flapStart();
  }
});

window.addEventListener("keyup", (e) => {
  if (e.code === "Space" || e.code === "ArrowUp") {
    flapEnd();
  }
});

canvas.addEventListener("pointerdown", (e) => {
  if (scene === "menu") {
    startGame();
    return;
  }

  if (scene === "gameover") {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    if (
      x >= W / 2 - 70 &&
      x <= W / 2 + 70 &&
      y >= 355 &&
      y <= 390
    ) {
      toggleMoonlight();
      return;
    }

    startGame();
    return;
  }

  flapStart();
});

canvas.addEventListener("pointerup", flapEnd);
canvas.addEventListener("pointercancel", flapEnd);

function rectsOverlap(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

function spawnOrb() {
  const size = 20 + Math.random() * 14;

  orbs.push({
    x: W + 30,
    y: 80 + Math.random() * (H - 220),
    w: size,
    h: size,
    speed: 2.3 + Math.random() * 1.8,
    bob: Math.random() * Math.PI * 2,
    glow: 0.5 + Math.random() * 0.5
  });
}

function burst(x, y, count) {
  for (let i = 0; i < count; i++) {
    particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 3,
      vy: (Math.random() - 0.5) * 3,
      life: 24 + Math.random() * 14,
      size: 2 + Math.random() * 3
    });
  }
}

function updateGame() {
  if (isFlapping) {
    player.vy += player.flapPower;
  }

  player.vy += player.gravity;
  if (player.vy > player.maxFall) player.vy = player.maxFall;
  if (player.vy < -4.4) player.vy = -4.4;

  player.y += player.vy;

  if (player.y < 24) {
    player.y = 24;
    player.vy = 0.3;
  }

  if (player.y + player.h > H - 70) {
    player.y = H - 70 - player.h;
    player.vy = -0.4;
  }

  spawnTimer++;
  if (spawnTimer >= spawnEvery) {
    spawnTimer = 0;
    spawnOrb();
  }

  for (let i = orbs.length - 1; i >= 0; i--) {
    const orb = orbs[i];
    orb.x -= orb.speed;
    orb.bob += 0.05;
    orb.y += Math.sin(orb.bob) * 0.35;

    if (rectsOverlap(player, orb)) {
      score++;
      burst(orb.x + orb.w / 2, orb.y + orb.h / 2, 10);
      orbs.splice(i, 1);
      continue;
    }

    if (orb.x + orb.w < 0) {
      missed++;
      burst(20, orb.y + orb.h / 2, 6);
      orbs.splice(i, 1);
    }
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life -= 1;
    p.vx *= 0.98;
    p.vy *= 0.98;

    if (p.life <= 0) {
      particles.splice(i, 1);
    }
  }

  if (missed >= maxMissed) {
    endGame();
  }
}

function drawSky() {
  const dark = document.body.classList.contains("dark");

  ctx.fillStyle = dark ? "#241733" : "#9fd8ff";
  ctx.fillRect(0, 0, W, H);

  const gradient = ctx.createLinearGradient(0, 0, 0, H);
  if (dark) {
    gradient.addColorStop(0, "rgba(140,100,200,0.18)");
    gradient.addColorStop(1, "rgba(0,0,0,0)");
  } else {
    gradient.addColorStop(0, "rgba(255,255,255,0.32)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
  }
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, W, H);

  ctx.beginPath();
  ctx.fillStyle = dark ? "#d9d9a8" : "#e6ea6d";
  ctx.arc(W - 72, 78, 30, 0, Math.PI * 2);
  ctx.fill();

  if (dark) {
    ctx.beginPath();
    ctx.fillStyle = "#241733";
    ctx.arc(W - 48, 78, 30, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(120,120,100,0.25)";
    ctx.beginPath();
    ctx.arc(W - 82, 66, 4, 0, Math.PI * 2);
    ctx.arc(W - 92, 84, 3, 0, Math.PI * 2);
    ctx.arc(W - 74, 92, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  drawCloud(70 - cloudOffset * 0.7, 150, 1.1);
  drawCloud(250 - cloudOffset * 1.0, 170, 0.8);
  drawCloud(345 - cloudOffset * 0.5, 330, 1.3);
  drawCloud(60 - cloudOffset * 0.85, 460, 0.95);

  drawCloud(70 - cloudOffset * 0.7 + W + 140, 150, 1.1);
  drawCloud(250 - cloudOffset * 1.0 + W + 140, 170, 0.8);
  drawCloud(345 - cloudOffset * 0.5 + W + 140, 330, 1.3);
  drawCloud(60 - cloudOffset * 0.85 + W + 140, 460, 0.95);
}

function drawCloud(x, y, scale) {
  const dark = document.body.classList.contains("dark");

  let alpha = 1;

  if (x < 80) alpha = x / 80;
  if (x > W - 80) alpha = (W - x) / 80;

  alpha = Math.max(0, Math.min(1, alpha));

  ctx.globalAlpha = alpha;
  ctx.fillStyle = dark ? "#8a8a8a" : "#ffffff";

  ctx.beginPath();
  ctx.arc(x - 28 * scale, y + 6 * scale, 18 * scale, 0, Math.PI * 2);
  ctx.arc(x - 8 * scale, y - 4 * scale, 22 * scale, 0, Math.PI * 2);
  ctx.arc(x + 16 * scale, y - 2 * scale, 20 * scale, 0, Math.PI * 2);
  ctx.arc(x + 38 * scale, y + 8 * scale, 16 * scale, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = 1;
}

function drawGround() {
  const dark = document.body.classList.contains("dark");

  ctx.strokeStyle = dark ? "#d0d0d0" : "#5a5a5a";
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.moveTo(0, H - 60);
  ctx.lineTo(W, H - 60);
  ctx.stroke();

  for (let i = 0; i < 50; i++) {
    const x = (i * 16 + score * 0.7) % (W + 20);
    const drawX = W - x;
    ctx.fillStyle = dark ? "#bdbdbd" : "#727272";
    ctx.fillRect(drawX, H - 40 + (i % 3), 3, 2);
  }
}

function drawOrbs() {
  const dark = document.body.classList.contains("dark");

  for (let i = 0; i < orbs.length; i++) {
    const orb = orbs[i];

    ctx.save();
    ctx.globalAlpha = 0.22 + orb.glow * 0.3;
    ctx.fillStyle = dark ? "#e9d5ff" : "#fff7a8";
    ctx.beginPath();
    ctx.arc(orb.x + orb.w / 2, orb.y + orb.h / 2, orb.w * 0.9, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = dark ? "#f5e8ff" : "#fff1a8";
    ctx.beginPath();
    ctx.arc(orb.x + orb.w / 2, orb.y + orb.h / 2, orb.w / 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = dark ? "#ffffff" : "#fffdf0";
    ctx.beginPath();
    ctx.arc(orb.x + orb.w / 2 - 4, orb.y + orb.h / 2 - 4, orb.w / 7, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawParticles() {
  const dark = document.body.classList.contains("dark");

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    ctx.globalAlpha = Math.max(0, p.life / 38);
    ctx.fillStyle = dark ? "#f0e3ff" : "#fff5a8";
    ctx.fillRect(p.x, p.y, p.size, p.size);
  }

  ctx.globalAlpha = 1;
}

function drawMenuScene() {
  drawSky();
  drawGround();
  drawOrbs();

  const dark = document.body.classList.contains("dark");
  ctx.fillStyle = dark ? "#e9e9e9" : "#4c4c4c";

  const dx = 36;
  const dy = H / 2 - 20;

  ctx.fillRect(dx, dy, 18, 18);
  ctx.fillRect(dx + 18, dy - 10, 14, 14);
  ctx.fillRect(dx - 8, dy + 10, 8, 5);
  ctx.fillRect(dx + 3, dy + 18, 4, 12);
  ctx.fillRect(dx + 13, dy + 18, 4, 12);
}

function drawPlayer() {
  mothFrameTimer++;

  if (mothFrameTimer > 5) {
    mothFrameTimer = 0;
    mothFrame++;
    if (mothFrame >= mothFrames.length) mothFrame = 0;
  }

  const img = mothFrames[mothFrame];

  if (img.complete && img.naturalWidth > 0) {
    ctx.save();
    const tilt = Math.max(-0.35, Math.min(0.35, player.vy * 0.08));
    ctx.translate(player.x + player.w / 2, player.y + player.h / 2);
    ctx.rotate(tilt);
    ctx.drawImage(img, -player.w / 2, -player.h / 2, player.w, player.h);
    ctx.restore();
  } else {
    const dark = document.body.classList.contains("dark");
    ctx.fillStyle = dark ? "#f1f1f1" : "#303030";
    ctx.fillRect(player.x, player.y, player.w, player.h);
  }
}

function drawHud() {
  const dark = document.body.classList.contains("dark");
  ctx.fillStyle = dark ? "#f1f1f1" : "#2b2b2b";
  ctx.font = "bold 18px Arial";
  ctx.fillText("GLOW " + score, 16, 34);
  ctx.fillText("BEST " + best, 16, 58);
  ctx.fillText("MISSED " + missed + "/" + maxMissed, 16, 82);
}

function drawGameOverText() {
  if (scene !== "gameover") return;

  const dark = document.body.classList.contains("dark");

  ctx.fillStyle = dark ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.35)";
  ctx.beginPath();
  ctx.roundRect(50, 230, 320, 165, 18);
  ctx.fill();

  ctx.strokeStyle = dark ? "#cccccc" : "#444444";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(50, 230, 320, 165, 18);
  ctx.stroke();

  ctx.fillStyle = dark ? "#f1f1f1" : "#222222";
  ctx.textAlign = "center";

  ctx.font = "bold 26px Arial";
  ctx.fillText("GAME OVER", W / 2, 270);

  ctx.font = "bold 16px Arial";
  ctx.fillText("Glow Collected: " + score, W / 2, 302);
  ctx.fillText("Tap or Press FLAP to restart", W / 2, 328);

  ctx.strokeStyle = dark ? "#cccccc" : "#444444";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(W / 2 - 70, 355, 140, 35, 12);
  ctx.stroke();

  ctx.fillStyle = dark ? "#f1f1f1" : "#222222";
  ctx.font = "bold 15px Arial";
  ctx.fillText("MOONLIGHT", W / 2, 378);

  ctx.textAlign = "left";
}

function update() {
  cloudOffset += cloudSpeed;
  if (cloudOffset > W + 140) cloudOffset = 0;

  if (scene === "game") {
    updateGame();
  }
}

function draw() {
  drawSky();
  drawGround();

  if (scene === "menu") {
    drawMenuScene();
  } else {
    drawOrbs();
    drawParticles();
    drawPlayer();
    drawHud();
    drawGameOverText();
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
