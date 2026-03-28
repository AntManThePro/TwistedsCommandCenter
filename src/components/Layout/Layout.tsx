import { useState } from 'react'
import type { PageId } from '../../types/inventory'
import Sidebar from './Sidebar'
import Header from './Header'
import NexusBackground from '../shared/NexusBackground'

interface LayoutProps {
  currentPage: PageId
  onNavigate: (page: PageId) => void
  children: React.ReactNode
}

export default function Layout({ currentPage, onNavigate, children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="relative flex h-screen overflow-hidden bg-[#050510]">
      {/* Animated neural network background */}
      <NexusBackground />

      {/* Content layer */}
      <div className="relative z-10 flex w-full overflow-hidden">
        <Sidebar
          currentPage={currentPage}
          onNavigate={onNavigate}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="flex flex-1 flex-col overflow-hidden">
          <Header
            onMenuToggle={() => setSidebarOpen(prev => !prev)}
          />

          <main className="flex-1 overflow-y-auto p-4 sm:p-5">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
