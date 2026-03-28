import { useState, useMemo } from 'react'
import type { InventoryItem, ItemCategory } from '../../types/inventory'
import { allCategories } from '../../data/mockData'
import InventoryTable from './InventoryTable'
import AddItemModal from './AddItemModal'

interface InventoryPageProps {
  items: InventoryItem[]
  onAdd: (item: Omit<InventoryItem, 'id' | 'status' | 'lastUpdated'>) => void
  onDelete: (id: string) => void
}

export default function InventoryPage({ items, onAdd, onDelete }: InventoryPageProps) {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<ItemCategory | ''>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const filtered = useMemo(() => {
    return items.filter(item => {
      const matchesSearch =
        !search ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.sku.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = !categoryFilter || item.category === categoryFilter
      const matchesStatus = !statusFilter || item.status === statusFilter
      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [items, search, categoryFilter, statusFilter])

  return (
    <div className="animate-fade-in space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative flex-1 sm:max-w-xs">
            <svg
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search items..."
              className="w-full rounded-lg border border-[#1e1e2e] bg-[#12121a] py-2 pl-9 pr-3 text-sm text-slate-200 placeholder-slate-600 outline-none transition-colors focus:border-cyan-500/50"
            />
          </div>

          {/* Category filter */}
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value as ItemCategory | '')}
            className="rounded-lg border border-[#1e1e2e] bg-[#12121a] px-3 py-2 text-sm text-slate-300 outline-none transition-colors focus:border-cyan-500/50"
          >
            <option value="">All Categories</option>
            {allCategories.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="rounded-lg border border-[#1e1e2e] bg-[#12121a] px-3 py-2 text-sm text-slate-300 outline-none transition-colors focus:border-cyan-500/50"
          >
            <option value="">All Status</option>
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-black transition-all hover:bg-cyan-400 hover:shadow-[0_0_20px_rgba(0,212,255,0.3)]"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Item
        </button>
      </div>

      {/* Results count */}
      <p className="text-sm text-slate-500">
        Showing {filtered.length} of {items.length} items
      </p>

      {/* Table */}
      <InventoryTable items={filtered} onDelete={onDelete} />

      {/* Modal */}
      <AddItemModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAdd={onAdd} />
    </div>
  )
}
