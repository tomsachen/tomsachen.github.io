const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const levelSlider = document.getElementById('level');
const length = 250
const angleSlider = document.getElementById('angle');
const scalingSlider = document.getElementById('scaling');
const shiftSlider = document.getElementById('shiftSlider');


let offsetX = 0;
let offsetY = 0;
let isDragging = false;
let zoom = .2;

canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
});

canvas.addEventListener('mouseup', () => {
    isDragging = false;
});

canvas.addEventListener('mousemove', (e) => {
    if (isDragging) {
        offsetX += e.clientX - lastX;
        offsetY += e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;
        draw();
    }
});

function toggleWiggleBox() {

  const shiftCheckbox = document.getElementById('shiftCheckbox');
  let enableRowShift = shiftCheckbox.checked;

  if (enableRowShift){
      document.getElementById("wiggleCheckbox").disabled = false;
    }
  else {
      document.getElementById("wiggleCheckbox").disabled = true;
  }
}



function drawGasket(x, y, l, lev) {
    if (lev <= 0) return;

    const half = l / 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + half, y - l);
    ctx.lineTo(x - half, y - l);
    ctx.closePath();
    ctx.stroke();

    drawGasket(x + half, y - l, half, lev - 1);
    drawGasket(x - half, y - l, half, lev - 1);
    drawGasket(x, y, half, lev - 1);
}

function drawTree(x, y, l, lev, ang) {
    if (lev <= 0) return;

    const x1 = x + l * Math.sin(ang);
    const y1 = y - l * Math.cos(ang);

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x1, y1);
    ctx.stroke();

    const nextAngle = parseFloat(angleSlider.value) * (Math.PI / 180);
    const scaleFactor = parseFloat(scalingSlider.value);
    drawTree(x1, y1, l * scaleFactor, lev - 1, ang + nextAngle);
    drawTree(x1, y1, l * scaleFactor, lev - 1, ang - nextAngle);
}

const shiftCheckbox = document.getElementById('shiftCheckbox');
const wiggleCheckbox = document.getElementById('wiggleCheckbox');

canvas.addEventListener('wheel', (e) => {
    // Update zoom based on wheel event delta
    zoom += e.deltaY * -0.001;
    zoom = Math.max(0.1, Math.min(3, zoom)); // Limit zoom range
    draw();
});

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(zoom, zoom);  // Apply zoom scaling

    let level = parseInt(levelSlider.value);
    let angle = parseFloat(angleSlider.value);
    let shiftAmount = parseFloat(shiftSlider.value) * length;
    let enableRowShift = shiftCheckbox.checked;
    let enableWiggle = wiggleCheckbox.checked;
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 5;

    let rowSpacing = 1.8 * length;
    let firstRowIndex = Math.floor((-offsetY / zoom) / rowSpacing);
    let lastRowIndex = Math.ceil((-offsetY / zoom + canvas.height / zoom) / rowSpacing);
    let firstColIndex = Math.floor((-offsetX / zoom) / (2 * length)) - 2;
    let lastColIndex = Math.ceil((-offsetX / zoom + canvas.width / zoom) / (2 * length)) + 2;

    for (let rowIndex = firstRowIndex; rowIndex <= lastRowIndex; rowIndex++) {
        for (let colIndex = firstColIndex; colIndex <= lastColIndex; colIndex++) {
            let x = colIndex * 2 * length;

            if (!enableRowShift) {
                if (rowIndex % 2 === 0) {
                    x += shiftAmount; Apply shift for even rowIndex
                }
                // No shift for odd rowIndex
            } else if (rowIndex % 2 === 0) {
                if (enableWiggle) {
                    let rowShift = (Math.random() * 0.5 + 0.5) * rowIndex * (shiftAmount / (lastRowIndex - firstRowIndex + 1));
                    x += 3 * rowShift;
                } else {
                    let rowShift = rowIndex * (shiftAmount / (lastRowIndex - firstRowIndex + 1));
                    x += 3 * rowShift;
                }
            } else if (rowIndex % 2 === 1) {
                if (enableWiggle) {
                    let rowShift = (Math.random() * 0.5 + 0.5) * rowIndex * (shiftAmount / (lastRowIndex - firstRowIndex + 1));
                    x += (3 * rowShift) - length;
                } else {
                    let rowShift = rowIndex * (shiftAmount / (lastRowIndex - firstRowIndex + 1));
                    x += (3 * rowShift) - length;
                }
            }

            let y = rowIndex * rowSpacing;
            let startY = y;

            if (angle === 0) {
                drawGasket(x, startY, length, level);
            } else {
                drawTree(x, startY, length, level, 0);
            }
        }
    }

    ctx.restore();
}


// Update canvas size to fill window and handle window resizing
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    draw();
}


levelSlider.addEventListener('input', draw);
angleSlider.addEventListener('input', draw);
scalingSlider.addEventListener('input', draw);
shiftSlider.addEventListener('input', draw);
shiftCheckbox.addEventListener('change', toggleWiggleBox);


window.addEventListener('resize', resizeCanvas);
resizeCanvas();
