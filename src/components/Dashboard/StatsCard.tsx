import type { ReactNode } from 'react'

interface StatsCardProps {
  title: string
  value: string | number
  icon: ReactNode
  accent: 'blue' | 'purple' | 'green' | 'yellow'
  subtitle?: string
}

const accentStyles = {
  blue: {
    border: 'border-cyan-500/30',
    glow: 'group-hover:shadow-[0_0_30px_rgba(96,239,255,0.2)]',
    iconBg: 'bg-cyan-500/10 text-cyan-400',
    valueTxt: 'text-cyan-400',
    neonColor: '#60efff',
    barColor: 'bg-cyan-400',
  },
  purple: {
    border: 'border-violet-500/30',
    glow: 'group-hover:shadow-[0_0_30px_rgba(139,92,246,0.2)]',
    iconBg: 'bg-violet-500/10 text-violet-400',
    valueTxt: 'text-violet-400',
    neonColor: '#8b5cf6',
    barColor: 'bg-violet-400',
  },
  green: {
    border: 'border-emerald-500/30',
    glow: 'group-hover:shadow-[0_0_30px_rgba(0,255,135,0.2)]',
    iconBg: 'bg-emerald-500/10 text-emerald-400',
    valueTxt: 'text-emerald-400',
    neonColor: '#00ff87',
    barColor: 'bg-emerald-400',
  },
  yellow: {
    border: 'border-yellow-500/30',
    glow: 'group-hover:shadow-[0_0_30px_rgba(255,204,0,0.2)]',
    iconBg: 'bg-yellow-500/10 text-yellow-400',
    valueTxt: 'text-yellow-400',
    neonColor: '#ffcc00',
    barColor: 'bg-yellow-400',
  },
}

export default function StatsCard({ title, value, icon, accent, subtitle }: StatsCardProps) {
  const style = accentStyles[accent]

  return (
    <div
      data-testid="stats-card"
      className={`group relative overflow-hidden rounded-xl border bg-[#0d0d1e]/90 p-4 transition-all duration-300 backdrop-blur-sm ${style.border} ${style.glow}`}
    >
      {/* Top glow line */}
      <div
        className="absolute inset-x-0 top-0 h-px opacity-60"
        style={{ background: `linear-gradient(90deg, transparent, ${style.neonColor}, transparent)` }}
      />

      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-widest text-[#4a5278]">{title}</p>
          <p
            className={`mt-2 text-2xl font-black tabular-nums animate-counter ${style.valueTxt}`}
            style={{ textShadow: `0 0 15px ${style.neonColor}66` }}
          >
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 text-[10px] text-[#4a5278]">{subtitle}</p>
          )}
        </div>
        <div
          className={`rounded-lg p-2 ${style.iconBg}`}
          style={{ boxShadow: `0 0 12px ${style.neonColor}22` }}
        >
          {icon}
        </div>
      </div>

      {/* Bottom accent bar */}
      <div className="mt-3 h-px w-full rounded-full bg-[#1a1a3e] overflow-hidden">
        <div
          className={`h-full w-2/3 rounded-full ${style.barColor} opacity-40 animate-slide-right`}
        />
      </div>
    </div>
  )
}
