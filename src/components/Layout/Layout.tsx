import { useState } from 'react'
import type { PageId } from '../../types/inventory'
import Sidebar from './Sidebar'
import Header from './Header'

interface LayoutProps {
  currentPage: PageId
  onNavigate: (page: PageId) => void
  children: React.ReactNode
}

export default function Layout({ currentPage, onNavigate, children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0a0f]">
      <Sidebar
        currentPage={currentPage}
        onNavigate={onNavigate}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          onMenuToggle={() => setSidebarOpen(prev => !prev)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
