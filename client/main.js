const screen = document.getElementById('screen');

function showHome() {
  screen.innerHTML = `
    <h1>Welcome!</h1>
    <button id="play">Play</button>`;
  document.getElementById('play').addEventListener('click', showArena);
}

function showArena() {
  screen.innerHTML = `
    <canvas id="arena" width="480" height="480"></canvas>
    <button id="back">Back</button>`;
  drawGrid(document.getElementById('arena'));
  document.getElementById('back').addEventListener('click', showHome);
}

// Placeholder: an 8x8 checkered grid where the game will take place
function drawGrid(canvas) {
  const ctx = canvas.getContext('2d');
  const size = 8;
  const cell = canvas.width / size;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      ctx.fillStyle = (x + y) % 2 === 0 ? '#a5e04a' : '#5fb82e';
      ctx.fillRect(x * cell, y * cell, cell, cell);
    }
  }
}

showHome();