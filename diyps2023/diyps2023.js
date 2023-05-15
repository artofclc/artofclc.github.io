var initials = 'cc';
var screenbg = 200;
var lastscreenshot = 61;
var undoStack = [];
var redoStack = [];
var currentColor = '#000000';
var currentTool = '1';
var currentSize = 10;
var hueJitterRange = 0;
var eraserColor = '';
var hasMouseBeenReleased = true;
var currentOpacity = 255;
var pointerPressure = 1;
var previousTool = '';
var previousColor = currentColor;
var touchStartedOnCanvas = false;
var touchMoved = false;
var lastTouchX = 0;
var lastTouchY = 0

let brushTexture;

let canvas; 

function setup() {
  const canvasContainer = document.getElementById('canvas-container');
  const availableWidth = canvasContainer.clientWidth;
  const availableHeight = canvasContainer.clientHeight;
  const canvasSize = min(availableWidth, availableHeight);

  canvas = createCanvas(canvasSize, canvasSize);
  canvas.parent('canvas-container');
  background(screenbg);
  saveState();


  // Add the following event listeners to prevent scrolling
  canvas.elt.addEventListener('touchstart', (e) => {
    e.preventDefault();
  }, { passive: false });


  canvas.elt.addEventListener('touchmove', (e) => {
    e.preventDefault();
  }, { passive: false });
  // Center the canvas
   canvas.style('display', 'block');
  canvas.style('margin', 'auto');
  canvas.style('position', 'absolute');
  canvas.style('top', '0');
  canvas.style('bottom', '0');
  canvas.style('left', '0');
  canvas.style('right', '0');

  eraserColor = color(screenbg);
     window.addEventListener('resize', resizeCanvasToFit);
  // Add the following event listeners to prevent scrolling
  canvas.elt.addEventListener('touchstart', (e) => {
    e.preventDefault();
  }, { passive: false });

  canvas.elt.addEventListener('touchmove', (e) => {
    e.preventDefault();
  }, { passive: false });
  document.querySelector('#hueJitter').addEventListener('input', function (event) {
    hueJitterRange = parseInt(event.target.value, 10);
  });

document.querySelector('#toolSelector').addEventListener('change', function (event) {
  if (currentTool === '3') {
    currentColor = previousColor; // Restore the previous color when eraser is deselected
  } else if (event.target.value === '3') {
    previousColor = currentColor; // Store the current color when eraser is selected
  }

  currentTool = event.target.value;
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
    saveState();
    saveme();
  });

  document.querySelector('#colorPicker').addEventListener('input', function (event) {
    currentColor = event.target.value;
  });
  document.getElementById('toolSelector').addEventListener('change', function () {
    const eraserButton = document.getElementById('eraserButton');

    if (currentTool === '3') {
      previousTool = currentTool;
      previousColor = currentColor;
    }

    currentTool = this.value;
    eraserButton.classList.remove('active-tool');
  });

  document.querySelector('#brushSize').addEventListener('change', function (event) {
    currentSize = parseInt(event.target.value, 10);
  });

  document.querySelector('#opacitySlider').addEventListener('input', function (event) {
    currentOpacity = parseInt(event.target.value, 10);
  });

document.getElementById('eraserButton').addEventListener('click', function () {
  const eraserButton = document.getElementById('eraserButton');

  if (currentTool === '3') {
    currentTool = previousTool;
    currentColor = previousColor;
    eraserButton.classList.remove('active-tool');
  } else {
    previousTool = currentTool;
    previousColor = currentColor;
    currentTool = '3';
    eraserButton.classList.add('active-tool');
  }
});

  updateButtonStates();
}
customDrawingLoop();
function resizeCanvasToFit() {
  const size = min(window.innerWidth, window.innerHeight);
  resizeCanvas(size, size);
  background(screenbg);
}

function draw() {
  if (mouseIsPressed || touchStartedOnCanvas) {
    let mouseXToUse = touchStartedOnCanvas ? lastTouchX : mouseX;
    let mouseYToUse = touchStartedOnCanvas ? lastTouchY : mouseY;

    if (isMouseInsideCanvas()) {
      if (currentTool === '3') { // using eraser
        applyTool('1', eraserColor); // use basic brush with eraser color
      } else {
        applyTool(currentTool, currentColor); // Call applyTool with the current tool and color
      }
      updateButtonStates(); // Update button states after applying tool
    }
  } else {
    if (previousTool === '3') {
      currentColor = previousColor; // Restore the previous color when eraser is deselected
      previousTool = '';
    }
    if (currentTool === '3') {
      hasMouseBeenReleased = true; // Reset flag when eraser is deselected
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
    saveState();
    hasMouseBeenReleased = false;
  }
}

function mouseReleased() {
  hasMouseBeenReleased = true;
}

function saveState() {
  undoStack.push(get());
  if (undoStack.length > 20) {
    undoStack.shift();
  }
  redoStack = [];
}

function undo() {
  if (undoStack.length > 1) {
    redoStack.push(undoStack.pop());
    background(screenbg);
    image(undoStack[undoStack.length - 1], 0, 0);
  }
}

function redo() {
  if (redoStack.length > 0) {
    undoStack.push(redoStack.pop());
    background(screenbg);
    image(undoStack[undoStack.length - 1], 0, 0);
    updateButtonStates();
  }
}
function touchStarted() {
  if (isMouseInsideCanvas()) {
    touchStartedOnCanvas = true;
    saveState();
    lastTouchX = touchX;
    lastTouchY = touchY;
  }
}

function touchMoved() {
  touchMoved = true;
  lastTouchX = touchX;
  lastTouchY = touchY;
}

function touchEnded() {
  touchStartedOnCanvas = false;
  touchMoved = false;
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
function gradientEllipse(x, y, d, c) {
  const steps = 50;
  const fromColor = color(c);
  const toColor = color(c);
  toColor.setAlpha(0);

  for (let i = 0; i < steps; i++) {
    const inter = map(i, 0, steps, 0, 1);
    const c = lerpColor(fromColor, toColor, inter);
    const r = inter * (d / 2);
    fill(c);
    noStroke();
    ellipse(x, y, r * 2, r * 2);
  }
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
        adjustedOpacity / 5
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


if (tool === '7') {
  push();
  resetMatrix();
  noTint();
  colorMode(RGB);

  const pencilSize = adjustedSize / 2;
  const numSteps = 20;
  const pencilStrokeColor = color(chosenColor);
  const grainDensity = 5; // Higher value = more graininess

  strokeWeight(1);
  stroke(pencilStrokeColor);

  let prevX = pmouseX;
  let prevY = pmouseY;
  for (let i = 0; i < numSteps; i++) {
    const t = i / (numSteps - 1);
    const currentX = lerp(pmouseX, mouseX, t);
    const currentY = lerp(pmouseY, mouseY, t);

    const stepDistance = dist(prevX, prevY, currentX, currentY);
    const numGrains = stepDistance * grainDensity;

    for (let j = 0; j < numGrains; j++) {
      const lerpAmount = j / numGrains;
      const grainX = lerp(prevX, currentX, lerpAmount) + random(-pencilSize / 4, pencilSize / 4);
      const grainY = lerp(prevY, currentY, lerpAmount) + random(-pencilSize / 4, pencilSize / 4);

      const taperFactor = min(lerpAmount, 1 - lerpAmount) * 2; // Factor to create a tapered effect at the ends of the stroke
      const adjustedPencilSize = pencilSize * taperFactor;
      const offsetX = random(-adjustedPencilSize / 4, adjustedPencilSize / 4);
      const offsetY = random(-adjustedPencilSize / 4, adjustedPencilSize / 4);

      const alphaValue = map(random(1), 0, 1, adjustedOpacity * 0.7, adjustedOpacity); // Random alpha for realistic pencil effect
      const finalColor = color(red(pencilStrokeColor), green(pencilStrokeColor), blue(pencilStrokeColor), alphaValue);
      stroke(finalColor);

      point(grainX + offsetX, grainY + offsetY);
    }

    prevX = currentX;
    prevY = currentY;
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
