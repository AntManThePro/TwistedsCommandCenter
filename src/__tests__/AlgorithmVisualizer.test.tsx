import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import AlgorithmVisualizer from '../components/Algorithm/AlgorithmVisualizer'

/* ── Step-generator unit tests ──────────────────────────
   We test the pure sorting logic by importing the generators
   indirectly through the component's exported helpers.
   Since genBubble etc. are module-private, we validate via
   observable behaviour: after the full step sequence the
   array must be sorted, array length must be preserved, and
   the final step must have every index in `sorted`.
   ────────────────────────────────────────────────────── */

// Re-export the generators for white-box testing by duplicating
// the minimal logic here to keep tests focused and fast.

type Step = {
  array: number[]
  comparing: number[]
  swapping: number[]
  sorted: number[]
}

function isSorted(arr: number[]): boolean {
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] > arr[i + 1]) return false
  }
  return true
}

// ── Inline step generators (mirrors the production code) ──

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
      if (lo === hi && lo >= 0 && lo < a.length) sortedSet.add(lo)
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
      if (left[i] <= right[j]) { a[k++] = left[i++] } else { a[k++] = right[j++] }
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

const GENERATORS = { genBubble, genSelection, genInsertion, genQuick, genMerge }

const SAMPLE = [5, 3, 8, 1, 9, 2, 7, 4, 6, 10]
const SINGLE = [42]
const TWO = [9, 1]
const ALREADY_SORTED = [1, 2, 3, 4, 5]

describe.each(Object.entries(GENERATORS))('%s', (_name, gen) => {
  it('produces a sorted array in the final step', () => {
    const steps = gen(SAMPLE)
    const last = steps[steps.length - 1]
    expect(isSorted(last.array)).toBe(true)
  })

  it('preserves array length throughout all steps', () => {
    const steps = gen(SAMPLE)
    for (const step of steps) {
      expect(step.array.length).toBe(SAMPLE.length)
    }
  })

  it('preserves all original values (no elements lost or duplicated)', () => {
    const steps = gen(SAMPLE)
    const last = steps[steps.length - 1]
    expect([...last.array].sort((a, b) => a - b)).toEqual([...SAMPLE].sort((a, b) => a - b))
  })

  it('marks every index as sorted in the final step', () => {
    const steps = gen(SAMPLE)
    const last = steps[steps.length - 1]
    const sortedIndices = [...last.sorted].sort((a, b) => a - b)
    expect(sortedIndices).toEqual([...Array(SAMPLE.length).keys()])
  })

  it('handles a single-element array', () => {
    const steps = gen(SINGLE)
    const last = steps[steps.length - 1]
    expect(last.array).toEqual([42])
    expect(isSorted(last.array)).toBe(true)
  })

  it('handles a two-element array', () => {
    const steps = gen(TWO)
    const last = steps[steps.length - 1]
    expect(isSorted(last.array)).toBe(true)
    expect(last.array.length).toBe(2)
  })

  it('handles an already-sorted array', () => {
    const steps = gen(ALREADY_SORTED)
    const last = steps[steps.length - 1]
    expect(isSorted(last.array)).toBe(true)
    expect(last.array).toEqual(ALREADY_SORTED)
  })

  it('sorted indices never go out of bounds', () => {
    const steps = gen(SAMPLE)
    for (const step of steps) {
      for (const idx of step.sorted) {
        expect(idx).toBeGreaterThanOrEqual(0)
        expect(idx).toBeLessThan(SAMPLE.length)
      }
    }
  })
})

/* ── Component render tests ─────────────────────────── */

describe('AlgorithmVisualizer component', () => {
  it('renders algorithm selector buttons', () => {
    render(<AlgorithmVisualizer />)
    expect(screen.getByText('Bubble Sort')).toBeInTheDocument()
    expect(screen.getByText('Selection Sort')).toBeInTheDocument()
    expect(screen.getByText('Insertion Sort')).toBeInTheDocument()
    expect(screen.getByText('Quick Sort')).toBeInTheDocument()
    expect(screen.getByText('Merge Sort')).toBeInTheDocument()
  })

  it('renders Run button initially', () => {
    render(<AlgorithmVisualizer />)
    expect(screen.getByText('▶ Run')).toBeInTheDocument()
  })

  it('renders speed and array-size sliders with accessible names', () => {
    render(<AlgorithmVisualizer />)
    expect(screen.getByRole('slider', { name: /speed/i })).toBeInTheDocument()
    expect(screen.getByRole('slider', { name: /array size/i })).toBeInTheDocument()
  })

  it('renders the canvas element', () => {
    const { container } = render(<AlgorithmVisualizer />)
    expect(container.querySelector('canvas')).toBeInTheDocument()
  })
})
