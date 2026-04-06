import React, { useRef, useEffect, useState, useCallback, memo } from 'react';

type Algorithm = 'quick' | 'merge';
type Pattern = 'random' | 'waveform' | 'reverse';

function buildArray(size: number, pattern: Pattern): number[] {
  const base = Array.from({ length: size }, (_, i) => i + 1);
  if (pattern === 'reverse') return base.reverse();
  if (pattern === 'waveform') {
    return base.map((_, i) => Math.round((Math.sin((i / size) * Math.PI * 4) + 1) * (size / 2)) + 1);
  }
  for (let i = base.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [base[i], base[j]] = [base[j], base[i]];
  }
  return base;
}

function sortedness(arr: number[]): number {
  if (arr.length <= 1) return 100;
  let ordered = 0;
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] <= arr[i + 1]) ordered++;
  }
  return Math.round((ordered / (arr.length - 1)) * 100);
}

const AlgorithmArena = memo(function AlgorithmArena() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const arrRef = useRef<number[]>([]);
  const sortingRef = useRef(false);
  const opsRef = useRef(0);

  const [algo, setAlgo] = useState<Algorithm>('quick');
  const [pattern, setPattern] = useState<Pattern>('random');
  const [size, setSize] = useState(80);
  const [operations, setOperations] = useState(0);
  const [sorted, setSorted] = useState(0);
  const [sorting, setSorting] = useState(false);

  const drawArray = useCallback((highlight = -1) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = ctxRef.current;
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const arr = arrRef.current;
    const barW = canvas.width / arr.length;
    const max = arr.length;
    for (let i = 0; i < arr.length; i++) {
      const h = (arr[i] / max) * (canvas.height - 12);
      ctx.fillStyle = i === highlight ? '#ffcc00' : `hsl(${(i / arr.length) * 180 + 160}, 90%, 60%)`;
      ctx.fillRect(i * barW, canvas.height - h, Math.max(1, barW - 1), h);
    }
  }, []);

  const resetArray = useCallback(
    (newSize?: number, newPattern?: Pattern) => {
      const s = newSize ?? size;
      const p = newPattern ?? pattern;
      arrRef.current = buildArray(s, p);
      opsRef.current = 0;
      setOperations(0);
      setSorted(sortedness(arrRef.current));
      drawArray();
    },
    [size, pattern, drawArray]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) ctxRef.current = canvas.getContext('2d');
    resetArray(size, pattern);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function partition(l: number, r: number): Promise<number> {
    const pivot = arrRef.current[r];
    let i = l;
    for (let j = l; j < r; j++) {
      opsRef.current++;
      if (arrRef.current[j] < pivot) {
        [arrRef.current[i], arrRef.current[j]] = [arrRef.current[j], arrRef.current[i]];
        i++;
      }
      if (opsRef.current % 6 === 0) {
        setOperations(opsRef.current);
        drawArray(j);
        await new Promise<void>((res) => requestAnimationFrame(() => res()));
      }
    }
    [arrRef.current[i], arrRef.current[r]] = [arrRef.current[r], arrRef.current[i]];
    return i;
  }

  async function quickSortVisual(l = 0, r = arrRef.current.length - 1): Promise<void> {
    if (l >= r) return;
    const p = await partition(l, r);
    await quickSortVisual(l, p - 1);
    await quickSortVisual(p + 1, r);
  }

  async function mergeSortVisual(start = 0, end = arrRef.current.length - 1): Promise<void> {
    if (start >= end) return;
    const mid = (start + end) >> 1;
    await mergeSortVisual(start, mid);
    await mergeSortVisual(mid + 1, end);
    const left = arrRef.current.slice(start, mid + 1);
    const right = arrRef.current.slice(mid + 1, end + 1);
    let i = 0;
    let j = 0;
    let k = start;
    while (i < left.length && j < right.length) {
      opsRef.current++;
      arrRef.current[k++] = left[i] < right[j] ? left[i++] : right[j++];
      if (opsRef.current % 5 === 0) {
        setOperations(opsRef.current);
        drawArray(k);
        await new Promise<void>((res) => requestAnimationFrame(() => res()));
      }
    }
    while (i < left.length) arrRef.current[k++] = left[i++];
    while (j < right.length) arrRef.current[k++] = right[j++];
  }

  const handleSort = useCallback(async () => {
    if (sortingRef.current) return;
    sortingRef.current = true;
    setSorting(true);
    opsRef.current = 0;
    setOperations(0);
    if (algo === 'quick') {
      await quickSortVisual();
    } else {
      await mergeSortVisual();
    }
    drawArray();
    setSorted(100);
    setOperations(opsRef.current);
    sortingRef.current = false;
    setSorting(false);
  }, [algo, drawArray]); // eslint-disable-line react-hooks/exhaustive-deps

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
        <h2 style={{ margin: '0 0 0.3rem', color: 'var(--yellow)' }}>Algorithm Arena</h2>
        <p style={{ margin: '0 0 0.7rem', color: '#b5e9ef', fontSize: '0.95rem' }}>
          Real-time sorting visualizer with operation counter. Toggle algorithm and watch how
          complexity feels.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem 0.8rem' }}>
          <label style={labelStyle}>
            Algorithm
            <select
              value={algo}
              onChange={(e) => setAlgo(e.target.value as Algorithm)}
              style={selectStyle}
            >
              <option value="quick">Quick Sort</option>
              <option value="merge">Merge Sort</option>
            </select>
          </label>
          <label style={labelStyle}>
            Pattern
            <select
              value={pattern}
              onChange={(e) => {
                const p = e.target.value as Pattern;
                setPattern(p);
                resetArray(size, p);
              }}
              style={selectStyle}
            >
              <option value="random">Random</option>
              <option value="waveform">Waveform</option>
              <option value="reverse">Reverse</option>
            </select>
          </label>
          <label style={labelStyle}>
            Size
            <input
              type="range"
              min="20"
              max="180"
              value={size}
              onChange={(e) => {
                const s = Number(e.target.value);
                setSize(s);
                resetArray(s, pattern);
              }}
            />
            <span>{size}</span>
          </label>
          <button onClick={() => resetArray()} style={btnStyle} disabled={sorting}>
            Shuffle
          </button>
          <button onClick={handleSort} style={btnStyle} disabled={sorting}>
            {sorting ? 'Sorting…' : 'Sort'}
          </button>
        </div>
        <div style={{ marginTop: '0.6rem', color: 'var(--green)', fontSize: '0.85rem', display: 'flex', gap: '1rem' }}>
          <span>Operations: {operations}</span>
          <span>Sorted: {sorted}%</span>
          <span>Pattern: {pattern}</span>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        width={960}
        height={420}
        style={canvasStyle}
        aria-label="Algorithm Arena sorting visualization canvas"
      />
    </div>
  );
});

const labelStyle: React.CSSProperties = {
  fontSize: '0.82rem',
  color: 'var(--cyan)',
  display: 'flex',
  gap: '0.4rem',
  alignItems: 'center',
};

const selectStyle: React.CSSProperties = {
  background: 'rgba(8,14,24,0.8)',
  border: '1px solid var(--line)',
  color: '#c2f9ff',
  padding: '0.2rem',
};

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
};

export default AlgorithmArena;
