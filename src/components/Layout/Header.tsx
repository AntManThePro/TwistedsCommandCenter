interface HeaderProps {
  onMenuToggle: () => void
  searchQuery: string
  onSearchChange: (query: string) => void
}

export default function Header({ onMenuToggle, searchQuery, onSearchChange }: HeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-[#1e1e2e] bg-[#0d0d14]/80 px-4 backdrop-blur-md sm:px-6">
      {/* Mobile menu button */}
      <button
        onClick={onMenuToggle}
        className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-[#1a1a2e] hover:text-white lg:hidden"
        aria-label="Toggle sidebar"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Title */}
      <h1 className="text-sm font-semibold text-white sm:text-base">
        Twisted&apos;s <span className="text-cyan-400">Command Center</span>
      </h1>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search */}
      <div className="relative hidden sm:block sm:w-64">
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
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Search..."
          className="w-full rounded-lg border border-[#1e1e2e] bg-[#12121a] py-1.5 pl-9 pr-3 text-sm text-slate-200 placeholder-slate-600 outline-none transition-colors focus:border-cyan-500/50"
        />
      </div>

      {/* Notification bell */}
      <button
        className="relative rounded-lg p-2 text-slate-400 transition-colors hover:bg-[#1a1a2e] hover:text-white"
        aria-label="Notifications"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        {/* Notification dot */}
        <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-cyan-400" />
      </button>
    </header>
  )
}
