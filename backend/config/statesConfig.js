// ─────────────────────────────────────────────────────────────
// STATES CONFIG — Backend copy
// Keep in sync with frontend/src/config/statesConfig.js
//
// To add a new state: add an entry here AND in the frontend copy
// ─────────────────────────────────────────────────────────────

export const STATES = [
  { slug: 'rajasthan',      name: 'Rajasthan',       nodeId: 'AX-001' },
  { slug: 'uttar-pradesh',  name: 'Uttar Pradesh',   nodeId: 'AX-002' },
  { slug: 'maharashtra',    name: 'Maharashtra',     nodeId: 'AX-003' },
  { slug: 'gujarat',        name: 'Gujarat',         nodeId: 'AX-004' },
  { slug: 'madhya-pradesh', name: 'Madhya Pradesh',  nodeId: 'AX-005' },
];

// Just the display names — used by StateAgent cron
export const STATE_NAMES = STATES.map(s => s.name);
