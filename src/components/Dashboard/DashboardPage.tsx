import type { StatsData, ActivityEntry } from '../../types/inventory'
import StatsCard from './StatsCard'
import RecentActivity from './RecentActivity'

interface DashboardPageProps {
  stats: StatsData
  activities: ActivityEntry[]
  onNavigate: (page: 'inventory') => void
}

export default function DashboardPage({ stats, activities, onNavigate }: DashboardPageProps) {
  return (
    <div className="animate-fade-in space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="Total Items"
          value={stats.totalItems.toLocaleString()}
          accent="blue"
          subtitle="Units in inventory"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          }
        />
        <StatsCard
          title="Low Stock Alerts"
          value={stats.lowStockAlerts}
          accent="yellow"
          subtitle="Items need attention"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          }
        />
        <StatsCard
          title="Categories"
          value={stats.categories}
          accent="purple"
          subtitle="Active categories"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          }
        />
        <StatsCard
          title="Total Value"
          value={`$${stats.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          accent="green"
          subtitle="Inventory worth"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          }
        />
      </div>

      {/* Quick Actions + Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentActivity activities={activities} />
        </div>
        <div className="space-y-4">
          <div className="rounded-xl border border-[#1e1e2e] bg-[#12121a] p-5">
            <h3 className="mb-4 text-lg font-semibold text-white">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => onNavigate('inventory')}
                className="flex w-full items-center gap-3 rounded-lg border border-cyan-500/20 bg-cyan-500/5 px-4 py-3 text-sm font-medium text-cyan-400 transition-all duration-200 hover:border-cyan-500/40 hover:bg-cyan-500/10"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add New Item
              </button>
              <button
                className="flex w-full items-center gap-3 rounded-lg border border-violet-500/20 bg-violet-500/5 px-4 py-3 text-sm font-medium text-violet-400 transition-all duration-200 hover:border-violet-500/40 hover:bg-violet-500/10"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export Report
              </button>
              <button
                onClick={() => onNavigate('inventory')}
                className="flex w-full items-center gap-3 rounded-lg border border-[#1e1e2e] bg-[#0a0a0f]/50 px-4 py-3 text-sm font-medium text-slate-400 transition-all duration-200 hover:border-[#2e2e4e] hover:text-slate-300"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                View All Inventory
              </button>
            </div>
          </div>

          {/* Low Stock Summary */}
          <div className="rounded-xl border border-yellow-500/20 bg-[#12121a] p-5">
            <h3 className="mb-3 text-sm font-semibold text-yellow-400">⚠ Low Stock Alert</h3>
            <p className="text-xs text-slate-400">
              {stats.lowStockAlerts} item{stats.lowStockAlerts !== 1 ? 's' : ''} require
              restocking attention. Check inventory for details.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
