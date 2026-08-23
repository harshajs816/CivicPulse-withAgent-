import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ShieldAlert, Bot, MapPin, Zap, ChevronRight,
  Users, AlertTriangle, CheckCircle, Clock, BarChart3
} from 'lucide-react';
import { STATES, COLOR_MAP } from '../../config/statesConfig';

const API = 'http://localhost:5000/api/agent';

// Per-state quick stats fetched from dept-stats endpoint
function useStateSummaries() {
  const [summaries, setSummaries] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      const results = {};
      await Promise.all(
        STATES.map(async (s) => {
          try {
            const res = await axios.get(`${API}/dept-stats?state=${s.name}`);
            if (res.data.success) results[s.slug] = res.data.summary;
          } catch {
            results[s.slug] = null;
          }
        })
      );
      setSummaries(results);
      setLoading(false);
    };
    fetchAll();
  }, []);

  return { summaries, loading };
}

// ── State Card ──────────────────────────────────────────────
function StateCard({ state, summary, loading }) {
  const navigate = useNavigate();
  const c = COLOR_MAP[state.color] || COLOR_MAP.indigo;

  const unassigned = summary?.unassigned ?? '—';
  const total      = summary?.total      ?? '—';
  const resolved   = summary?.resolved   ?? '—';
  const escalated  = summary?.escalated  ?? '—';

  // Resolution rate
  const rate = summary?.total > 0
    ? Math.round((summary.resolved / summary.total) * 100)
    : null;

  return (
    <div
      onClick={() => navigate(`/agent/${state.slug}`)}
      className="group relative bg-[#0f1623] border border-slate-800 rounded-2xl p-5 cursor-pointer hover:border-slate-600 transition-all duration-200 hover:shadow-[0_0_30px_rgba(0,0,0,0.4)] overflow-hidden"
    >
      {/* Glow accent top-left */}
      <div className={`absolute top-0 left-0 w-1 h-full rounded-l-2xl ${c.bg}`} />

      {/* Header */}
      <div className="flex items-start justify-between mb-4 pl-2">
        <div>
          <div className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest mb-1.5 ${c.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${c.bg} animate-pulse`} />
            {state.region}
          </div>
          <h3 className="text-lg font-black text-white leading-tight">{state.name}</h3>
          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
            <MapPin size={10} /> {state.capital}
            <span className="mx-1 text-slate-700">·</span>
            Node {state.nodeId}
          </p>
        </div>

        <div className={`p-2.5 rounded-xl ${c.soft} border ${c.border}`}>
          <Bot size={20} className={c.text} />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-2 pl-2 mb-4">
        {[
          { label: 'Total',      value: total,      icon: BarChart3,    cls: 'text-slate-300'  },
          { label: 'Pending',    value: unassigned, icon: Clock,        cls: 'text-amber-400'  },
          { label: 'Resolved',   value: resolved,   icon: CheckCircle,  cls: 'text-emerald-400'},
          { label: 'Escalated',  value: escalated,  icon: AlertTriangle,cls: 'text-rose-400'   },
        ].map(stat => (
          <div key={stat.label} className="bg-slate-800/40 rounded-lg p-2 text-center border border-slate-800">
            <stat.icon size={12} className={`${stat.cls} mx-auto mb-1`} />
            <div className={`text-base font-black ${stat.cls}`}>
              {loading ? <span className="text-slate-600">—</span> : stat.value}
            </div>
            <div className="text-[9px] text-slate-600 font-medium uppercase tracking-wide">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Resolution bar */}
      <div className="pl-2 mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[10px] text-slate-500 font-medium">Resolution Rate</span>
          <span className={`text-[10px] font-bold ${
            rate === null ? 'text-slate-600' :
            rate >= 70 ? 'text-emerald-400' :
            rate >= 40 ? 'text-amber-400' : 'text-rose-400'
          }`}>
            {rate === null ? '—' : `${rate}%`}
          </span>
        </div>
        <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              rate === null ? '' :
              rate >= 70 ? 'bg-emerald-500' :
              rate >= 40 ? 'bg-amber-500' : 'bg-rose-500'
            }`}
            style={{ width: rate !== null ? `${rate}%` : '0%' }}
          />
        </div>
      </div>

      {/* CTA */}
      <div className={`flex items-center justify-between pl-2 pt-3 border-t border-slate-800`}>
        <span className="text-xs text-slate-500 flex items-center gap-1.5">
          <Zap size={11} className={c.text} /> AI Triage Active
        </span>
        <span className={`flex items-center gap-1 text-xs font-bold ${c.text} group-hover:gap-2 transition-all`}>
          Open Dashboard <ChevronRight size={14} />
        </span>
      </div>
    </div>
  );
}

// ── Main Hub ────────────────────────────────────────────────
const StateAgentHub = () => {
  const { summaries, loading } = useStateSummaries();

  // Aggregate totals across all states
  const globalTotal     = Object.values(summaries).reduce((a, s) => a + (s?.total     || 0), 0);
  const globalResolved  = Object.values(summaries).reduce((a, s) => a + (s?.resolved  || 0), 0);
  const globalPending   = Object.values(summaries).reduce((a, s) => a + (s?.unassigned|| 0), 0);
  const globalEscalated = Object.values(summaries).reduce((a, s) => a + (s?.escalated || 0), 0);

  return (
    <div className="min-h-screen bg-[#0d1219] text-slate-200 font-sans">

      {/* ── Top Bar ── */}
      <header className="border-b border-slate-800/80 bg-[#0a0f17]/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600/20 p-1.5 rounded-lg border border-indigo-500/30">
              <ShieldAlert className="text-indigo-400" size={18} />
            </div>
            <div>
              <span className="font-black text-white text-sm tracking-tight block">CivicPulse</span>
              <span className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">State Agent Network</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-full font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            {STATES.length} Agents Online
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* ── Hero ── */}
        <div className="mb-10">
          <h1 className="text-3xl font-black text-white mb-2">State Agent Command Center</h1>
          <p className="text-slate-400 text-sm max-w-xl">
            Each state has a dedicated AI agent that automatically triages, routes, and manages
            civic complaints — reducing SuperAdmin workload.
          </p>
        </div>

        {/* ── Global Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
          {[
            { label: 'Total Across All States', value: globalTotal,     icon: BarChart3,    cls: 'text-white'         },
            { label: 'Unassigned Queue',         value: globalPending,   icon: Clock,        cls: 'text-amber-400'     },
            { label: 'Resolved',                 value: globalResolved,  icon: CheckCircle,  cls: 'text-emerald-400'   },
            { label: 'Escalated to Admin',       value: globalEscalated, icon: AlertTriangle,cls: 'text-rose-400'      },
          ].map(card => (
            <div key={card.label} className="bg-[#0f1623] border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">{card.label}</span>
                <card.icon size={13} className={card.cls} />
              </div>
              <span className={`text-3xl font-black ${card.cls}`}>
                {loading ? <span className="text-slate-700 text-lg">Loading...</span> : card.value}
              </span>
            </div>
          ))}
        </div>

        {/* ── State Cards Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {STATES.map(state => (
            <StateCard
              key={state.slug}
              state={state}
              summary={summaries[state.slug]}
              loading={loading}
            />
          ))}
        </div>

        {/* ── Add state hint ── */}
        <div className="mt-8 p-4 rounded-xl border border-dashed border-slate-700 text-center text-slate-600 text-sm">
          To add a new state — edit{' '}
          <code className="text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded text-xs">
            src/config/statesConfig.js
          </code>
          {' '}and{' '}
          <code className="text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded text-xs">
            backend/config/statesConfig.js
          </code>
        </div>
      </div>
    </div>
  );
};

export default StateAgentHub;
