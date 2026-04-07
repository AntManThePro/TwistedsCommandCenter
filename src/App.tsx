import { useState } from 'react'
import type { PageId } from './types/inventory'
import { useInventory } from './hooks/useInventory'
import Layout from './components/Layout/Layout'
import DashboardPage from './components/Dashboard/DashboardPage'
import InventoryPage from './components/Inventory/InventoryPage'
import AlgorithmVisualizer from './components/Algorithm/AlgorithmVisualizer'
import PortfolioPage from './components/Portfolio/PortfolioPage'
import CategoriesPage from './components/Categories/CategoriesPage'
import SettingsPage from './components/Settings/SettingsPage'

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
      case 'portfolio':
        return <PortfolioPage />
      case 'categories':
        return <CategoriesPage items={items} onNavigate={setCurrentPage} />
      case 'settings':
        return <SettingsPage />
    }
  }

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </Layout>
  )
}
