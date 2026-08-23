// ─────────────────────────────────────────────────────────────
// STATES CONFIG — Single source of truth for all State Agents
//
// To add a new state:
//   1. Add an entry to the STATES array below
//   2. That's it — routing, hub page, and backend cron all
//      pick it up automatically
// ─────────────────────────────────────────────────────────────

export const STATES = [
  {
    slug: 'rajasthan',           // URL: /agent/rajasthan
    name: 'Rajasthan',           // Display name & DB query value
    capital: 'Jaipur',
    region: 'North India',
    nodeId: 'AX-001',
    color: 'indigo',             // Accent color for this agent's UI
  },
  {
    slug: 'uttar-pradesh',
    name: 'Uttar Pradesh',
    capital: 'Lucknow',
    region: 'North India',
    nodeId: 'AX-002',
    color: 'cyan',
  },
  {
    slug: 'maharashtra',
    name: 'Maharashtra',
    capital: 'Mumbai',
    region: 'West India',
    nodeId: 'AX-003',
    color: 'purple',
  },
  {
    slug: 'gujarat',
    name: 'Gujarat',
    capital: 'Gandhinagar',
    region: 'West India',
    nodeId: 'AX-004',
    color: 'amber',
  },
  {
    slug: 'madhya-pradesh',
    name: 'Madhya Pradesh',
    capital: 'Bhopal',
    region: 'Central India',
    nodeId: 'AX-005',
    color: 'emerald',
  },
];

// Lookup by slug — used in StateAgentLayout via useParams
export function getStateBySlug(slug) {
  return STATES.find(s => s.slug === slug) || null;
}

// Just the names array — used by backend cron
export const STATE_NAMES = STATES.map(s => s.name);

// Tailwind color map — used for dynamic accent styling
export const COLOR_MAP = {
  indigo:  { bg: 'bg-indigo-600',     soft: 'bg-indigo-500/10',  border: 'border-indigo-500/30',  text: 'text-indigo-400'  },
  cyan:    { bg: 'bg-cyan-600',       soft: 'bg-cyan-500/10',    border: 'border-cyan-500/30',    text: 'text-cyan-400'    },
  purple:  { bg: 'bg-purple-600',     soft: 'bg-purple-500/10',  border: 'border-purple-500/30',  text: 'text-purple-400'  },
  amber:   { bg: 'bg-amber-500',      soft: 'bg-amber-500/10',   border: 'border-amber-500/30',   text: 'text-amber-400'   },
  emerald: { bg: 'bg-emerald-600',    soft: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400' },
};
