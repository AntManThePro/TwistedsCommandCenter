interface HeaderProps {
  onMenuToggle: () => void
  searchQuery: string
  onSearchChange: (query: string) => void
}

export default function Header({ onMenuToggle, searchQuery, onSearchChange }: HeaderProps) {
  return (
    <header className="relative flex h-14 shrink-0 items-center gap-3 border-b border-[#1a1a3e] bg-[#050510]/90 px-4 backdrop-blur-xl sm:px-5">
      {/* Mobile menu button */}
      <button
        onClick={onMenuToggle}
        className="rounded-lg border border-[#1a1a3e] p-1.5 text-[#4a5278] transition-colors hover:border-[#60efff]/30 hover:text-[#60efff] lg:hidden"
        aria-label="Toggle sidebar"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Breadcrumb / title */}
      <div className="hidden sm:flex items-center gap-2">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#60efff]">NEXUS</span>
        <span className="text-[#1a1a3e]">/</span>
        <span className="text-[10px] uppercase tracking-wider text-[#4a5278]">
          Twisted&apos;s Command Center
        </span>
      </div>
      <div className="sm:hidden text-xs font-black uppercase tracking-widest text-[#60efff]">NEXUS</div>

      <div className="flex-1" />

      {/* Search */}
      <div className="relative hidden sm:block sm:w-56">
        <svg
          className="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-[#4a5278]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Search systems..."
          className="w-full rounded-lg border border-[#1a1a3e] bg-[#0d0d1e] py-1.5 pl-8 pr-3 text-xs text-slate-300 placeholder-[#2a2a4e] outline-none transition-all focus:border-[#60efff]/40 focus:shadow-[0_0_10px_rgba(96,239,255,0.1)]"
        />
      </div>

      {/* Status indicators */}
      <div className="hidden sm:flex items-center gap-3 text-[9px] uppercase tracking-wider">
        {[
          { label: 'CPU', value: '23%', color: '#00ff87' },
          { label: 'MEM', value: '67%', color: '#60efff' },
        ].map(m => (
          <div key={m.label} className="flex items-center gap-1">
            <span style={{ color: m.color }} className="font-bold">{m.label}</span>
            <span style={{ color: m.color + 'aa' }}>{m.value}</span>
          </div>
        ))}
      </div>

      {/* Notification bell */}
      <button
        className="relative rounded-lg border border-[#1a1a3e] p-1.5 text-[#4a5278] transition-colors hover:border-[#60efff]/30 hover:text-[#60efff]"
        aria-label="Notifications"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        <span
          className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-[#ff0080]"
          style={{ boxShadow: '0 0 6px #ff0080' }}
        />
      </button>
    </header>
  )
}
