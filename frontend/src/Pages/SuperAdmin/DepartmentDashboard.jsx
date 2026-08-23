import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Building2, LayoutDashboard, ClipboardList, Clock, 
  CheckCircle2, Search, Bell, User, LogOut, Menu,
  Droplets, Trash2, Zap, HardHat, MoreHorizontal
} from 'lucide-react';

// Department config for dynamic themes & icons
const DEPT_CONFIG = {
  'water': { name: 'Water & Sanitation', icon: Droplets, color: 'text-cyan-400', bg: 'bg-cyan-500', badge: 'bg-cyan-500/10 border-cyan-500/30' },
  'garbage': { name: 'Waste Management', icon: Trash2, color: 'text-purple-400', bg: 'bg-purple-500', badge: 'bg-purple-500/10 border-purple-500/30' },
  'streetlight': { name: 'Electricity Board', icon: Zap, color: 'text-orange-400', bg: 'bg-orange-500', badge: 'bg-orange-500/10 border-orange-500/30' },
  'pothole': { name: 'Roads & Construction', icon: HardHat, color: 'text-rose-400', bg: 'bg-rose-500', badge: 'bg-rose-500/10 border-rose-500/30' },
  'other': { name: 'General Civic Dept', icon: MoreHorizontal, color: 'text-slate-400', bg: 'bg-slate-500', badge: 'bg-slate-500/10 border-slate-500/30' }
};

export default function DepartmentDashboard() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  
  const [deptUser, setDeptUser] = useState(null);
  const [deptConfig, setDeptConfig] = useState(DEPT_CONFIG['other']);
  const [reports, setReports] = useState([]);
  
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0 });

  // --- 1. AUTH & DATA FETCH ---
  useEffect(() => {
    const initDashboard = async () => {
      // Get logged-in department worker
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        navigate('/login');
        return;
      }
      
      const user = JSON.parse(userStr);
      setDeptUser(user);
      
      // Man lijiye user object mein department save hai (e.g., user.department = 'water')
      const userDept = user.department || 'water'; // Defaulting to water for testing
      setDeptConfig(DEPT_CONFIG[userDept] || DEPT_CONFIG['other']);

      try {
        const res = await axios.get("http://localhost:5000/api/reports/all");
        if (res.data.success) {
          // FILTER: Sirf is department ki reports nikalenge
          const myDeptReports = res.data.reports.filter(r => r.category === userDept);
          
          // NAYI REPORT KO UPAR RAKHNE KE LIYE SORTING
          myDeptReports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setReports(myDeptReports);

          // Calculate Stats
          setStats({
            total: myDeptReports.length,
            pending: myDeptReports.filter(r => r.status === 'Pending').length,
            inProgress: myDeptReports.filter(r => r.status === 'In Progress').length,
            resolved: myDeptReports.filter(r => r.status === 'Resolved').length
          });
        }
      } catch (error) {
        console.error("Failed to fetch department reports:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initDashboard();
  }, [navigate]);

  // --- 2. ACTION HANDLERS ---
  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/reports/${id}/status`, { status: newStatus });
      
      const updatedReports = reports.map(r => r._id === id ? { ...r, status: newStatus } : r);
      setReports(updatedReports);
      
      // Update Stats Instantly
      setStats({
        total: updatedReports.length,
        pending: updatedReports.filter(r => r.status === 'Pending').length,
        inProgress: updatedReports.filter(r => r.status === 'In Progress').length,
        resolved: updatedReports.filter(r => r.status === 'Resolved').length
      });
    } catch (error) {
      alert("Failed to update status");
    }
  };

  const handleLogout = () => {
    if (window.confirm("Log out of Department Portal?")) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      navigate('/login');
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const DeptIcon = deptConfig.icon;

  return (
    <div className="min-h-screen bg-[#0d1219] text-slate-300 font-sans flex overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} hidden md:flex flex-col bg-[#111721] border-r border-slate-800/60 transition-all duration-300 z-20`}>
        <div className="h-20 flex items-center px-6 border-b border-slate-800/60">
          <div className="flex items-center gap-3 text-emerald-400 font-bold text-xl tracking-tight whitespace-nowrap">
            <Building2 className="w-8 h-8" />
            {isSidebarOpen && <span>CivicPulse</span>}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4">
          {isSidebarOpen && (
            <div className="mb-6 flex items-center gap-2 px-3">
              <span className={`text-[10px] font-black uppercase tracking-widest ${deptConfig.color} ${deptConfig.badge} px-2 py-1 rounded border`}>
                {deptConfig.name}
              </span>
            </div>
          )}

          <div className="space-y-1 mb-8">
            <a href="#" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${deptConfig.badge} ${deptConfig.color} font-medium transition-colors border`}>
              <LayoutDashboard className="w-5 h-5" /> {isSidebarOpen && "Dept Dashboard"}
            </a>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#0d1219]">
        
        {/* HEADER */}
        <header className="h-20 flex items-center justify-between px-8 border-b border-slate-800/60 bg-[#0d1219]/80 backdrop-blur-md z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 bg-slate-800/50 rounded-lg hover:bg-slate-800 text-slate-400 transition-colors md:hidden">
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <DeptIcon className={`w-6 h-6 ${deptConfig.color}`} /> 
                {deptConfig.name} Portal
              </h1>
              <p className="text-xs text-slate-400">Welcome, <span className="text-white font-medium">{deptUser?.name || 'Officer'}</span></p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input type="text" placeholder="Search tasks..." className="bg-[#151c27] border border-slate-700/60 text-sm text-slate-200 rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-emerald-500/50 w-64 transition-all" />
            </div>
            
            <div className="h-8 w-px bg-slate-800/80 mx-1"></div>
            
            <button onClick={handleLogout} className="p-2 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 rounded-lg text-rose-400 transition-colors" title="Log Out">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* WORKSPACE */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          
          {/* STATS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-[#18202d] border border-slate-700/40 rounded-xl p-5 shadow-lg relative overflow-hidden">
              <p className="text-sm font-medium text-slate-400 mb-2">Total Assigned</p>
              <h2 className="text-3xl font-bold text-white mb-1">{stats.total}</h2>
              <div className="absolute right-[-10px] bottom-[-10px] opacity-10"><ClipboardList className="w-20 h-20" /></div>
            </div>
            <div className="bg-[#18202d] border-b-2 border-rose-500 border-x border-t border-slate-700/40 rounded-xl p-5 shadow-lg">
              <p className="text-sm font-medium text-slate-400 mb-2">Pending Action</p>
              <h2 className="text-3xl font-bold text-rose-400 mb-1">{stats.pending}</h2>
            </div>
            <div className="bg-[#18202d] border-b-2 border-orange-500 border-x border-t border-slate-700/40 rounded-xl p-5 shadow-lg">
              <p className="text-sm font-medium text-slate-400 mb-2">In Progress</p>
              <h2 className="text-3xl font-bold text-orange-400 mb-1">{stats.inProgress}</h2>
            </div>
            <div className="bg-[#18202d] border-b-2 border-emerald-500 border-x border-t border-slate-700/40 rounded-xl p-5 shadow-lg">
              <p className="text-sm font-medium text-slate-400 mb-2">Resolved</p>
              <h2 className="text-3xl font-bold text-emerald-400 mb-1">{stats.resolved}</h2>
            </div>
          </div>

          {/* TASK TABLE */}
          <div className="bg-[#151c27] border border-slate-800/80 rounded-xl shadow-lg flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-800/80">
              <h2 className="text-white font-bold">Assigned Tasks ({reports.length})</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] uppercase tracking-wider text-slate-500 font-bold bg-[#111721]/50">
                    <th className="p-4 pl-6">ID</th>
                    <th className="p-4">Issue Details</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Priority</th>
                    <th className="p-4">Status Update</th>
                    <th className="p-4">Date</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {isLoading ? (
                    <tr><td colSpan="6" className="text-center py-10 text-slate-400">Loading assignments...</td></tr>
                  ) : reports.length === 0 ? (
                    <tr><td colSpan="6" className="text-center py-10 text-slate-400">No issues assigned to this department.</td></tr>
                  ) : (
                    reports.map((report, idx) => (
                      <tr key={report._id} className="border-b border-slate-800/80 hover:bg-[#1b2234]/50 transition-colors">
                        <td className="p-4 pl-6 font-mono text-slate-400">#{report._id.slice(-5).toUpperCase()}</td>
                        <td className="p-4">
                          <p className="text-white font-medium line-clamp-1">{report.title}</p>
                          <p className="text-[11px] text-slate-500 line-clamp-1">{report.description}</p>
                        </td>
                        <td className="p-4 text-slate-400 truncate max-w-[150px]" title={report.locationName}>{report.locationName}</td>
                        <td className="p-4">
                          <span className={`font-bold text-[11px] uppercase tracking-wider ${report.priority === 'high' ? 'text-rose-500' : report.priority === 'medium' ? 'text-orange-500' : 'text-emerald-500'}`}>
                            {report.priority}
                          </span>
                        </td>
                        <td className="p-4">
                          <select 
                            value={report.status}
                            onChange={(e) => handleStatusChange(report._id, e.target.value)}
                            className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-md border appearance-none outline-none cursor-pointer
                              ${report.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' : 
                                report.status === 'In Progress' ? 'bg-orange-500/10 text-orange-500 border-orange-500/30' : 
                                report.status === 'Withdrawn' ? 'bg-slate-500/10 text-slate-500 border-slate-500/30' :
                                'bg-cyan-500/10 text-cyan-500 border-cyan-500/30'}`}
                            disabled={report.status === 'Withdrawn'}
                          >
                            <option value="Pending" className="bg-[#151c27] text-cyan-500">Pending</option>
                            <option value="In Progress" className="bg-[#151c27] text-orange-500">In Progress</option>
                            <option value="Resolved" className="bg-[#151c27] text-emerald-500">Mark Resolved</option>
                            <option value="Withdrawn" className="bg-[#151c27] text-slate-500" disabled>Withdrawn</option>
                          </select>
                        </td>
                        <td className="p-4 text-slate-400 text-xs">{formatDate(report.createdAt)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}