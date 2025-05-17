// fixed cities: Athens↔Los Angeles
const CITY_A = { name: 'Athens, Greece', lat: 37.9838, lon: 23.7275 };
const CITY_B = { name: 'Los Angeles, USA', lat: 34.0522, lon: -118.2437 };

const queue       = document.getElementById('queue');
const smoker      = document.getElementById('smoker');
const messageBox  = document.getElementById('message');
const questionBox = document.getElementById('question');

let ribCount = 0;
let dragging = null, offsetX = 0, offsetY = 0;
let score    = 0;

// 1) auto-spawn ribs every 2s, max 5 in queue
function makeRib() {
  if (queue.children.length >= 5) return;
  const rib = document.createElement('div');
  rib.className = 'rib';
  rib.textContent = '🍖';
  rib.draggable = true;
  rib.id = 'rib' + (++ribCount);
  rib.addEventListener('dragstart', e => {
    e.dataTransfer.setData('text/plain', rib.id);
  });
  rib.addEventListener('touchstart', onTouchStart, { passive: false });
  queue.appendChild(rib);
}
setInterval(makeRib, 2000);

// 2) desktop drop handler
smoker.addEventListener('dragover', e => e.preventDefault());
smoker.addEventListener('drop', e => {
  e.preventDefault();
  const id = e.dataTransfer.getData('text/plain');
  const rib = document.getElementById(id);
  if (!rib) return;
  feedSmoker(rib);
});

// 3) feeding & scoring
function feedSmoker(rib) {
  smoker.appendChild(rib);
  setTimeout(() => {
    rib.remove();
    score++;
    document.querySelector('#smoker .score-display').textContent = score;
    if (score === 10) {
      messageBox.textContent = 'New High Score!';
    }
    askQuestion();
  }, 300);
}

// 4) always-Greece/LA question
function askQuestion() {
  const toRad = d => d * Math.PI / 180;
  const R = 6371;
  const dLat = toRad(CITY_B.lat - CITY_A.lat);
  const dLon = toRad(CITY_B.lon - CITY_A.lon);
  const φ1 = toRad(CITY_A.lat), φ2 = toRad(CITY_B.lat);
  const a = Math.sin(dLat/2)**2 +
            Math.cos(φ1)*Math.cos(φ2)*Math.sin(dLon/2)**2;
  const dist = 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  questionBox.classList.remove('hidden');
  questionBox.innerHTML = `
    <p>Distance between <strong>${CITY_A.name}</strong> and <strong>${CITY_B.name}</strong> is <em>${dist.toFixed(0)} km</em>.</p>
    <p>Which way is faster: east or west?</p>
    <button id="east">Travel East</button>
    <button id="west">Travel West</button>
  `;

  ['east','west'].forEach(dir => {
    questionBox.querySelector('#'+dir)
      .addEventListener('click', () => {
        questionBox.innerHTML = `<p>Are you so sure about that?</p>`;
      });
  });
}

// === Mobile touch-and-drag ===
function onTouchStart(e) {
  e.preventDefault();
  const touch = e.changedTouches[0];
  const target = document.elementFromPoint(touch.clientX, touch.clientY);
  if (!target || !target.classList.contains('rib')) return;

  dragging = target;
  const rect = target.getBoundingClientRect();
  offsetX = touch.clientX - rect.left;
  offsetY = touch.clientY - rect.top;

  target.style.position = 'fixed';
  target.style.zIndex   = 1000;
  moveAt(touch.clientX, touch.clientY);

  window.addEventListener('touchmove', onTouchMove, { passive: false });
  window.addEventListener('touchend',  onTouchEnd);
}

function onTouchMove(e) {
  e.preventDefault();
  const touch = e.changedTouches[0];
  moveAt(touch.clientX, touch.clientY);
}

function moveAt(x,y) {
  dragging.style.left = x - offsetX + 'px';
  dragging.style.top  = y - offsetY + 'px';
}

function onTouchEnd(e) {
  e.preventDefault();
  const touch = e.changedTouches[0];
  const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY)
                            .closest('.dropzone');

  if (dropTarget === smoker && dragging) {
    feedSmoker(dragging);
  } else {
    queue.appendChild(dragging);
  }

  dragging.style.position = '';
  dragging.style.left     = '';
  dragging.style.top      = '';
  window.removeEventListener('touchmove', onTouchMove);
  window.removeEventListener('touchend',  onTouchEnd);
  dragging = null;
}
