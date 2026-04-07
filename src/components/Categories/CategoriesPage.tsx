import { useState } from 'react'
import type { InventoryItem, ItemCategory } from '../../types/inventory'
import { allCategories } from '../../data/mockData'

interface CategoriesPageProps {
  items: InventoryItem[]
  onNavigate: (page: 'inventory') => void
}

const ACCENT_COLORS = [
  '#60efff',
  '#00ff87',
  '#ff0080',
  '#ffcc00',
  '#8b5cf6',
  '#ff6b35',
  '#a3e635',
  '#f59e0b',
]

interface CategoryStats {
  category: ItemCategory
  accent: string
  itemCount: number
  totalUnits: number
  totalValue: number
  lowStockCount: number
  inStockCount: number
  outOfStockCount: number
}

function buildCategoryStats(items: InventoryItem[]): CategoryStats[] {
  return allCategories.map((category, index) => {
    const categoryItems = items.filter(item => item.category === category)
    const totalUnits = categoryItems.reduce((sum, item) => sum + item.quantity, 0)
    const totalValue = categoryItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const lowStockCount = categoryItems.filter(item => item.status === 'Low Stock').length
    const inStockCount = categoryItems.filter(item => item.status === 'In Stock').length
    const outOfStockCount = categoryItems.filter(item => item.status === 'Out of Stock').length

    return {
      category,
      accent: ACCENT_COLORS[index % ACCENT_COLORS.length],
      itemCount: categoryItems.length,
      totalUnits,
      totalValue,
      lowStockCount,
      inStockCount,
      outOfStockCount,
    }
  })
}

interface CategoryCardProps {
  stats: CategoryStats
  onClick: () => void
}

function CategoryCard({ stats, onClick }: CategoryCardProps) {
  const { category, accent, itemCount, totalUnits, totalValue, lowStockCount, inStockCount, outOfStockCount } = stats
  const inStockPct = itemCount > 0 ? Math.round((inStockCount / itemCount) * 100) : 0
  const [hovered, setHovered] = useState(false)

  return (
    <button
      onClick={onClick}
      className="nexus-card group w-full rounded-xl text-left transition-all duration-200 hover:scale-[1.02] focus:outline-none"
      style={{
        borderColor: hovered ? `${accent}55` : `${accent}22`,
        background: '#0a0a1f',
        boxShadow: hovered ? `0 0 20px ${accent}18` : 'none',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Accent top bar */}
      <div
        className="h-0.5 w-full rounded-t-xl"
        style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }}
      />

      <div className="p-4">
        {/* Header row */}
        <div className="mb-3 flex items-start justify-between gap-2">
          <span
            className="text-sm font-black uppercase tracking-widest leading-tight"
            style={{ color: accent, textShadow: `0 0 10px ${accent}66` }}
          >
            {category}
          </span>
          <span
            className="shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
            style={{
              background: `${accent}18`,
              color: accent,
              border: `1px solid ${accent}33`,
            }}
          >
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </span>
        </div>

        <div className="mb-3 h-px w-full bg-[#1a1a3e]" />

        {itemCount === 0 ? (
          /* Empty state */
          <div className="py-4 text-center">
            <div
              className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ background: `${accent}10`, border: `1px solid ${accent}22` }}
            >
              <svg
                className="h-4 w-4"
                style={{ color: accent + '88' }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <p className="text-[10px] uppercase tracking-widest text-[#4a5278]">No items</p>
          </div>
        ) : (
          <>
            {/* Stats row */}
            <div className="mb-3 grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-[9px] uppercase tracking-widest text-[#4a5278]">Units</p>
                <p className="mt-0.5 text-sm font-black text-[#e2e8f0]">{totalUnits.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-widest text-[#4a5278]">Value</p>
                <p className="mt-0.5 text-sm font-black text-[#e2e8f0]">
                  ${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-widest text-[#4a5278]">Low Stock</p>
                <p
                  className="mt-0.5 text-sm font-black"
                  style={{ color: lowStockCount > 0 ? '#ffcc00' : '#4a5278' }}
                >
                  {lowStockCount}
                </p>
              </div>
            </div>

            {/* Status breakdown */}
            <div>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-[9px] uppercase tracking-widest text-[#4a5278]">In-Stock</span>
                <span className="text-[9px] font-bold" style={{ color: accent }}>
                  {inStockPct}%
                </span>
              </div>
              <div className="h-1 w-full overflow-hidden rounded-full bg-[#1a1a3e]">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${inStockPct}%`,
                    background: accent,
                    boxShadow: `0 0 6px ${accent}88`,
                  }}
                />
              </div>
              <div className="mt-1.5 flex items-center gap-3">
                <span className="flex items-center gap-1 text-[9px] text-[#4a5278]">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  {inStockCount} in stock
                </span>
                {outOfStockCount > 0 && (
                  <span className="flex items-center gap-1 text-[9px] text-[#4a5278]">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                    {outOfStockCount} out
                  </span>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </button>
  )
}

export default function CategoriesPage({ items, onNavigate }: CategoriesPageProps) {
  const categoryStats = buildCategoryStats(items)
  const totalItems = items.length
  const populatedCategories = categoryStats.filter(c => c.itemCount > 0).length

  return (
    <div className="animate-fade-in space-y-5">
      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-black tracking-tight">
            <span className="text-glow-cyan text-[#60efff]">CATEGORIES</span>{' '}
            <span className="text-white">OVERVIEW</span>
          </h2>
          <p className="mt-0.5 text-[10px] uppercase tracking-widest text-[#4a5278]">
            {populatedCategories} of {allCategories.length} categories active &mdash; {totalItems} total items
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-[#00ff87]/20 bg-[#00ff87]/5 px-3 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#00ff87] status-dot-live" />
          <span className="text-[9px] uppercase tracking-widest text-[#00ff87]">Live Data</span>
        </div>
      </div>

      {/* Summary strip */}
      <div className="nexus-card rounded-xl p-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Total Categories', value: allCategories.length, color: '#60efff' },
            { label: 'Active Categories', value: populatedCategories, color: '#00ff87' },
            { label: 'Total SKUs', value: totalItems, color: '#8b5cf6' },
            {
              label: 'Total Value',
              value: `$${items.reduce((s, i) => s + i.price * i.quantity, 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
              color: '#ffcc00',
            },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <p className="text-[9px] uppercase tracking-widest text-[#4a5278]">{stat.label}</p>
              <p
                className="mt-1 text-lg font-black"
                style={{ color: stat.color, textShadow: `0 0 10px ${stat.color}55` }}
              >
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Category cards grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {categoryStats.map(stats => (
          <CategoryCard
            key={stats.category}
            stats={stats}
            onClick={() => onNavigate('inventory')}
          />
        ))}
      </div>
    </div>
  )
}
