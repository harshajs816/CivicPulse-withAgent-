import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Building2, LayoutDashboard, FileText, Users, BarChart2, 
  Bell, Settings, PlusCircle, Search, Menu, LogOut, User,
  Droplets, Trash2, Zap, HardHat, CirclePlus, Bot, ChevronDown, ChevronRight, ExternalLink
} from 'lucide-react';
import { STATES, COLOR_MAP } from '../config/statesConfig';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [categoryStats, setCategoryStats] = useState([]);
  const [agentsExpanded, setAgentsExpanded] = useState(true);

  const getPageTitle = () => {
    if (location.pathname.includes('/reports')) return "All Reports";
    if (location.pathname.includes('/analytics')) return "Analytics & Insights";
    return "Dashboard Overview";
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out of the Admin Panel?")) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      navigate('/login');
    }
  };

  // Sidebar departments fetch karne ke liye (ek hi baar load hoga)
  useEffect(() => {
    const fetchSidebarData = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/reports/all");
        if (res.data.success) {
          const reports = res.data.reports;
          const stats = [
            { id: 'water', name: 'Water & Pipe', icon: Droplets },
            { id: 'garbage', name: 'Garbage', icon: Trash2 },
            { id: 'streetlight', name: 'Electricity', icon: Zap },
            { id: 'pothole', name: 'Roads & Const.', icon: HardHat },
            { id: 'other', name: 'Other', icon: FileText }
          ].map(cat => ({
            ...cat,
            count: reports.filter(r => r.category === cat.id).length
          }));
          setCategoryStats(stats);
        }
      } catch (error) {
        console.error("Sidebar data fetch error:", error);
      }
    };
    fetchSidebarData();
  }, []);

  return (
    <div className="min-h-screen bg-[#0d1219] text-slate-300 font-sans flex overflow-hidden">
      
      {/* ================= SIDEBAR ================= */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} hidden md:flex flex-col bg-[#111721] border-r border-slate-800/60 transition-all duration-300 z-20`}>
        <div className="h-20 flex items-center px-6 border-b border-slate-800/60">
          <div className="flex items-center gap-3 text-emerald-400 font-bold text-xl tracking-tight whitespace-nowrap">
            <Building2 className="w-8 h-8 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
            {isSidebarOpen && <span>CivicPulse</span>}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 custom-scrollbar">
          {isSidebarOpen && (
            <div className="mb-6 flex items-center gap-2 px-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                ★ Super Admin
              </span>
            </div>
          )}

          <div className="space-y-1 mb-8">
            <Link to="/superAdmin" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${location.pathname === '/admin' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'hover:bg-slate-800/50 text-slate-400 hover:text-slate-200'}`}>
              <LayoutDashboard className="w-5 h-5" /> {isSidebarOpen && "Dashboard"}
            </Link>
            <Link to="/superAdmin/reports" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${location.pathname.includes('/reports') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'hover:bg-slate-800/50 text-slate-400 hover:text-slate-200'}`}>
              <FileText className="w-5 h-5" /> {isSidebarOpen && "All Reports"}
            </Link>
            <Link to="/superAdmin/analytics" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${location.pathname.includes('/analytics') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'hover:bg-slate-800/50 text-slate-400 hover:text-slate-200'}`}>
              <BarChart2 className="w-5 h-5" /> {isSidebarOpen && "Analytics"}
            </Link>
            <Link to="/superAdmin/newReport" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${location.pathname.includes('/newReport') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'hover:bg-slate-800/50 text-slate-400 hover:text-slate-200'}`}>
              <PlusCircle className="w-5 h-5" /> {isSidebarOpen && "New Report"}
            </Link>
          </div>

         {/* {isSidebarOpen && <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Departments</p>} */}

          {/* ── State AI Agents ── */}
          <div className="mt-2">
            {/* Section header — clickable to collapse */}
            <button
              onClick={() => isSidebarOpen && setAgentsExpanded(!agentsExpanded)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-800/40 transition-colors group"
            >
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-cyan-400 shrink-0" />
                {isSidebarOpen && (
                  <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">
                    State Agents
                  </span>
                )}
              </div>
              {isSidebarOpen && (
                agentsExpanded
                  ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                  : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              )}
            </button>

            {/* Agent links */}
            {(agentsExpanded || !isSidebarOpen) && (
              <div className="mt-1 space-y-0.5">
                {STATES.map(state => {
                  const c = COLOR_MAP[state.color] || COLOR_MAP.indigo;
                  const isActive = location.pathname === `/agent/${state.slug}`;
                  return (
                    <Link
                      key={state.slug}
                      to={`/agent/${state.slug}`}
                      title={!isSidebarOpen ? `${state.name} Agent` : undefined}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive
                          ? `${c.soft} ${c.text} border ${c.border}`
                          : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                      }`}
                    >
                      {/* Color dot */}
                      <span className={`w-2 h-2 rounded-full ${c.bg} shrink-0`} />

                      {isSidebarOpen && (
                        <>
                          <span className="text-sm flex-1 truncate">{state.name}</span>
                          <ExternalLink className="w-3 h-3 text-slate-600 group-hover:text-slate-400 shrink-0" />
                        </>
                      )}
                    </Link>
                  );
                })}

                {/* View all hub link */}
                {isSidebarOpen && (
                  <Link
                    to="/agent"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/5 transition-colors text-xs font-medium border border-transparent hover:border-cyan-500/20 mt-1"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    View All Agents →
                  </Link>
                )}
              </div>
            )}
          </div>
          
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#0d1219]">
        
        {/* HEADER */}
        <header className="h-20 flex items-center justify-between px-8 border-b border-slate-800/60 bg-[#0d1219]/80 backdrop-blur-md z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 bg-slate-800/50 rounded-lg hover:bg-slate-800 text-slate-400 transition-colors md:hidden">
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">{getPageTitle()}</h1>
              <p className="text-xs text-slate-400">Welcome, <span className="text-emerald-400 font-medium">Super Admin</span></p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input type="text" placeholder="Search..." className="bg-[#151c27] border border-slate-700/60 text-sm text-slate-200 rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-emerald-500/50 w-64 transition-all" />
            </div>
            <button className="w-9 h-9 bg-emerald-500/20 border border-emerald-500/40 rounded-lg flex items-center justify-center text-emerald-400">
              <User className="w-5 h-5" />
            </button>
            <button onClick={handleLogout} className="p-2 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 rounded-lg text-rose-400 transition-colors" title="Log Out">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* PAGE CONTENT (Child components yaha inject honge) */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <Outlet /> 
        </div>
        
      </main>
    </div>
  );
}