const views = Array.from(document.querySelectorAll('.view'));
const navButtons = Array.from(document.querySelectorAll('.nav-btn'));

navButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.view;
    navButtons.forEach((b) => b.classList.toggle('active', b === btn));
    views.forEach((view) => view.classList.toggle('active', view.id === target));
  });
});

function mapCanvasPoint(event, canvas) {
  const rect = canvas.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * canvas.width;
  const y = ((event.clientY - rect.top) / rect.height) * canvas.height;
  return { x, y };
}

// Neural Forge
const neuralCanvas = document.getElementById('neural-canvas');
const nctx = neuralCanvas.getContext('2d');
const classSelect = document.getElementById('class-select');
const trainBtn = document.getElementById('train-btn');
const resetNeural = document.getElementById('reset-neural');
const lrInput = document.getElementById('learning-rate');
const lrValue = document.getElementById('learning-rate-value');

let points = [];
let weights = [Math.random() * 2 - 1, Math.random() * 2 - 1, 0];
let training = false;

lrInput.addEventListener('input', () => {
  lrValue.textContent = Number(lrInput.value).toFixed(2);
});

neuralCanvas.addEventListener('click', (event) => {
  const p = mapCanvasPoint(event, neuralCanvas);
  const label = Number(classSelect.value);
  points.push({ x: p.x, y: p.y, label });
  drawNeural();
});

trainBtn.addEventListener('click', () => {
  training = !training;
  trainBtn.textContent = training ? 'Pause' : 'Train';
});

resetNeural.addEventListener('click', () => {
  points = [];
  weights = [Math.random() * 2 - 1, Math.random() * 2 - 1, 0];
  training = false;
  trainBtn.textContent = 'Train';
  drawNeural();
});

function neuralPredict(x, y) {
  const nx = x / neuralCanvas.width;
  const ny = y / neuralCanvas.height;
  const z = weights[0] * nx + weights[1] * ny + weights[2];
  return z >= 0 ? 1 : -1;
}

function trainStep() {
  if (!training || points.length === 0) return;
  const lr = Number(lrInput.value);
  for (let i = 0; i < 12; i += 1) {
    const sample = points[(Math.random() * points.length) | 0];
    const nx = sample.x / neuralCanvas.width;
    const ny = sample.y / neuralCanvas.height;
    const pred = neuralPredict(sample.x, sample.y);
    const error = sample.label - pred;
    weights[0] += lr * error * nx;
    weights[1] += lr * error * ny;
    weights[2] += lr * error;
  }
}

function drawNeural() {
  const img = nctx.createImageData(neuralCanvas.width, neuralCanvas.height);

  for (let y = 0; y < neuralCanvas.height; y += 4) {
    for (let x = 0; x < neuralCanvas.width; x += 4) {
      const idx = (y * neuralCanvas.width + x) * 4;
      const pred = neuralPredict(x, y);
      const c = pred === 1 ? [0, 255, 135] : [255, 0, 128];
      img.data[idx] = c[0];
      img.data[idx + 1] = c[1];
      img.data[idx + 2] = c[2];
      img.data[idx + 3] = 42;
    }
  }
  nctx.putImageData(img, 0, 0);

  points.forEach((p) => {
    nctx.beginPath();
    nctx.arc(p.x, p.y, 7, 0, Math.PI * 2);
    nctx.fillStyle = p.label === 1 ? '#00ff87' : '#ff0080';
    nctx.shadowColor = nctx.fillStyle;
    nctx.shadowBlur = 14;
    nctx.fill();
    nctx.shadowBlur = 0;
  });
}

// Algorithm Arena
const algoCanvas = document.getElementById('algo-canvas');
const actx = algoCanvas.getContext('2d');
const algoSelect = document.getElementById('algo-select');
const sizeInput = document.getElementById('array-size');
const sizeValue = document.getElementById('array-size-value');
const shuffleBtn = document.getElementById('shuffle-btn');
const sortBtn = document.getElementById('sort-btn');
const operationsEl = document.getElementById('operations');

let arr = [];
let operations = 0;
let sorting = false;

function resetArray() {
  const size = Number(sizeInput.value);
  sizeValue.textContent = String(size);
  arr = Array.from({ length: size }, (_, i) => i + 1);
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = (Math.random() * (i + 1)) | 0;
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  operations = 0;
  operationsEl.textContent = String(operations);
  drawArray();
}

sizeInput.addEventListener('input', resetArray);
shuffleBtn.addEventListener('click', resetArray);

function drawArray(highlight = -1) {
  actx.clearRect(0, 0, algoCanvas.width, algoCanvas.height);
  const barW = algoCanvas.width / arr.length;
  const max = arr.length;

  for (let i = 0; i < arr.length; i += 1) {
    const h = (arr[i] / max) * (algoCanvas.height - 12);
    actx.fillStyle = i === highlight ? '#ffcc00' : `hsl(${(i / arr.length) * 180 + 160}, 90%, 60%)`;
    actx.fillRect(i * barW, algoCanvas.height - h, Math.max(1, barW - 1), h);
  }
}

async function quickSortVisual(l = 0, r = arr.length - 1) {
  if (l >= r) return;
  const p = await partition(l, r);
  await Promise.all([quickSortVisual(l, p - 1), quickSortVisual(p + 1, r)]);
}

async function partition(l, r) {
  const pivot = arr[r];
  let i = l;
  for (let j = l; j < r; j += 1) {
    operations += 1;
    if (arr[j] < pivot) {
      [arr[i], arr[j]] = [arr[j], arr[i]];
      i += 1;
    }
    if (operations % 6 === 0) {
      operationsEl.textContent = String(operations);
      drawArray(j);
      await new Promise((res) => requestAnimationFrame(res));
    }
  }
  [arr[i], arr[r]] = [arr[r], arr[i]];
  return i;
}

async function mergeSortVisual(start = 0, end = arr.length - 1) {
  if (start >= end) return;
  const mid = (start + end) >> 1;
  await mergeSortVisual(start, mid);
  await mergeSortVisual(mid + 1, end);
  const left = arr.slice(start, mid + 1);
  const right = arr.slice(mid + 1, end + 1);
  let i = 0;
  let j = 0;
  let k = start;
  while (i < left.length && j < right.length) {
    operations += 1;
    arr[k++] = left[i] < right[j] ? left[i++] : right[j++];
    if (operations % 5 === 0) {
      operationsEl.textContent = String(operations);
      drawArray(k);
      await new Promise((res) => requestAnimationFrame(res));
    }
  }
  while (i < left.length) arr[k++] = left[i++];
  while (j < right.length) arr[k++] = right[j++];
}

sortBtn.addEventListener('click', async () => {
  if (sorting) return;
  sorting = true;
  operations = 0;
  operationsEl.textContent = '0';
  if (algoSelect.value === 'quick') {
    await quickSortVisual();
  } else {
    await mergeSortVisual();
  }
  drawArray();
  sorting = false;
});

// Systems Pulse
const systemsCanvas = document.getElementById('systems-canvas');
const sctx = systemsCanvas.getContext('2d');
const mouse = { x: systemsCanvas.width / 2, y: systemsCanvas.height / 2 };

const particles = Array.from({ length: 95 }, () => ({
  x: Math.random() * systemsCanvas.width,
  y: Math.random() * systemsCanvas.height,
  vx: (Math.random() - 0.5) * 1.4,
  vy: (Math.random() - 0.5) * 1.4,
  r: Math.random() * 2 + 1,
}));

systemsCanvas.addEventListener('mousemove', (event) => {
  Object.assign(mouse, mapCanvasPoint(event, systemsCanvas));
});

function drawSystems() {
  sctx.clearRect(0, 0, systemsCanvas.width, systemsCanvas.height);

  for (let i = 0; i < particles.length; i += 1) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;

    if (p.x < 0 || p.x > systemsCanvas.width) p.vx *= -1;
    if (p.y < 0 || p.y > systemsCanvas.height) p.vy *= -1;

    const dxm = mouse.x - p.x;
    const dym = mouse.y - p.y;
    const dm = Math.hypot(dxm, dym) || 1;
    if (dm < 160) {
      p.vx += (dxm / dm) * 0.01;
      p.vy += (dym / dm) * 0.01;
    }

    sctx.fillStyle = i % 2 ? '#60efff' : '#00ff87';
    sctx.beginPath();
    sctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    sctx.fill();

    for (let j = i + 1; j < particles.length; j += 1) {
      const q = particles[j];
      const dx = p.x - q.x;
      const dy = p.y - q.y;
      const d = Math.hypot(dx, dy);
      if (d < 90) {
        sctx.strokeStyle = `rgba(255, 0, 128, ${1 - d / 90})`;
        sctx.lineWidth = 0.8;
        sctx.beginPath();
        sctx.moveTo(p.x, p.y);
        sctx.lineTo(q.x, q.y);
        sctx.stroke();
      }
    }
  }
}

function tick() {
  trainStep();
  drawNeural();
  drawSystems();
  requestAnimationFrame(tick);
}

resetArray();
drawNeural();
tick();
