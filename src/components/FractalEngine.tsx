import React, { useRef, useEffect, useState, useCallback, memo } from 'react';

// ---------------------------------------------------------------------------
// Fractal types
// ---------------------------------------------------------------------------
type FractalKind = 'mandelbrot' | 'julia' | 'burning';
type Palette = 'nexus' | 'fire' | 'ice' | 'mono';

// ---------------------------------------------------------------------------
// Color palettes
// ---------------------------------------------------------------------------
function makeGradient(stops: [number, number, number][]): Uint8Array {
  const out = new Uint8Array(768); // 256 × 3
  for (let i = 0; i < 256; i++) {
    const t = i / 255;
    const seg = (stops.length - 1) * t;
    const lo = Math.floor(seg);
    const hi = Math.min(lo + 1, stops.length - 1);
    const frac = seg - lo;
    out[i * 3] = Math.round(stops[lo][0] * (1 - frac) + stops[hi][0] * frac);
    out[i * 3 + 1] = Math.round(stops[lo][1] * (1 - frac) + stops[hi][1] * frac);
    out[i * 3 + 2] = Math.round(stops[lo][2] * (1 - frac) + stops[hi][2] * frac);
  }
  return out;
}

const PALETTES: Record<Palette, Uint8Array> = {
  nexus: makeGradient([
    [0, 0, 0],
    [0, 60, 80],
    [0, 180, 120],    // #00b478 → near var(--green)
    [0, 255, 135],    // #00ff87 green
    [96, 239, 255],   // #60efff cyan
    [255, 204, 0],    // #ffcc00 yellow
    [255, 0, 128],    // #ff0080 pink
    [255, 255, 255],
  ]),
  fire: makeGradient([
    [0, 0, 0],
    [64, 0, 0],
    [255, 60, 0],
    [255, 200, 0],
    [255, 255, 160],
    [255, 255, 255],
  ]),
  ice: makeGradient([
    [0, 0, 30],
    [0, 60, 160],
    [0, 180, 255],
    [160, 240, 255],
    [255, 255, 255],
  ]),
  mono: makeGradient([
    [0, 0, 0],
    [0, 128, 0],
    [0, 255, 0],
    [255, 255, 0],
    [255, 255, 255],
  ]),
};

// ---------------------------------------------------------------------------
// Iteration core — returns smooth iteration count (0 if inside set)
// ---------------------------------------------------------------------------
function iterateMandelbrot(cx: number, cy: number, maxIter: number): number {
  let zx = 0, zy = 0;
  for (let i = 0; i < maxIter; i++) {
    const zx2 = zx * zx, zy2 = zy * zy;
    if (zx2 + zy2 > 4) {
      // Smooth coloring
      return i + 1 - Math.log(Math.log(Math.sqrt(zx2 + zy2))) / Math.log(2);
    }
    zy = 2 * zx * zy + cy;
    zx = zx2 - zy2 + cx;
  }
  return 0;
}

function iterateJulia(zx: number, zy: number, cx: number, cy: number, maxIter: number): number {
  for (let i = 0; i < maxIter; i++) {
    const zx2 = zx * zx, zy2 = zy * zy;
    if (zx2 + zy2 > 4) {
      return i + 1 - Math.log(Math.log(Math.sqrt(zx2 + zy2))) / Math.log(2);
    }
    const nx = zx2 - zy2 + cx;
    zy = 2 * zx * zy + cy;
    zx = nx;
  }
  return 0;
}

function iterateBurning(cx: number, cy: number, maxIter: number): number {
  let zx = 0, zy = 0;
  for (let i = 0; i < maxIter; i++) {
    const zx2 = zx * zx, zy2 = zy * zy;
    if (zx2 + zy2 > 4) {
      return i + 1 - Math.log(Math.log(Math.sqrt(zx2 + zy2))) / Math.log(2);
    }
    const nx = zx2 - zy2 + cx;
    zy = 2 * Math.abs(zx * zy) + cy;
    zx = Math.abs(nx);
  }
  return 0;
}

// ---------------------------------------------------------------------------
// Julia constant presets
// ---------------------------------------------------------------------------
const JULIA_PRESETS = [
  { label: 'Spiral', cx: -0.7269, cy: 0.1889 },
  { label: 'Dragon', cx: -0.8, cy: 0.156 },
  { label: 'Rabbit', cx: -0.123, cy: 0.745 },
  { label: 'Snowflake', cx: 0.285, cy: 0.013 },
  { label: 'Dendrite', cx: 0, cy: 1 },
];

// ---------------------------------------------------------------------------
// Render fractal into ImageData (runs synchronously, not in worker)
// ---------------------------------------------------------------------------
interface Viewport {
  cx: number;  // center x (real)
  cy: number;  // center y (imag)
  zoom: number; // pixels per unit
}

function renderFractal(
  imgData: ImageData,
  vp: Viewport,
  fractal: FractalKind,
  maxIter: number,
  pal: Uint8Array,
  juliaCx: number,
  juliaCy: number,
): void {
  const { width, height } = imgData;
  const data = imgData.data;
  const half_w = width / 2;
  const half_h = height / 2;

  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      const re = (px - half_w) / vp.zoom + vp.cx;
      const im = (py - half_h) / vp.zoom + vp.cy;

      let t: number;
      if (fractal === 'mandelbrot') {
        t = iterateMandelbrot(re, im, maxIter);
      } else if (fractal === 'julia') {
        t = iterateJulia(re, im, juliaCx, juliaCy, maxIter);
      } else {
        t = iterateBurning(re, im, maxIter);
      }

      const idx = (py * width + px) * 4;
      if (t === 0) {
        // Inside the set → black
        data[idx] = data[idx + 1] = data[idx + 2] = 0;
      } else {
        // Smooth color lookup
        const normalized = ((t / maxIter) * 255 * 4) % 255;
        const ci = Math.floor(normalized) * 3;
        data[idx] = pal[ci];
        data[idx + 1] = pal[ci + 1];
        data[idx + 2] = pal[ci + 2];
      }
      data[idx + 3] = 255;
    }
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const DEFAULT_VP: Viewport = { cx: -0.5, cy: 0, zoom: 220 };

const FractalEngine = memo(function FractalEngine() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const vpRef = useRef<Viewport>({ ...DEFAULT_VP });
  const renderIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPanRef = useRef(false);
  const lastPanRef = useRef({ x: 0, y: 0 });

  const [fractal, setFractal] = useState<FractalKind>('mandelbrot');
  const [palette, setPalette] = useState<Palette>('nexus');
  const [maxIter, setMaxIter] = useState(120);
  const [juliaCx, setJuliaCx] = useState(JULIA_PRESETS[0].cx);
  const [juliaCy, setJuliaCy] = useState(JULIA_PRESETS[0].cy);
  const [juliaPreset, setJuliaPreset] = useState(0);
  const [rendering, setRendering] = useState(false);
  const [coords, setCoords] = useState({ re: 0, im: 0 });
  const [zoomLevel, setZoomLevel] = useState(220);

  // Trigger fractal render (deferred to avoid blocking UI)
  const scheduleRender = useCallback((
    _fractal: FractalKind,
    _maxIter: number,
    _palette: Palette,
    _juliaCx: number,
    _juliaCy: number,
  ) => {
    if (renderIdRef.current) clearTimeout(renderIdRef.current);
    setRendering(true);

    renderIdRef.current = setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const imgData = ctx.createImageData(canvas.width, canvas.height);
      renderFractal(
        imgData,
        vpRef.current,
        _fractal,
        _maxIter,
        PALETTES[_palette],
        _juliaCx,
        _juliaCy,
      );
      ctx.putImageData(imgData, 0, 0);
      setRendering(false);
      setZoomLevel(Math.round(vpRef.current.zoom));
    }, 30);
  }, []);

  // Resize canvas + initial render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const w = Math.min(canvas.parentElement?.clientWidth ?? 700, 900);
      canvas.width = w;
      canvas.height = Math.round(w * 0.56);
      scheduleRender(fractal, maxIter, palette, juliaCx, juliaCy);
    };
    resize();
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      if (renderIdRef.current) clearTimeout(renderIdRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-render when params change
  useEffect(() => {
    scheduleRender(fractal, maxIter, palette, juliaCx, juliaCy);
  }, [fractal, maxIter, palette, juliaCx, juliaCy, scheduleRender]);

  // -------------------------------------------------------------------------
  // Interaction: zoom (wheel + pinch)
  // -------------------------------------------------------------------------
  const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();

    const mx = (e.clientX - rect.left) / rect.width * canvas.width;
    const my = (e.clientY - rect.top) / rect.height * canvas.height;
    const vp = vpRef.current;

    // world coords of mouse
    const mouseRe = (mx - canvas.width / 2) / vp.zoom + vp.cx;
    const mouseIm = (my - canvas.height / 2) / vp.zoom + vp.cy;

    const factor = e.deltaY < 0 ? 1.35 : 1 / 1.35;
    vp.zoom *= factor;
    vp.cx = mouseRe - (mx - canvas.width / 2) / vp.zoom;
    vp.cy = mouseIm - (my - canvas.height / 2) / vp.zoom;

    scheduleRender(fractal, maxIter, palette, juliaCx, juliaCy);
  }, [fractal, maxIter, palette, juliaCx, juliaCy, scheduleRender]);

  // -------------------------------------------------------------------------
  // Pan
  // -------------------------------------------------------------------------
  const onPointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    isPanRef.current = true;
    lastPanRef.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    // Update coord display
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;
    const vp = vpRef.current;
    setCoords({
      re: ((mx - canvas.width / 2) / vp.zoom + vp.cx),
      im: ((my - canvas.height / 2) / vp.zoom + vp.cy),
    });

    if (!isPanRef.current) return;
    const dx = (e.clientX - lastPanRef.current.x) * scaleX;
    const dy = (e.clientY - lastPanRef.current.y) * scaleY;
    lastPanRef.current = { x: e.clientX, y: e.clientY };
    vp.cx -= dx / vp.zoom;
    vp.cy -= dy / vp.zoom;
    scheduleRender(fractal, maxIter, palette, juliaCx, juliaCy);
  }, [fractal, maxIter, palette, juliaCx, juliaCy, scheduleRender]);

  const onPointerUp = useCallback(() => { isPanRef.current = false; }, []);

  // -------------------------------------------------------------------------
  // Reset
  // -------------------------------------------------------------------------
  const resetView = useCallback(() => {
    if (fractal === 'mandelbrot') {
      vpRef.current = { cx: -0.5, cy: 0, zoom: 220 };
    } else if (fractal === 'burning') {
      vpRef.current = { cx: -0.5, cy: -0.5, zoom: 180 };
    } else {
      vpRef.current = { cx: 0, cy: 0, zoom: 220 };
    }
    scheduleRender(fractal, maxIter, palette, juliaCx, juliaCy);
  }, [fractal, maxIter, palette, juliaCx, juliaCy, scheduleRender]);

  const applyJuliaPreset = useCallback((idx: number) => {
    setJuliaPreset(idx);
    setJuliaCx(JULIA_PRESETS[idx].cx);
    setJuliaCy(JULIA_PRESETS[idx].cy);
  }, []);

  // -------------------------------------------------------------------------
  // Render UI
  // -------------------------------------------------------------------------
  const fractalLabels: Record<FractalKind, string> = {
    mandelbrot: '🌀 Mandelbrot',
    julia: '✨ Julia',
    burning: '🔥 Burning Ship',
  };

  const paletteLabels: Record<Palette, string> = {
    nexus: '⚡ NEXUS',
    fire: '🔥 Fire',
    ice: '❄ Ice',
    mono: '💚 Mono',
  };

  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      <div style={panelStyle}>
        <h2 style={{ margin: '0 0 0.3rem', color: 'var(--yellow)' }}>Fractal Engine</h2>
        <p style={{ margin: '0 0 0.7rem', color: '#b5e9ef', fontSize: '0.9rem' }}>
          Real-time fractal explorer. Scroll to zoom, drag to pan. Smooth iteration coloring with
          custom NEXUS palettes. Mandelbrot, Julia, and Burning Ship — all rendered pixel-by-pixel
          in the browser.
        </p>

        {/* Fractal type */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.5rem' }}>
          {(Object.keys(fractalLabels) as FractalKind[]).map(f => (
            <button key={f} onClick={() => { setFractal(f); }} style={btnStyle(fractal === f, 'var(--yellow)')}>
              {fractalLabels[f]}
            </button>
          ))}
        </div>

        {/* Julia presets */}
        {fractal === 'julia' && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.5rem' }}>
            {JULIA_PRESETS.map((p, i) => (
              <button key={p.label} onClick={() => applyJuliaPreset(i)}
                style={btnStyle(juliaPreset === i, 'var(--pink)')}>
                {p.label}
              </button>
            ))}
          </div>
        )}

        {/* Palette + Iterations */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem 1rem', marginBottom: '0.5rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {(Object.keys(paletteLabels) as Palette[]).map(p => (
              <button key={p} onClick={() => setPalette(p)} style={btnStyle(palette === p, 'var(--cyan)')}>
                {paletteLabels[p]}
              </button>
            ))}
          </div>
          <label style={labelStyle}>
            Iterations ({maxIter}):
            <input type="range" min={40} max={400} step={20} value={maxIter}
              onChange={e => setMaxIter(Number(e.target.value))}
              style={{ accentColor: 'var(--yellow)', width: '90px' }} />
          </label>
          <button onClick={resetView} style={btnStyle(false, 'var(--green)')}>⟳ Reset</button>
        </div>

        {/* Status bar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.78rem', color: '#89b9c0' }}>
          <span>re: <span style={{ color: 'var(--cyan)' }}>{coords.re.toFixed(6)}</span></span>
          <span>im: <span style={{ color: 'var(--pink)' }}>{coords.im.toFixed(6)}</span></span>
          <span>zoom: <span style={{ color: 'var(--yellow)' }}>{zoomLevel}×</span></span>
          {rendering && <span style={{ color: 'var(--green)' }}>⟳ Rendering…</span>}
        </div>
      </div>

      <canvas
        ref={canvasRef}
        onWheel={handleWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        style={{
          width: '100%',
          borderRadius: '0.8rem',
          border: '1px solid var(--line)',
          cursor: isPanRef.current ? 'grabbing' : 'crosshair',
          touchAction: 'none',
          display: 'block',
        }}
        aria-label="Fractal Engine canvas — scroll to zoom, drag to pan"
      />
    </div>
  );
});

const panelStyle: React.CSSProperties = {
  background: 'var(--panel)',
  border: '1px solid var(--line)',
  borderRadius: '0.8rem',
  padding: '0.8rem',
};

function btnStyle(active: boolean, accentColor: string): React.CSSProperties {
  return {
    border: `1px solid ${active ? accentColor : 'rgba(96,239,255,0.25)'}`,
    background: active ? `${accentColor}22` : 'rgba(8,14,24,0.8)',
    color: active ? accentColor : '#c2f9ff',
    padding: '0.38rem 0.6rem',
    cursor: 'pointer',
    borderRadius: '0.45rem',
    boxShadow: active ? `0 0 10px ${accentColor}44` : 'none',
    fontSize: '0.82rem',
  };
}

const labelStyle: React.CSSProperties = {
  color: '#b5e9ef',
  fontSize: '0.82rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.4rem',
};

export default FractalEngine;
