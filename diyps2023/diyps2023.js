var initials = 'cc'; // your initials
var screenbg = 200; // off white background
var lastscreenshot = 61; // last screenshot never taken
var undoStack = []; // array to store undo states
var redoStack = []; // array to store redo states
var currentColor = '#000000'; // initial color
var currentTool = '1'; // initial tool
var currentSize = 10; // initial brush size
var hueJitterRange = 0; // initial hue jitter range
var eraserColor = ''; // initialize eraser color as an empty string
var hasMouseBeenReleased = true; // added flag for mouse release
var currentOpacity = 255; // initial brush opacity
var pointerPressure = 1;

let brushTexture;

function preload() {
  brushTexture= loadImage('https://artofclc.github.io/diyps2023/b1.png');
}

function setup() {
var canvas = createCanvas(800, 800);
canvas.parent('canvas-container');
background(screenbg);
saveState(); // save initial state

eraserColor = color(screenbg); // set eraser color to match background color

// Add event listeners for buttons
// Hue jitter event listener
document.querySelector('#hueJitter').addEventListener('input', function (event) {
hueJitterRange = parseInt(event.target.value, 10);
});
document.getElementById('toolSelector').addEventListener('change', function() {
  currentTool = this.value;
});
document.querySelector('#undoButton').addEventListener('click', function () {
undo();
updateButtonStates();
});

document.querySelector('#redoButton').addEventListener('click', function () {
redo();
updateButtonStates();
});

document.querySelector('#clearButton').addEventListener('click', function () {
background(screenbg);
saveState();
updateButtonStates();
});

document.querySelector('#saveButton').addEventListener('click', function () {
saveState(); // save current state before calling saveme
saveme();
});

// Color picker event listener
document.querySelector('#colorPicker').addEventListener('input', function (event) {
currentColor = event.target.value;
});

// Tool selector event listener
document.querySelector('#toolSelector').addEventListener('change', function (event) {
currentTool = event.target.value;
});
document.querySelectorAll('input[name="brushType"]').forEach(function (radio) {
radio.addEventListener('change', function (event) {
currentBrushType = event.target.value;
});
});
// Brush size event listener
document.querySelector('#brushSize').addEventListener('change', function (event) {
currentSize = parseInt(event.target.value, 10);
});
document.querySelector('#opacitySlider').addEventListener('input', function (event) {
currentOpacity = parseInt(event.target.value, 10);
});
document.getElementById('eraserButton').addEventListener('click', function () {
currentTool = '1'; // Set the tool to line (which will work as an eraser)
currentColor = eraserColor; // Set the current color to the eraser color
});
canvas.elt.addEventListener('pointerdown', function (event) {
if (event.pointerType === 'pen') {
event.target.setPointerCapture(event.pointerId);
}
});

canvas.elt.addEventListener('pointermove', function (event) {
if (event.pointerType === 'pen') {
pointerPressure = event.pressure;
}
});

canvas.elt.addEventListener('pointerup', function (event) {
if (event.pointerType === 'pen') {
event.target.releasePointerCapture(event.pointerId);
}
});

updateButtonStates(); // Initialize button states
}customDrawingLoop();

function draw() {
  if (mouseIsPressed) {
    if (isMouseInsideCanvas()) {
      if (!isMouseOverElement(document.querySelector('#canvas-container'))) {
        return;
      }
      if (currentTool === '3') { // using eraser
        applyTool('1', eraserColor); // use basic brush with eraser color
      } else {
        applyTool(currentTool, currentColor); // Call applyTool with the current tool and color
      }
      updateButtonStates(); // Update button states after applying tool
    }
  }
}

function keyPressed() {
if (key === 'z' || key === 'Z') {
undo();
} else if (key === 'y' || key === 'Y') {
redo();
}
updateButtonStates();
}

function isMouseOverElement(element) {
const rect = element.getBoundingClientRect();
return (
mouseX >= rect.left &&
mouseX <= rect.right &&
mouseY >= rect.top &&
mouseY <= rect.bottom
);
}

function isMouseInsideCanvas() {
return (
mouseX >= 0 &&
mouseX <= width &&
mouseY >= 0 &&
mouseY <= height
);
}
function mousePressed() {
if (isMouseInsideCanvas() && hasMouseBeenReleased) {
saveState(); // Save state when mouse is initially pressed
hasMouseBeenReleased = false;
}
}

function mouseReleased() {
hasMouseBeenReleased = true;
}
function saveState() {
undoStack.push(get()); // add current state to undo stack
if (undoStack.length > 20) { // limit undo stack to 20 states
undoStack.shift(); // remove the oldest state
}
redoStack = []; // clear redo stack
}

function undo() {
if (undoStack.length > 1) {
redoStack.push(undoStack.pop()); // move current state to redo stack
background(screenbg);
image(undoStack[undoStack.length - 1], 0, 0); // draw previous state on canvas
}
}

function redo() {
if (redoStack.length > 0) {
undoStack.push(redoStack.pop()); // move current state to undo stack
background(screenbg);
image(undoStack[undoStack.length - 1], 0, 0); // draw previous state on canvas
updateButtonStates(); // Add this line to update the button states after performing redo
}
}

function updateButtonStates() {
document.querySelector('#undoButton').disabled = undoStack.length <= 1;
document.querySelector('#redoButton').disabled = redoStack.length === 0;
}

function getPointerPressure() {
if (mouseIsPressed) {
return pointerPressure;
} else {
return 1;
}
}
function customDrawingLoop() {
requestAnimationFrame(customDrawingLoop);
draw();
}

function applyTool(tool, chosenColor) {
  const pressure = getPointerPressure();
  const adjustedSize = currentSize * pressure;
  const adjustedOpacity = currentOpacity * pressure;

  if (tool === '1') {
    resetMatrix();
    noTint();
    if (chosenColor === eraserColor) {
      colorMode(RGB);
      stroke(screenbg, screenbg, screenbg, adjustedOpacity);
    } else {
      const p5Color = color(chosenColor);
      const r = red(p5Color);
      const g = green(p5Color);
      const b = blue(p5Color);
      colorMode(RGB);
      const jitteredColor = color(
        r + random(-hueJitterRange, hueJitterRange),
        g + random(-hueJitterRange, hueJitterRange),
        b + random(-hueJitterRange, hueJitterRange),
        adjustedOpacity /7
      );
      stroke(jitteredColor);
    }
    strokeWeight(adjustedSize);

    drawSmoothLine(mouseX, mouseY, pmouseX, pmouseY, 50);
  }

  if (tool === '6') {
    push();
    resetMatrix();
    noTint();
    const p5Color = color(chosenColor);
    const r = red(p5Color);
    const g = green(p5Color);
    const b = blue(p5Color);
    colorMode(RGB);

    for (let i = 0; i < 3; i++) {
      const jitteredColor = color(
        r + random(-hueJitterRange, hueJitterRange),
        g + random(-hueJitterRange, hueJitterRange),
        b + random(-hueJitterRange, hueJitterRange),
        adjustedOpacity /7
      );
      stroke(jitteredColor);
      strokeWeight(adjustedSize);

      const offsetX = random(-adjustedSize / 4, adjustedSize / 4);
      const offsetY = random(-adjustedSize / 4, adjustedSize / 4);
      drawSmoothLine(
        mouseX + offsetX,
        mouseY + offsetY,
        pmouseX + offsetX,
        pmouseY + offsetY,
        30
      );
    }

    pop();
  }
}

function drawSmoothLine(x1, y1, x2, y2) {
  const distance = dist(x1, y1, x2, y2);
  const segments = max(2, floor(distance / 2));

  for (let i = 0; i < segments; i++) {
    const startX = lerp(x1, x2, i / segments);
    const startY = lerp(y1, y2, i / segments);
    const endX = lerp(x1, x2, (i + 1) / segments);
    const endY = lerp(y1, y2, (i + 1) / segments);
    line(startX, startY, endX, endY);
  }
}
function saveme() {
saveCanvas(initials + 'drawing' + nf(millis(), 0) + '.jpg');
}
