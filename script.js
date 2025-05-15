const ITEMS = [
  { icon: '🍗', cookable: true },
  { icon: '🍔', cookable: true },
  { icon: '🌭', cookable: true },
  { icon: '🥩', cookable: true },
  { icon: '🥓', cookable: true },
  { icon: '🐱', cookable: false }  // cats shouldn’t go on grill or smoker
];

const queueEl   = document.getElementById('queue');
const grillEl   = document.getElementById('grill');
const smokerEl  = document.getElementById('smoker');
const trayEl    = document.getElementById('tray');
const scoreEl   = document.getElementById('score');

let score = 0;
let dragging = null, offsetX = 0, offsetY = 0;

// create a new queue item
function makeItem() {
  const { icon, cookable } = ITEMS[Math.floor(Math.random() * ITEMS.length)];
  const div = document.createElement('div');
  div.className = 'meat-item';
  div.textContent = icon;
  div.draggable = true;
  div.dataset.status   = cookable ? 'raw' : 'no-cook';
  div.dataset.cookable = cookable;
  div.id = 'i' + Date.now() + Math.random().toString(36).slice(2);

  div.addEventListener('dragstart', e => {
    e.dataTransfer.setData('text/plain', div.id);
  });
  div.addEventListener('touchstart', onTouchStart);

  queueEl.appendChild(div);
}

// spawn up to 5 items, every 2s
setInterval(() => {
  if (queueEl.children.length < 5) makeItem();
}, 2000);
makeItem(); makeItem(); makeItem();

// universal drop logic
[grillEl, smokerEl, trayEl].forEach(zone => {
  zone.addEventListener('dragover', e => e.preventDefault());
  zone.addEventListener('drop', e => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    const item = document.getElementById(id);
    if (!item) return;

    // Grill or Smoker
    if ((zone === grillEl || zone === smokerEl)
        && item.dataset.status === 'raw') {
      const cookTime = zone === grillEl ? 3000 : 8000;
      zone.appendChild(item);
      item.dataset.status = 'cooking';
      item.classList.add('cooking');
      setTimeout(() => {
        item.dataset.status = 'done';
        item.classList.remove('cooking');
        item.classList.add('done');
      }, cookTime);
    }
    // Tray
    else if (zone === trayEl && item.dataset.status === 'done') {
      trayEl.appendChild(item);
      score += 10;
      scoreEl.textContent = 'Score: ' + score;
      setTimeout(() => trayEl.removeChild(item), 300);
    }
  });
});

// Touch-to-drag for mobile
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
    window.addEventListener('touchend',  onTouchEnd);
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
  dragging.style.top  = y - offsetY + 'px';
}

function onTouchEnd(e) {
  const touch = e.changedTouches[0];
  const dropZone = document.elementFromPoint(touch.clientX, touch.clientY)
                         .closest('.dropzone');
  if (dropZone) {
    dropZone.dispatchEvent(new DragEvent('drop', {
      dataTransfer: { getData: () => dragging.id }
    }));
  }
  dragging.classList.remove('dragging');
  dragging.style.position = '';
  dragging.style.left     = '';
  dragging.style.top      = '';
  window.removeEventListener('touchmove', onTouchMove);
  window.removeEventListener('touchend',  onTouchEnd);
  dragging = null;
}
