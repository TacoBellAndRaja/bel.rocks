// simple city list with lat/lon
const CITIES = [
  {name:'New York', lat:40.7128, lon:-74.0060},
  {name:'London',    lat:51.5074, lon:-0.1278},
  {name:'Tokyo',     lat:35.6895, lon:139.6917},
  {name:'Sydney',    lat:-33.8688, lon:151.2093},
  {name:'Cairo',     lat:30.0444, lon:31.2357},
  {name:'Rio de Janeiro', lat:-22.9068, lon:-43.1729}
];

const queue = document.getElementById('queue');
const smoker = document.getElementById('smoker');
const genBtn = document.getElementById('genRibs');
const questionBox = document.getElementById('question');

let ribCount = 0;

// Drag-start
function makeRib() {
  const rib = document.createElement('div');
  rib.className = 'rib';
  rib.textContent = '🍖';
  rib.draggable = true;
  rib.id = 'rib' + (++ribCount);
  rib.addEventListener('dragstart', e => {
    e.dataTransfer.setData('text/plain', rib.id);
  });
  queue.appendChild(rib);
}

// Drop on smoker
smoker.addEventListener('dragover', e => e.preventDefault());
smoker.addEventListener('drop', e => {
  e.preventDefault();
  const id = e.dataTransfer.getData('text/plain');
  const rib = document.getElementById(id);
  if (!rib) return;
  // “feed” smoker
  smoker.appendChild(rib);
  setTimeout(() => {
    rib.remove();
    askQuestion();
  }, 300);  // small delay to simulate “eating”
});

// question logic
function askQuestion() {
  // pick two distinct
  let [a,b] = [0,0];
  while(a===b) {
    a = Math.floor(Math.random() * CITIES.length);
    b = Math.floor(Math.random() * CITIES.length);
  }
  const cityA = CITIES[a], cityB = CITIES[b];
  // haversine distance
  const R = 6371;
  const toRad = d => d * Math.PI/180;
  const dLat = toRad(cityB.lat - cityA.lat);
  const dLon = toRad(cityB.lon - cityA.lon);
  const φ1 = toRad(cityA.lat), φ2 = toRad(cityB.lat);
  const u = Math.sin(dLat/2)**2 + Math.cos(φ1)*Math.cos(φ2)*Math.sin(dLon/2)**2;
  const dist = 2 * R * Math.atan2(Math.sqrt(u), Math.sqrt(1-u));
  // show prompt
  questionBox.classList.remove('hidden');
  questionBox.innerHTML = `
    <p>Distance between <strong>${cityA.name}</strong> and <strong>${cityB.name}</strong> is <em>${dist.toFixed(0)} km</em>.</p>
    <p>Which direction is faster to travel: east or west?</p>
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

// wiring
genBtn.addEventListener('click', makeRib);
