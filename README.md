# TwistedsCommandCenter

NEXUS interactive portfolio + Art Inventory Management System — built with React 18, Vite 5, TypeScript, and Tailwind CSS. Deployable to Vercel in one click.

## Features

### NEXUS Portfolio Demos
- **Neural Forge** — Live perceptron classifier with interactive canvas training
- **Algorithm Arena** — Real-time sorting visualizer (Quick Sort, Merge Sort) with multiple input patterns
- **Systems Pulse** — Interactive particle mesh with pulse injection
- **PathFinder** — Interactive maze + grid pathfinding (A\*, BFS, DFS, Dijkstra) with step-by-step canvas animation, wall drawing, random maze generator, and live statistics
- **CipherMatrix** — Real-time encryption visualizer (Caesar, ROT-13, Vigenère, XOR, Base64, Binary, Atbash) with animated matrix data-rain canvas and diff-highlighted output
- **Fractal Engine** — Real-time Mandelbrot/Julia/Burning-Ship fractal explorer with smooth coloring, zoom/pan, multiple palettes, and Julia constant presets
- **BeatForge** — Web Audio API step sequencer: 5 tracks (kick, snare, hi-hat, bass, lead), 16 steps, synthesized entirely in-browser with BPM control, mute, randomize

### Art Inventory Management
- **Command Center** — Full CRUD inventory with analytics canvas visualization
- **Dashboard** — Metrics, category distribution, and recommendations
- **Gallery** — Filterable client showcase with search
- **Quick Lister** — Listing generator with tone templates and Squarespace HTML export

## Quick Start

```bash
npm install
npm run dev
# open http://localhost:5173
```

## Run Tests

```bash
npm test
```

30 tests across hooks (useInventory, useListings) and components (ErrorBoundary, App navigation including all 7 NEXUS tabs).

## Build

```bash
npm run build
# outputs to dist/
```

## Preview Production Build

```bash
npm run preview
# open http://localhost:4173
```

## Deploy to Vercel

### Option 1: One-click via GitHub

1. Push this repository to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project**
3. Import the repository
4. Framework preset: **Vite**
5. Click **Deploy**

Vercel auto-detects Vite and configures the build. The included `vercel.json` handles SPA routing.

### Option 2: Vercel CLI

```bash
npm install -g vercel
vercel
```

### Option 3: Deploy from dist/

```bash
npm run build
vercel --prod dist/
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Build | Vite 5 (lazy-loaded chunks) |
| Styling | Tailwind CSS 3 |
| Testing | Jest 29 + Testing Library |
| Deployment | Vercel (SPA routing via vercel.json) |
| State | React hooks + localStorage |

## Performance

- **Lazy loading**: Each view (NeuralForge, AlgorithmArena, SystemsPulse, PathFinder, CipherMatrix, FractalEngine, BeatForge, CommandCenter, Dashboard, Gallery, QuickLister) is a separate chunk loaded on demand
- **Memoization**: All components wrapped in `React.memo`; expensive computations use `useMemo`
- **Canvas optimizations**: Uses `requestAnimationFrame` loop with ref-based state to avoid re-renders; canvas drawn only when active

## Security

- XSS prevention in `generateSquarespaceHTML`: all user content passed through `escapeHtml()` before insertion into generated HTML
- Input `maxLength` constraints on all form fields
- localStorage data round-trips through `JSON.parse`/`JSON.stringify` (no `eval`)

## Project Structure

```
src/
├── App.tsx                    # Main app with lazy-loaded navigation
├── index.css                  # Tailwind + NEXUS CSS variables
├── main.tsx                   # React entry point
├── components/
│   ├── ErrorBoundary.tsx      # Class-based error boundary
│   ├── NeuralForge.tsx        # Canvas perceptron demo
│   ├── AlgorithmArena.tsx     # Canvas sorting visualizer
│   ├── SystemsPulse.tsx       # Canvas particle mesh
│   ├── PathFinder.tsx         # Interactive A*/BFS/DFS/Dijkstra grid visualizer
│   ├── CipherMatrix.tsx       # Real-time cipher/encryption visualizer
│   ├── FractalEngine.tsx      # Mandelbrot/Julia/Burning-Ship fractal explorer
│   ├── BeatForge.tsx          # Web Audio API step sequencer
│   ├── CommandCenter.tsx      # Inventory management UI
│   ├── Dashboard.tsx          # Metrics dashboard
│   ├── Gallery.tsx            # Client gallery
│   └── QuickLister.tsx        # Listing generator
├── hooks/
│   ├── useInventory.ts        # Artwork CRUD + localStorage
│   └── useListings.ts         # Listing generation + XSS-safe HTML export
└── __tests__/
    ├── setup.ts               # jest-dom setup
    ├── App.test.tsx
    ├── components/
    │   └── ErrorBoundary.test.tsx
    └── hooks/
        ├── useInventory.test.ts
        └── useListings.test.ts
```

