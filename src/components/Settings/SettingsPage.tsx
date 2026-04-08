import { useState, useEffect, useRef, type ReactNode } from 'react'

/* ══════════════════════════════════════════════════════
   NEXUS Settings — Twisted's Command Center
   Appearance, notifications, and data management config
   ══════════════════════════════════════════════════════ */

interface ToggleProps {
  enabled: boolean
  onToggle: () => void
}

function Toggle({ enabled, onToggle }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-checked={enabled}
      role="switch"
      className="relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer items-center rounded-full transition-all duration-300 focus:outline-none"
      style={{
        background: enabled ? '#00ff87' : '#1a1a3e',
        border: `1px solid ${enabled ? '#00ff87' : '#2d2d5e'}`,
        boxShadow: enabled ? '0 0 10px rgba(0,255,135,0.4)' : 'none',
      }}
    >
      <span
        className="inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform duration-300"
        style={{
          transform: enabled ? 'translateX(18px)' : 'translateX(2px)',
          boxShadow: enabled ? '0 0 4px rgba(0,255,135,0.6)' : '0 1px 3px rgba(0,0,0,0.4)',
        }}
      />
    </button>
  )
}

interface SettingRowProps {
  label: string
  children: ReactNode
}

function SettingRow({ label, children }: SettingRowProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[#1a1a3e] last:border-b-0">
      <span className="text-xs font-semibold uppercase tracking-wider text-[#e2e8f0]">{label}</span>
      {children}
    </div>
  )
}

const ACCENT_SWATCHES = [
  { color: '#60efff', label: 'Cyan' },
  { color: '#00ff87', label: 'Green' },
  { color: '#ff0080', label: 'Pink' },
  { color: '#ffcc00', label: 'Yellow' },
  { color: '#8b5cf6', label: 'Purple' },
]

export default function SettingsPage() {
  const [accentColor, setAccentColor] = useState('#60efff')

  const [animations, setAnimations] = useState(true)
  const [compactMode, setCompactMode] = useState(false)

  const [lowStockAlerts, setLowStockAlerts] = useState(true)
  const [activityFeed, setActivityFeed] = useState(true)
  const [systemMetrics, setSystemMetrics] = useState(false)

  const [resetMessage, setResetMessage] = useState<string | null>(null)
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (resetTimerRef.current !== null) clearTimeout(resetTimerRef.current)
    }
  }, [])

  function handleReset() {
    setAccentColor('#60efff')
    setAnimations(true)
    setCompactMode(false)
    setLowStockAlerts(true)
    setActivityFeed(true)
    setSystemMetrics(false)
    setResetMessage('Settings reset to defaults.')
    if (resetTimerRef.current !== null) clearTimeout(resetTimerRef.current)
    resetTimerRef.current = setTimeout(() => setResetMessage(null), 3000)
  }

  return (
    <div className="animate-fade-in space-y-5">
      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-black tracking-tight">
            <span className="font-black" style={{ color: '#8b5cf6', textShadow: '0 0 12px rgba(139,92,246,0.6)' }}>
              SETTINGS
            </span>{' '}
            <span className="text-white">CONFIG</span>
          </h2>
          <p className="mt-0.5 text-[10px] uppercase tracking-widest text-[#4a5278]">
            System Preferences &amp; Configuration
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-[#8b5cf6]/20 bg-[#8b5cf6]/5 px-3 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#8b5cf6]" />
          <span className="text-[9px] uppercase tracking-widest text-[#8b5cf6]">Local Only</span>
        </div>
      </div>

      {/* Section 1: Appearance */}
      <div className="nexus-card rounded-xl p-5">
        <h3 className="mb-4 text-[10px] font-black uppercase tracking-widest text-[#4a5278]">
          Appearance
        </h3>

        <SettingRow label="Accent Theme">
          <div className="flex items-center gap-2">
            {ACCENT_SWATCHES.map(({ color, label }) => (
              <button
                key={color}
                type="button"
                title={label}
                onClick={() => setAccentColor(color)}
                className="h-6 w-6 rounded-full transition-all duration-200 hover:scale-110 focus:outline-none"
                style={{
                  background: color,
                  boxShadow: accentColor === color
                    ? `0 0 0 2px #050510, 0 0 0 4px ${color}, 0 0 10px ${color}88`
                    : `0 0 6px ${color}44`,
                }}
                aria-label={`${label} accent`}
                aria-pressed={accentColor === color}
              />
            ))}
          </div>
        </SettingRow>

        <SettingRow label="Animations">
          <Toggle enabled={animations} onToggle={() => setAnimations(v => !v)} />
        </SettingRow>

        <SettingRow label="Compact Mode">
          <Toggle enabled={compactMode} onToggle={() => setCompactMode(v => !v)} />
        </SettingRow>
      </div>

      {/* Section 2: Notifications */}
      <div className="nexus-card rounded-xl p-5">
        <h3 className="mb-4 text-[10px] font-black uppercase tracking-widest text-[#4a5278]">
          Notifications
        </h3>

        <SettingRow label="Low Stock Alerts">
          <Toggle enabled={lowStockAlerts} onToggle={() => setLowStockAlerts(v => !v)} />
        </SettingRow>

        <SettingRow label="Activity Feed">
          <Toggle enabled={activityFeed} onToggle={() => setActivityFeed(v => !v)} />
        </SettingRow>

        <SettingRow label="System Metrics">
          <Toggle enabled={systemMetrics} onToggle={() => setSystemMetrics(v => !v)} />
        </SettingRow>
      </div>

      {/* Section 3: Data Management */}
      <div className="nexus-card rounded-xl p-5">
        <h3 className="mb-4 text-[10px] font-black uppercase tracking-widest text-[#4a5278]">
          Data Management
        </h3>

        <div className="flex flex-wrap items-center gap-3">
          <div className="group relative">
            <button
              type="button"
              disabled
              className="nexus-btn flex items-center gap-2 rounded-lg border border-[#1a1a3e] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#4a5278] cursor-not-allowed opacity-50"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export CSV
            </button>
            <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-[#1a1a3e] px-2 py-1 text-[9px] uppercase tracking-wider text-[#60efff] opacity-0 transition-opacity group-hover:opacity-100">
              Coming Soon
            </span>
          </div>

          <div className="group relative">
            <button
              type="button"
              disabled
              className="nexus-btn flex items-center gap-2 rounded-lg border border-[#1a1a3e] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#4a5278] cursor-not-allowed opacity-50"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Import Data
            </button>
            <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-[#1a1a3e] px-2 py-1 text-[9px] uppercase tracking-wider text-[#60efff] opacity-0 transition-opacity group-hover:opacity-100">
              Coming Soon
            </span>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="nexus-btn flex items-center gap-2 rounded-lg border border-[#ff0080]/20 bg-[#ff0080]/5 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#ff0080] transition-all hover:border-[#ff0080]/40 hover:bg-[#ff0080]/10 hover:shadow-[0_0_15px_rgba(255,0,128,0.15)]"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset to Defaults
          </button>
        </div>

        {resetMessage && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-[#00ff87]/20 bg-[#00ff87]/5 px-3 py-2">
            <svg className="h-3.5 w-3.5 text-[#00ff87]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-xs font-semibold text-[#00ff87]">{resetMessage}</span>
          </div>
        )}
      </div>
    </div>
  )
}
