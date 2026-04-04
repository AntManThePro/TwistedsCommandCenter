import React, { Suspense, lazy, useState } from 'react';
import ErrorBoundary from './components/ErrorBoundary';

const NeuralForge = lazy(() => import('./components/NeuralForge'));
const AlgorithmArena = lazy(() => import('./components/AlgorithmArena'));
const SystemsPulse = lazy(() => import('./components/SystemsPulse'));
const PathFinder = lazy(() => import('./components/PathFinder'));
const CipherMatrix = lazy(() => import('./components/CipherMatrix'));
const FractalEngine = lazy(() => import('./components/FractalEngine'));
const BeatForge = lazy(() => import('./components/BeatForge'));
const CommandCenter = lazy(() => import('./components/CommandCenter'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const Gallery = lazy(() => import('./components/Gallery'));
const QuickLister = lazy(() => import('./components/QuickLister'));

type MainView = 'nexus' | 'inventory';
type NexusTab = 'neural' | 'algorithms' | 'systems' | 'pathfinder' | 'cipher' | 'fractal' | 'beat';
type InventoryTab = 'command' | 'dashboard' | 'gallery' | 'listings';

const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center min-h-64 text-[#60efff] text-xl">
    <span className="animate-pulse">Loading…</span>
  </div>
);

export default function App() {
  const [mainView, setMainView] = useState<MainView>('nexus');
  const [nexusTab, setNexusTab] = useState<NexusTab>('neural');
  const [inventoryTab, setInventoryTab] = useState<InventoryTab>('command');

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: '#dffcff' }}>
      {/* Top Bar */}
      <header
        className="sticky top-0 z-10 backdrop-blur-sm"
        style={{
          padding: '0.8rem 1rem',
          borderBottom: '1px solid var(--line)',
          background: 'rgba(2, 4, 10, 0.9)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem' }}>
          <span
            style={{
              width: '0.8rem',
              height: '0.8rem',
              borderRadius: '50%',
              background: 'var(--green)',
              boxShadow: '0 0 15px var(--green)',
              display: 'inline-block',
            }}
          />
          <h1
            style={{
              margin: 0,
              fontSize: 'clamp(0.8rem, 2.2vw, 1.1rem)',
              letterSpacing: '0.12em',
              color: 'var(--green)',
            }}
          >
            NEXUS // DOUBLEA // COMMAND CENTER
          </h1>
        </div>

        {/* Main view switcher */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
          <NavButton active={mainView === 'nexus'} onClick={() => setMainView('nexus')}>
            ◈ NEXUS Portfolio
          </NavButton>
          <NavButton active={mainView === 'inventory'} onClick={() => setMainView('inventory')}>
            📦 Art Inventory
          </NavButton>
        </div>

        {/* Sub-nav for NEXUS */}
        {mainView === 'nexus' && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <NavButton active={nexusTab === 'neural'} onClick={() => setNexusTab('neural')}>
              Neural Forge
            </NavButton>
            <NavButton active={nexusTab === 'algorithms'} onClick={() => setNexusTab('algorithms')}>
              Algorithm Arena
            </NavButton>
            <NavButton active={nexusTab === 'systems'} onClick={() => setNexusTab('systems')}>
              Systems Pulse
            </NavButton>
            <NavButton active={nexusTab === 'pathfinder'} onClick={() => setNexusTab('pathfinder')}>
              PathFinder
            </NavButton>
            <NavButton active={nexusTab === 'cipher'} onClick={() => setNexusTab('cipher')}>
              CipherMatrix
            </NavButton>
            <NavButton active={nexusTab === 'fractal'} onClick={() => setNexusTab('fractal')}>
              Fractal Engine
            </NavButton>
            <NavButton active={nexusTab === 'beat'} onClick={() => setNexusTab('beat')}>
              BeatForge
            </NavButton>
          </div>
        )}

        {/* Sub-nav for Inventory */}
        {mainView === 'inventory' && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <NavButton active={inventoryTab === 'command'} onClick={() => setInventoryTab('command')}>
              Command Center
            </NavButton>
            <NavButton active={inventoryTab === 'dashboard'} onClick={() => setInventoryTab('dashboard')}>
              Dashboard
            </NavButton>
            <NavButton active={inventoryTab === 'gallery'} onClick={() => setInventoryTab('gallery')}>
              Gallery
            </NavButton>
            <NavButton active={inventoryTab === 'listings'} onClick={() => setInventoryTab('listings')}>
              Quick Lister
            </NavButton>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main style={{ padding: '1rem' }}>
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>
            {mainView === 'nexus' && (
              <>
                {nexusTab === 'neural' && <NeuralForge />}
                {nexusTab === 'algorithms' && <AlgorithmArena />}
                {nexusTab === 'systems' && <SystemsPulse />}
                {nexusTab === 'pathfinder' && <PathFinder />}
                {nexusTab === 'cipher' && <CipherMatrix />}
                {nexusTab === 'fractal' && <FractalEngine />}
                {nexusTab === 'beat' && <BeatForge />}
              </>
            )}
            {mainView === 'inventory' && (
              <>
                {inventoryTab === 'command' && <CommandCenter />}
                {inventoryTab === 'dashboard' && <Dashboard />}
                {inventoryTab === 'gallery' && <Gallery />}
                {inventoryTab === 'listings' && <QuickLister />}
              </>
            )}
          </Suspense>
        </ErrorBoundary>
      </main>

      <footer style={{ textAlign: 'center', color: '#89b9c0', padding: '1rem', fontSize: '0.85rem' }}>
        Built for AntManThePro // NEXUS aesthetic // Canvas + algorithmic interactivity
      </footer>
    </div>
  );
}

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function NavButton({ active, onClick, children }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        border: `1px solid ${active ? 'var(--green)' : 'var(--line)'}`,
        background: active ? 'rgba(0,255,135,0.1)' : 'rgba(8, 14, 24, 0.8)',
        color: active ? 'var(--green)' : '#c2f9ff',
        padding: '0.5rem 0.8rem',
        cursor: 'pointer',
        borderRadius: '0.5rem',
        boxShadow: active ? '0 0 18px rgba(0, 255, 135, 0.35)' : 'none',
        fontSize: '0.85rem',
      }}
    >
      {children}
    </button>
  );
}
