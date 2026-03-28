import React, { useRef, useEffect, useState, useCallback, memo } from 'react';

interface Point {
  x: number;
  y: number;
  label: 1 | -1;
}

function mapCanvasPoint(event: React.PointerEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement) {
  const rect = canvas.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * canvas.width;
  const y = ((event.clientY - rect.top) / rect.height) * canvas.height;
  return { x, y };
}

const NeuralForge = memo(function NeuralForge() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointsRef = useRef<Point[]>([]);
  const weightsRef = useRef<number[]>([Math.random() * 2 - 1, Math.random() * 2 - 1, 0]);
  const trainingRef = useRef(false);
  const animationIdRef = useRef<number>(0);
  const lrRef = useRef(0.2);

  const [training, setTraining] = useState(false);
  const [labelClass, setLabelClass] = useState<1 | -1>(1);
  const [lr, setLr] = useState(0.2);
  const [epoch, setEpoch] = useState(0);
  const [accuracy, setAccuracy] = useState(0);

  const predict = useCallback((x: number, y: number, canvas: HTMLCanvasElement) => {
    const nx = x / canvas.width;
    const ny = y / canvas.height;
    const w = weightsRef.current;
    const z = w[0] * nx + w[1] * ny + w[2];
    return z >= 0 ? 1 : -1;
  }, []);

  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = ctx.createImageData(canvas.width, canvas.height);
    for (let py = 0; py < canvas.height; py += 4) {
      for (let px = 0; px < canvas.width; px += 4) {
        const idx = (py * canvas.width + px) * 4;
        const p = predict(px, py, canvas);
        const c = p === 1 ? [0, 255, 135] : [255, 0, 128];
        for (let dy = 0; dy < 4 && py + dy < canvas.height; dy++) {
          for (let dx = 0; dx < 4 && px + dx < canvas.width; dx++) {
            const i = ((py + dy) * canvas.width + (px + dx)) * 4;
            img.data[i] = c[0];
            img.data[i + 1] = c[1];
            img.data[i + 2] = c[2];
            img.data[i + 3] = 42;
          }
        }
      }
    }
    ctx.putImageData(img, 0, 0);

    pointsRef.current.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 7, 0, Math.PI * 2);
      ctx.fillStyle = p.label === 1 ? '#00ff87' : '#ff0080';
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 14;
      ctx.fill();
      ctx.shadowBlur = 0;
    });
  }, [predict]);

  const trainStep = useCallback(() => {
    if (!trainingRef.current || pointsRef.current.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = weightsRef.current;
    const lr2 = lrRef.current;
    for (let i = 0; i < 12; i++) {
      const sample = pointsRef.current[(Math.random() * pointsRef.current.length) | 0];
      const nx = sample.x / canvas.width;
      const ny = sample.y / canvas.height;
      const pred = predict(sample.x, sample.y, canvas);
      const error = sample.label - pred;
      w[0] += lr2 * error * nx;
      w[1] += lr2 * error * ny;
      w[2] += lr2 * error;
    }
  }, [predict]);

  useEffect(() => {
    let frameCount = 0;
    const tick = () => {
      trainStep();
      drawFrame();
      frameCount++;
      if (frameCount % 30 === 0 && pointsRef.current.length > 0) {
        const canvas = canvasRef.current;
        if (canvas) {
          const correct = pointsRef.current.filter(
            (p) => predict(p.x, p.y, canvas) === p.label
          ).length;
          setAccuracy(Math.round((correct / pointsRef.current.length) * 100));
          setEpoch((e) => e + 1);
        }
      }
      animationIdRef.current = requestAnimationFrame(tick);
    };
    animationIdRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationIdRef.current);
  }, [trainStep, drawFrame, predict]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const p = mapCanvasPoint(e, canvas);
      pointsRef.current = [...pointsRef.current, { x: p.x, y: p.y, label: labelClass }];
    },
    [labelClass]
  );

  const handleReset = useCallback(() => {
    pointsRef.current = [];
    weightsRef.current = [Math.random() * 2 - 1, Math.random() * 2 - 1, 0];
    trainingRef.current = false;
    setTraining(false);
    setEpoch(0);
    setAccuracy(0);
  }, []);

  const toggleTraining = useCallback(() => {
    const next = !trainingRef.current;
    trainingRef.current = next;
    setTraining(next);
  }, []);

  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      <div
        style={{
          background: 'var(--panel)',
          border: '1px solid var(--line)',
          borderRadius: '0.8rem',
          padding: '0.8rem',
        }}
      >
        <h2 style={{ margin: '0 0 0.3rem', color: 'var(--yellow)' }}>Neural Forge</h2>
        <p style={{ margin: '0 0 0.7rem', color: '#b5e9ef', fontSize: '0.95rem' }}>
          Train a live perceptron classifier by dropping data points. Pink and green are opposing
          classes. Press <strong>Train</strong> to watch the decision field evolve in real time.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem 0.8rem' }}>
          <label style={{ fontSize: '0.82rem', color: 'var(--cyan)', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            Class
            <select
              value={labelClass}
              onChange={(e) => setLabelClass(Number(e.target.value) as 1 | -1)}
              style={{ background: 'rgba(8,14,24,0.8)', border: '1px solid var(--line)', color: '#c2f9ff', padding: '0.2rem' }}
            >
              <option value={1}>Green (+1)</option>
              <option value={-1}>Pink (-1)</option>
            </select>
          </label>
          <label style={{ fontSize: '0.82rem', color: 'var(--cyan)', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            Learning Rate
            <input
              type="range"
              min="0.01"
              max="1"
              step="0.01"
              value={lr}
              onChange={(e) => {
                const v = Number(e.target.value);
                setLr(v);
                lrRef.current = v;
              }}
            />
            <span>{lr.toFixed(2)}</span>
          </label>
          <button onClick={toggleTraining} style={btnStyle}>
            {training ? 'Pause' : 'Train'}
          </button>
          <button onClick={handleReset} style={btnStyle}>
            Reset
          </button>
        </div>
        <div style={{ marginTop: '0.6rem', color: 'var(--green)', fontSize: '0.85rem', display: 'flex', gap: '1rem' }}>
          <span>Samples: {pointsRef.current.length}</span>
          <span>Epoch: {epoch}</span>
          <span>Accuracy: {accuracy}%</span>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        width={960}
        height={540}
        onPointerDown={handlePointerDown}
        style={canvasStyle}
        aria-label="Neural Forge canvas - click to add data points"
      />
    </div>
  );
});

const btnStyle: React.CSSProperties = {
  border: '1px solid rgba(255, 0, 128, 0.5)',
  background: 'rgba(255, 0, 128, 0.12)',
  color: '#ffd4eb',
  padding: '0.42rem 0.7rem',
  borderRadius: '0.45rem',
  cursor: 'pointer',
};

const canvasStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: '100%',
  borderRadius: '0.8rem',
  border: '1px solid var(--line)',
  background: 'linear-gradient(180deg, rgba(3,8,16,0.92), rgba(1,3,8,0.95))',
  minHeight: '280px',
  cursor: 'crosshair',
};

export default NeuralForge;
