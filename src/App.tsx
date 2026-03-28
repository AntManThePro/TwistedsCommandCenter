import { useState } from 'react'
import type { PageId } from './types/inventory'
import { useInventory } from './hooks/useInventory'
import Layout from './components/Layout/Layout'
import DashboardPage from './components/Dashboard/DashboardPage'
import InventoryPage from './components/Inventory/InventoryPage'
import AlgorithmVisualizer from './components/Algorithm/AlgorithmVisualizer'

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard')
  const { items, activities, stats, addItem, deleteItem } = useInventory()

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <DashboardPage
            stats={stats}
            activities={activities}
            onNavigate={setCurrentPage}
          />
        )
      case 'inventory':
        return (
          <InventoryPage
            items={items}
            onAdd={addItem}
            onDelete={deleteItem}
          />
        )
      case 'algorithm':
        return <AlgorithmVisualizer />
      case 'categories':
        return (
          <div className="animate-fade-in nexus-card rounded-xl p-8 text-center">
            <div
              className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl"
              style={{ background: 'rgba(255,204,0,0.1)', border: '1px solid rgba(255,204,0,0.2)' }}
            >
              <svg className="h-7 w-7" style={{ color: '#ffcc00' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <h2 className="text-lg font-black uppercase tracking-wider text-white">Categories</h2>
            <p className="mt-2 text-xs text-[#4a5278]">Category management coming soon.</p>
          </div>
        )
      case 'settings':
        return (
          <div className="animate-fade-in nexus-card rounded-xl p-8 text-center">
            <div
              className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl"
              style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)' }}
            >
              <svg className="h-7 w-7 text-[#8b5cf6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-black uppercase tracking-wider text-white">Settings</h2>
            <p className="mt-2 text-xs text-[#4a5278]">System settings coming soon.</p>
          </div>
        )
    }
  }

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </Layout>
  )
}
