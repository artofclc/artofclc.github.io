var ballx = 300;
var bally = 300;
var ballSize = 40;
var score = 0;
var gameState = "title";
var playButton;

function preload() {
  tt = loadImage('https://artofclc.github.io/game1/title.png');
  bg1 = loadImage('https://artofclc.github.io/game1/watersand.jpg');
  bg2 = loadImage('https://artofclc.github.io/game1/water.jpg');
  bg3 = loadImage('https://artofclc.github.io/game1/sand.jpg');
  ck = loadImage('https://artofclc.github.io/game1/coke.png');
  bag = loadImage('https://artofclc.github.io/game1/bag.png');
  btl = loadImage('https://artofclc.github.io/game1/bottle.png');
  fin =  loadImage('https://artofclc.github.io/game1/fin.jpg');
}

function setup() {
  var canvas = createCanvas(windowWidth * 0.8, windowHeight * 0.8);
  canvas.position(windowWidth * 0.1, windowHeight * 0.1);
  textAlign(CENTER);
  textSize(width / 30);
}

function draw() {
  if (gameState == "title") {
    titlePage();
  } else {
    background(220);
    image(bg1, 0, 0, width, height);
    if (gameState == "L1") {
      levelOne();
    } else if (gameState == "L2") {
      levelTwo();
    } else if (gameState == "L3") {
      levelThree();
    } else if (gameState == "win") {
      winPage();
    }
    textSize(width / 30); // Set the font size for the score
    text("Score: " + score, width / 2, height / 8);
  }
}

function titlePage() {
  image(tt, 0, 0, width, height);
  fill(255);
  textSize(width / 15);
  text("Coastal Clean Up", width / 2, height / 4.6 );
  textSize(width / 25);
  text("Collect pieces of trash in the ocean to win!", width / 2, height / 3);
  if (!playButton) {
    playButton = createButton('Play');
    playButton.style('font-size', '24px');
    playButton.size(width / 5, height / 10);
    playButton.position((windowWidth - playButton.width) / 2, (windowHeight - playButton.height) / 2);
    playButton.mousePressed(startGame);
  }
}

function startGame() {
  playButton.remove();
  gameState = "L1";
}

function levelOne() {
  text("Level 1", width / 2, height - height / 20);
  var distToBall = dist(ballx, bally, mouseX, mouseY);
  if (distToBall < ballSize / 2) {
    ballx = random(width);
    bally = random(height);
    score += 1;
  }
  if (score >= 5) {
    gameState = "L2";
    ballSize = 40;
  }
  image(ck, ballx - ballSize * 1.5, bally - ballSize * 1.5, ballSize * 3, ballSize * 3);
  line(ballx, bally, mouseX, mouseY);
}

function levelTwo() {
  background(200, 100, 0);
  image(bg2, 0, 0, width, height);
  text("Level 2", width / 2, height - height / 20);
  var distToBall = dist(ballx, bally, mouseX, mouseY);
  if (distToBall < ballSize / 2) {
    ballx = random(width);
    bally = random(height);
    score += 1;
  }
  if (score >= 15) {
    gameState = "L3";
    ballSize = 40;
  }
  image(bag, ballx - ballSize * 1.5, bally - ballSize * 1.5, ballSize * 3, ballSize * 3);
}

function levelThree() {
  background(200, 100, 200);
  image(bg3, 0, 0, width, height);
  text("Level 3", width / 2, height - height / 20);
  var distToBall = dist(ballx, bally, mouseX, mouseY);
  if (distToBall < ballSize / 2) {
    ballx = random(width);
    bally = random(height);
    score += 1;
  }
  if (score >= 20) {
    gameState = "win";
  }
  image(btl, ballx - ballSize * 1.5, bally - ballSize * 1.5, ballSize * 3, ballSize * 3);
}

function winPage() {
  background(220);
  image(fin, 0, 0, width, height);
  textSize(width / 20);
  text("You won! Thanks for cleaning up!", width / 2, height / 2.5 );
  if (!playButton) {
    playButton = createButton('Restart');
    playButton.style('font-size', '24px');
    playButton.size(width / 5, height / 10);
    playButton.position((windowWidth - playButton.width) / 2, height / 1.8);
    playButton.mousePressed(restartGame);
  }
}

function restartGame() {
  gameState = "title";
  score = 0;
  ballSize = 40;
}
