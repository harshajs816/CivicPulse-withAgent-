import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Bot, ListChecks, BarChart3, User, Menu,
  LogOut, ShieldAlert, Zap, ChevronRight, ArrowLeft
} from 'lucide-react';
import StateAgentDashboardContent from '../Pages/Agents/StateAgentDashboardContent';
import { getStateBySlug, COLOR_MAP } from '../config/statesConfig';

const NAV_ITEMS = [
  { id: 'triage',      label: 'AI Triage Queue',  icon: Bot,       desc: 'Route unassigned complaints' },
  { id: 'complaints',  label: 'Live Complaints',   icon: ListChecks,desc: 'View, update & escalate'     },
  { id: 'stats',       label: 'Dept Analytics',    icon: BarChart3, desc: 'Resolution performance'      },
];

const StateAgentLayout = ({ currentState: propState }) => {
  const { stateSlug } = useParams();
  const navigate = useNavigate();

  // Resolve state from URL param first, fall back to prop
  const stateConfig  = getStateBySlug(stateSlug) || null;
  const currentState = stateConfig?.name  || propState || 'Rajasthan';
  const nodeId       = stateConfig?.nodeId || 'AX-000';
  const c            = COLOR_MAP[stateConfig?.color || 'indigo'];

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab]         = useState('triage');

  const activeNav = NAV_ITEMS.find(n => n.id === activeTab);

  return (
    <div className="flex h-screen bg-[#0d1219] overflow-hidden font-sans">

      {/* ── SIDEBAR ──────────────────────────────────────── */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-[72px]'} bg-[#0a0f17] border-r border-slate-800/80 transition-all duration-300 ease-in-out flex flex-col z-20`}>

        {/* Logo row */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80 shrink-0">
          {isSidebarOpen && (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className={`p-1.5 rounded-lg ${c.soft} border ${c.border}`}>
                <ShieldAlert size={18} className={c.text} />
              </div>
              <div className="leading-tight overflow-hidden">
                <span className="font-black text-white text-sm tracking-tight block truncate">CivicPulse</span>
                <span className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">State Agent</span>
              </div>
            </div>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 rounded-md text-slate-500 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
          >
            <Menu size={18} />
          </button>
        </div>

        {/* AI status pill */}
        {isSidebarOpen && (
          <div className={`mx-3 mt-3 px-3 py-2 rounded-lg ${c.soft} border ${c.border} flex items-center gap-2`}>
            <span className={`w-1.5 h-1.5 rounded-full ${c.bg} animate-pulse shrink-0`} />
            <span className={`text-[11px] ${c.text} font-semibold`}>AI Agent Online</span>
            <Zap size={11} className={`${c.text} ml-auto`} />
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                title={!isSidebarOpen ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all group ${
                  isActive
                    ? `${c.bg} text-white shadow-lg`
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <Icon size={19} className="shrink-0" />
                {isSidebarOpen && (
                  <div className="flex-1 text-left overflow-hidden">
                    <div className="text-sm font-semibold leading-tight truncate">{item.label}</div>
                    {!isActive && (
                      <div className="text-[10px] text-slate-500 group-hover:text-slate-400 truncate">{item.desc}</div>
                    )}
                  </div>
                )}
                {isSidebarOpen && isActive && <ChevronRight size={14} className="shrink-0 opacity-70" />}
              </button>
            );
          })}
        </nav>

        {/* Profile footer */}
        <div className="p-3 border-t border-slate-800/80 shrink-0">
          <div className={`flex items-center gap-3 mb-2 ${!isSidebarOpen ? 'justify-center' : ''}`}>
            <div className={`p-2 rounded-full ${c.soft} border ${c.border} shrink-0`}>
              <User size={16} className={c.text} />
            </div>
            {isSidebarOpen && (
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-slate-200 truncate">{currentState} Agent</p>
                <p className="text-[10px] text-slate-500">Node ID: {nodeId}</p>
              </div>
            )}
          </div>

          {/* Back to hub */}
          <button
            onClick={() => navigate('/agent')}
            className={`w-full flex items-center gap-2 px-3 py-2 mb-1.5 rounded-lg ${c.soft} ${c.text} border ${c.border} text-xs font-medium transition-colors hover:opacity-80 ${!isSidebarOpen ? 'justify-center' : ''}`}
          >
            <ArrowLeft size={13} />
            {isSidebarOpen && <span>All States</span>}
          </button>

          <button
            onClick={() => {
              localStorage.removeItem('user');
              localStorage.removeItem('token');
              navigate('/login');
            }}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/60 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 transition-colors border border-slate-700/50 text-xs font-medium ${!isSidebarOpen ? 'justify-center' : ''}`}
          >
            <LogOut size={15} />
            {isSidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* ── MAIN ─────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* Topbar */}
        <header className="h-16 bg-[#0a0f17]/80 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3">
            {activeNav && (
              <>
                <activeNav.icon size={18} className="text-slate-400" />
                <div>
                  <p className="text-sm font-bold text-white">{activeNav.label}</p>
                  <p className="text-[11px] text-slate-500">{activeNav.desc}</p>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Dynamic state zone badge */}
            <div className={`hidden sm:flex items-center gap-1.5 text-xs font-semibold ${c.text} ${c.soft} border ${c.border} px-3 py-1.5 rounded-full`}>
              <span className={`w-1.5 h-1.5 rounded-full ${c.bg} animate-pulse`} />
              {currentState}
            </div>

            <div className="hidden md:flex items-center gap-1.5 text-[11px] text-slate-500 bg-slate-800/60 border border-slate-700/50 px-3 py-1.5 rounded-full">
              <ShieldAlert size={12} className="text-rose-400" />
              Escalations → SuperAdmin
            </div>
          </div>
        </header>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          <StateAgentDashboardContent
            currentState={currentState}
            activeTab={activeTab}
          />
        </div>
      </main>
    </div>
  );
};

export default StateAgentLayout;
