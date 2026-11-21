import React, { useRef, useEffect, useState, useCallback, memo } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  pulse: number;
}

function createParticles(count: number, w: number, h: number): Particle[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 1.4,
    vy: (Math.random() - 0.5) * 1.4,
    r: Math.random() * 2 + 1,
    pulse: 0,
  }));
}

const MAX_SPEED = 2.5;
const CONNECT_DIST = 90;
const CONNECT_DIST_SQ = CONNECT_DIST * CONNECT_DIST;

const SystemsPulse = memo(function SystemsPulse() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 480, y: 270 });
  const animationIdRef = useRef<number>(0);
  const pulseCountRef = useRef(0);
  const resonanceRef = useRef(0);

  const [pulseCount, setPulseCount] = useState(0);
  const [resonance, setResonance] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    ctxRef.current = canvas.getContext('2d');
    particlesRef.current = createParticles(95, canvas.width, canvas.height);

    // Reusable buckets for batching line strokes by quantised alpha (0.1 steps → ≤10 buckets).
    // Each bucket stores flat [x1, y1, x2, y2, …] coordinates.
    const alphaBuckets = new Map<number, number[]>();

    let frame = 0;
    const draw = () => {
      const ctx = ctxRef.current;
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const ps = particlesRef.current;
      let totalResonance = 0;

      // --- Update + draw particles ---
      for (let i = 0; i < ps.length; i++) {
        const p = ps[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        const dxm = mouseRef.current.x - p.x;
        const dym = mouseRef.current.y - p.y;
        const dm = Math.hypot(dxm, dym) || 1;
        if (dm < 160) {
          p.vx += (dxm / dm) * 0.01;
          p.vy += (dym / dm) * 0.01;
        }

        // Clamp speed so particles don't accelerate indefinitely near the cursor.
        const speed = Math.hypot(p.vx, p.vy);
        if (speed > MAX_SPEED) {
          const inv = MAX_SPEED / speed;
          p.vx *= inv;
          p.vy *= inv;
        }

        if (p.pulse > 0) {
          p.pulse -= 0.05;
          totalResonance += p.pulse;
        }

        const alpha = 0.6 + (p.pulse > 0 ? p.pulse * 0.4 : 0);
        ctx.fillStyle = i % 2 ? `rgba(96,239,255,${alpha})` : `rgba(0,255,135,${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r + (p.pulse > 0 ? p.pulse * 2 : 0), 0, Math.PI * 2);
        ctx.fill();
      }

      // --- Batch connection lines by quantised alpha (≤10 stroke() calls instead of O(n²)) ---
      alphaBuckets.clear();
      for (let i = 0; i < ps.length; i++) {
        for (let j = i + 1; j < ps.length; j++) {
          const dx = ps[i].x - ps[j].x;
          const dy = ps[i].y - ps[j].y;
          const dSq = dx * dx + dy * dy;
          if (dSq < CONNECT_DIST_SQ) {
            const d = Math.sqrt(dSq);
            // Quantise to 0.1 steps to limit bucket count.
            const key = Math.round((1 - d / CONNECT_DIST) * 10) / 10;
            let bucket = alphaBuckets.get(key);
            if (!bucket) { bucket = []; alphaBuckets.set(key, bucket); }
            bucket.push(ps[i].x, ps[i].y, ps[j].x, ps[j].y);
          }
        }
      }
      ctx.strokeStyle = 'rgb(255, 0, 128)';
      ctx.lineWidth = 0.8;
      for (const [a, coords] of alphaBuckets) {
        ctx.globalAlpha = a;
        ctx.beginPath();
        for (let k = 0; k < coords.length; k += 4) {
          ctx.moveTo(coords[k], coords[k + 1]);
          ctx.lineTo(coords[k + 2], coords[k + 3]);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      frame++;
      if (frame % 30 === 0) {
        resonanceRef.current = Number((totalResonance / ps.length).toFixed(2));
        setResonance(resonanceRef.current);
      }

      animationIdRef.current = requestAnimationFrame(draw);
    };

    animationIdRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animationIdRef.current);
  }, []);

  const injectPulse = useCallback(() => {
    const ps = particlesRef.current;
    const count = Math.min(10, ps.length);
    for (let i = 0; i < count; i++) {
      const idx = (Math.random() * ps.length) | 0;
      ps[idx].pulse = 1;
    }
    pulseCountRef.current++;
    setPulseCount(pulseCountRef.current);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    mouseRef.current = {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  }, []);

  const handleCanvasClick = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cx = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const cy = ((e.clientY - rect.top) / rect.height) * canvas.height;
    const ps = particlesRef.current;
    for (let i = 0; i < ps.length; i++) {
      const d = Math.hypot(ps[i].x - cx, ps[i].y - cy);
      if (d < 80) ps[i].pulse = 1;
    }
    pulseCountRef.current++;
    setPulseCount(pulseCountRef.current);
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
        <h2 style={{ margin: '0 0 0.3rem', color: 'var(--yellow)' }}>Systems Pulse</h2>
        <p style={{ margin: '0 0 0.7rem', color: '#b5e9ef', fontSize: '0.95rem' }}>
          Particle mesh reacts to cursor movement. Click the canvas or press Inject Pulse to send
          a signal wave through the network.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem 0.8rem' }}>
          <button onClick={injectPulse} style={btnStyle}>
            Inject Pulse
          </button>
        </div>
        <div style={{ marginTop: '0.6rem', color: 'var(--green)', fontSize: '0.85rem', display: 'flex', gap: '1rem' }}>
          <span>Pulses: {pulseCount}</span>
          <span>Resonance: {resonance}</span>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        width={960}
        height={540}
        onMouseMove={handleMouseMove}
        onPointerDown={handleCanvasClick}
        style={canvasStyle}
        aria-label="Systems Pulse particle mesh canvas"
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

export default SystemsPulse;
