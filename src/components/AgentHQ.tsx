import React, { useState, useCallback, memo } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Agent roster — the expert team powering Twisted's Command Center
// ─────────────────────────────────────────────────────────────────────────────

export type AgentStatus = 'idle' | 'active' | 'processing' | 'offline';

export interface AgentTool {
  id: string;
  name: string;
  description: string;
}

export interface Agent {
  id: string;
  codename: string;
  emoji: string;
  role: string;
  specialty: string;
  status: AgentStatus;
  tools: AgentTool[];
  lastAction: string;
}

export const AGENT_ROSTER: Agent[] = [
  {
    id: 'pixel-reaper',
    codename: 'PixelReaper',
    emoji: '🔪',
    role: 'Art Analysis & Description Forge',
    specialty:
      'Dismembers vague descriptions and reassembles them as compelling, SEO-ready copy that collectors actually want to read.',
    status: 'active',
    tools: [
      { id: 'vision-ai', name: 'Vision AI', description: 'Visual pattern recognition for art classification' },
      { id: 'seo-opt', name: 'SEO Optimizer', description: 'Keyword analysis for marketplace discovery' },
      { id: 'copy-gen', name: 'Copy Forge', description: 'Tone-aware description generator' },
    ],
    lastAction: 'Generated 3 Squarespace listings',
  },
  {
    id: 'price-oracle',
    codename: 'PriceOracle',
    emoji: '🔮',
    role: 'Market Intelligence & Valuation',
    specialty:
      'Gazes into the dark corners of the art market and surfaces comparable sales, pricing trends, and optimal price points.',
    status: 'idle',
    tools: [
      { id: 'market-scan', name: 'Market Scanner', description: 'Real-time comparable artwork pricing' },
      { id: 'price-history', name: 'Price History', description: 'Historical valuation trends' },
      { id: 'demand-index', name: 'Demand Index', description: 'Category demand heatmap' },
    ],
    lastAction: 'Indexed sculpture market trends',
  },
  {
    id: 'gallery-ghost',
    codename: 'GalleryGhost',
    emoji: '👻',
    role: 'Exhibition Planning & Placement',
    specialty:
      'Haunts your inventory looking for pieces that deserve better placement — then matches them to venues, collectors, and moments.',
    status: 'idle',
    tools: [
      { id: 'venue-match', name: 'Venue Matcher', description: 'Gallery and exhibition space finder' },
      { id: 'exhibit-cal', name: 'Exhibition Calendar', description: 'Show scheduling and deadline tracker' },
      { id: 'loc-analyzer', name: 'Location Analyzer', description: 'Storage and display optimization' },
    ],
    lastAction: 'Analyzed 2 available venues',
  },
  {
    id: 'sales-banshee',
    codename: 'SalesBanshee',
    emoji: '💀',
    role: 'Listing Optimization & Conversion',
    specialty:
      'Screams until your listings convert. Optimizes copy, platform strategy, and call-to-action for maximum gallery-to-collector throughput.',
    status: 'processing',
    tools: [
      { id: 'copy-opt', name: 'Copy Optimizer', description: 'A/B tested listing language' },
      { id: 'platform-conn', name: 'Platform Connector', description: 'Squarespace / Etsy / IG sync' },
      { id: 'funnel-map', name: 'Funnel Mapper', description: 'Buyer journey visualization' },
    ],
    lastAction: 'Running conversion A/B test',
  },
  {
    id: 'data-voodoo',
    codename: 'DataVoodoo',
    emoji: '🎴',
    role: 'Analytics & Intelligence',
    specialty:
      'Sticks pins in your data until patterns scream back. Surfaces inventory gaps, velocity metrics, and category performance.',
    status: 'active',
    tools: [
      { id: 'stats-engine', name: 'Stats Engine', description: 'Inventory KPI computation' },
      { id: 'trend-det', name: 'Trend Detector', description: 'Sales velocity and pattern analysis' },
      { id: 'dash-builder', name: 'Dashboard Builder', description: 'Custom metric dashboard generation' },
    ],
    lastAction: 'Generated weekly inventory report',
  },
  {
    id: 'crypto-muse',
    codename: 'CryptoMuse',
    emoji: '⚡',
    role: 'Digital & NFT Art Tracking',
    specialty:
      'Bridges physical craft to digital scarcity. Tracks tokenized art, digital drops, and blockchain provenance for the collection.',
    status: 'offline',
    tools: [
      { id: 'chain-scan', name: 'Blockchain Scanner', description: 'NFT mint and ownership tracking' },
      { id: 'token-track', name: 'Token Tracker', description: 'Digital edition inventory management' },
      { id: 'mint-assist', name: 'Mint Assistant', description: 'Digital art publishing workflow' },
    ],
    lastAction: 'Awaiting digital art pipeline',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Status helpers
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<AgentStatus, string> = {
  active: '#00ff87',
  processing: '#ffcc00',
  idle: '#60efff',
  offline: '#555e70',
};

const STATUS_LABELS: Record<AgentStatus, string> = {
  active: '● ACTIVE',
  processing: '◌ PROCESSING',
  idle: '○ IDLE',
  offline: '✕ OFFLINE',
};

/** Plain text without the leading status symbol — used in the summary bar. */
const STATUS_TEXT: Record<AgentStatus, string> = {
  active: 'ACTIVE',
  processing: 'PROCESSING',
  idle: 'IDLE',
  offline: 'OFFLINE',
};

function StatusPip({ status }: { status: AgentStatus }) {
  const color = STATUS_COLORS[status];
  return (
    <span
      style={{
        color,
        fontSize: '0.72rem',
        fontWeight: 600,
        letterSpacing: '0.08em',
        textShadow: status !== 'offline' ? `0 0 8px ${color}` : 'none',
      }}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Agent Card
// ─────────────────────────────────────────────────────────────────────────────

interface AgentCardProps {
  agent: Agent;
  selected: boolean;
  onSelect: (id: string) => void;
}

const AgentCard = memo(function AgentCard({ agent, selected, onSelect }: AgentCardProps) {
  const borderColor = selected ? STATUS_COLORS[agent.status] : 'rgba(96,239,255,0.18)';
  const bgColor = selected ? 'rgba(0,255,135,0.07)' : 'rgba(10,16,28,0.72)';

  return (
    <button
      data-testid={`agent-card-${agent.id}`}
      onClick={() => onSelect(agent.id)}
      style={{
        border: `1px solid ${borderColor}`,
        background: bgColor,
        borderRadius: '0.75rem',
        padding: '1rem',
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
        color: '#dffcff',
        transition: 'border-color 0.2s, background 0.2s',
        boxShadow: selected ? `0 0 24px ${STATUS_COLORS[agent.status]}33` : 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
        <span style={{ fontSize: '1.4rem' }}>{agent.emoji}</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: STATUS_COLORS[agent.status] }}>
            {agent.codename}
          </div>
          <StatusPip status={agent.status} />
        </div>
      </div>
      <div style={{ fontSize: '0.78rem', color: '#89b9c0', lineHeight: 1.4 }}>{agent.role}</div>
    </button>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// Agent Detail Panel
// ─────────────────────────────────────────────────────────────────────────────

interface AgentDetailProps {
  agent: Agent;
}

function AgentDetail({ agent }: AgentDetailProps) {
  const accentColor = STATUS_COLORS[agent.status];
  return (
    <div
      data-testid="agent-detail"
      style={{
        border: `1px solid ${accentColor}44`,
        borderRadius: '0.75rem',
        padding: '1.4rem',
        background: 'rgba(10,16,28,0.82)',
        height: '100%',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
        <span style={{ fontSize: '2.2rem' }}>{agent.emoji}</span>
        <div>
          <h2 style={{ margin: 0, color: accentColor, fontSize: '1.3rem', letterSpacing: '0.06em' }}>
            {agent.codename}
          </h2>
          <StatusPip status={agent.status} />
        </div>
      </div>

      {/* Role */}
      <div style={{ marginBottom: '0.8rem' }}>
        <div style={{ color: '#60efff', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.2rem' }}>
          ROLE
        </div>
        <div style={{ color: '#c2f9ff', fontSize: '0.9rem' }}>{agent.role}</div>
      </div>

      {/* Specialty */}
      <div style={{ marginBottom: '1.1rem' }}>
        <div style={{ color: '#60efff', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.2rem' }}>
          SPECIALTY
        </div>
        <div style={{ color: '#a8d8e0', fontSize: '0.88rem', lineHeight: 1.55 }}>{agent.specialty}</div>
      </div>

      {/* Tools */}
      <div style={{ marginBottom: '1rem' }}>
        <div
          style={{
            color: '#60efff',
            fontSize: '0.78rem',
            fontWeight: 600,
            marginBottom: '0.5rem',
            letterSpacing: '0.06em',
          }}
        >
          TOOLS LOADOUT
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {agent.tools.map((tool) => (
            <div
              key={tool.id}
              data-testid={`tool-${tool.id}`}
              style={{
                border: '1px solid rgba(96,239,255,0.2)',
                borderRadius: '0.4rem',
                padding: '0.4rem 0.7rem',
                background: 'rgba(96,239,255,0.04)',
              }}
            >
              <span style={{ color: accentColor, fontWeight: 600, fontSize: '0.82rem' }}>{tool.name}</span>
              <span style={{ color: '#7ab8c0', fontSize: '0.78rem', marginLeft: '0.5rem' }}>
                — {tool.description}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Last action */}
      <div
        style={{
          borderTop: '1px solid rgba(96,239,255,0.12)',
          paddingTop: '0.7rem',
          color: '#607880',
          fontSize: '0.78rem',
        }}
      >
        <span style={{ color: '#60efff', fontWeight: 600 }}>LAST ACTION: </span>
        {agent.lastAction}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main AgentHQ component
// ─────────────────────────────────────────────────────────────────────────────

const AgentHQ = memo(function AgentHQ() {
  const [selectedId, setSelectedId] = useState<string>(AGENT_ROSTER[0].id);

  const selectedAgent = AGENT_ROSTER.find((a) => a.id === selectedId) ?? AGENT_ROSTER[0];

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  const statusCounts = AGENT_ROSTER.reduce<Record<AgentStatus, number>>(
    (acc, agent) => {
      acc[agent.status] = (acc[agent.status] ?? 0) + 1;
      return acc;
    },
    { active: 0, processing: 0, idle: 0, offline: 0 }
  );

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* HQ Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1
          style={{
            margin: '0 0 0.3rem',
            fontSize: 'clamp(1rem, 3vw, 1.4rem)',
            color: 'var(--green)',
            letterSpacing: '0.1em',
          }}
        >
          ⚡ AGENT HQ // DELEGATION MATRIX
        </h1>
        <p style={{ margin: 0, color: '#89b9c0', fontSize: '0.85rem' }}>
          The expert crew running Twisted&#39;s Command Center. Click an agent to inspect their loadout.
        </p>

        {/* Status bar */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
          {(Object.entries(statusCounts) as [AgentStatus, number][]).map(([status, count]) => (
            <span key={status} style={{ fontSize: '0.78rem', color: STATUS_COLORS[status] }}>
              {STATUS_TEXT[status]} ×{count}
            </span>
          ))}
        </div>
      </div>

      {/* Grid: roster left, detail right */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(200px, 340px) 1fr',
          gap: '1rem',
          alignItems: 'start',
        }}
      >
        {/* Roster */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {AGENT_ROSTER.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              selected={agent.id === selectedId}
              onSelect={handleSelect}
            />
          ))}
        </div>

        {/* Detail */}
        <AgentDetail agent={selectedAgent} />
      </div>
    </div>
  );
});

export default AgentHQ;
