interface StatsCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  accent: 'blue' | 'purple' | 'green' | 'yellow'
  subtitle?: string
}

const accentStyles = {
  blue: {
    border: 'border-cyan-500/30',
    glow: 'group-hover:shadow-[0_0_20px_rgba(0,212,255,0.15)]',
    iconBg: 'bg-cyan-500/10 text-cyan-400',
    valueTxt: 'text-cyan-400',
  },
  purple: {
    border: 'border-violet-500/30',
    glow: 'group-hover:shadow-[0_0_20px_rgba(124,58,237,0.15)]',
    iconBg: 'bg-violet-500/10 text-violet-400',
    valueTxt: 'text-violet-400',
  },
  green: {
    border: 'border-emerald-500/30',
    glow: 'group-hover:shadow-[0_0_20px_rgba(34,197,94,0.15)]',
    iconBg: 'bg-emerald-500/10 text-emerald-400',
    valueTxt: 'text-emerald-400',
  },
  yellow: {
    border: 'border-yellow-500/30',
    glow: 'group-hover:shadow-[0_0_20px_rgba(234,179,8,0.15)]',
    iconBg: 'bg-yellow-500/10 text-yellow-400',
    valueTxt: 'text-yellow-400',
  },
}

export default function StatsCard({ title, value, icon, accent, subtitle }: StatsCardProps) {
  const style = accentStyles[accent]

  return (
    <div
      data-testid="stats-card"
      className={`group relative rounded-xl border bg-[#12121a] p-5 transition-all duration-300 ${style.border} ${style.glow}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400">{title}</p>
          <p className={`mt-2 text-2xl font-bold ${style.valueTxt}`}>{value}</p>
          {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
        </div>
        <div className={`rounded-lg p-2.5 ${style.iconBg}`}>{icon}</div>
      </div>
    </div>
  )
}
