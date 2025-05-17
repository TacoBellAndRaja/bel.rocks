// simple city list with lat/lon
const CITIES = [
  {name:'New York', lat:40.7128, lon:-74.0060},
  {name:'London',    lat:51.5074, lon:-0.1278},
  {name:'Tokyo',     lat:35.6895, lon:139.6917},
  {name:'Sydney',    lat:-33.8688, lon:151.2093},
  {name:'Cairo',     lat:30.0444, lon:31.2357},
  {name:'Rio de Janeiro', lat:-22.9068, lon:-43.1729}
];

const queue       = document.getElementById('queue');
const smoker      = document.getElementById('smoker');
const genBtn      = document.getElementById('genRibs');
const questionBox = document.getElementById('question');

let ribCount = 0;
let dragging = null, offsetX = 0, offsetY = 0;

// create a rib
function makeRib() {
  const rib = document.createElement('div');
  rib.className = 'rib';
  rib.textContent = '🍖';
  rib.draggable = true;
  rib.id = 'rib' + (++ribCount);
  rib.addEventListener('dragstart', e => {
    e.dataTransfer.setData('text/plain', rib.id);
  });
  // touch support
  rib.addEventListener('touchstart', onTouchStart, {passive:false});
  queue.appendChild(rib);
}

// drop onto smoker
smoker.addEventListener('dragover', e => e.preventDefault());
smoker.addEventListener('drop', e => {
  e.preventDefault();
  const id = e.dataTransfer.getData('text/plain');
  const rib = document.getElementById(id);
  if (!rib) return;
  smoker.appendChild(rib);
  setTimeout(() => {
    rib.remove();
    askQuestion();
  }, 300);
});

// generate ribs
genBtn.addEventListener('click', makeRib);

// ask the distance question
function askQuestion() {
  let [a,b]=[0,0];
  while(a===b){
    a=Math.floor(Math.random()*CITIES.length);
    b=Math.floor(Math.random()*CITIES.length);
  }
  const A=CITIES[a], B=CITIES[b];
  const R=6371, toRad=d=>d*Math.PI/180;
  const dLat=toRad(B.lat-A.lat), dLon=toRad(B.lon-A.lon);
  const u=Math.sin(dLat/2)**2+Math.cos(toRad(A.lat))*Math.cos(toRad(B.lat))*Math.sin(dLon/2)**2;
  const dist=2*R*Math.atan2(Math.sqrt(u),Math.sqrt(1-u));

  questionBox.classList.remove('hidden');
  questionBox.innerHTML=`
    <p>Distance between <strong>${A.name}</strong> and <strong>${B.name}</strong> is <em>${dist.toFixed(0)} km</em>.</p>
    <p>Which direction is faster: east or west?</p>
    <button id="east">Travel East</button>
    <button id="west">Travel West</button>
  `;
  ['east','west'].forEach(dir=>{
    questionBox.querySelector('#'+dir)
      .addEventListener('click', ()=>{
        questionBox.innerHTML=`<p>Are you so sure about that?</p>`;
      });
  });
}

// TOUCH-AND-DRAG for mobile
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
  target.style.zIndex = 1000;
  moveAt(touch.clientX, touch.clientY);
  window.addEventListener('touchmove', onTouchMove, {passive:false});
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
  const dropZone = document.elementFromPoint(touch.clientX, touch.clientY)
                         .closest('.dropzone');
  if (dropZone) {
    dropZone.dispatchEvent(new DragEvent('drop', {
      dataTransfer:{ getData: ()=>dragging.id }
    }));
  }
  dragging.style.position = '';
  dragging.style.left     = '';
  dragging.style.top      = '';
  window.removeEventListener('touchmove', onTouchMove);
  window.removeEventListener('touchend',  onTouchEnd);
  dragging = null;
}
