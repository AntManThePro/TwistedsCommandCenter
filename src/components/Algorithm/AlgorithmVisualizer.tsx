import { useEffect, useRef, useState, useCallback } from 'react'

/* ══════════════════════════════════════════════════════
   NEXUS Algorithm Visualizer — Twisted's Command Center
   Sorting race with Canvas animation
   ══════════════════════════════════════════════════════ */

type AlgoId = 'bubble' | 'selection' | 'insertion' | 'quick' | 'merge'

interface Step {
  array: number[]
  comparing: number[]
  swapping: number[]
  sorted: number[]
}

interface AlgoInfo {
  name: string
  color: string
  complexity: string
  description: string
}

const ALGO_INFO: Record<AlgoId, AlgoInfo> = {
  bubble: {
    name: 'Bubble Sort',
    color: '#60efff',
    complexity: 'O(n²)',
    description: 'Repeatedly swaps adjacent elements if out of order.',
  },
  selection: {
    name: 'Selection Sort',
    color: '#00ff87',
    complexity: 'O(n²)',
    description: 'Finds the minimum and places it at the correct position.',
  },
  insertion: {
    name: 'Insertion Sort',
    color: '#ffcc00',
    complexity: 'O(n²)',
    description: 'Builds sorted array one element at a time by insertion.',
  },
  quick: {
    name: 'Quick Sort',
    color: '#ff0080',
    complexity: 'O(n log n)',
    description: 'Divides array around a pivot, recurses on sub-arrays.',
  },
  merge: {
    name: 'Merge Sort',
    color: '#8b5cf6',
    complexity: 'O(n log n)',
    description: 'Splits, sorts, and merges halves recursively.',
  },
}

/* ─── Step generators ──────────────────────────────── */

function genBubble(arr: number[]): Step[] {
  const steps: Step[] = []
  const a = [...arr]
  const n = a.length
  const sortedSet = new Set<number>()

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      steps.push({ array: [...a], comparing: [j, j + 1], swapping: [], sorted: [...sortedSet] })
      if (a[j] > a[j + 1]) {
        ;[a[j], a[j + 1]] = [a[j + 1], a[j]]
        steps.push({ array: [...a], comparing: [], swapping: [j, j + 1], sorted: [...sortedSet] })
      }
    }
    sortedSet.add(n - 1 - i)
  }
  sortedSet.add(0)
  steps.push({ array: [...a], comparing: [], swapping: [], sorted: [...Array(n).keys()] })
  return steps
}

function genSelection(arr: number[]): Step[] {
  const steps: Step[] = []
  const a = [...arr]
  const n = a.length
  const sortedSet = new Set<number>()

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i
    for (let j = i + 1; j < n; j++) {
      steps.push({ array: [...a], comparing: [minIdx, j], swapping: [], sorted: [...sortedSet] })
      if (a[j] < a[minIdx]) minIdx = j
    }
    if (minIdx !== i) {
      ;[a[i], a[minIdx]] = [a[minIdx], a[i]]
      steps.push({ array: [...a], comparing: [], swapping: [i, minIdx], sorted: [...sortedSet] })
    }
    sortedSet.add(i)
  }
  sortedSet.add(n - 1)
  steps.push({ array: [...a], comparing: [], swapping: [], sorted: [...Array(n).keys()] })
  return steps
}

function genInsertion(arr: number[]): Step[] {
  const steps: Step[] = []
  const a = [...arr]
  const n = a.length
  const sortedSet = new Set<number>([0])

  for (let i = 1; i < n; i++) {
    let j = i
    while (j > 0) {
      steps.push({ array: [...a], comparing: [j - 1, j], swapping: [], sorted: [...sortedSet] })
      if (a[j] < a[j - 1]) {
        ;[a[j], a[j - 1]] = [a[j - 1], a[j]]
        steps.push({ array: [...a], comparing: [], swapping: [j, j - 1], sorted: [...sortedSet] })
        j--
      } else {
        break
      }
    }
    sortedSet.add(i)
  }
  steps.push({ array: [...a], comparing: [], swapping: [], sorted: [...Array(n).keys()] })
  return steps
}

function genQuick(arr: number[]): Step[] {
  const steps: Step[] = []
  const a = [...arr]
  const sortedSet = new Set<number>()

  const partition = (lo: number, hi: number): number => {
    const pivot = a[hi]
    let i = lo - 1
    for (let j = lo; j < hi; j++) {
      steps.push({ array: [...a], comparing: [j, hi], swapping: [], sorted: [...sortedSet] })
      if (a[j] <= pivot) {
        i++
        ;[a[i], a[j]] = [a[j], a[i]]
        if (i !== j)
          steps.push({ array: [...a], comparing: [], swapping: [i, j], sorted: [...sortedSet] })
      }
    }
    ;[a[i + 1], a[hi]] = [a[hi], a[i + 1]]
    steps.push({ array: [...a], comparing: [], swapping: [i + 1, hi], sorted: [...sortedSet] })
    return i + 1
  }

  const sort = (lo: number, hi: number) => {
    if (lo >= hi) {
      if (lo === hi && lo >= 0 && lo < a.length) {
        sortedSet.add(lo)
      }
      return
    }
    const p = partition(lo, hi)
    sortedSet.add(p)
    sort(lo, p - 1)
    sort(p + 1, hi)
  }

  sort(0, a.length - 1)
  steps.push({ array: [...a], comparing: [], swapping: [], sorted: [...Array(a.length).keys()] })
  return steps
}

function genMerge(arr: number[]): Step[] {
  const steps: Step[] = []
  const a = [...arr]

  const merge = (lo: number, mid: number, hi: number) => {
    const left = a.slice(lo, mid + 1)
    const right = a.slice(mid + 1, hi + 1)
    let i = 0, j = 0, k = lo
    while (i < left.length && j < right.length) {
      steps.push({ array: [...a], comparing: [lo + i, mid + 1 + j], swapping: [], sorted: [] })
      if (left[i] <= right[j]) {
        a[k++] = left[i++]
      } else {
        a[k++] = right[j++]
      }
      steps.push({ array: [...a], comparing: [], swapping: [k - 1, k - 1], sorted: [] })
    }
    while (i < left.length) { a[k++] = left[i++] }
    while (j < right.length) { a[k++] = right[j++] }
  }

  const sort = (lo: number, hi: number) => {
    if (lo >= hi) return
    const mid = Math.floor((lo + hi) / 2)
    sort(lo, mid)
    sort(mid + 1, hi)
    merge(lo, mid, hi)
  }

  sort(0, a.length - 1)
  steps.push({ array: [...a], comparing: [], swapping: [], sorted: [...Array(a.length).keys()] })
  return steps
}

const GENERATORS: Record<AlgoId, (arr: number[]) => Step[]> = {
  bubble: genBubble,
  selection: genSelection,
  insertion: genInsertion,
  quick: genQuick,
  merge: genMerge,
}

/* ─── Canvas renderer ──────────────────────────────── */

function drawBars(canvas: HTMLCanvasElement, step: Step, color: string) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  const n = step.array.length
  const max = Math.max(...step.array)
  const bw = canvas.width / n
  const pad = bw > 4 ? 1 : 0

  for (let i = 0; i < n; i++) {
    const h = (step.array[i] / max) * (canvas.height - 4)
    const x = i * bw + pad
    const w = bw - pad * 2
    const y = canvas.height - h

    let fill: string
    let glowColor: string

    if (step.sorted.includes(i)) {
      fill = '#00ff87'
      glowColor = 'rgba(0,255,135,0.6)'
    } else if (step.swapping.includes(i)) {
      fill = '#ff0080'
      glowColor = 'rgba(255,0,128,0.8)'
    } else if (step.comparing.includes(i)) {
      fill = '#60efff'
      glowColor = 'rgba(96,239,255,0.8)'
    } else {
      fill = color + '99'
      glowColor = 'transparent'
    }

    ctx.shadowColor = glowColor
    ctx.shadowBlur = step.comparing.includes(i) || step.swapping.includes(i) ? 12 : 0
    ctx.fillStyle = fill
    ctx.fillRect(x, y, w, h)
  }
  ctx.shadowBlur = 0
}

/* ─── Main component ───────────────────────────────── */

function randArray(n: number): number[] {
  return Array.from({ length: n }, () => Math.floor(Math.random() * 98) + 3)
}

interface VizState {
  stepIdx: number
  totalSteps: number
  comparisons: number
  swaps: number
  elapsed: number
  done: boolean
}

const initialVizState: VizState = {
  stepIdx: 0,
  totalSteps: 0,
  comparisons: 0,
  swaps: 0,
  elapsed: 0,
  done: false,
}

export default function AlgorithmVisualizer() {
  const [algo, setAlgo] = useState<AlgoId>('bubble')
  const [arraySize, setArraySize] = useState(60)
  const [speed, setSpeed] = useState(30)
  const [running, setRunning] = useState(false)
  const [viz, setViz] = useState<VizState>(initialVizState)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stepsRef = useRef<Step[]>([])
  const rafRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const startTimeRef = useRef<number>(0)
  const currentStepRef = useRef(0)
  const animateRef = useRef<() => void>(() => {})

  const info = ALGO_INFO[algo]

  const buildSteps = useCallback((algoId: AlgoId, size: number) => {
    const arr = randArray(size)
    stepsRef.current = GENERATORS[algoId](arr)
    currentStepRef.current = 0
    setViz({ ...initialVizState, totalSteps: stepsRef.current.length })

    // Draw initial state
    const canvas = canvasRef.current
    if (canvas && stepsRef.current.length > 0) {
      drawBars(canvas, stepsRef.current[0], ALGO_INFO[algoId].color)
    }
  }, [])

  useEffect(() => {
    buildSteps(algo, arraySize)
  }, [algo, arraySize, buildSteps])

  const stop = useCallback(() => {
    if (rafRef.current !== null) clearTimeout(rafRef.current)
    setRunning(false)
  }, [])

  useEffect(() => {
    animateRef.current = () => {
      const idx = currentStepRef.current
      const steps = stepsRef.current
      if (idx >= steps.length) {
        setRunning(false)
        setViz(prev => ({ ...prev, done: true }))
        return
      }

      const step = steps[idx]
      const canvas = canvasRef.current
      if (canvas) drawBars(canvas, step, ALGO_INFO[algo].color)

      const now = startTimeRef.current
      setViz(prev => ({
        ...prev,
        stepIdx: idx,
        comparisons: step.comparing.length > 0 ? prev.comparisons + 1 : prev.comparisons,
        swaps: step.swapping.length > 0 ? prev.swaps + 1 : prev.swaps,
        elapsed: Math.round((Date.now() - now) / 10) / 100,
      }))

      currentStepRef.current = idx + 1

      const delay = Math.max(1, 200 - speed * 2)
      rafRef.current = setTimeout(animateRef.current, delay)
    }
  }, [algo, speed])

  const animate = useCallback(() => {
    animateRef.current()
  }, [])

  const start = useCallback(() => {
    if (viz.done) {
      buildSteps(algo, arraySize)
      setTimeout(() => {
        setRunning(true)
        startTimeRef.current = Date.now()
        currentStepRef.current = 0
        rafRef.current = setTimeout(animate, 10)
      }, 50)
    } else {
      setRunning(true)
      // Preserve accumulated elapsed time so the timer continues from where it paused
      startTimeRef.current = Date.now() - viz.elapsed * 1000
      rafRef.current = setTimeout(animate, 10)
    }
  }, [algo, animate, arraySize, buildSteps, viz.done, viz.elapsed])

  useEffect(() => {
    return () => { if (rafRef.current !== null) clearTimeout(rafRef.current) }
  }, [])

  const reset = () => {
    stop()
    buildSteps(algo, arraySize)
  }

  return (
    <div className="animate-fade-in space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight">
            <span className="text-glow-cyan text-[#60efff]">ALGORITHM</span>{' '}
            <span className="text-white">LAB</span>
          </h2>
          <p className="mt-0.5 text-xs text-[#4a5278] uppercase tracking-widest">
            Live Sorting Visualizer — Real-Time Canvas Rendering
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-[#00ff87] animate-pulse-green" />
          <span className="text-[10px] uppercase tracking-widest text-[#00ff87]">Interactive</span>
        </div>
      </div>

      {/* Algorithm selector */}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(ALGO_INFO) as AlgoId[]).map(id => {
          const active = algo === id
          const c = ALGO_INFO[id].color
          return (
            <button
              key={id}
              onClick={() => { stop(); setAlgo(id) }}
              className="nexus-btn rounded-lg border px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all duration-200"
              style={{
                borderColor: active ? c : 'rgba(96,239,255,0.15)',
                color: active ? c : '#4a5278',
                background: active ? c + '18' : 'transparent',
                boxShadow: active ? `0 0 14px ${c}44` : 'none',
              }}
            >
              {ALGO_INFO[id].name}
            </button>
          )
        })}
      </div>

      {/* Info card */}
      <div
        className="nexus-card rounded-lg px-4 py-2.5 flex items-center gap-4"
        style={{ borderColor: info.color + '33' }}
      >
        <span className="text-xs font-mono font-bold" style={{ color: info.color }}>
          {info.complexity}
        </span>
        <span className="text-xs text-[#64748b]">{info.description}</span>
      </div>

      {/* Canvas */}
      <div
        className="nexus-card relative overflow-hidden rounded-xl"
        style={{ borderColor: info.color + '33' }}
      >
        <canvas
          ref={canvasRef}
          width={800}
          height={220}
          className="w-full"
          style={{ display: 'block', imageRendering: 'pixelated' }}
        />
        {viz.done && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[1px]">
            <div className="text-center">
              <p className="text-2xl font-black text-glow-green text-[#00ff87]">SORTED ✓</p>
              <p className="text-xs text-[#4a5278] mt-1">
                {viz.comparisons} comparisons · {viz.swaps} swaps · {viz.elapsed}s
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Comparisons', value: viz.comparisons, color: '#60efff' },
          { label: 'Swaps',       value: viz.swaps,       color: '#ff0080' },
          { label: 'Time (s)',    value: viz.elapsed,     color: '#ffcc00' },
        ].map(s => (
          <div key={s.label} className="nexus-card rounded-lg p-3 text-center">
            <p className="text-[10px] uppercase tracking-wider text-[#4a5278]">{s.label}</p>
            <p className="mt-1 text-xl font-black" style={{ color: s.color }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      {viz.totalSteps > 0 && (
        <div className="h-1 w-full rounded-full bg-[#1a1a3e] overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${((viz.stepIdx + 1) / viz.totalSteps) * 100}%`,
              background: `linear-gradient(90deg, ${info.color}, ${info.color}aa)`,
              boxShadow: `0 0 8px ${info.color}88`,
            }}
          />
        </div>
      )}

      {/* Controls */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Speed */}
        <div className="nexus-card rounded-lg p-3">
          <p className="mb-2 text-[10px] uppercase tracking-wider text-[#4a5278]">
            Speed — {speed}x
          </p>
          <input
            type="range"
            min={1}
            max={99}
            value={speed}
            aria-label={`Animation speed: ${speed}x`}
            onChange={e => setSpeed(Number(e.target.value))}
            className="w-full accent-[#60efff]"
          />
        </div>

        {/* Array size */}
        <div className="nexus-card rounded-lg p-3">
          <p className="mb-2 text-[10px] uppercase tracking-wider text-[#4a5278]">
            Array Size — {arraySize}
          </p>
          <input
            type="range"
            min={20}
            max={120}
            value={arraySize}
            aria-label={`Array size: ${arraySize} elements`}
            disabled={running}
            onChange={e => setArraySize(Number(e.target.value))}
            className="w-full accent-[#00ff87] disabled:opacity-40"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          {!running ? (
            <button
              onClick={start}
              className="nexus-btn flex-1 rounded-lg border border-[#00ff87]/30 bg-[#00ff87]/10 py-2 text-sm font-bold uppercase tracking-wider text-[#00ff87] transition-all hover:bg-[#00ff87]/20 hover:shadow-[0_0_20px_rgba(0,255,135,0.3)]"
            >
              {viz.done ? '↺ Replay' : '▶ Run'}
            </button>
          ) : (
            <button
              onClick={stop}
              className="nexus-btn flex-1 rounded-lg border border-[#ff0080]/30 bg-[#ff0080]/10 py-2 text-sm font-bold uppercase tracking-wider text-[#ff0080] transition-all hover:bg-[#ff0080]/20"
            >
              ⏸ Pause
            </button>
          )}
          <button
            onClick={reset}
            className="nexus-btn rounded-lg border border-[#60efff]/20 px-3 py-2 text-sm font-bold uppercase tracking-wider text-[#4a5278] transition-all hover:border-[#60efff]/40 hover:text-[#60efff]"
          >
            ⟳
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-[10px] uppercase tracking-wider">
        {[
          { label: 'Comparing', color: '#60efff' },
          { label: 'Swapping',  color: '#ff0080' },
          { label: 'Sorted',    color: '#00ff87' },
          { label: 'Unsorted',  color: info.color + '66' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <span className="h-2 w-3 rounded-sm" style={{ background: l.color, boxShadow: `0 0 5px ${l.color}` }} />
            <span className="text-[#4a5278]">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
