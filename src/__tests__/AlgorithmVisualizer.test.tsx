import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import AlgorithmVisualizer from '../components/Algorithm/AlgorithmVisualizer'
import {
  genBubble,
  genSelection,
  genInsertion,
  genQuick,
  genMerge,
} from '../components/Algorithm/sortGenerators'

/* ── Helpers ──────────────────────────────────────────── */

function isSorted(arr: number[]): boolean {
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] > arr[i + 1]) return false
  }
  return true
}

/* ── Step-generator unit tests ───────────────────────── */

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

/* ── Component render tests ──────────────────────────── */

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
    expect(screen.getByRole('slider', { name: /animation speed/i })).toBeInTheDocument()
    expect(screen.getByRole('slider', { name: /array size/i })).toBeInTheDocument()
  })

  it('renders the canvas element', () => {
    const { container } = render(<AlgorithmVisualizer />)
    expect(container.querySelector('canvas')).toBeInTheDocument()
  })
})

