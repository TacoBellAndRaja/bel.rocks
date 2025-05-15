const MEATS = ['🍗','🍔','🌭','🥩','🥓'];
const queueEl = document.getElementById('queue');
const grillEl = document.getElementById('grill');
const smokerEl = document.getElementById('smoker');
const trayEl = document.getElementById('tray');
const scoreEl = document.getElementById('score');
let score = 0;

// Touch-drag state
let dragging = null, offsetX = 0, offsetY = 0;

// helper to create a draggable meat div
function makeMeat() {
  const div = document.createElement('div');
  div.className = 'meat-item';
  div.textContent = MEATS[Math.floor(Math.random() * MEATS.length)];
  div.draggable = true;
  div.dataset.status = 'raw';
  // unique id
  div.id = 'm' + Date.now() + Math.random().toString(36).slice(2);

  // mouse dragstart
  div.addEventListener('dragstart', e => {
    e.dataTransfer.setData('text/plain', div.id);
  });

  // touch start
  div.addEventListener('touchstart', onTouchStart);
  queueEl.appendChild(div);
}

// spawn one every 2s up to 5 in queue
setInterval(() => {
  if (queueEl.children.length < 5) makeMeat();
}, 2000);
makeMeat(); makeMeat(); makeMeat();

// DROP HANDLERS
[grillEl, smokerEl, trayEl].forEach(zone => {
  zone.addEventListener('dragover', e => e.preventDefault());
  zone.addEventListener('drop', e => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    const item = document.getElementById(id);
    if (!item) return;

    // Grill/Smoker logic
    if ((zone === grillEl || zone === smokerEl) && item.dataset.status === 'raw') {
      zone.appendChild(item);
      item.dataset.status = 'cooking';
      item.classList.add('cooking');
      const cookTime = zone === grillEl ? 10000 : 30000;
      setTimeout(() => {
        item.dataset.status = 'done';
        item.classList.remove('cooking');
        item.classList.add('done');
      }, cookTime);
    }

    // Tray logic
    else if (zone === trayEl && item.dataset.status === 'done') {
      trayEl.appendChild(item);
      score += 10;
      scoreEl.textContent = 'Score: ' + score;
      setTimeout(() => trayEl.removeChild(item), 300);
    }
  });
});

// TOUCH HANDLERS
function onTouchStart(e) {
  const touch = e.changedTouches[0];
  const target = document.elementFromPoint(touch.clientX, touch.clientY);
  if (target && target.classList.contains('meat-item')) {
    dragging = target;
    const rect = target.getBoundingClientRect();
    offsetX = touch.clientX - rect.left;
    offsetY = touch.clientY - rect.top;
    target.classList.add('dragging');
    target.style.position = 'fixed';
    target.style.zIndex = 1000;
    moveAt(touch.clientX, touch.clientY);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
    e.preventDefault();
  }
}

function onTouchMove(e) {
  const touch = e.changedTouches[0];
  moveAt(touch.clientX, touch.clientY);
  e.preventDefault();
}

function moveAt(x, y) {
  dragging.style.left = x - offsetX + 'px';
  dragging.style.top = y - offsetY + 'px';
}

function onTouchEnd(e) {
  const touch = e.changedTouches[0];
  const dropZone = document.elementFromPoint(touch.clientX, touch.clientY).closest('.dropzone');
  if (dropZone) {
    // simulate drop event
    dropZone.dispatchEvent(new DragEvent('drop', {
      dataTransfer: {
        getData: () => dragging.id
      }
    }));
  }
  // cleanup
  dragging.classList.remove('dragging');
  dragging.style.position = '';
  dragging.style.left = '';
  dragging.style.top = '';
  window.removeEventListener('touchmove', onTouchMove);
  window.removeEventListener('touchend', onTouchEnd);
  dragging = null;
}
