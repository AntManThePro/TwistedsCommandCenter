import { useState } from 'react'

/* ══════════════════════════════════════════════════════
   NEXUS Portfolio — Twisted's Command Center
   Interactive showcase of projects, skills, and about
   ══════════════════════════════════════════════════════ */

type TabId = 'projects' | 'skills' | 'about'

interface Project {
  id: string
  title: string
  description: string
  detail: string
  tags: string[]
  accent: string
  status: 'live' | 'wip' | 'archived'
  link?: string
}

interface Skill {
  name: string
  level: number
  color: string
  category: string
}

const PROJECTS: Project[] = [
  {
    id: 'tcc',
    title: "Twisted's Command Center",
    description: 'Production-ready inventory dashboard with NEXUS dark aesthetic.',
    detail:
      'Built with React 19, TypeScript, Vite 8, and Tailwind CSS 4. Features real-time stats, CRUD inventory management, an algorithm sorting visualizer, and a fully responsive NEXUS dark theme.',
    tags: ['React', 'TypeScript', 'Vite', 'Tailwind CSS'],
    accent: '#60efff',
    status: 'live',
  },
  {
    id: 'algo',
    title: 'Algorithm Race Visualizer',
    description: 'Side-by-side sorting algorithm comparison with canvas animations.',
    detail:
      'An interactive racing visualizer built into the Command Center. Five sorting algorithms (Bubble, Selection, Insertion, Quick, Merge) compete simultaneously on an HTML5 canvas, with step-by-step swap and comparison highlights.',
    tags: ['Canvas API', 'React Hooks', 'Animations'],
    accent: '#ff0080',
    status: 'live',
  },
  {
    id: 'nexus',
    title: 'NEXUS Design System',
    description: 'Custom dark-theme design system powering the Command Center.',
    detail:
      'A bespoke design language featuring a deep-space color palette, neon glow effects, cyber-grid backgrounds, and Tailwind CSS v4 theme tokens. Includes custom CSS animations and utility classes.',
    tags: ['CSS', 'Tailwind CSS', 'Design Tokens'],
    accent: '#8b5cf6',
    status: 'live',
  },
  {
    id: 'hooks',
    title: 'useInventory Hook',
    description: 'Stateful inventory management with stale-closure-safe callbacks.',
    detail:
      'A custom React hook that manages CRUD operations, activity logging, and derived statistics. Uses a ref-based pattern to ensure callbacks always access the latest state, avoiding stale-closure bugs.',
    tags: ['React Hooks', 'TypeScript', 'Testing'],
    accent: '#00ff87',
    status: 'live',
  },
]

const SKILLS: Skill[] = [
  { name: 'React',        level: 92, color: '#60efff', category: 'Frontend'  },
  { name: 'TypeScript',   level: 88, color: '#60efff', category: 'Frontend'  },
  { name: 'Tailwind CSS', level: 90, color: '#60efff', category: 'Frontend'  },
  { name: 'Vite',         level: 82, color: '#60efff', category: 'Frontend'  },
  { name: 'Node.js',      level: 75, color: '#00ff87', category: 'Backend'   },
  { name: 'REST APIs',    level: 80, color: '#00ff87', category: 'Backend'   },
  { name: 'Vitest',       level: 78, color: '#ffcc00', category: 'Testing'   },
  { name: 'Canvas API',   level: 72, color: '#ff0080', category: 'Graphics'  },
  { name: 'Git',          level: 88, color: '#8b5cf6', category: 'Tooling'   },
  { name: 'CSS / SVG',    level: 85, color: '#8b5cf6', category: 'Tooling'   },
]

const SKILL_CATEGORIES = ['Frontend', 'Backend', 'Testing', 'Graphics', 'Tooling']

const STATUS_STYLES: Record<Project['status'], { label: string; color: string; bg: string }> = {
  live:     { label: 'Live',     color: '#00ff87', bg: 'rgba(0,255,135,0.1)'  },
  wip:      { label: 'WIP',      color: '#ffcc00', bg: 'rgba(255,204,0,0.1)' },
  archived: { label: 'Archived', color: '#4a5278', bg: 'rgba(74,82,120,0.1)' },
}

/* ─── Sub-components ─────────────────────────────────── */

function SkillBar({ skill, visible }: { skill: Skill; visible: boolean }) {
  return (
    <div className="group">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#e2e8f0]">
          {skill.name}
        </span>
        <span
          className="text-[10px] font-bold transition-opacity"
          style={{ color: skill.color }}
        >
          {skill.level}%
        </span>
      </div>
      <div
        className="relative h-1.5 w-full overflow-hidden rounded-full"
        style={{ background: '#1a1a3e' }}
      >
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: visible ? `${skill.level}%` : '0%',
            background: skill.color,
            boxShadow: `0 0 8px ${skill.color}88`,
          }}
        />
      </div>
    </div>
  )
}

function ProjectCard({ project }: { project: Project }) {
  const [expanded, setExpanded] = useState(false)
  const status = STATUS_STYLES[project.status]

  return (
    <article
      className="nexus-card rounded-xl p-4 cursor-pointer transition-all duration-300"
      style={{
        borderColor: expanded ? project.accent + '40' : 'rgba(26,26,62,1)',
        boxShadow: expanded ? `0 0 24px ${project.accent}18` : 'none',
      }}
      onClick={() => setExpanded(prev => !prev)}
      role="button"
      aria-expanded={expanded}
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setExpanded(prev => !prev) }}
    >
      {/* Card header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3
              className="text-sm font-black uppercase tracking-wide"
              style={{ color: project.accent }}
            >
              {project.title}
            </h3>
            <span
              className="rounded-sm px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest"
              style={{ color: status.color, background: status.bg }}
            >
              {status.label}
            </span>
          </div>
          <p className="text-xs text-[#4a5278] leading-relaxed">{project.description}</p>
        </div>
        {/* Expand toggle */}
        <svg
          className="h-4 w-4 flex-shrink-0 transition-transform duration-300"
          style={{
            color: project.accent,
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Tags */}
      <div className="mt-2 flex flex-wrap gap-1.5">
        {project.tags.map(tag => (
          <span
            key={tag}
            className="rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider"
            style={{ color: project.accent + 'cc', background: project.accent + '10' }}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div
          className="mt-3 border-t pt-3 text-xs leading-relaxed text-[#e2e8f0]"
          style={{ borderColor: project.accent + '20' }}
        >
          {project.detail}
        </div>
      )}
    </article>
  )
}

/* ─── Main component ─────────────────────────────────── */

export default function PortfolioPage() {
  const [activeTab, setActiveTab] = useState<TabId>('projects')
  const [skillsVisible, setSkillsVisible] = useState(false)

  const TABS: { id: TabId; label: string; accent: string }[] = [
    { id: 'projects', label: 'Projects', accent: '#60efff' },
    { id: 'skills',   label: 'Skills',   accent: '#00ff87' },
    { id: 'about',    label: 'About',    accent: '#8b5cf6' },
  ]

  function handleTabClick(id: TabId) {
    setActiveTab(id)
    if (id === 'skills') setSkillsVisible(true)
  }

  return (
    <div className="animate-fade-in space-y-5">
      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-black tracking-tight">
            <span className="text-glow-cyan text-[#60efff]">PORTFOLIO</span>{' '}
            <span className="text-white">SHOWCASE</span>
          </h2>
          <p className="mt-0.5 text-[10px] uppercase tracking-widest text-[#4a5278]">
            Interactive project &amp; skill showcase
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-[#8b5cf6]/20 bg-[#8b5cf6]/5 px-3 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#8b5cf6] animate-pulse" />
          <span className="text-[9px] uppercase tracking-widest text-[#8b5cf6]">AntManThePro</span>
        </div>
      </div>

      {/* Hero card */}
      <div
        className="nexus-card rounded-xl p-6"
        style={{ borderColor: 'rgba(96,239,255,0.15)', background: 'linear-gradient(135deg, rgba(96,239,255,0.05) 0%, rgba(139,92,246,0.05) 100%)' }}
      >
        <div className="flex flex-wrap items-center gap-5">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-[#ff0080] to-[#8b5cf6] flex items-center justify-center text-2xl font-black text-white shadow-lg">
              A
            </div>
            <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-[#050510] bg-[#00ff87]" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-baseline gap-3">
              <h3 className="text-lg font-black text-white">AntManThePro</h3>
              <span
                className="text-[10px] font-bold uppercase tracking-widest"
                style={{ color: '#60efff' }}
              >
                DoubleA
              </span>
            </div>
            <p className="mt-0.5 text-xs text-[#4a5278]">Full-Stack Developer · React &amp; TypeScript Specialist</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {['React', 'TypeScript', 'Node.js', 'Open Source'].map(tag => (
                <span
                  key={tag}
                  className="rounded px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[#60efff]"
                  style={{ background: 'rgba(96,239,255,0.08)', border: '1px solid rgba(96,239,255,0.15)' }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="hidden sm:grid grid-cols-3 gap-4 text-center">
            {[
              { label: 'Projects', value: PROJECTS.length, color: '#60efff' },
              { label: 'Skills',   value: SKILLS.length,   color: '#00ff87' },
              { label: 'Years',    value: '3+',            color: '#8b5cf6' },
            ].map(s => (
              <div key={s.label}>
                <div className="text-xl font-black" style={{ color: s.color }}>{s.value}</div>
                <div className="text-[9px] uppercase tracking-wider text-[#4a5278]">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-[#1a1a3e] bg-[#0a0a1f] p-1">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className="flex-1 rounded-lg py-2 text-[11px] font-bold uppercase tracking-widest transition-all duration-200"
            style={
              activeTab === tab.id
                ? {
                    background: tab.accent + '15',
                    color: tab.accent,
                    borderBottom: `2px solid ${tab.accent}`,
                    boxShadow: `0 0 12px ${tab.accent}20`,
                  }
                : { color: '#4a5278', borderBottom: '2px solid transparent' }
            }
            aria-selected={activeTab === tab.id}
            role="tab"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      <div role="tabpanel">
        {/* Projects tab */}
        {activeTab === 'projects' && (
          <div className="animate-fade-in grid grid-cols-1 gap-3 lg:grid-cols-2">
            {PROJECTS.map(p => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        )}

        {/* Skills tab */}
        {activeTab === 'skills' && (
          <div className="animate-fade-in space-y-5">
            {SKILL_CATEGORIES.map(category => {
              const catSkills = SKILLS.filter(s => s.category === category)
              if (catSkills.length === 0) return null
              const accent = catSkills[0].color
              return (
                <div key={category} className="nexus-card rounded-xl p-4">
                  <h3
                    className="mb-3 text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: accent + 'aa' }}
                  >
                    {category}
                  </h3>
                  <div className="space-y-3">
                    {catSkills.map(skill => (
                      <SkillBar key={skill.name} skill={skill} visible={skillsVisible} />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* About tab */}
        {activeTab === 'about' && (
          <div className="animate-fade-in space-y-4">
            <div className="nexus-card rounded-xl p-5">
              <h3 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-[#4a5278]">Bio</h3>
              <p className="text-xs leading-relaxed text-[#e2e8f0]">
                I'm <span className="font-bold text-white">AntManThePro</span> — a full-stack developer
                with a passion for building polished, interactive web experiences. I specialize in React
                and TypeScript, crafting components that are both visually striking and production-ready.
              </p>
              <p className="mt-2 text-xs leading-relaxed text-[#e2e8f0]">
                My work focuses on clean architecture, strong test coverage, and immersive UI design.
                The NEXUS aesthetic in this Command Center is my own design language — built to feel
                alive and reactive.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="nexus-card rounded-xl p-4">
                <h3 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-[#4a5278]">
                  Focus Areas
                </h3>
                <ul className="space-y-2">
                  {[
                    { label: 'React & TypeScript',    color: '#60efff' },
                    { label: 'UI Design Systems',     color: '#8b5cf6' },
                    { label: 'Performance & Testing', color: '#00ff87' },
                    { label: 'Data Visualization',    color: '#ff0080' },
                  ].map(item => (
                    <li key={item.label} className="flex items-center gap-2 text-xs text-[#e2e8f0]">
                      <span
                        className="h-1.5 w-1.5 flex-shrink-0 rounded-full"
                        style={{ background: item.color, boxShadow: `0 0 6px ${item.color}` }}
                      />
                      {item.label}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="nexus-card rounded-xl p-4">
                <h3 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-[#4a5278]">
                  Highlights
                </h3>
                <ul className="space-y-2">
                  {[
                    { value: `${PROJECTS.length} Projects`,         color: '#60efff' },
                    { value: `${SKILLS.length} Technical Skills`,   color: '#00ff87' },
                    { value: 'Full NEXUS Design System',            color: '#8b5cf6' },
                    { value: '100% TypeScript Codebase',            color: '#ffcc00' },
                  ].map(item => (
                    <li key={item.value} className="flex items-center gap-2 text-xs text-[#e2e8f0]">
                      <span
                        className="h-1.5 w-1.5 flex-shrink-0 rounded-full"
                        style={{ background: item.color, boxShadow: `0 0 6px ${item.color}` }}
                      />
                      {item.value}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div
              className="nexus-card rounded-xl p-4"
              style={{ borderColor: 'rgba(96,239,255,0.15)' }}
            >
              <h3 className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[#4a5278]">
                GitHub
              </h3>
              <a
                href="https://github.com/AntManThePro"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-semibold text-[#60efff] transition-opacity hover:opacity-80"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                github.com/AntManThePro
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
