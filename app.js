// --- 1. Background Doodle Animation Engine ---
const bgCanvas = document.getElementById('bg-canvas');
const bgCtx = bgCanvas.getContext('2d');

let doodles = [];
const TOTAL_DOODLES = 35;

function resizeBgCanvas() {
  bgCanvas.width = window.innerWidth;
  bgCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeBgCanvas);
resizeBgCanvas();

class DoodleItem {
  constructor() { this.reset(); }
  reset() {
    this.x = Math.random() * bgCanvas.width;
    this.y = Math.random() * bgCanvas.height;
    this.size = Math.random() * 12 + 10;
    this.speedY = -(Math.random() * 0.4 + 0.1);
    this.rotation = Math.random() * Math.PI * 2;
    this.rotSpeed = (Math.random() - 0.5) * 0.01;
    this.type = Math.floor(Math.random() * 4);
  }
  update() {
    this.y += this.speedY;
    this.rotation += this.rotSpeed;
    if (this.y < -30) {
      this.y = bgCanvas.height + 30;
      this.x = Math.random() * bgCanvas.width;
    }
  }
  draw() {
    bgCtx.save();
    bgCtx.translate(this.x, this.y);
    bgCtx.rotate(this.rotation);
    const doodleColor = getComputedStyle(document.body).getPropertyValue('--doodle-color').trim();
    bgCtx.strokeStyle = doodleColor;
    bgCtx.fillStyle = doodleColor;
    bgCtx.lineWidth = 2;
    bgCtx.lineCap = 'round';

    if (this.type === 0) {
      bgCtx.beginPath();
      bgCtx.moveTo(0, -this.size);
      bgCtx.quadraticCurveTo(0, 0, this.size, 0);
      bgCtx.quadraticCurveTo(0, 0, 0, this.size);
      bgCtx.quadraticCurveTo(0, 0, -this.size, 0);
      bgCtx.quadraticCurveTo(0, 0, 0, -this.size);
      bgCtx.stroke();
    } else if (this.type === 1) {
      const s = this.size * 0.6;
      bgCtx.beginPath();
      bgCtx.moveTo(0, -s); bgCtx.lineTo(0, s);
      bgCtx.moveTo(-s, 0); bgCtx.lineTo(s, 0);
      bgCtx.stroke();
    } else if (this.type === 2) {
      bgCtx.beginPath();
      bgCtx.arc(0, 0, this.size * 0.6, 0.5 * Math.PI, 1.5 * Math.PI, true);
      bgCtx.quadraticCurveTo(this.size * 0.3, 0, 0, -this.size * 0.6);
      bgCtx.stroke();
    } else {
      bgCtx.beginPath();
      bgCtx.arc(0, 0, 3, 0, Math.PI * 2);
      bgCtx.fill();
    }
    bgCtx.restore();
  }
}

for (let i = 0; i < TOTAL_DOODLES; i++) doodles.push(new DoodleItem());

function animateBg() {
  bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
  doodles.forEach(d => { d.update(); d.draw(); });
  requestAnimationFrame(animateBg);
}
animateBg();

// --- 2. Dark Mode Toggle ---
const themeToggleBtn = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');

themeToggleBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  themeIcon.innerText = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
});

// --- 3. VibeCheck! Interactive Engine ---
const boardCanvas = document.getElementById('moodboard-canvas');
const placeholderText = document.getElementById('placeholder-text');
const imageUpload = document.getElementById('image-upload');
const memeUpload = document.getElementById('meme-upload');
const noteTextInput = document.getElementById('note-text-input');
const btnAddNote = document.getElementById('btn-add-note');
const textColorPicker = document.getElementById('text-color-picker');
const highlighterSelect = document.getElementById('highlighter-select');

const fmtBold = document.getElementById('fmt-bold');
const fmtItalic = document.getElementById('fmt-italic');
const fmtUnderline = document.getElementById('fmt-underline');

const btnClearBoard = document.getElementById('btn-clear-board');
const btnExport = document.getElementById('btn-export');

let activeItemsCount = 0;

// State Formatting Text
let isBold = false;
let isItalic = false;
let isUnderline = false;

fmtBold.addEventListener('click', () => { isBold = !isBold; fmtBold.classList.toggle('active', isBold); });
fmtItalic.addEventListener('click', () => { isItalic = !isItalic; fmtItalic.classList.toggle('active', isItalic); });
fmtUnderline.addEventListener('click', () => { isUnderline = !isUnderline; fmtUnderline.classList.toggle('active', isUnderline); });

function updatePlaceholder() {
  if (activeItemsCount > 0) {
    placeholderText.classList.add('hidden');
  } else {
    placeholderText.classList.remove('hidden');
  }
}

// Drag & Drop Element Controller
function makeElementDraggable(elm) {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

  elm.onmousedown = dragMouseDown;
  elm.ontouchstart = dragTouchStart;

  function dragMouseDown(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
    bringToFront(elm);
  }

  function dragTouchStart(e) {
    pos3 = e.touches[0].clientX;
    pos4 = e.touches[0].clientY;
    document.ontouchend = closeDragElement;
    document.ontouchmove = elementTouchDrag;
    bringToFront(elm);
  }

  function elementDrag(e) {
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    updatePosition(elm, pos1, pos2);
  }

  function elementTouchDrag(e) {
    pos1 = pos3 - e.touches[0].clientX;
    pos2 = pos4 - e.touches[0].clientY;
    pos3 = e.touches[0].clientX;
    pos4 = e.touches[0].clientY;
    updatePosition(elm, pos1, pos2);
  }

  function updatePosition(element, p1, p2) {
    let newTop = element.offsetTop - p2;
    let newLeft = element.offsetLeft - p1;

    const maxTop = boardCanvas.clientHeight - element.clientHeight;
    const maxLeft = boardCanvas.clientWidth - element.clientWidth;

    element.style.top = Math.max(0, Math.min(newTop, maxTop)) + "px";
    element.style.left = Math.max(0, Math.min(newLeft, maxLeft)) + "px";
  }

  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
    document.ontouchend = null;
    document.ontouchmove = null;
  }

  // Hapus item jika di-double click
  elm.ondblclick = () => {
    elm.remove();
    activeItemsCount--;
    updatePlaceholder();
  };
}

function bringToFront(elm) {
  const allItems = boardCanvas.querySelectorAll('.board-item');
  allItems.forEach(item => item.style.zIndex = '1');
  elm.style.zIndex = '10';
}

// 1. Upload Gambar Polaroid (Otomatis Landscape / Portrait)
imageUpload.addEventListener('change', (e) => {
  const files = e.target.files;
  if (!files) return;

  Array.from(files).forEach((file, index) => {
    const reader = new FileReader();
    reader.onload = function(event) {
      const wrapper = document.createElement('div');
      wrapper.className = 'board-item draggable-photo';
      wrapper.style.top = (40 + (index * 25)) + 'px';
      wrapper.style.left = (40 + (index * 30)) + 'px';

      const img = document.createElement('img');
      img.src = event.target.result;

      img.onload = function() {
        if (img.naturalWidth > img.naturalHeight) {
          wrapper.classList.add('landscape-frame');
        }
      };

      wrapper.appendChild(img);
      boardCanvas.appendChild(wrapper);
      makeElementDraggable(wrapper);
      activeItemsCount++;
      updatePlaceholder();
    };
    reader.readAsDataURL(file);
  });
  imageUpload.value = '';
});

// 2. Upload Stiker Meme
memeUpload.addEventListener('change', (e) => {
  const files = e.target.files;
  if (!files) return;

  Array.from(files).forEach((file, index) => {
    const reader = new FileReader();
    reader.onload = function(event) {
      const wrapper = document.createElement('div');
      wrapper.className = 'board-item draggable-meme';
      wrapper.style.top = (boardCanvas.clientHeight / 2 + (index * 20 - 40)) + 'px';
      wrapper.style.left = (boardCanvas.clientWidth / 2 + (index * 20 - 40)) + 'px';

      const img = document.createElement('img');
      img.src = event.target.result;
      wrapper.appendChild(img);

      boardCanvas.appendChild(wrapper);
      makeElementDraggable(wrapper);
      activeItemsCount++;
      updatePlaceholder();
    };
    reader.readAsDataURL(file);
  });
  memeUpload.value = '';
});

// 3. Tambah Stiker Emoji/Icons
document.querySelectorAll('.stamp-pills .stamp-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'board-item draggable-sticker';
    wrapper.style.top = (boardCanvas.clientHeight / 2 + (Math.random() * 60 - 30)) + 'px';
    wrapper.style.left = (boardCanvas.clientWidth / 2 + (Math.random() * 60 - 30)) + 'px';
    wrapper.innerText = e.target.dataset.stamp;

    boardCanvas.appendChild(wrapper);
    makeElementDraggable(wrapper);
    activeItemsCount++;
    updatePlaceholder();
  });
});

// 4. Tambah Text Quote/Note dengan Stabilo, Shadow, & Formatting
function addNovelNote() {
  const text = noteTextInput.value.trim();
  if (!text) return;

  const wrapper = document.createElement('div');
  wrapper.className = 'board-item draggable-quote';
  wrapper.style.top = (boardCanvas.clientHeight / 2 + (Math.random() * 40 - 20)) + 'px';
  wrapper.style.left = (boardCanvas.clientWidth / 2 + (Math.random() * 40 - 20)) + 'px';
  
  wrapper.innerText = text;
  wrapper.style.color = textColorPicker.value;
  if (isBold) wrapper.style.fontWeight = 'bold';
  if (isItalic) wrapper.style.fontStyle = 'italic';
  if (isUnderline) wrapper.style.textDecoration = 'underline';

  const highlightStyle = highlighterSelect.value;
  if (highlightStyle === 'transparent-shadow') {
    wrapper.classList.add('no-bg-shadow');
  } else if (highlightStyle !== 'none') {
    wrapper.style.backgroundColor = highlightStyle;
  } else {
    wrapper.style.backgroundColor = 'rgba(255, 255, 255, 0.85)';
  }

  boardCanvas.appendChild(wrapper);
  makeElementDraggable(wrapper);
  activeItemsCount++;
  updatePlaceholder();
  noteTextInput.value = '';
}

btnAddNote.addEventListener('click', addNovelNote);
noteTextInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addNovelNote();
});

// 5. Ubah Background Warna & Pattern
document.querySelectorAll('.color-picker-row .color-dot').forEach(dot => {
  dot.addEventListener('click', (e) => {
    document.querySelectorAll('.color-picker-row .color-dot').forEach(d => d.classList.remove('active'));
    e.target.classList.add('active');
    boardCanvas.style.backgroundColor = e.target.dataset.bg;
  });
});

document.querySelectorAll('.pattern-pills .pill-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    document.querySelectorAll('.pattern-pills .pill-btn').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    const pattern = e.target.dataset.pattern;
    boardCanvas.className = `moodboard-area pattern-${pattern}`;
  });
});

// --- Custom Exit Modal & Intent Detection Engine ---
const exitModal = document.getElementById('exit-modal');
const btnStay = document.getElementById('btn-stay');
const btnLeave = document.getElementById('btn-leave');

let isExitModalOpen = false;

function showExitModal() {
  exitModal.classList.remove('hidden');
  isExitModalOpen = true;
}

function hideExitModal() {
  exitModal.classList.add('hidden');
  isExitModalOpen = false;
}

// Deteksi saat kursor mouse bergerak mendekati area atas browser
document.addEventListener('mouseleave', (e) => {
  if (e.clientY <= 0 && activeItemsCount > 0 && !isExitModalOpen) {
    showExitModal();
  }
});

// Munculkan modal kucing saat tombol "Clear Canvas" diklik
btnClearBoard.addEventListener('click', () => {
  if (activeItemsCount > 0) {
    showExitModal();
  } else {
    alert("Kanvas kamu masih kosong nih! ✨");
  }
});

// Jika user memilih "Nggak jadi, lanjut curating!"
btnStay.addEventListener('click', hideExitModal);

// Jika user memilih "Tetap Keluar / Kosongkan Board"
btnLeave.addEventListener('click', () => {
  hideExitModal();
  const items = boardCanvas.querySelectorAll('.board-item');
  items.forEach(item => item.remove());
  activeItemsCount = 0;
  updatePlaceholder();
});

// 6. Export ke PNG
btnExport.addEventListener('click', () => {
  btnExport.innerText = "⏳ Generating...";
  btnExport.disabled = true;

  html2canvas(boardCanvas, { scale: 2, useCORS: true }).then(canvas => {
    const link = document.createElement('a');
    link.download = `vibecheck-moodboard-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    
    btnExport.innerText = "💾 Save Mood Board";
    btnExport.disabled = false;
  }).catch(err => {
    alert("Gagal menyimpan gambar. Silakan coba lagi.");
    btnExport.innerText = "💾 Save Mood Board";
    btnExport.disabled = false;
  });
});