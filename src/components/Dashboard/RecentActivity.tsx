import type { ActivityEntry } from '../../types/inventory'

interface RecentActivityProps {
  activities: ActivityEntry[]
}

const actionConfig: Record<
  ActivityEntry['action'],
  { label: string; color: string; dot: string }
> = {
  added:     { label: 'ADDED',     color: '#00ff87', dot: '#00ff87' },
  updated:   { label: 'UPDATED',   color: '#60efff', dot: '#60efff' },
  removed:   { label: 'REMOVED',   color: '#ff0080', dot: '#ff0080' },
  restocked: { label: 'RESTOCKED', color: '#8b5cf6', dot: '#8b5cf6' },
}

export default function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <div className="nexus-card rounded-xl p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#4a5278]">
          Recent Activity
        </h3>
        <div className="flex items-center gap-1.5">
          <span className="h-1 w-1 rounded-full bg-[#60efff] status-dot-live" />
          <span className="text-[9px] uppercase tracking-widest text-[#60efff]">Live</span>
        </div>
      </div>
      <div className="space-y-1.5">
        {activities.slice(0, 6).map((entry, i) => {
          const cfg = actionConfig[entry.action]
          return (
            <div
              key={entry.id}
              className="flex items-center gap-3 rounded-lg border border-transparent px-2.5 py-2 transition-all duration-200 hover:border-[#1a1a3e] hover:bg-[#0d0d1e]/60"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              {/* Action badge */}
              <span
                className="shrink-0 rounded px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest"
                style={{
                  color: cfg.color,
                  background: cfg.color + '14',
                  border: `1px solid ${cfg.color}33`,
                  boxShadow: `0 0 6px ${cfg.color}22`,
                }}
              >
                {cfg.label}
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-slate-200">{entry.itemName}</p>
                <p className="truncate text-[10px] text-[#4a5278]">{entry.details}</p>
              </div>

              <span className="shrink-0 text-[9px] text-[#2a2a4e]">{entry.timestamp}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
