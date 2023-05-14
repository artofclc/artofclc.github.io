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
var currentBrushType = 'hardRound';

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
        applyTool(currentTool, currentColor); // Call applyTool without passing size
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


// Replace the draw function:
function draw() {
  if (mouseIsPressed) {
    if (isMouseInsideCanvas()) {
      if (!isMouseOverElement(document.querySelector('#canvas-container'))) {
        return;
      }
      if (currentTool === '3') { // using eraser
        applyTool('1', eraserColor); // use basic brush with eraser color
      } else {
        applyTool(currentTool, currentColor); // Call applyTool without passing size
      }
      updateButtonStates(); // Update button states after applying tool
    }
  }
}
function applyBrush(brushType, xPos, yPos, pXPos, pYPos, brushSize, brushColor) {
  var angle;
  var distance;
  var x, y;
  var numSegments;

  switch (brushType) {
    case 'hardRound':
      strokeWeight(brushSize);
      stroke(brushColor);
      line(xPos, yPos, pXPos, pYPos);
      break;

    case 'rake':
      numSegments = 4;
      strokeWeight(brushSize / numSegments);
      stroke(brushColor);

      for (var i = 0; i < numSegments; i++) {
        x = lerp(xPos, pXPos, i / numSegments);
        y = lerp(yPos, pYPos, i / numSegments);
        line(x, y, x + random(-brushSize / 2, brushSize / 2), y + random(-brushSize / 2, brushSize / 2));
      }
      break;

    case 'dry':
      numSegments = 20;
      strokeWeight(brushSize / numSegments);
      stroke(brushColor);

      for (var j = 0; j < numSegments; j++) {
        angle = random(TWO_PI);
        distance = random(brushSize) * 0.5;
        x = xPos + cos(angle) * distance;
        y = yPos + sin(angle) * distance;
        point(x, y);
      }
      break;

    case 'wet':
      strokeWeight(brushSize);
      stroke(brushColor);
      line(xPos, yPos, pXPos, pYPos);

      numSegments = 10;
      strokeWeight(brushSize / numSegments);
      stroke(brushColor);

      for (var k = 0; k < numSegments; k++) {
        angle = random(TWO_PI);
        distance = random(brushSize) * 0.5;
        x = xPos + cos(angle) * distance;
        y = yPos + sin(angle) * distance;
        line(x, y, x + random(-brushSize / 2, brushSize / 2), y + random(-brushSize / 2, brushSize / 2));
      }
      break;
  }
}

function applyTool(tool, chosenColor) {
  const pressure = getPointerPressure(); // Get the pressure based on input device
  const adjustedSize = currentSize * pressure; // Get the adjusted size based on the pressure
  const adjustedOpacity = currentOpacity * pressure; // Get the adjusted opacity based on the pressure

  if (tool === '1') {
    // Basic brush (Hard round brush)
    applyHardRoundBrush(chosenColor, adjustedSize, adjustedOpacity);
  } else if (tool === '2') {
    // Rake brush
    applyRakeBrush(chosenColor, adjustedSize, adjustedOpacity);
  } else if (tool === '3') {
    // Dry brush
    applyDryBrush(chosenColor, adjustedSize, adjustedOpacity);
  } else if (tool === '4') {
    // Wet brush
    applyWetBrush(chosenColor, adjustedSize, adjustedOpacity);
  }
}

function applyHardRoundBrush(chosenColor, adjustedSize, adjustedOpacity) {
  stroke(chosenColor);
  strokeWeight(adjustedSize);
  strokeCap(ROUND);
  strokeJoin(ROUND);
  line(mouseX, mouseY, pmouseX, pmouseY);
}

function applyRakeBrush(chosenColor, adjustedSize, adjustedOpacity) {
  push();
  stroke(chosenColor);
  strokeWeight(adjustedSize / 10);
  strokeCap(ROUND);
  strokeJoin(ROUND);
  const numLines = 5;
  const spacing = adjustedSize / (numLines - 1);
  const offsetX = adjustedSize / 2;
  const offsetY = -adjustedSize * 0.8;
  const angle = atan2(mouseY - pmouseY, mouseX - pmouseX);
  for (let i = 0; i < numLines; i++) {
    const x1 = pmouseX - offsetX + i * spacing;
    const y1 = pmouseY + offsetY;
    const x2 = mouseX - offsetX + i * spacing;
    const y2 = mouseY + offsetY;
    const ctrlX1 = lerp(x1, x2, 0.5) - sin(angle) * adjustedSize / 2;
    const ctrlY1 = lerp(y1, y2, 0.5) + cos(angle) * adjustedSize / 2;
    bezier(x1, y1, ctrlX1, ctrlY1, ctrlX1, ctrlY1, x2, y2);
  }
  pop();
}

function applyDryBrush(chosenColor, adjustedSize, adjustedOpacity) {
  const numSegments = 10;
  const spacing = adjustedSize / numSegments;
  stroke(chosenColor);
  strokeWeight(adjustedSize / 4);
  for (let i = 0; i < numSegments; i++) {
    const x1 = lerp(pmouseX, mouseX, i / numSegments);
    const y1 = lerp(pmouseY, mouseY, i / numSegments);
    const x2 = lerp(pmouseX, mouseX, (i + 1) / numSegments);
    const y2 = lerp(pmouseY, mouseY, (i + 1) / numSegments);
    if (random() < 0.7) {
      line(x1, y1, x2, y2);
    }
  }
}

function applyWetBrush(chosenColor, adjustedSize, adjustedOpacity) {
  const numSegments = 10;
  const spacing = adjustedSize / numSegments;
  strokeWeight(adjustedSize);
  for (let i = 0; i < numSegments; i++) {
    const x1 = lerp(pmouseX, mouseX, i / numSegments);
    const y1 = lerp(pmouseY, mouseY, i / numSegments);
    const x2 = lerp(pmouseX, mouseX, (i + 1) / numSegments);
    const y2 = lerp(pmouseY, mouseY, (i + 1) / numSegments);
    const c1 = get(x1, y1);
    const c2 = get(x2, y2);
    const mixedColor = lerpColor(color(c1), color(c2), 0.5);
    stroke(mixedColor);
    line(x1, y1, x2, y2);
  }
}

function saveme() {
  saveCanvas(initials + '_drawing_' + nf(millis(), 0) + '.jpg');
}
