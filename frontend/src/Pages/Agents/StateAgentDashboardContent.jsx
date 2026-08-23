import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  MapPin, AlertTriangle, CheckCircle, Clock, Loader2,
  Bot, Zap, RefreshCw, ChevronRight, ShieldAlert,
  Droplets, Trash2, Lightbulb, Car, Waves, BadgeAlert,
  TrendingUp, BarChart3, ListChecks, ArrowUpRight
} from 'lucide-react';

const API = 'http://localhost:5000/api/agent';

// ── Helpers ────────────────────────────────────────────────────────────────

const DEPT_META = {
  Road:        { icon: Car,       color: 'text-orange-400',  bg: 'bg-orange-500/10',  border: 'border-orange-500/20' },
  Water:       { icon: Droplets,  color: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20'   },
  Sanitation:  { icon: Trash2,    color: 'text-yellow-400',  bg: 'bg-yellow-500/10',  border: 'border-yellow-500/20' },
  Electricity: { icon: Lightbulb, color: 'text-purple-400',  bg: 'bg-purple-500/10',  border: 'border-purple-500/20' },
  Drainage:    { icon: Waves,     color: 'text-cyan-400',    bg: 'bg-cyan-500/10',    border: 'border-cyan-500/20'   },
  Police:      { icon: BadgeAlert, color: 'text-rose-400',   bg: 'bg-rose-500/10',    border: 'border-rose-500/20'   },
  Unassigned:  { icon: Bot,       color: 'text-slate-400',   bg: 'bg-slate-500/10',   border: 'border-slate-500/20'  },
};

const STATUS_META = {
  Pending:     { color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   icon: Clock        },
  Assigned:    { color: 'text-cyan-400',    bg: 'bg-cyan-500/10',    border: 'border-cyan-500/20',    icon: Bot          },
  'In Progress':{ color: 'text-indigo-400', bg: 'bg-indigo-500/10',  border: 'border-indigo-500/20',  icon: RefreshCw    },
  Resolved:    { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: CheckCircle  },
  Escalated:   { color: 'text-rose-400',    bg: 'bg-rose-500/10',    border: 'border-rose-500/20',    icon: ShieldAlert  },
};

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META['Pending'];
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border ${meta.bg} ${meta.color} ${meta.border}`}>
      <Icon size={11} />
      {status}
    </span>
  );
}

function DeptBadge({ dept }) {
  const meta = DEPT_META[dept] || DEPT_META['Unassigned'];
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider border ${meta.bg} ${meta.color} ${meta.border}`}>
      <Icon size={10} />
      {dept}
    </span>
  );
}

// ── Sub-panels ─────────────────────────────────────────────────────────────

// Panel 1: AI Triage Queue
function TriageQueuePanel({ currentState }) {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [triaging, setTriaging] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/triage-queue?state=${currentState}`);
      if (res.data.success) setQueue(res.data.queue);
    } catch (err) {
      console.error('Triage queue fetch failed:', err);
    } finally {
      setLoading(false);
    }
  }, [currentState]);

  useEffect(() => { fetchQueue(); }, [fetchQueue]);

  const handleRunTriage = async () => {
    setTriaging(true);
    setLastResult(null);
    try {
      const res = await axios.post(`${API}/trigger-triage`, { state: currentState });
      setLastResult(res.data.message);
      await fetchQueue(); // refresh queue after triage
    } catch (err) {
      setLastResult('Triage failed. Check backend logs.');
    } finally {
      setTriaging(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Bot className="text-cyan-400" size={22} /> AI Triage Queue
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Unassigned complaints waiting for AI department routing
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchQueue}
            disabled={loading}
            className="p-2 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>

          <button
            onClick={handleRunTriage}
            disabled={triaging || queue.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-700 disabled:text-slate-500 text-black font-bold text-sm transition-colors shadow-[0_0_20px_rgba(34,211,238,0.3)]"
          >
            {triaging ? (
              <><Loader2 size={15} className="animate-spin" /> Running AI Triage...</>
            ) : (
              <><Zap size={15} /> Run AI Triage ({queue.length})</>
            )}
          </button>
        </div>
      </div>

      {/* Result banner */}
      {lastResult && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium flex items-center gap-2">
          <CheckCircle size={16} /> {lastResult}
        </div>
      )}

      {/* Queue list */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <Loader2 size={28} className="animate-spin text-cyan-400 mb-3" />
          <p>Loading triage queue...</p>
        </div>
      ) : queue.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border border-dashed border-slate-700 rounded-xl text-slate-500">
          <CheckCircle size={36} className="text-emerald-500/50 mb-3" />
          <p className="font-semibold text-slate-400">Triage queue is clear</p>
          <p className="text-sm mt-1">All complaints have been assigned to departments</p>
        </div>
      ) : (
        <div className="space-y-3">
          {queue.map((item, i) => (
            <div
              key={item._id}
              className="bg-[#111721] border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start gap-3">
                {/* Queue position indicator */}
                <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-semibold text-white text-sm">{item.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded font-bold uppercase border ${
                      item.priority === 'high'   ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                      item.priority === 'medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                   'bg-slate-700 text-slate-400 border-slate-600'
                    }`}>
                      {item.priority}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs line-clamp-2">{item.description}</p>
                  <p className="text-slate-600 text-xs mt-1.5 flex items-center gap-1">
                    <MapPin size={10} /> {item.locationName}
                    <span className="mx-1">·</span>
                    <Clock size={10} /> {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-10 sm:ml-0">
                <StatusBadge status={item.status} />
                <Bot size={18} className="text-slate-600" title="Waiting for AI routing" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Panel 2: Live Complaints (all, with filter + escalate)
function LiveComplaintsPanel({ currentState }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/state-complaints?state=${currentState}`);
      if (res.data.success) setComplaints(res.data.complaints);
    } catch (err) {
      console.error('Complaints fetch failed:', err);
    } finally {
      setLoading(false);
    }
  }, [currentState]);

  useEffect(() => { fetchComplaints(); }, [fetchComplaints]);

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await axios.patch(`${API}/update-status`, { complaintId: id, status: newStatus });
      setComplaints(prev => prev.map(c => c._id === id ? { ...c, status: newStatus } : c));
    } catch {
      alert('Status update failed.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleEscalate = async (id) => {
    setUpdatingId(id);
    try {
      await axios.post(`${API}/escalate`, { complaintId: id });
      setComplaints(prev => prev.map(c => c._id === id ? { ...c, status: 'Escalated' } : c));
    } catch {
      alert('Escalation failed.');
    } finally {
      setUpdatingId(null);
    }
  };

  const FILTERS = ['ALL', 'Pending', 'Assigned', 'In Progress', 'Resolved', 'Escalated'];
  const filtered = complaints.filter(c =>
    filter === 'ALL' ? true : c.status?.toLowerCase() === filter.toLowerCase()
  );

  // Count badges for tabs
  const counts = FILTERS.reduce((acc, f) => {
    acc[f] = f === 'ALL' ? complaints.length : complaints.filter(c => c.status?.toLowerCase() === f.toLowerCase()).length;
    return acc;
  }, {});

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ListChecks className="text-indigo-400" size={22} /> Live Complaints
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            All {currentState} complaints — review, update status, or escalate
          </p>
        </div>
        <button
          onClick={fetchComplaints}
          disabled={loading}
          className="p-2 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-colors"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-5">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              filter === f
                ? 'bg-[#1e293b] text-cyan-400 border-cyan-500/30 shadow'
                : 'bg-transparent text-slate-400 border-slate-800 hover:border-slate-600 hover:text-slate-200'
            }`}
          >
            {f}
            <span className={`px-1.5 py-0.5 rounded text-[10px] ${filter === f ? 'bg-cyan-500/20' : 'bg-slate-800'}`}>
              {counts[f]}
            </span>
          </button>
        ))}
      </div>

      {/* Complaints list */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <Loader2 size={28} className="animate-spin text-cyan-400 mb-3" />
          <p>Fetching complaints...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border border-dashed border-slate-700 rounded-xl text-slate-500">
          <p className="font-semibold text-slate-400">No complaints in this category</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(c => (
            <div
              key={c._id}
              className={`bg-[#111721] border rounded-xl p-4 transition-colors ${
                updatingId === c._id ? 'border-cyan-500/30 opacity-60' : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                {/* Left: info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="font-bold text-white text-sm">{c.title}</h3>
                    <DeptBadge dept={c.department || 'Unassigned'} />
                    <span className={`text-[11px] px-2 py-0.5 rounded font-bold uppercase border ${
                      c.priority === 'high'   ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                      c.priority === 'medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                               'bg-slate-700/50 text-slate-400 border-slate-700'
                    }`}>
                      {c.priority}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs mb-2 line-clamp-2">{c.description}</p>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1"><MapPin size={10} /> {c.locationName}</span>
                    <span className="flex items-center gap-1"><Clock size={10} /> {new Date(c.createdAt).toLocaleString()}</span>
                    {c.reportedBy?.name && <span>By: {c.reportedBy.name}</span>}
                  </div>
                </div>

                {/* Right: status + actions */}
                <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 shrink-0">
                  <StatusBadge status={c.status} />

                  {/* Status updater */}
                  {c.status !== 'Escalated' && c.status !== 'Resolved' && (
                    <select
                      value={c.status}
                      onChange={e => handleStatusChange(c._id, e.target.value)}
                      disabled={updatingId === c._id}
                      className="text-xs bg-slate-800 border border-slate-700 text-slate-300 rounded-md px-2 py-1 cursor-pointer hover:border-slate-500 transition-colors"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Assigned">Assigned</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  )}

                  {/* Escalate button */}
                  {c.status !== 'Escalated' && c.status !== 'Resolved' && (
                    <button
                      onClick={() => handleEscalate(c._id)}
                      disabled={updatingId === c._id}
                      className="flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 px-2 py-1 rounded border border-transparent hover:border-rose-500/20 transition-colors font-bold"
                    >
                      <ArrowUpRight size={12} /> Escalate to Admin
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Panel 3: Department Stats
function DeptStatsPanel({ currentState }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/dept-stats?state=${currentState}`);
      if (res.data.success) setData(res.data);
    } catch (err) {
      console.error('Stats fetch failed:', err);
    } finally {
      setLoading(false);
    }
  }, [currentState]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
      <Loader2 size={28} className="animate-spin text-cyan-400 mb-3" />
      <p>Loading department analytics...</p>
    </div>
  );

  if (!data) return null;

  const { summary, stats } = data;

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="text-purple-400" size={22} /> Department Analytics
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Resolution performance per department for {currentState}
          </p>
        </div>
        <button onClick={fetchStats} className="p-2 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-colors">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Reports',  value: summary.total,      color: 'text-white',          icon: ListChecks  },
          { label: 'Unassigned',     value: summary.unassigned, color: 'text-amber-400',       icon: Bot         },
          { label: 'Resolved',       value: summary.resolved,   color: 'text-emerald-400',     icon: CheckCircle },
          { label: 'Escalated',      value: summary.escalated,  color: 'text-rose-400',        icon: ShieldAlert },
        ].map(card => (
          <div key={card.label} className="bg-[#111721] border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 font-medium">{card.label}</span>
              <card.icon size={14} className={card.color} />
            </div>
            <span className={`text-2xl font-black ${card.color}`}>{card.value}</span>
          </div>
        ))}
      </div>

      {/* Per-department breakdown */}
      <div className="space-y-3">
        {stats.map(dept => {
          const meta = DEPT_META[dept.dept] || DEPT_META['Unassigned'];
          const Icon = meta.icon;
          return (
            <div key={dept.dept} className="bg-[#111721] border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${meta.bg} border ${meta.border}`}>
                    <Icon size={16} className={meta.color} />
                  </div>
                  <span className="font-bold text-white">{dept.dept}</span>
                  <span className="text-slate-500 text-xs">{dept.total} total</span>
                </div>
                <div className="flex items-center gap-1 text-sm font-black">
                  <TrendingUp size={14} className="text-emerald-400" />
                  <span className={dept.resolutionRate >= 70 ? 'text-emerald-400' : dept.resolutionRate >= 40 ? 'text-amber-400' : 'text-rose-400'}>
                    {dept.resolutionRate}%
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden mb-3">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    dept.resolutionRate >= 70 ? 'bg-emerald-500' :
                    dept.resolutionRate >= 40 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${dept.resolutionRate}%` }}
                />
              </div>

              {/* Breakdown pills */}
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Pending',     val: dept.pending,    cls: 'text-amber-400 bg-amber-500/10 border-amber-500/20'     },
                  { label: 'In Progress', val: dept.inProgress, cls: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'        },
                  { label: 'Resolved',    val: dept.resolved,   cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
                  { label: 'Escalated',   val: dept.escalated,  cls: 'text-rose-400 bg-rose-500/10 border-rose-500/20'        },
                ].map(pill => (
                  dept.total > 0 && (
                    <span key={pill.label} className={`text-[11px] px-2 py-0.5 rounded border font-medium ${pill.cls}`}>
                      {pill.label}: {pill.val}
                    </span>
                  )
                ))}
                {dept.total === 0 && (
                  <span className="text-xs text-slate-600 italic">No complaints yet</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main export ─────────────────────────────────────────────────────────────

const StateAgentDashboardContent = ({ currentState, activeTab }) => {
  return (
    <div className="p-6 bg-[#0d1219] min-h-full font-sans text-slate-200">

      {/* Zone badge */}
      <div className="flex items-center justify-between mb-6">
        <div className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 shadow-[0_0_15px_rgba(34,211,238,0.1)] text-sm">
          <MapPin size={16} /> Active Zone: {currentState}
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          Auto-triage every 2 min
        </div>
      </div>

      {/* Render active panel based on tab from layout */}
      {activeTab === 'triage'    && <TriageQueuePanel    currentState={currentState} />}
      {activeTab === 'complaints'&& <LiveComplaintsPanel currentState={currentState} />}
      {activeTab === 'stats'     && <DeptStatsPanel      currentState={currentState} />}
    </div>
  );
};

export default StateAgentDashboardContent;
