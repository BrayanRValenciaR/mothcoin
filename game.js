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

  // HUD
  ctx.fillStyle = "#f5f5f5";
  ctx.font = "16px system-ui, Arial";
  ctx.fillText(`Score: ${score}`, 16, 26);
  ctx.fillText(`Best: ${best}`, 16, 48);

  // Start screen
  if (!gameStarted && !gameOver) {
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 28px system-ui, Arial";
    ctx.fillText("Tap to Start", W / 2 - 75, H / 2 - 10);

    ctx.font = "16px system-ui, Arial";
    ctx.fillText("Tap / Space / Up Arrow to Jump", W / 2 - 115, H / 2 + 22);
  }

  // Game over screen
  if (gameOver) {
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = "#fff";
    ctx.font = "bold 30px system-ui, Arial";
    ctx.fillText("Game Over", W / 2 - 90, H / 2 - 10);

    ctx.font = "16px system-ui, Arial";
    ctx.fillText("Tap to play again", W / 2 - 70, H / 2 + 22);
  }
}
