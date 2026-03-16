diff --git a/game.js b/game.js
index c4a6b371698a88ca3284381eb186f9af61e5c020..1f602230d8ba3c78c2b19f1c507463c18fd9bfaa 100644
--- a/game.js
+++ b/game.js
@@ -1,193 +1,276 @@
 const canvas = document.getElementById("game");
 const ctx = canvas.getContext("2d");
 
-const tapLeft = document.getElementById("tapLeft");
-const tapRight = document.getElementById("tapRight");
+const jumpBtn = document.getElementById("jumpBtn");
+const darkMode = document.getElementById("darkMode");
+const lightMode = document.getElementById("lightMode");
 
 const W = canvas.width;
 const H = canvas.height;
-
 const groundY = H - 40;
 
 const player = {
-x:80,
-y:groundY-40,
-w:32,
-h:40,
+x:70,
+y:groundY-42,
+w:34,
+h:42,
 vy:0,
 onGround:true
 };
 
 let obstacles=[];
+let particles=[];
 let speed=6;
 let gravity=0.75;
 let jumpPower=13;
 
 let spawnTimer=0;
 let spawnEvery=70;
 
 let score=0;
 let best=0;
+let level=1;
 
 let gameStarted=false;
 let gameOver=false;
 
 function rectsOverlap(a,b){
-
 return(
 a.x < b.x + b.w &&
 a.x + a.w > b.x &&
 a.y < b.y + b.h &&
 a.y + a.h > b.y
 );
+}
 
+function setTheme(mode){
+if(mode === "dark"){
+document.body.classList.add("dark");
+}else{
+document.body.classList.remove("dark");
+}
 }
 
-function resetGame(){
+darkMode.addEventListener("click",()=>setTheme("dark"));
+lightMode.addEventListener("click",()=>setTheme("light"));
 
+function resetGame(){
 obstacles=[];
+particles=[];
 speed=6;
+spawnEvery=70;
 score=0;
+level=1;
 spawnTimer=0;
 gameOver=false;
 
-player.y=groundY-40;
+player.y=groundY-player.h;
 player.vy=0;
 player.onGround=true;
-
 }
 
 function jump(){
-
 if(!gameStarted){
-
 gameStarted=true;
 return;
-
 }
 
 if(gameOver){
-
 resetGame();
 return;
-
 }
 
 if(player.onGround){
-
 player.vy=-jumpPower;
 player.onGround=false;
-
+for(let i=0;i<8;i++){
+particles.push({
+x:player.x+8,
+y:groundY-2,
+vx:-Math.random()*2,
+vy:-Math.random()*1.8,
+life:24
+});
+}
+}
 }
 
+jumpBtn.addEventListener("touchstart",jump);
+jumpBtn.addEventListener("mousedown",jump);
+window.addEventListener("keydown",(e)=>{
+if(e.code==="Space" || e.code==="ArrowUp"){
+e.preventDefault();
+jump();
 }
+});
 
-tapLeft.addEventListener("touchstart",jump);
-tapRight.addEventListener("touchstart",jump);
+function spawnObstacle(){
+const typeRoll=Math.random();
 
-tapLeft.addEventListener("mousedown",jump);
-tapRight.addEventListener("mousedown",jump);
+if(typeRoll<0.4){
+obstacles.push({type:"box",x:W,y:groundY-30,w:22,h:30,vy:0});
+return;
+}
 
-function spawnObstacle(){
+if(typeRoll<0.75){
+const tall=42+Math.floor(Math.random()*22);
+obstacles.push({type:"pillar",x:W,y:groundY-tall,w:18,h:tall,vy:0});
+return;
+}
 
 obstacles.push({
-
+type:"hopper",
 x:W,
-y:groundY-30,
-w:20,
-h:30
-
+y:groundY-24,
+w:24,
+h:24,
+vy:-(7+Math.random()*2)
 });
+}
 
+function updateDifficulty(){
+level=1+Math.floor(score/700);
+speed=6+Math.min(5,level*0.45);
+spawnEvery=Math.max(38,70-level*3);
 }
 
 function update(){
-
 if(!gameStarted)return;
-
 if(gameOver)return;
 
+updateDifficulty();
+
 player.vy+=gravity;
 player.y+=player.vy;
 
 if(player.y+player.h>=groundY){
-
 player.y=groundY-player.h;
 player.vy=0;
 player.onGround=true;
-
 }
 
 spawnTimer++;
-
 if(spawnTimer>spawnEvery){
-
 spawnTimer=0;
 spawnObstacle();
-
 }
 
 for(let o of obstacles){
-
 o.x-=speed;
 
-if(rectsOverlap(player,o)){
+if(o.type==="hopper"){
+o.vy+=0.45;
+o.y+=o.vy;
+if(o.y+o.h>=groundY){
+o.y=groundY-o.h;
+o.vy=-(6+Math.random()*1.5);
+}
+}
 
+if(rectsOverlap(player,o)){
 gameOver=true;
-
+}
 }
 
+for(let p of particles){
+p.x+=p.vx;
+p.y+=p.vy;
+p.vy+=0.08;
+p.life--;
 }
 
+particles=particles.filter(p=>p.life>0);
 obstacles=obstacles.filter(o=>o.x+o.w>0);
 
 score++;
+if(score>best){best=score;}
+}
 
-if(score>best){
+function drawBackground(){
+ctx.clearRect(0,0,W,H);
 
-best=score;
+const isDark=document.body.classList.contains("dark");
+ctx.fillStyle=isDark?"#171b24":"#f4f8ff";
+ctx.fillRect(0,0,W,H);
 
+ctx.fillStyle=isDark?"#2a3040":"#d8e7ff";
+for(let i=0;i<7;i++){
+const x=(i*78 + (score*0.22)%78)%(W+50)-50;
+const y=35+(i%3)*26;
+ctx.fillRect(x,y,26,10);
+ctx.fillRect(x+10,y-8,22,10);
 }
-
 }
 
-function draw(){
-
-ctx.clearRect(0,0,W,H);
-
-ctx.fillStyle="#333";
+function drawGround(){
+ctx.fillStyle=getComputedStyle(document.body).getPropertyValue('--ground').trim() || "#333";
 ctx.fillRect(0,groundY,W,2);
+}
 
-ctx.fillStyle="black";
+function drawPlayer(){
+ctx.fillStyle=document.body.classList.contains("dark")?"#f3f4f6":"#111";
 ctx.fillRect(player.x,player.y,player.w,player.h);
+ctx.fillStyle="#f59e0b";
+ctx.fillRect(player.x+4,player.y+9,7,7);
+}
 
-ctx.fillStyle="green";
-
+function drawObstacles(){
 for(let o of obstacles){
-
+if(o.type==="box") ctx.fillStyle="#16a34a";
+if(o.type==="pillar") ctx.fillStyle="#15803d";
+if(o.type==="hopper") ctx.fillStyle="#0f766e";
 ctx.fillRect(o.x,o.y,o.w,o.h);
+}
+}
 
+function drawParticles(){
+ctx.fillStyle="#9ca3af";
+for(let p of particles){
+ctx.fillRect(p.x,p.y,3,3);
+}
 }
 
-ctx.fillStyle="black";
+function drawHud(){
+ctx.fillStyle=document.body.classList.contains("dark")?"#e5e7eb":"#111";
+ctx.font="14px sans-serif";
 ctx.fillText("Score "+score,10,20);
 ctx.fillText("Best "+best,10,40);
+ctx.fillText("Level "+level,10,60);
+}
 
-if(gameOver){
+function drawMessages(){
+ctx.fillStyle=document.body.classList.contains("dark")?"#e5e7eb":"#111";
 
-ctx.fillText("Game Over",160,200);
-ctx.fillText("Tap to play again",140,220);
+if(!gameStarted){
+ctx.font="bold 20px sans-serif";
+ctx.fillText("Mothcoin Runner",120,180);
+ctx.font="14px sans-serif";
+ctx.fillText("Press Jump or Space to start",105,208);
+return;
+}
 
+if(gameOver){
+ctx.font="bold 22px sans-serif";
+ctx.fillText("Game Over",140,190);
+ctx.font="14px sans-serif";
+ctx.fillText("Press Jump to play again",120,214);
+}
 }
 
+function draw(){
+drawBackground();
+drawGround();
+drawPlayer();
+drawObstacles();
+drawParticles();
+drawHud();
+drawMessages();
 }
 
 function loop(){
-
 update();
 draw();
 requestAnimationFrame(loop);
-
 }
 
 loop();
