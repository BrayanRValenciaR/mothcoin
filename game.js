const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const tapLeft = document.getElementById("tapLeft");
const tapRight = document.getElementById("tapRight");

const W = canvas.width;
const H = canvas.height;

const groundY = H - 40;

const player = {
x:80,
y:groundY-40,
w:32,
h:40,
vy:0,
onGround:true
};

let obstacles=[];
let speed=6;
let gravity=0.75;
let jumpPower=13;

let spawnTimer=0;
let spawnEvery=70;

let score=0;
let best=0;

let gameStarted=false;
let gameOver=false;

function rectsOverlap(a,b){

return(
a.x < b.x + b.w &&
a.x + a.w > b.x &&
a.y < b.y + b.h &&
a.y + a.h > b.y
);

}

function resetGame(){

obstacles=[];
speed=6;
score=0;
spawnTimer=0;
gameOver=false;

player.y=groundY-40;
player.vy=0;
player.onGround=true;

}

function jump(){

if(!gameStarted){

gameStarted=true;
return;

}

if(gameOver){

resetGame();
return;

}

if(player.onGround){

player.vy=-jumpPower;
player.onGround=false;

}

}

tapLeft.addEventListener("touchstart",jump);
tapRight.addEventListener("touchstart",jump);

tapLeft.addEventListener("mousedown",jump);
tapRight.addEventListener("mousedown",jump);

function spawnObstacle(){

obstacles.push({

x:W,
y:groundY-30,
w:20,
h:30

});

}

function update(){

if(!gameStarted)return;

if(gameOver)return;

player.vy+=gravity;
player.y+=player.vy;

if(player.y+player.h>=groundY){

player.y=groundY-player.h;
player.vy=0;
player.onGround=true;

}

spawnTimer++;

if(spawnTimer>spawnEvery){

spawnTimer=0;
spawnObstacle();

}

for(let o of obstacles){

o.x-=speed;

if(rectsOverlap(player,o)){

gameOver=true;

}

}

obstacles=obstacles.filter(o=>o.x+o.w>0);

score++;

if(score>best){

best=score;

}

}

function draw(){

ctx.clearRect(0,0,W,H);

ctx.fillStyle="#333";
ctx.fillRect(0,groundY,W,2);

ctx.fillStyle="black";
ctx.fillRect(player.x,player.y,player.w,player.h);

ctx.fillStyle="green";

for(let o of obstacles){

ctx.fillRect(o.x,o.y,o.w,o.h);

}

ctx.fillStyle="black";
ctx.fillText("Score "+score,10,20);
ctx.fillText("Best "+best,10,40);

if(gameOver){

ctx.fillText("Game Over",160,200);
ctx.fillText("Tap to play again",140,220);

}

}

function loop(){

update();
draw();
requestAnimationFrame(loop);

}

loop();
