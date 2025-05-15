const canvas = document.getElementById('gridCanvas');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;
const origin = { x: W / 2, y: H / 2 };
let bullseye = { x: 0, y: 0, visible: false };
const ringRadii = [30, 20, 10];
let dart = null;

// Spectrums with bias maps
const spectrums = [
  { x: ['Food','Not Food'], y: ['Sport','Not Sport'],
    posX: ['Apple','Banana','Broccoli','Carrot','Chocolate'],
    posY: ['Basketball','Soccer','Cycling','Hiking']
  },
  { x: ['Fiction','Non-Fiction'], y: ['Light','Serious'],
    posX: ['Book','Myth'], posY: ['Apple','Chocolate']
  },
  { x: ['Solid','Liquid'], y: ['Natural','Synthetic'],
    posX: ['Rock','Robot','Chocolate'], posY: ['Water','Lava']
  },
  { x: ['Modern','Ancient'], y: ['Mythical','Mundane'],
    posX: ['Robot','Chocolate','Soccer'], posY: ['Dinosaur','Myth']
  }
];
let currentSpec;
const words = [...new Set(spectrums.flatMap(s => [...s.posX, ...s.posY]))];

// DOM refs
const promptEl = document.getElementById('promptWord');
const resultEl = document.getElementById('resultBox');
const xLeftEl = document.getElementById('xLabelLeft');
const xRightEl = document.getElementById('xLabelRight');
const yTopEl = document.getElementById('yLabelTop');
const yBottomEl = document.getElementById('yLabelBottom');
const clueEl = document.getElementById('clueBox');

function pickRound() {
  currentSpec = spectrums[Math.floor(Math.random() * spectrums.length)];
  [xLeftEl.textContent, xRightEl.textContent] = [currentSpec.x[1], currentSpec.x[0]];
  [yTopEl.textContent, yBottomEl.textContent] = [currentSpec.y[0], currentSpec.y[1]];
  const w = words[Math.floor(Math.random() * words.length)];
  promptEl.textContent = w;

  const margin = ringRadii[0] + 10;
  const xBias = currentSpec.posX.includes(w) ? 0.8 : 0.2;
  const yBias = currentSpec.posY.includes(w) ? 0.8 : 0.2;
  bullseye.x = margin + xBias * (W - 2 * margin);
  bullseye.y = margin + yBias * (H - 2 * margin);
  bullseye.visible = false;
  dart = null;
  resultEl.textContent = '';

  const xDesc = xBias > 0.5 ? 'strongly ' + currentSpec.x[0] : 'strongly ' + currentSpec.x[1];
  const yDesc = yBias > 0.5 ? 'strongly ' + currentSpec.y[0] : 'strongly ' + currentSpec.y[1];
  clueEl.textContent = `Clue: this word is ${xDesc} and ${yDesc}.`;
}

function drawGrid() {
  ctx.clearRect(0, 0, W, H);
  // Draw axes
  ctx.strokeStyle = '#888'; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(origin.x, 0); ctx.lineTo(origin.x, H);
  ctx.moveTo(0, origin.y); ctx.lineTo(W, origin.y);
  ctx.stroke();

  // Axis labels on canvas
  ctx.fillStyle = '#333';
  ctx.font = '16px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  // X-axis labels
  ctx.fillText(currentSpec.x[1], 40, origin.y - 20);
  ctx.fillText(currentSpec.x[0], W - 40, origin.y - 20);
  // Y-axis labels
  ctx.save();
  ctx.translate(origin.x + 20, 30);
  ctx.rotate(Math.PI / 2);
  ctx.fillText(currentSpec.y[0], 0, 0);
  ctx.restore();
  ctx.save();
  ctx.translate(origin.x - 20, H - 30);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText(currentSpec.y[1], 0, 0);
  ctx.restore();

  // Bullseye
  if (bullseye.visible) {
    ringRadii.forEach((r, i) => {
      ctx.beginPath(); ctx.arc(bullseye.x, bullseye.y, r, 0, 2 * Math.PI);
      ctx.fillStyle = i % 2 === 0 ? 'rgba(200,0,0,0.3)' : 'rgba(255,255,0,0.3)';
      ctx.fill(); ctx.strokeStyle = '#900'; ctx.stroke();
    });
  }

  // Dart
  if (dart) drawDart(dart.x, dart.y);
}

function drawDart(x, y) {
  ctx.save(); ctx.translate(x, y);
  const dx = bullseye.x - x, dy = bullseye.y - y;
  ctx.rotate(Math.atan2(dy, dx));
  ctx.strokeStyle = '#333'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(-15, 0); ctx.lineTo(0, 0); ctx.stroke();
  ctx.fillStyle = '#900';
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-5, -4); ctx.lineTo(-5, 4); ctx.closePath(); ctx.fill();
  ctx.restore();
}

function score(x, y) {
  const d = Math.hypot(x - bullseye.x, y - bullseye.y);
  if (d <= ringRadii[2]) return 50;
  if (d <= ringRadii[1]) return 30;
  if (d <= ringRadii[0]) return 10;
  return 0;
}

canvas.addEventListener('click', e => {
  const rect = canvas.getBoundingClientRect();
  dart = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  bullseye.visible = true;
  drawGrid();
  resultEl.textContent = `You scored ${score(dart.x, dart.y)} points!`;
});

document.getElementById('clearBtn').addEventListener('click', () => { pickRound(); drawGrid(); });

// Initialize
pickRound(); drawGrid();
