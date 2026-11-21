/* ── Sorting step generators for the Algorithm Visualizer ─────────────────
   Pure functions that build an array of Steps (snapshots of comparing /
   swapping / sorted indices) for each algorithm. Extracted to a separate
   module so they can be unit-tested directly without touching the React
   component file (which must only export a single default component to
   satisfy the react-refresh fast-reload lint rule).
   ───────────────────────────────────────────────────────────────────────── */

export interface Step {
  array: number[]
  comparing: number[]
  swapping: number[]
  sorted: number[]
}

export function genBubble(arr: number[]): Step[] {
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

export function genSelection(arr: number[]): Step[] {
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

export function genInsertion(arr: number[]): Step[] {
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

export function genQuick(arr: number[]): Step[] {
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

export function genMerge(arr: number[]): Step[] {
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
