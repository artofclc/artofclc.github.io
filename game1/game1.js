var ballx = 300;
var bally = 300;
var ballSize = 40;
var score = 0;
var gameState = "L1";

function setup() {
  createCanvas(600, 600);
  textAlign(CENTER);
  textSize(20);
}

function draw() {
  background(220);
  if (gameState == "L1") {
    levelOne();
  } 
  if (gameState == "L2") {
    levelTwo(); 
  }
  if (gameState == "L3") {
    levelThree(); 
  }
  
  text(("Score: " + score), width / 2, 40);
}

function levelOne() {
  text("Level 1", width / 2, height - 20);
  var distToBall = dist(ballx, bally, mouseX, mouseY);
  if (distToBall < ballSize / 2) {
    ballx = random(width);
    bally = random(height);
    score = score + 1;
  }
  if (score > 5) {
    gameState = "L2";
  }
  
  ellipse(ballx, bally, ballSize, ballSize);
  line(ballx, bally, mouseX, mouseY);
}

function levelTwo() {
  background(200, 100, 0);
  text("Level 2", width / 2, height - 20);
  var distToBall = dist(ballx, bally, mouseX, mouseY);
  if (distToBall < ballSize / 2) {
    ballx = random(width);
    bally = random(height);
    score = score + 1;
  }
  if (score > 10) {
    gameState = "L3";
  }
  
  ellipse(ballx, bally, ballSize, ballSize);
}

function levelThree() {
  background(200, 100, 2000);
  text("Level 3", width / 2, height - 20);
  var distToBall = dist(ballx, bally, mouseX, mouseY);
  if (distToBall < ballSize / 2) {
    ballx = random(width);
    bally = random(height);
    ballSize = ballSize - 1;
    score = score + 1;
  }
  if (score > 15) {
    // gameState = "L4";
  }
  
  ellipse(ballx, bally, ballSize, ballSize);
}
