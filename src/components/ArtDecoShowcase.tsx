import React, { useRef, useEffect, useState, useCallback, memo } from 'react';

interface Tier {
  base: number;
  height: number;
  color: string;
  y: number;
}

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface Sparkle {
  x: number;
  y: number;
  size: number;
  speed: number;
}

const TIERS: Tier[] = [
  { base: 80, height: 60, color: '#B87333', y: -120 },
  { base: 140, height: 50, color: '#D4AF37', y: -60 },
  { base: 200, height: 50, color: '#008B8B', y: -10 },
  { base: 260, height: 40, color: '#A0522D', y: 40 },
];

const LAYER_INFO = [
  {
    title: 'Peak Compartment',
    description:
      'The apex houses your most treasured pieces. Lined with premium velvet, this intimate space is perfect for statement rings or rare collectibles.',
    details: ['Capacity: 3–4 rings or small items', 'Material: Brushed copper finish', 'Design: Geometric pyramid cap'],
  },
  {
    title: 'Upper Chamber',
    description:
      'Designed for delicate chains and bracelets. The teal-accented dividers prevent tangling while showcasing Art Deco motifs.',
    details: ['Capacity: 5–6 necklaces or bracelets', 'Material: Teal lacquer interior', 'Design: Stepped geometric pattern'],
  },
  {
    title: 'Mid Chamber',
    description:
      'The versatile workhorse layer. Store earrings, cufflinks, or watches in individually sectioned compartments with magnetic closures.',
    details: ['Capacity: 8–10 pairs of earrings', 'Material: Mixed metal accents', 'Design: Modular divider system'],
  },
  {
    title: 'Foundation Level',
    description:
      'The grandest tier features a hidden drawer and mirror inlay. Store larger items like bangles, brooches, or keepsakes.',
    details: ['Capacity: 6–8 large items', 'Material: Polished brass base', 'Design: Secret compartment access'],
  },
];

function adjustBrightness(hex: string, factor: number): string {
  const h = hex.replace('#', '');
  const r = Math.min(255, Math.round(parseInt(h.substring(0, 2), 16) * factor));
  const g = Math.min(255, Math.round(parseInt(h.substring(2, 4), 16) * factor));
  const b = Math.min(255, Math.round(parseInt(h.substring(4, 6), 16) * factor));
  return `rgb(${r},${g},${b})`;
}

const ArtDecoShowcase = memo(function ArtDecoShowcase() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotationRef = useRef({ x: 0.5, y: 0.5 });
  const scaleRef = useRef(1);
  const isDraggingRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });
  const autoRotateRef = useRef(false);
  const animIdRef = useRef<number>(0);
  const currentLayerRef = useRef(1);
  const sparklesRef = useRef<Sparkle[]>([]);
  const needsRedrawRef = useRef(true);

  const [autoRotate, setAutoRotate] = useState(false);
  const [activeLayer, setActiveLayer] = useState(1);

  // Initialise sparkles once canvas dimensions are known
  const initSparkles = useCallback((w: number, h: number) => {
    sparklesRef.current = Array.from({ length: 30 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      size: Math.random() * 2 + 1,
      speed: Math.random() * 0.5 + 0.2,
    }));
  }, []);

  const project3D = useCallback(
    (pt: Point3D, w: number, h: number): { x: number; y: number } => {
      const { x: rx, y: ry } = rotationRef.current;
      const sc = scaleRef.current;
      const cosX = Math.cos(rx);
      const sinX = Math.sin(rx);
      const cosY = Math.cos(ry);
      const sinY = Math.sin(ry);

      const y1 = pt.y * cosX - pt.z * sinX;
      const z1 = pt.y * sinX + pt.z * cosX;
      const x1 = pt.x * cosY + z1 * sinY;
      const z2 = -pt.x * sinY + z1 * cosY;

      const persp = 400 / (400 + z2);
      return {
        x: w / 2 + x1 * persp * sc,
        y: h / 2 + y1 * persp * sc,
      };
    },
    []
  );

  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Draw pyramid tiers
    TIERS.forEach((tier, index) => {
      const half = tier.base / 2;
      const corners: Point3D[] = [
        { x: -half, y: tier.y + tier.height, z: -half },
        { x: half, y: tier.y + tier.height, z: -half },
        { x: half, y: tier.y + tier.height, z: half },
        { x: -half, y: tier.y + tier.height, z: half },
        { x: 0, y: tier.y, z: 0 },
      ];

      const projected = corners.map((c) => project3D(c, w, h));

      const faces = [
        { pts: [0, 1, 4], z: (corners[0].z + corners[1].z + corners[4].z) / 3 },
        { pts: [1, 2, 4], z: (corners[1].z + corners[2].z + corners[4].z) / 3 },
        { pts: [2, 3, 4], z: (corners[2].z + corners[3].z + corners[4].z) / 3 },
        { pts: [3, 0, 4], z: (corners[3].z + corners[0].z + corners[4].z) / 3 },
        { pts: [0, 1, 2, 3], z: corners[0].z },
      ];

      faces.sort((a, b) => a.z - b.z);

      faces.forEach((face) => {
        ctx.beginPath();
        ctx.moveTo(projected[face.pts[0]].x, projected[face.pts[0]].y);
        face.pts.forEach((p) => ctx.lineTo(projected[p].x, projected[p].y));
        ctx.closePath();
        const brightness = index === currentLayerRef.current - 1 ? 1.2 : 0.8;
        ctx.fillStyle = adjustBrightness(tier.color, brightness);
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.stroke();
      });
    });

    // Draw sparkles (always animate when the loop is running)
    sparklesRef.current.forEach((s) => {
      ctx.fillStyle = 'rgba(212,175,55,0.6)';
      ctx.fillRect(s.x, s.y, s.size, s.size);
      s.y += s.speed;
      if (s.y > h) s.y = 0;
    });
  }, [project3D]);

  // Animation loop — only keeps itself alive while auto-rotate is enabled.
  // When auto-rotate is off the loop stops; a single redraw is requested via
  // needsRedrawRef whenever the user interacts with the canvas.
  const startLoop = useCallback(() => {
    if (animIdRef.current !== 0 || !autoRotateRef.current) return; // guard: only start when enabled
    const loop = () => {
      if (autoRotateRef.current) {
        rotationRef.current.y += 0.01;
        drawFrame();
        animIdRef.current = requestAnimationFrame(loop);
      } else {
        // Loop has stopped; clear the id so startLoop can be called again later.
        animIdRef.current = 0;
      }
    };
    animIdRef.current = requestAnimationFrame(loop);
  }, [drawFrame]);

  // Request a single redraw when auto-rotate is off (user interaction or
  // initial mount).
  const requestRedraw = useCallback(() => {
    if (autoRotateRef.current) return; // loop handles it
    if (!needsRedrawRef.current) return; // already scheduled
    needsRedrawRef.current = false;
    requestAnimationFrame(() => {
      drawFrame();
      needsRedrawRef.current = true;
    });
  }, [drawFrame]);

  // Initial setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    initSparkles(canvas.width, canvas.height);
    drawFrame(); // draw once on mount
    return () => {
      cancelAnimationFrame(animIdRef.current);
      animIdRef.current = 0;
    };
  }, [initSparkles, drawFrame]);

  const handleAutoRotate = useCallback(() => {
    const next = !autoRotateRef.current;
    autoRotateRef.current = next;
    setAutoRotate(next);
    if (next) {
      startLoop();
    } else {
      // The loop will self-cancel on the next tick; request a static redraw.
      requestRedraw();
    }
  }, [startLoop, requestRedraw]);

  const handleReset = useCallback(() => {
    rotationRef.current = { x: 0.5, y: 0.5 };
    scaleRef.current = 1;
    requestRedraw();
  }, [requestRedraw]);

  const handleLayerChange = useCallback(
    (layer: number) => {
      currentLayerRef.current = layer;
      setActiveLayer(layer);
      requestRedraw();
    },
    [requestRedraw]
  );

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - lastMouseRef.current.x;
      const dy = e.clientY - lastMouseRef.current.y;
      rotationRef.current.y += dx * 0.01;
      rotationRef.current.x += dy * 0.01;
      lastMouseRef.current = { x: e.clientX, y: e.clientY };
      requestRedraw();
    },
    [requestRedraw]
  );

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      scaleRef.current = Math.max(0.5, Math.min(2, scaleRef.current + e.deltaY * -0.001));
      requestRedraw();
    },
    [requestRedraw]
  );

  const layerInfo = LAYER_INFO[activeLayer - 1];

  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      {/* Header panel */}
      <div
        style={{
          background: 'var(--panel)',
          border: '1px solid var(--line)',
          borderRadius: '0.8rem',
          padding: '0.8rem',
        }}
      >
        <h2 style={{ margin: '0 0 0.3rem', color: 'var(--yellow)' }}>Art Deco Pyramid Jewelry Box</h2>
        <p style={{ margin: '0 0 0.7rem', color: '#b5e9ef', fontSize: '0.95rem' }}>
          360° interactive viewer — drag to rotate · scroll to zoom · select a tier to explore.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem 0.8rem' }}>
          <button onClick={handleAutoRotate} style={btnStyle}>
            {autoRotate ? 'Stop Rotation' : 'Auto Rotate'}
          </button>
          <button onClick={handleReset} style={btnStyle}>
            Reset View
          </button>
        </div>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={960}
        height={400}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={canvasStyle}
        aria-label="Art Deco Pyramid Jewelry Box 360° viewer"
      />

      {/* Tier navigator */}
      <div
        style={{
          background: 'var(--panel)',
          border: '1px solid var(--line)',
          borderRadius: '0.8rem',
          padding: '0.8rem',
        }}
      >
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.8rem' }}>
          {LAYER_INFO.map((_, i) => {
            const tier = i + 1;
            const isActive = activeLayer === tier;
            return (
              <button
                key={tier}
                onClick={() => handleLayerChange(tier)}
                style={{
                  ...btnStyle,
                  border: `1px solid ${isActive ? 'var(--yellow)' : 'var(--line)'}`,
                  background: isActive ? 'rgba(255,204,0,0.15)' : 'rgba(8,14,24,0.8)',
                  color: isActive ? 'var(--yellow)' : '#c2f9ff',
                  boxShadow: isActive ? '0 0 12px rgba(255,204,0,0.3)' : 'none',
                }}
              >
                Tier {tier}
              </button>
            );
          })}
        </div>
        <h3 style={{ margin: '0 0 0.4rem', color: 'var(--yellow)' }}>{layerInfo.title}</h3>
        <p style={{ margin: '0 0 0.5rem', color: '#b5e9ef', fontSize: '0.9rem' }}>{layerInfo.description}</p>
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', color: 'var(--green)', fontSize: '0.85rem' }}>
          {layerInfo.details.map((d) => (
            <li key={d}>✦ {d}</li>
          ))}
        </ul>
      </div>
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
  cursor: 'grab',
};

export default ArtDecoShowcase;
