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

const SystemsPulse = memo(function SystemsPulse() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
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
    particlesRef.current = createParticles(95, canvas.width, canvas.height);

    let frame = 0;
    const draw = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const ps = particlesRef.current;
      let totalResonance = 0;

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

        if (p.pulse > 0) {
          p.pulse -= 0.05;
          totalResonance += p.pulse;
        }

        const alpha = 0.6 + (p.pulse > 0 ? p.pulse * 0.4 : 0);
        ctx.fillStyle = i % 2 ? `rgba(96,239,255,${alpha})` : `rgba(0,255,135,${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r + (p.pulse > 0 ? p.pulse * 2 : 0), 0, Math.PI * 2);
        ctx.fill();

        for (let j = i + 1; j < ps.length; j++) {
          const q = ps[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const d = Math.hypot(dx, dy);
          if (d < 90) {
            ctx.strokeStyle = `rgba(255, 0, 128, ${1 - d / 90})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
      }

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
