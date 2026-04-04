import type { ReactNode } from 'react'
import type { PageId } from '../../types/inventory'

interface SidebarProps {
  currentPage: PageId
  onNavigate: (page: PageId) => void
  isOpen: boolean
  onClose: () => void
}

const navItems: { id: PageId; label: string; accent: string; icon: ReactNode }[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    accent: '#60efff',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
  },
  {
    id: 'inventory',
    label: 'Inventory',
    accent: '#00ff87',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    id: 'algorithm',
    label: 'Algorithm Lab',
    accent: '#ff0080',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0l-3.75-3.75M17.25 21L21 17.25" />
      </svg>
    ),
  },
  {
    id: 'categories',
    label: 'Categories',
    accent: '#ffcc00',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
  },
  {
    id: 'settings',
    label: 'Settings',
    accent: '#8b5cf6',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
]

export default function Sidebar({ currentPage, onNavigate, isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-[#1a1a3e] bg-[#050510]/95 backdrop-blur-xl transition-transform duration-300 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-[#1a1a3e] px-4">
          <div className="relative flex h-8 w-8 items-center justify-center">
            <div className="absolute inset-0 rounded-lg bg-[#60efff]/20 blur-sm" />
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-[#60efff]/40 bg-[#0d0d1e]">
              <svg className="h-4 w-4 text-[#60efff]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-white text-glitch">NEXUS</p>
            <p className="text-[9px] uppercase tracking-[0.15em] text-[#4a5278]">Command Center</p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto rounded-lg p-1 text-[#4a5278] hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* System status */}
        <div className="mx-3 mt-3 rounded-lg border border-[#00ff87]/20 bg-[#00ff87]/5 px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#00ff87] status-dot-live" />
            <span className="text-[9px] uppercase tracking-widest text-[#00ff87]">Systems Online</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-0.5 px-2 py-3">
          {navItems.map(item => {
            const active = currentPage === item.id
            return (
              <button
                key={item.id}
                onClick={() => { onNavigate(item.id); onClose() }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-200"
                style={{
                  color: active ? item.accent : '#4a5278',
                  background: active ? item.accent + '12' : 'transparent',
                  borderLeft: active ? `2px solid ${item.accent}` : '2px solid transparent',
                  boxShadow: active ? `inset 0 0 20px ${item.accent}08` : 'none',
                }}
              >
                <span style={{ color: active ? item.accent : '#4a5278' }}>{item.icon}</span>
                {item.label}
                {item.id === 'algorithm' && (
                  <span className="ml-auto rounded-sm bg-[#ff0080]/20 px-1 py-0.5 text-[8px] font-bold text-[#ff0080]">
                    NEW
                  </span>
                )}
                {active && (
                  <div
                    className="ml-auto h-1 w-1 rounded-full"
                    style={{ background: item.accent, boxShadow: `0 0 6px ${item.accent}` }}
                  />
                )}
              </button>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-[#1a1a3e] px-3 py-3">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div
                className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black"
                style={{ background: 'linear-gradient(135deg, #ff0080, #8b5cf6)', color: '#fff' }}
              >
                A
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-[#050510] bg-[#00ff87]" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-white">DoubleA</p>
              <p className="text-[9px] text-[#4a5278]">AntManThePro · Admin</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
