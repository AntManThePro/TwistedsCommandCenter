import type { ActivityEntry } from '../../types/inventory'

interface RecentActivityProps {
  activities: ActivityEntry[]
}

const actionConfig: Record<
  ActivityEntry['action'],
  { label: string; color: string; bg: string }
> = {
  added: { label: 'Added', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  updated: { label: 'Updated', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  removed: { label: 'Removed', color: 'text-red-400', bg: 'bg-red-500/10' },
  restocked: { label: 'Restocked', color: 'text-violet-400', bg: 'bg-violet-500/10' },
}

export default function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <div className="rounded-xl border border-[#1e1e2e] bg-[#12121a] p-5">
      <h3 className="mb-4 text-lg font-semibold text-white">Recent Activity</h3>
      <div className="space-y-3">
        {activities.slice(0, 6).map(entry => {
          const cfg = actionConfig[entry.action]
          return (
            <div
              key={entry.id}
              className="flex items-start gap-3 rounded-lg border border-[#1e1e2e] bg-[#0a0a0f]/50 p-3 transition-colors duration-200 hover:border-[#2e2e4e]"
            >
              <span
                className={`mt-0.5 shrink-0 rounded-md px-2 py-0.5 text-xs font-medium ${cfg.bg} ${cfg.color}`}
              >
                {cfg.label}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-200">{entry.itemName}</p>
                <p className="text-xs text-slate-500">{entry.details}</p>
              </div>
              <span className="shrink-0 text-xs text-slate-600">{entry.timestamp}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
