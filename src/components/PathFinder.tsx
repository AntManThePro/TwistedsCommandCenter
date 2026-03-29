import React, { useRef, useEffect, useState, useCallback, memo } from 'react';

// ---------------------------------------------------------------------------
// Grid dimensions + cell size
// ---------------------------------------------------------------------------
const COLS = 40;
const ROWS = 24;

// Cell kinds  0=empty 1=wall 2=start 3=end 4=visited 5=frontier 6=path
type CellKind = 0 | 1 | 2 | 3 | 4 | 5 | 6;
type Algo = 'astar' | 'bfs' | 'dfs' | 'dijkstra';
type Tool = 'wall' | 'erase' | 'start' | 'end';

// ---------------------------------------------------------------------------
// Priority queue (min-heap) used by A* and Dijkstra
// ---------------------------------------------------------------------------
class MinHeap {
  private data: [number, number, number][] = []; // [priority, row, col]

  push(priority: number, row: number, col: number) {
    this.data.push([priority, row, col]);
    this._bubbleUp(this.data.length - 1);
  }

  pop(): [number, number, number] | undefined {
    if (this.data.length === 0) return undefined;
    const top = this.data[0];
    const last = this.data.pop()!;
    if (this.data.length > 0) {
      this.data[0] = last;
      this._sinkDown(0);
    }
    return top;
  }

  get size() { return this.data.length; }

  private _bubbleUp(i: number) {
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.data[parent][0] <= this.data[i][0]) break;
      [this.data[parent], this.data[i]] = [this.data[i], this.data[parent]];
      i = parent;
    }
  }

  private _sinkDown(i: number) {
    const n = this.data.length;
    while (true) {
      let smallest = i;
      const l = 2 * i + 1, r = 2 * i + 2;
      if (l < n && this.data[l][0] < this.data[smallest][0]) smallest = l;
      if (r < n && this.data[r][0] < this.data[smallest][0]) smallest = r;
      if (smallest === i) break;
      [this.data[smallest], this.data[i]] = [this.data[i], this.data[smallest]];
      i = smallest;
    }
  }
}

function heuristic(r1: number, c1: number, r2: number, c2: number) {
  return Math.abs(r1 - r2) + Math.abs(c1 - c2);
}

const DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]];
const MAZE_DIRS: [number, number][] = [[-2, 0], [2, 0], [0, -2], [0, 2]];

// ---------------------------------------------------------------------------
// Algorithm runners — return ordered list of steps + final path
// ---------------------------------------------------------------------------
interface SearchResult {
  visitedOrder: [number, number][];  // cells in order they were visited
  frontierSnapshots: Map<string, [number, number]>; // cells in frontier at each step
  path: [number, number][];          // reconstructed optimal path
  found: boolean;
}

function runAstar(
  grid: CellKind[][],
  sr: number, sc: number,
  er: number, ec: number,
): SearchResult {
  const g: number[][] = Array.from({ length: ROWS }, () => Array(COLS).fill(Infinity));
  const prev = new Map<string, [number, number] | null>();
  const visited = new Set<string>();
  const heap = new MinHeap();
  g[sr][sc] = 0;
  heap.push(heuristic(sr, sc, er, ec), sr, sc);
  prev.set(`${sr},${sc}`, null);
  const visitedOrder: [number, number][] = [];

  while (heap.size > 0) {
    const node = heap.pop()!;
    const [, r, c] = node;
    const key = `${r},${c}`;
    if (visited.has(key)) continue;
    visited.add(key);
    visitedOrder.push([r, c]);
    if (r === er && c === ec) break;
    for (const [dr, dc] of DIRS) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;
      if (grid[nr][nc] === 1) continue;
      const ng = g[r][c] + 1;
      if (ng < g[nr][nc]) {
        g[nr][nc] = ng;
        prev.set(`${nr},${nc}`, [r, c]);
        heap.push(ng + heuristic(nr, nc, er, ec), nr, nc);
      }
    }
  }
  return { visitedOrder, frontierSnapshots: new Map(), path: buildPath(prev, er, ec), found: prev.has(`${er},${ec}`) };
}

function runBFS(grid: CellKind[][], sr: number, sc: number, er: number, ec: number): SearchResult {
  const prev = new Map<string, [number, number] | null>();
  const queue: [number, number][] = [[sr, sc]];
  prev.set(`${sr},${sc}`, null);
  const visitedOrder: [number, number][] = [];
  while (queue.length > 0) {
    const [r, c] = queue.shift()!;
    visitedOrder.push([r, c]);
    if (r === er && c === ec) break;
    for (const [dr, dc] of DIRS) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;
      if (grid[nr][nc] === 1) continue;
      const nk = `${nr},${nc}`;
      if (!prev.has(nk)) {
        prev.set(nk, [r, c]);
        queue.push([nr, nc]);
      }
    }
  }
  return { visitedOrder, frontierSnapshots: new Map(), path: buildPath(prev, er, ec), found: prev.has(`${er},${ec}`) };
}

function runDFS(grid: CellKind[][], sr: number, sc: number, er: number, ec: number): SearchResult {
  const prev = new Map<string, [number, number] | null>();
  const stack: [number, number][] = [[sr, sc]];
  prev.set(`${sr},${sc}`, null);
  const visitedOrder: [number, number][] = [];
  while (stack.length > 0) {
    const [r, c] = stack.pop()!;
    if (visitedOrder.some(([vr, vc]) => vr === r && vc === c)) continue;
    visitedOrder.push([r, c]);
    if (r === er && c === ec) break;
    for (const [dr, dc] of DIRS) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;
      if (grid[nr][nc] === 1) continue;
      const nk = `${nr},${nc}`;
      if (!prev.has(nk)) {
        prev.set(nk, [r, c]);
        stack.push([nr, nc]);
      }
    }
  }
  return { visitedOrder, frontierSnapshots: new Map(), path: buildPath(prev, er, ec), found: prev.has(`${er},${ec}`) };
}

function runDijkstra(grid: CellKind[][], sr: number, sc: number, er: number, ec: number): SearchResult {
  const dist: number[][] = Array.from({ length: ROWS }, () => Array(COLS).fill(Infinity));
  const prev = new Map<string, [number, number] | null>();
  const heap = new MinHeap();
  dist[sr][sc] = 0;
  heap.push(0, sr, sc);
  prev.set(`${sr},${sc}`, null);
  const visited = new Set<string>();
  const visitedOrder: [number, number][] = [];
  while (heap.size > 0) {
    const [d, r, c] = heap.pop()!;
    const key = `${r},${c}`;
    if (visited.has(key)) continue;
    visited.add(key);
    visitedOrder.push([r, c]);
    if (d > dist[r][c]) continue;
    if (r === er && c === ec) break;
    for (const [dr, dc] of DIRS) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;
      if (grid[nr][nc] === 1) continue;
      const nd = dist[r][c] + 1;
      if (nd < dist[nr][nc]) {
        dist[nr][nc] = nd;
        prev.set(`${nr},${nc}`, [r, c]);
        heap.push(nd, nr, nc);
      }
    }
  }
  return { visitedOrder, frontierSnapshots: new Map(), path: buildPath(prev, er, ec), found: prev.has(`${er},${ec}`) };
}

function buildPath(prev: Map<string, [number, number] | null>, er: number, ec: number): [number, number][] {
  const path: [number, number][] = [];
  let cur: [number, number] | null | undefined = [er, ec];
  while (cur) {
    path.unshift(cur);
    cur = prev.get(`${cur[0]},${cur[1]}`);
    if (cur === null) break;
  }
  return path;
}

// ---------------------------------------------------------------------------
// Random maze generator (iterative DFS / "random walk carving")
// ---------------------------------------------------------------------------
function generateMaze(): CellKind[][] {
  // Start with all walls
  const grid: CellKind[][] = Array.from({ length: ROWS }, () => Array(COLS).fill(1) as CellKind[]);

  // Carve passages from (1,1) using iterative DFS
  const visited = new Set<string>();
  const stack: [number, number][] = [[1, 1]];
  visited.add('1,1');
  grid[1][1] = 0;

  while (stack.length > 0) {
    const [r, c] = stack[stack.length - 1];
    const shuffled = MAZE_DIRS.slice().sort(() => Math.random() - 0.5);
    let moved = false;
    for (const [dr, dc] of shuffled) {
      const nr = r + dr, nc = c + dc;
      if (nr > 0 && nr < ROWS - 1 && nc > 0 && nc < COLS - 1 && !visited.has(`${nr},${nc}`)) {
        grid[r + dr / 2][c + dc / 2] = 0;
        grid[nr][nc] = 0;
        visited.add(`${nr},${nc}`);
        stack.push([nr, nc]);
        moved = true;
        break;
      }
    }
    if (!moved) stack.pop();
  }
  return grid;
}

// ---------------------------------------------------------------------------
// Canvas rendering helpers
// ---------------------------------------------------------------------------
const CELL_COLORS: Record<CellKind, string> = {
  0: '#050d1a',
  1: '#1a2035',
  2: '#00ff87',
  3: '#ff0080',
  4: 'rgba(96,239,255,0.55)',
  5: '#ffcc00',
  6: '#ffffff',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
interface AnimState {
  grid: CellKind[][];
  visitedOrder: [number, number][];
  path: [number, number][];
  stepIdx: number;
  phase: 'idle' | 'searching' | 'pathing' | 'done' | 'nofound';
}

const PathFinder = memo(function PathFinder() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Logical grid: persistent between renders via ref
  const gridRef = useRef<CellKind[][]>(
    Array.from({ length: ROWS }, () => Array(COLS).fill(0) as CellKind[])
  );
  const startRef = useRef<[number, number]>([Math.floor(ROWS / 2), 3]);
  const endRef = useRef<[number, number]>([Math.floor(ROWS / 2), COLS - 4]);

  // Animation state stored in a ref to avoid re-render per frame
  const animRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stateRef = useRef<AnimState>({
    grid: gridRef.current,
    visitedOrder: [],
    path: [],
    stepIdx: 0,
    phase: 'idle',
  });

  const [tool, setTool] = useState<Tool>('wall');
  const [algo, setAlgo] = useState<Algo>('astar');
  const [speed, setSpeed] = useState(12); // ms per step
  const [status, setStatus] = useState<string>('Draw walls → pick algorithm → Visualize');
  const [statsText, setStatsText] = useState<string>('');
  const [running, setRunning] = useState(false);

  const isPointerDown = useRef(false);
  const lastDrawnCell = useRef<[number, number] | null>(null);

  // -------------------------------------------------------------------------
  // Canvas sizing — use 100% width, fixed aspect
  // -------------------------------------------------------------------------
  const getCellSize = useCallback((): number => {
    const canvas = canvasRef.current;
    if (!canvas) return 16;
    return canvas.width / COLS;
  }, []);

  const getCell = useCallback((clientX: number, clientY: number): [number, number] | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const cs = canvas.width / COLS;
    const c = Math.floor(((clientX - rect.left) / rect.width) * canvas.width / cs);
    const r = Math.floor(((clientY - rect.top) / rect.height) * canvas.height / cs);
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return null;
    return [r, c];
  }, []);

  // -------------------------------------------------------------------------
  // Render grid to canvas
  // -------------------------------------------------------------------------
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cs = canvas.width / COLS;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const g = stateRef.current.grid;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const kind = g[r][c];
        ctx.fillStyle = CELL_COLORS[kind];
        ctx.fillRect(c * cs + 0.5, r * cs + 0.5, cs - 1, cs - 1);

        // Glow for special cells
        if (kind === 2 || kind === 3) {
          ctx.shadowColor = kind === 2 ? '#00ff87' : '#ff0080';
          ctx.shadowBlur = 10;
          ctx.fillRect(c * cs + 0.5, r * cs + 0.5, cs - 1, cs - 1);
          ctx.shadowBlur = 0;
        } else if (kind === 6) {
          ctx.fillStyle = 'rgba(255,255,255,0.9)';
          ctx.fillRect(c * cs + 2, r * cs + 2, cs - 4, cs - 4);
        }
      }
    }

    // Grid lines (subtle)
    ctx.strokeStyle = 'rgba(96,239,255,0.07)';
    ctx.lineWidth = 0.5;
    for (let r = 0; r <= ROWS; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * cs);
      ctx.lineTo(canvas.width, r * cs);
      ctx.stroke();
    }
    for (let c = 0; c <= COLS; c++) {
      ctx.beginPath();
      ctx.moveTo(c * cs, 0);
      ctx.lineTo(c * cs, canvas.height);
      ctx.stroke();
    }
  }, []);

  // -------------------------------------------------------------------------
  // Sync logical grid into stateRef and paint
  // -------------------------------------------------------------------------
  const syncAndRender = useCallback(() => {
    const g = stateRef.current.grid;
    const [sr, sc] = startRef.current;
    const [er, ec] = endRef.current;
    // Reset search colors
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (g[r][c] === 4 || g[r][c] === 5 || g[r][c] === 6) g[r][c] = 0;
      }
    }
    g[sr][sc] = 2;
    g[er][ec] = 3;
    renderCanvas();
  }, [renderCanvas]);

  // Initial render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Responsive sizing
    const resize = () => {
      const w = Math.min(canvas.parentElement?.clientWidth ?? 800, 900);
      canvas.width = w;
      canvas.height = Math.floor((w / COLS) * ROWS);
      syncAndRender();
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [syncAndRender]);

  // -------------------------------------------------------------------------
  // Drawing interaction
  // -------------------------------------------------------------------------
  const applyTool = useCallback((r: number, c: number) => {
    const g = stateRef.current.grid;
    const [sr, sc] = startRef.current;
    const [er, ec] = endRef.current;
    if (r === sr && c === sc) return;
    if (r === er && c === ec) return;

    if (tool === 'wall') {
      if (g[r][c] !== 2 && g[r][c] !== 3) g[r][c] = 1;
    } else if (tool === 'erase') {
      if (g[r][c] === 4 || g[r][c] === 5 || g[r][c] === 6 || g[r][c] === 1) g[r][c] = 0;
    } else if (tool === 'start') {
      g[sr][sc] = 0;
      startRef.current = [r, c];
      g[r][c] = 2;
    } else if (tool === 'end') {
      g[er][ec] = 0;
      endRef.current = [r, c];
      g[r][c] = 3;
    }
    renderCanvas();
  }, [tool, renderCanvas]);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    isPointerDown.current = true;
    const cell = getCell(e.clientX, e.clientY);
    if (!cell) return;
    lastDrawnCell.current = cell;
    applyTool(cell[0], cell[1]);
  }, [getCell, applyTool]);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isPointerDown.current) return;
    const cell = getCell(e.clientX, e.clientY);
    if (!cell) return;
    if (lastDrawnCell.current &&
        lastDrawnCell.current[0] === cell[0] &&
        lastDrawnCell.current[1] === cell[1]) return;
    lastDrawnCell.current = cell;
    applyTool(cell[0], cell[1]);
  }, [getCell, applyTool]);

  const onPointerUp = useCallback(() => {
    isPointerDown.current = false;
    lastDrawnCell.current = null;
  }, []);

  // -------------------------------------------------------------------------
  // Run algorithm
  // -------------------------------------------------------------------------
  const stopAnimation = useCallback(() => {
    if (animRef.current) {
      clearTimeout(animRef.current);
      animRef.current = null;
    }
  }, []);

  const visualize = useCallback(() => {
    stopAnimation();
    setRunning(true);
    setStatsText('');

    const g = stateRef.current.grid;
    // Reset visited/path cells
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (g[r][c] === 4 || g[r][c] === 5 || g[r][c] === 6) g[r][c] = 0;
      }
    }

    const [sr, sc] = startRef.current;
    const [er, ec] = endRef.current;
    const t0 = performance.now();

    const algos: Record<Algo, typeof runAstar> = {
      astar: runAstar,
      bfs: runBFS,
      dfs: runDFS,
      dijkstra: runDijkstra,
    };
    const result = algos[algo](g, sr, sc, er, ec);
    const elapsed = (performance.now() - t0).toFixed(1);

    stateRef.current.visitedOrder = result.visitedOrder;
    stateRef.current.path = result.path;
    stateRef.current.stepIdx = 0;
    stateRef.current.phase = 'searching';

    setStatus(`Running ${algo.toUpperCase()}…`);

    const animateSearch = () => {
      const state = stateRef.current;
      if (state.stepIdx >= state.visitedOrder.length) {
        // Move to path phase
        state.phase = 'pathing';
        state.stepIdx = 0;
        if (!result.found) {
          state.phase = 'nofound';
          setStatus('⛔  No path found!');
          setStatsText(`Visited: ${result.visitedOrder.length} cells | Time: ${elapsed}ms`);
          setRunning(false);
          return;
        }
        animatePath();
        return;
      }

      const batchSize = Math.max(1, Math.floor(2 + state.visitedOrder.length / 200));
      for (let b = 0; b < batchSize && state.stepIdx < state.visitedOrder.length; b++) {
        const [r, c] = state.visitedOrder[state.stepIdx++];
        if (g[r][c] !== 2 && g[r][c] !== 3) g[r][c] = 4;
      }
      renderCanvas();
      animRef.current = setTimeout(animateSearch, speed);
    };

    const animatePath = () => {
      const state = stateRef.current;
      if (state.stepIdx >= state.path.length) {
        state.phase = 'done';
        setStatus('✅  Path found!');
        setStatsText(
          `Visited: ${result.visitedOrder.length} | Path: ${result.path.length} steps | ${elapsed}ms`
        );
        setRunning(false);
        return;
      }
      const [r, c] = state.path[state.stepIdx++];
      if (g[r][c] !== 2 && g[r][c] !== 3) g[r][c] = 6;
      renderCanvas();
      animRef.current = setTimeout(animatePath, speed * 2);
    };

    animateSearch();
  }, [algo, speed, renderCanvas, stopAnimation]);

  // -------------------------------------------------------------------------
  // Controls
  // -------------------------------------------------------------------------
  const clearGrid = useCallback(() => {
    stopAnimation();
    setRunning(false);
    setStatus('Draw walls → pick algorithm → Visualize');
    setStatsText('');
    const g = stateRef.current.grid;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        g[r][c] = 0;
      }
    }
    syncAndRender();
  }, [stopAnimation, syncAndRender]);

  const loadMaze = useCallback(() => {
    stopAnimation();
    setRunning(false);
    setStatus('Maze loaded — Visualize to solve it!');
    setStatsText('');
    const newGrid = generateMaze();
    stateRef.current.grid = newGrid;
    gridRef.current = newGrid;
    // Place start and end in open cells
    startRef.current = [1, 1];
    endRef.current = [ROWS - 3, COLS - 3];
    syncAndRender();
  }, [stopAnimation, syncAndRender]);

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  const algoLabels: Record<Algo, string> = {
    astar: 'A* (optimal)',
    bfs: 'BFS (optimal)',
    dfs: 'DFS (fast)',
    dijkstra: 'Dijkstra (optimal)',
  };

  const toolLabels: Record<Tool, string> = {
    wall: '⬛ Wall',
    erase: '🧹 Erase',
    start: '🟢 Set Start',
    end: '🔴 Set End',
  };

  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      {/* Info panel */}
      <div style={panelStyle}>
        <h2 style={{ margin: '0 0 0.3rem', color: 'var(--cyan)' }}>PathFinder</h2>
        <p style={{ margin: '0 0 0.7rem', color: '#b5e9ef', fontSize: '0.9rem' }}>
          Draw walls by clicking/dragging on the grid. Generate a random maze or set custom obstacles.
          Watch A*, BFS, DFS, or Dijkstra solve it step-by-step.
        </p>

        {/* Tool row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.5rem' }}>
          {(Object.keys(toolLabels) as Tool[]).map(t => (
            <button
              key={t}
              onClick={() => setTool(t)}
              style={btnStyle(tool === t, t === 'start' ? 'var(--green)' : t === 'end' ? 'var(--pink)' : 'var(--cyan)')}
            >
              {toolLabels[t]}
            </button>
          ))}
        </div>

        {/* Algorithm row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.5rem' }}>
          {(Object.keys(algoLabels) as Algo[]).map(a => (
            <button
              key={a}
              onClick={() => setAlgo(a)}
              style={btnStyle(algo === a, 'var(--yellow)')}
            >
              {algoLabels[a]}
            </button>
          ))}
        </div>

        {/* Action row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
          <button
            onClick={visualize}
            disabled={running}
            style={btnStyle(false, 'var(--green)', true)}
          >
            {running ? 'Running…' : '▶ Visualize'}
          </button>
          <button onClick={loadMaze} style={btnStyle(false, 'var(--pink)')}>
            🌀 Generate Maze
          </button>
          <button onClick={clearGrid} style={btnStyle(false, 'var(--cyan)')}>
            🗑 Clear
          </button>
          <label style={{ color: '#b5e9ef', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            Speed:
            <input
              type="range"
              min={1}
              max={80}
              value={speed}
              onChange={e => setSpeed(Number(e.target.value))}
              style={{ accentColor: 'var(--green)', width: '80px' }}
            />
          </label>
        </div>

        {/* Status */}
        <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <span style={{ color: 'var(--green)', fontSize: '0.85rem' }}>{status}</span>
          {statsText && (
            <span style={{ color: 'var(--yellow)', fontSize: '0.82rem' }}>{statsText}</span>
          )}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginTop: '0.5rem' }}>
          {[
            { color: '#00ff87', label: 'Start' },
            { color: '#ff0080', label: 'End' },
            { color: '#1a2035', label: 'Wall' },
            { color: 'rgba(96,239,255,0.55)', label: 'Visited' },
            { color: '#ffffff', label: 'Path' },
          ].map(({ color, label }) => (
            <span key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', color: '#b5e9ef' }}>
              <span style={{ width: 12, height: 12, background: color, display: 'inline-block', borderRadius: 2, border: '1px solid rgba(255,255,255,0.2)' }} />
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        style={{
          width: '100%',
          borderRadius: '0.8rem',
          border: '1px solid var(--line)',
          background: '#050d1a',
          cursor: tool === 'wall' ? 'crosshair' : tool === 'erase' ? 'cell' : 'pointer',
          touchAction: 'none',
        }}
        aria-label="PathFinder interactive grid"
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

function btnStyle(active: boolean, accentColor: string, primary = false): React.CSSProperties {
  return {
    border: `1px solid ${active || primary ? accentColor : 'rgba(96,239,255,0.25)'}`,
    background: active || primary ? `${accentColor}22` : 'rgba(8,14,24,0.8)',
    color: active || primary ? accentColor : '#c2f9ff',
    padding: '0.4rem 0.65rem',
    cursor: 'pointer',
    borderRadius: '0.45rem',
    boxShadow: active || primary ? `0 0 12px ${accentColor}44` : 'none',
    fontSize: '0.82rem',
    opacity: 1,
  };
}

export default PathFinder;
