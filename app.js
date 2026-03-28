const views = Array.from(document.querySelectorAll('.view'));
const navButtons = Array.from(document.querySelectorAll('.nav-btn'));
const PROFILE_KEY = 'nexus-adaptive-profile';

function mapCanvasPoint(event, canvas) {
  const rect = canvas.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * canvas.width;
  const y = ((event.clientY - rect.top) / rect.height) * canvas.height;
  return { x, y };
}

function loadProfile() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(PROFILE_KEY) || 'null');
    if (saved) return saved;
  } catch (error) {
    console.warn('Profile restore failed', error);
  }
  return {
    viewVisits: { neural: 1, algorithms: 0, systems: 0 },
    neuralDrops: 0,
    trainingToggles: 0,
    sorts: 0,
    pulses: 0,
    patternUsage: { random: 1, wave: 0, reverse: 0 },
    algorithmUsage: { quick: 0, merge: 0 },
  };
}

let profile = loadProfile();

const profileStyleEl = document.getElementById('profile-style');
const profileComplexityEl = document.getElementById('profile-complexity');
const profileCuriosityEl = document.getElementById('profile-curiosity');
const profileFavoriteEl = document.getElementById('profile-favorite');
const downloadArtifactBtn = document.getElementById('download-artifact');
const resetProfileBtn = document.getElementById('reset-profile');

function persistProfile() {
  try {
    window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.warn('Profile save failed', error);
  }
}

function profileFavoriteArena() {
  const values = [
    ['Neural Forge', profile.neuralDrops + profile.trainingToggles + profile.viewVisits.neural],
    ['Algorithm Arena', profile.sorts + profile.viewVisits.algorithms],
    ['Systems Pulse', profile.pulses + profile.viewVisits.systems],
  ];
  values.sort((a, b) => b[1] - a[1]);
  return values[0][0];
}

function profileStyle() {
  if (profile.pulses > profile.sorts && profile.pulses > profile.neuralDrops / 2) return 'Signal Hacker';
  if (profile.sorts >= 3 || profile.algorithmUsage.merge + profile.algorithmUsage.quick >= 4) return 'Systems Strategist';
  if (profile.neuralDrops >= 6) return 'Pattern Hunter';
  return 'Direct Action';
}

function profileComplexity() {
  const diversity =
    Number(profile.patternUsage.random > 0) + Number(profile.patternUsage.wave > 0) + Number(profile.patternUsage.reverse > 0);
  const score =
    profile.neuralDrops + profile.trainingToggles * 2 + profile.sorts * 3 + profile.pulses * 2 + diversity * 4;
  if (score >= 26) return 'Interview Weapon';
  if (score >= 16) return 'Systems Level';
  if (score >= 8) return 'High Signal';
  return 'Tactical';
}

function profileCuriosity() {
  const totalActions = profile.neuralDrops + profile.trainingToggles + profile.sorts + profile.pulses;
  const viewSpread = Object.values(profile.viewVisits).filter(Boolean).length;
  return Math.min(100, Math.round(totalActions * 6 + viewSpread * 14));
}

function renderProfile() {
  profileStyleEl.textContent = profileStyle();
  profileComplexityEl.textContent = profileComplexity();
  profileCuriosityEl.textContent = `${profileCuriosity()}%`;
  profileFavoriteEl.textContent = profileFavoriteArena();
}

function ensureCounter(bucket, key) {
  if (!bucket || typeof bucket !== 'object') {
    return;
  }
  if (typeof bucket[key] !== 'number') {
    bucket[key] = 0;
  }
}

function recordProfile(type, detail) {
  switch (type) {
    case 'view':
      if (!profile.viewVisits || typeof profile.viewVisits !== 'object') {
        profile.viewVisits = {};
      }
      ensureCounter(profile.viewVisits, detail);
      profile.viewVisits[detail] += 1;
      break;
    case 'neural-drop':
      if (typeof profile.neuralDrops !== 'number') {
        profile.neuralDrops = 0;
      }
      profile.neuralDrops += 1;
      break;
    case 'train-toggle':
      if (typeof profile.trainingToggles !== 'number') {
        profile.trainingToggles = 0;
      }
      profile.trainingToggles += 1;
      break;
    case 'sort':
      if (typeof profile.sorts !== 'number') {
        profile.sorts = 0;
      }
      profile.sorts += 1;
      if (!profile.algorithmUsage || typeof profile.algorithmUsage !== 'object') {
        profile.algorithmUsage = {};
      }
      if (!profile.patternUsage || typeof profile.patternUsage !== 'object') {
        profile.patternUsage = {};
      }
      if (detail && typeof detail === 'object') {
        if (detail.algorithm != null) {
          ensureCounter(profile.algorithmUsage, detail.algorithm);
          profile.algorithmUsage[detail.algorithm] += 1;
        }
        if (detail.pattern != null) {
          ensureCounter(profile.patternUsage, detail.pattern);
          profile.patternUsage[detail.pattern] += 1;
        }
      }
      break;
    case 'pulse':
      if (typeof profile.pulses !== 'number') {
        profile.pulses = 0;
      }
      profile.pulses += 1;
      break;
    default:
      break;
  }
  persistProfile();
  renderProfile();
}

navButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.view;
    navButtons.forEach((b) => b.classList.toggle('active', b === btn));
    views.forEach((view) => view.classList.toggle('active', view.id === target));
    recordProfile('view', target);
  });
});

resetProfileBtn.addEventListener('click', () => {
  profile = {
    viewVisits: { neural: 1, algorithms: 0, systems: 0 },
    neuralDrops: 0,
    trainingToggles: 0,
    sorts: 0,
    pulses: 0,
    patternUsage: { random: 1, wave: 0, reverse: 0 },
    algorithmUsage: { quick: 0, merge: 0 },
  };
  persistProfile();
  renderProfile();
});

// Neural Forge
const neuralCanvas = document.getElementById('neural-canvas');
const nctx = neuralCanvas.getContext('2d');
const classSelect = document.getElementById('class-select');
const trainBtn = document.getElementById('train-btn');
const resetNeural = document.getElementById('reset-neural');
const lrInput = document.getElementById('learning-rate');
const lrValue = document.getElementById('learning-rate-value');
const sampleCountEl = document.getElementById('sample-count');
const epochCountEl = document.getElementById('epoch-count');
const accuracyEl = document.getElementById('accuracy-value');

let points = [];
let weights = [Math.random() * 2 - 1, Math.random() * 2 - 1, 0];
let training = false;
let epochs = 0;

lrInput.addEventListener('input', () => {
  lrValue.textContent = Number(lrInput.value).toFixed(2);
});

function neuralScore(x, y) {
  const nx = x / neuralCanvas.width;
  const ny = y / neuralCanvas.height;
  return weights[0] * nx + weights[1] * ny + weights[2];
}

function neuralPredict(x, y) {
  return neuralScore(x, y) >= 0 ? 1 : -1;
}

function neuralAccuracy() {
  if (!points.length) return 0;
  const correct = points.filter((point) => neuralPredict(point.x, point.y) === point.label).length;
  return Math.round((correct / points.length) * 100);
}

function updateNeuralReadout() {
  sampleCountEl.textContent = String(points.length);
  epochCountEl.textContent = String(epochs);
  accuracyEl.textContent = `${neuralAccuracy()}%`;
}

function addNeuralPoint(event) {
  event.preventDefault();
  const p = mapCanvasPoint(event, neuralCanvas);
  const label = Number(classSelect.value);
  points.push({ x: p.x, y: p.y, label });
  recordProfile('neural-drop');
  updateNeuralReadout();
  drawNeural();
}

neuralCanvas.addEventListener('pointerdown', addNeuralPoint);

trainBtn.addEventListener('click', () => {
  training = !training;
  trainBtn.textContent = training ? 'Pause' : 'Train';
  recordProfile('train-toggle');
});

resetNeural.addEventListener('click', () => {
  points = [];
  weights = [Math.random() * 2 - 1, Math.random() * 2 - 1, 0];
  training = false;
  epochs = 0;
  trainBtn.textContent = 'Train';
  updateNeuralReadout();
  drawNeural();
});

function trainStep() {
  if (!training || points.length === 0) return;
  const lr = Number(lrInput.value);
  for (let i = 0; i < 12; i += 1) {
    const sample = points[Math.floor(Math.random() * points.length)];
    const nx = sample.x / neuralCanvas.width;
    const ny = sample.y / neuralCanvas.height;
    const pred = neuralPredict(sample.x, sample.y);
    const error = sample.label - pred;
    weights[0] += lr * error * nx;
    weights[1] += lr * error * ny;
    weights[2] += lr * error;
  }
  epochs += 1;
  updateNeuralReadout();
}

function drawNeural() {
  nctx.clearRect(0, 0, neuralCanvas.width, neuralCanvas.height);
  for (let y = 0; y < neuralCanvas.height; y += 16) {
    for (let x = 0; x < neuralCanvas.width; x += 16) {
      const score = neuralScore(x, y);
      const alpha = Math.min(0.28, 0.08 + Math.abs(score) * 0.18);
      nctx.fillStyle = score >= 0 ? `rgba(0, 255, 135, ${alpha})` : `rgba(255, 0, 128, ${alpha})`;
      nctx.fillRect(x, y, 16, 16);
    }
  }

  nctx.strokeStyle = 'rgba(96, 239, 255, 0.12)';
  nctx.lineWidth = 1;
  for (let x = 0; x <= neuralCanvas.width; x += 48) {
    nctx.beginPath();
    nctx.moveTo(x, 0);
    nctx.lineTo(x, neuralCanvas.height);
    nctx.stroke();
  }
  for (let y = 0; y <= neuralCanvas.height; y += 48) {
    nctx.beginPath();
    nctx.moveTo(0, y);
    nctx.lineTo(neuralCanvas.width, y);
    nctx.stroke();
  }

  if (Math.abs(weights[1]) > 0.0001) {
    const y1 = ((-weights[2] - weights[0] * 0) / weights[1]) * neuralCanvas.height;
    const y2 = ((-weights[2] - weights[0] * 1) / weights[1]) * neuralCanvas.height;
    nctx.strokeStyle = 'rgba(255, 204, 0, 0.9)';
    nctx.lineWidth = 2;
    nctx.beginPath();
    nctx.moveTo(0, y1);
    nctx.lineTo(neuralCanvas.width, y2);
    nctx.stroke();
  }

  points.forEach((p) => {
    const color = p.label === 1 ? '#00ff87' : '#ff0080';
    nctx.beginPath();
    nctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
    nctx.fillStyle = 'rgba(3, 8, 16, 0.85)';
    nctx.fill();
    nctx.lineWidth = 2;
    nctx.strokeStyle = color;
    nctx.shadowColor = color;
    nctx.shadowBlur = 18;
    nctx.stroke();
    nctx.beginPath();
    nctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
    nctx.fillStyle = color;
    nctx.fill();
    nctx.shadowBlur = 0;
  });
}

// Algorithm Arena
const algoCanvas = document.getElementById('algo-canvas');
const actx = algoCanvas.getContext('2d');
const algoSelect = document.getElementById('algo-select');
const patternSelect = document.getElementById('pattern-select');
const sizeInput = document.getElementById('array-size');
const sizeValue = document.getElementById('array-size-value');
const shuffleBtn = document.getElementById('shuffle-btn');
const sortBtn = document.getElementById('sort-btn');
const operationsEl = document.getElementById('operations');
const sortedValueEl = document.getElementById('sorted-value');
const patternValueEl = document.getElementById('pattern-value');

let arr = [];
let operations = 0;
let sorting = false;

function titleCase(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function buildPattern(size, pattern) {
  if (pattern === 'reverse') {
    return Array.from({ length: size }, (_, i) => size - i);
  }
  if (pattern === 'wave') {
    return Array.from({ length: size }, (_, i) => {
      const normalized = (Math.sin((i / Math.max(1, size - 1)) * Math.PI * 3) + 1) * 0.5;
      return Math.max(1, Math.round(normalized * (size - 1)) + 1);
    });
  }
  const next = Array.from({ length: size }, (_, i) => i + 1);
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function sortedPercent() {
  if (arr.length < 2) return 100;
  let sortedPairs = 0;
  for (let i = 1; i < arr.length; i += 1) {
    if (arr[i] >= arr[i - 1]) sortedPairs += 1;
  }
  return Math.round((sortedPairs / (arr.length - 1)) * 100);
}

function updateAlgorithmReadout() {
  operationsEl.textContent = String(operations);
  sortedValueEl.textContent = `${sortedPercent()}%`;
  patternValueEl.textContent = titleCase(patternSelect.value);
}

function resetArray() {
  if (sorting) return;
  const size = Number(sizeInput.value);
  sizeValue.textContent = String(size);
  arr = buildPattern(size, patternSelect.value);
  operations = 0;
  updateAlgorithmReadout();
  drawArray();
}

sizeInput.addEventListener('input', resetArray);
patternSelect.addEventListener('change', resetArray);
shuffleBtn.addEventListener('click', resetArray);

function drawArray(highlight = -1, pivotIndex = -1) {
  actx.clearRect(0, 0, algoCanvas.width, algoCanvas.height);
  const barW = algoCanvas.width / arr.length;
  const max = Math.max(...arr, 1);

  for (let i = 0; i < arr.length; i += 1) {
    const h = (arr[i] / max) * (algoCanvas.height - 20);
    const x = i * barW;
    const y = algoCanvas.height - h;
    let fill = i === highlight ? '#ffcc00' : i === pivotIndex ? '#ff0080' : '#00ff87';
    if (i !== highlight && i !== pivotIndex) {
      const hue = 150 + (arr[i] / max) * 80;
      fill = `hsl(${hue} 100% 62%)`;
    }
    actx.fillStyle = fill;
    actx.fillRect(x, y, Math.max(1, barW - 1), h);
    actx.fillStyle = 'rgba(255,255,255,0.05)';
    actx.fillRect(x, y, Math.max(1, barW - 1), Math.min(8, h));
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
    if (operations % 4 === 0) {
      updateAlgorithmReadout();
      drawArray(j, r);
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
    if (operations % 4 === 0) {
      updateAlgorithmReadout();
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
  updateAlgorithmReadout();
  recordProfile('sort', { algorithm: algoSelect.value, pattern: patternSelect.value });
  if (algoSelect.value === 'quick') {
    await quickSortVisual();
  } else {
    await mergeSortVisual();
  }
  updateAlgorithmReadout();
  drawArray();
  sorting = false;
});

// Systems Pulse
const systemsCanvas = document.getElementById('systems-canvas');
const sctx = systemsCanvas.getContext('2d');
const pulseBtn = document.getElementById('pulse-btn');
const pulseCountEl = document.getElementById('pulse-count');
const resonanceValueEl = document.getElementById('resonance-value');
const mouse = { x: systemsCanvas.width / 2, y: systemsCanvas.height / 2 };

const particles = Array.from({ length: 95 }, () => ({
  x: Math.random() * systemsCanvas.width,
  y: Math.random() * systemsCanvas.height,
  vx: (Math.random() - 0.5) * 1.4,
  vy: (Math.random() - 0.5) * 1.4,
  r: Math.random() * 2 + 1,
}));

const pulses = [];
let pulseCount = 0;
let resonance = 0;

function updateSystemsReadout() {
  pulseCountEl.textContent = String(pulseCount);
  resonanceValueEl.textContent = resonance.toFixed(2);
}

function injectPulse(x = mouse.x, y = mouse.y) {
  pulses.push({ x, y, radius: 12, strength: 1 });
  pulseCount += 1;
  recordProfile('pulse');
  updateSystemsReadout();
}

systemsCanvas.addEventListener('pointermove', (event) => {
  Object.assign(mouse, mapCanvasPoint(event, systemsCanvas));
});

systemsCanvas.addEventListener('pointerdown', (event) => {
  event.preventDefault();
  const p = mapCanvasPoint(event, systemsCanvas);
  Object.assign(mouse, p);
  injectPulse(p.x, p.y);
});

pulseBtn.addEventListener('click', () => injectPulse());

downloadArtifactBtn.addEventListener('click', () => {
  const payload = {
    title: 'NEXUS Adaptive Portfolio Artifact',
    exportedAt: new Date().toISOString(),
    creator: 'DoubleA @ AntManThePro',
    profile: {
      style: profileStyle(),
      complexity: profileComplexity(),
      curiosity: `${profileCuriosity()}%`,
      favoriteArena: profileFavoriteArena(),
      raw: profile,
    },
    neuralForge: {
      samples: points.length,
      epochs,
      accuracy: `${neuralAccuracy()}%`,
      learningRate: Number(lrInput.value),
      weights: weights.map((value) => Number(value.toFixed(4))),
    },
    algorithmArena: {
      algorithm: algoSelect.value,
      pattern: patternSelect.value,
      operations,
      sorted: `${sortedPercent()}%`,
      size: arr.length,
    },
    systemsPulse: {
      pulses: pulseCount,
      resonance: Number(resonance.toFixed(2)),
      particles: particles.length,
    },
    summary:
      'Interactive NEXUS command artifact demonstrating classifier training, live sorting analytics, adaptive UI telemetry, and a reactive signal mesh.',
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'nexus-adaptive-artifact.json';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
});

function drawSystems() {
  sctx.clearRect(0, 0, systemsCanvas.width, systemsCanvas.height);
  resonance = 0;

  for (let i = pulses.length - 1; i >= 0; i -= 1) {
    const pulse = pulses[i];
    pulse.radius += 3.5;
    pulse.strength *= 0.985;
    sctx.strokeStyle = `rgba(255, 204, 0, ${pulse.strength * 0.5})`;
    sctx.lineWidth = 2;
    sctx.beginPath();
    sctx.arc(pulse.x, pulse.y, pulse.radius, 0, Math.PI * 2);
    sctx.stroke();
    if (pulse.strength < 0.08) pulses.splice(i, 1);
  }

  for (let i = 0; i < particles.length; i += 1) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;

    if (p.x < 0 || p.x > systemsCanvas.width) p.vx *= -1;
    if (p.y < 0 || p.y > systemsCanvas.height) p.vy *= -1;

    const dxm = mouse.x - p.x;
    const dym = mouse.y - p.y;
    const dm = Math.hypot(dxm, dym) || 1;
    if (dm < 180) {
      p.vx += (dxm / dm) * 0.012;
      p.vy += (dym / dm) * 0.012;
      resonance += (180 - dm) / 1800;
    }

    pulses.forEach((pulse) => {
      const dx = p.x - pulse.x;
      const dy = p.y - pulse.y;
      const distance = Math.hypot(dx, dy) || 1;
      const influence = Math.max(0, 1 - Math.abs(distance - pulse.radius) / 48) * pulse.strength;
      if (influence > 0) {
        p.vx += (dx / distance) * influence * 0.08;
        p.vy += (dy / distance) * influence * 0.08;
        resonance += influence * 0.2;
      }
    });

    p.vx *= 0.992;
    p.vy *= 0.992;

    sctx.fillStyle = i % 3 === 0 ? '#ff0080' : i % 2 ? '#60efff' : '#00ff87';
    sctx.beginPath();
    sctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    sctx.fill();

    for (let j = i + 1; j < particles.length; j += 1) {
      const q = particles[j];
      const dx = p.x - q.x;
      const dy = p.y - q.y;
      const d = Math.hypot(dx, dy);
      if (d < 92) {
        sctx.strokeStyle = `rgba(96, 239, 255, ${(1 - d / 92) * 0.55})`;
        sctx.lineWidth = d < 48 ? 1.4 : 0.8;
        sctx.beginPath();
        sctx.moveTo(p.x, p.y);
        sctx.lineTo(q.x, q.y);
        sctx.stroke();
      }
    }
  }

  resonance = Math.min(9.99, resonance);
  updateSystemsReadout();
}

function tick() {
  trainStep();
  drawNeural();
  drawSystems();
  requestAnimationFrame(tick);
}

resetArray();
updateNeuralReadout();
renderProfile();
drawNeural();
updateSystemsReadout();
tick();
