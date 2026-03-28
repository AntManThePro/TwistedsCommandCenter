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
    <div className="animate-fade-in space-y-5">
      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-black tracking-tight">
            <span className="text-glow-cyan text-[#60efff]">COMMAND</span>{' '}
            <span className="text-white">CENTER</span>
          </h2>
          <p className="mt-0.5 text-[10px] uppercase tracking-widest text-[#4a5278]">
            Inventory Intelligence Dashboard
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-[#00ff87]/20 bg-[#00ff87]/5 px-3 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#00ff87] status-dot-live" />
          <span className="text-[9px] uppercase tracking-widest text-[#00ff87]">Live Data</span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
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

      {/* Activity + Actions */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentActivity activities={activities} />
        </div>

        <div className="space-y-3">
          {/* Quick Actions */}
          <div className="nexus-card rounded-xl p-4">
            <h3 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-[#4a5278]">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => onNavigate('inventory')}
                className="nexus-btn flex w-full items-center gap-2.5 rounded-lg border border-[#60efff]/20 bg-[#60efff]/5 px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#60efff] transition-all hover:border-[#60efff]/40 hover:bg-[#60efff]/10 hover:shadow-[0_0_15px_rgba(96,239,255,0.15)]"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add New Item
              </button>
              <button
                className="nexus-btn flex w-full items-center gap-2.5 rounded-lg border border-[#8b5cf6]/20 bg-[#8b5cf6]/5 px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#8b5cf6] transition-all hover:border-[#8b5cf6]/40 hover:bg-[#8b5cf6]/10"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export Report
              </button>
              <button
                onClick={() => onNavigate('inventory')}
                className="nexus-btn flex w-full items-center gap-2.5 rounded-lg border border-[#1a1a3e] px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#4a5278] transition-all hover:border-[#60efff]/20 hover:text-slate-300"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                View Inventory
              </button>
            </div>
          </div>

          {/* Low Stock panel */}
          <div className="nexus-card rounded-xl p-4" style={{ borderColor: 'rgba(255,204,0,0.2)' }}>
            <div className="flex items-center gap-2 mb-2">
              <svg className="h-3.5 w-3.5 text-[#ffcc00]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#ffcc00]">
                Low Stock Alert
              </h3>
            </div>
            <p className="text-xs text-[#4a5278]">
              <span
                className="font-black"
                style={{ color: '#ffcc00', textShadow: '0 0 8px rgba(255,204,0,0.4)' }}
              >
                {stats.lowStockAlerts}
              </span>{' '}
              item{stats.lowStockAlerts !== 1 ? 's' : ''} require restocking attention.
            </p>
          </div>

          {/* System metrics */}
          <div className="nexus-card rounded-xl p-4">
            <h3 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-[#4a5278]">
              System Metrics
            </h3>
            {[
              { label: 'Database', value: 92, color: '#00ff87' },
              { label: 'API Sync',  value: 78, color: '#60efff' },
              { label: 'Storage',   value: 55, color: '#ffcc00' },
            ].map(m => (
              <div key={m.label} className="mb-2">
                <div className="mb-1 flex justify-between text-[9px] uppercase tracking-wider">
                  <span style={{ color: m.color + 'aa' }}>{m.label}</span>
                  <span style={{ color: m.color }} className="font-bold">{m.value}%</span>
                </div>
                <div className="h-1 w-full rounded-full bg-[#1a1a3e] overflow-hidden">
                  <div
                    className="h-full rounded-full animate-slide-right"
                    style={{
                      width: `${m.value}%`,
                      background: m.color,
                      boxShadow: `0 0 6px ${m.color}88`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
