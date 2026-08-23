import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Droplets, Trash2, Zap, HardHat, FileText, Check, Search, Loader2 } from 'lucide-react';

export default function AdminAllReports() {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Top Category Stats
  const [categoryStats, setCategoryStats] = useState([
    { id: 'water', name: 'Water & Pipe', count: 0, icon: Droplets, color: 'text-cyan-400' },
    { id: 'garbage', name: 'Garbage', count: 0, icon: Trash2, color: 'text-purple-400' },
    { id: 'streetlight', name: 'Electricity', count: 0, icon: Zap, color: 'text-orange-400' },
    { id: 'pothole', name: 'Construction', count: 0, icon: HardHat, color: 'text-rose-400' },
    { id: 'other', name: 'Other', count: 0, icon: FileText, color: 'text-slate-400' }
  ]);

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/reports/all");
        if (res.data.success) {
          const allReports = res.data.reports;
          setReports(allReports);
          
          // Calculate Category Stats dynamically
          const updatedStats = [...categoryStats];
          updatedStats.forEach(cat => {
            if (cat.id === 'pothole') {
              cat.count = allReports.filter(r => r.category === 'pothole').length;
            } else if (cat.id === 'streetlight') {
              cat.count = allReports.filter(r => r.category === 'streetlight').length;
            } else {
              cat.count = allReports.filter(r => r.category === cat.id).length;
            }
          });
          // For 'other'
          updatedStats[4].count = allReports.filter(r => !['water','garbage','streetlight','pothole'].includes(r.category)).length;
          
          setCategoryStats(updatedStats);
        }
      } catch (error) {
        console.error("Failed to fetch reports:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- FILTERING LOGIC ---
  useEffect(() => {
    let result = [...reports];

    // Status Tab Filter
    if (activeTab !== 'All') {
      result = result.filter(r => r.status === activeTab);
    }

    // Search Filter
    if (searchQuery) {
      const lowerQ = searchQuery.toLowerCase();
      result = result.filter(r => 
        r.title?.toLowerCase().includes(lowerQ) || 
        r.locationName?.toLowerCase().includes(lowerQ) ||
        r.reportedBy?.name?.toLowerCase().includes(lowerQ)
      );
    }

    setFilteredReports(result);
  }, [reports, activeTab, searchQuery]);

  // --- ACTION HANDLERS ---
  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/reports/${id}/status`, { status: newStatus });
      setReports(prev => prev.map(r => r._id === id ? { ...r, status: newStatus } : r));
    } catch (error) {
      alert("Failed to update status");
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm("Are you sure you want to delete this report?")) {
      try {
        await axios.delete(`http://localhost:5000/api/reports/${id}`);
        setReports(prev => prev.filter(r => r._id !== id));
      } catch (error) {
        alert("Failed to delete report");
      }
    }
  };

  // Helper Functions
  const getCategoryBadge = (category) => {
    if (category?.includes('water')) return { name: 'Water & Pipe', icon: <Droplets className="w-3 h-3"/>, style: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' };
    if (category?.includes('garbage')) return { name: 'Garbage', icon: <Trash2 className="w-3 h-3"/>, style: 'bg-purple-500/10 text-purple-400 border-purple-500/20' };
    if (category?.includes('light')) return { name: 'Electricity', icon: <Zap className="w-3 h-3"/>, style: 'bg-orange-500/10 text-orange-400 border-orange-500/20' };
    if (category?.includes('pothole')) return { name: 'Construction', icon: <HardHat className="w-3 h-3"/>, style: 'bg-rose-500/10 text-rose-400 border-rose-500/20' };
    return { name: 'Other', icon: <FileText className="w-3 h-3"/>, style: 'bg-slate-500/10 text-slate-400 border-slate-500/20' };
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); 
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
      </div>
    );
  }

  return (
    <>
      {/* Top Category Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {categoryStats.map((cat, idx) => (
          <div key={idx} className="bg-[#151c27] border border-slate-800/80 rounded-xl p-5 flex flex-col items-center justify-center shadow-lg transition-all hover:border-slate-700">
            <cat.icon className={`w-6 h-6 mb-2 ${cat.color}`} />
            <p className="text-xs text-slate-400 font-medium mb-1">{cat.name}</p>
            <h3 className="text-2xl font-bold text-white">{cat.count}</h3>
          </div>
        ))}
      </div>

      {/* Table Container */}
      <div className="bg-[#151c27] border border-slate-800/80 rounded-xl shadow-lg flex flex-col overflow-hidden">
        
        {/* Table Header / Tabs / Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 border-b border-slate-800/80">
          <div className="flex items-center gap-4">
            <h2 className="text-white font-bold mr-4">{filteredReports.length} Issues</h2>
            <div className="flex flex-wrap gap-2">
              {['All', 'Pending', 'In Progress', 'Resolved'].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-md text-xs font-medium border transition-colors
                    ${activeTab === tab 
                      ? 'bg-[#1b2234] text-emerald-400 border-emerald-500/30' 
                      : 'bg-transparent text-slate-400 border-slate-700 hover:text-slate-300'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Local Search for this page */}
          <div className="relative w-full md:w-auto">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search reports..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#111721] border border-slate-700/60 text-sm text-slate-200 rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-emerald-500/50 w-full md:w-64 transition-all" 
            />
          </div>
        </div>

        {/* Actual Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] uppercase tracking-wider text-slate-500 font-bold bg-[#111721]/50">
                <th className="p-4 pl-6">ID</th>
                <th className="p-4">Title</th>
                <th className="p-4">Department</th>
                <th className="p-4">Location</th>
                <th className="p-4">Priority</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
                <th className="p-4">Reporter</th>
                <th className="p-4 pr-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredReports.length === 0 ? (
                <tr><td colSpan="9" className="text-center py-10 text-slate-400">No issues found.</td></tr>
              ) : (
                filteredReports.map((report, idx) => {
                  const badge = getCategoryBadge(report.category);
                  const ticketId = `CP${String(idx + 1).padStart(3, '0')}`;
                  
                  return (
                    <tr key={report._id} className="border-b border-slate-800/80 hover:bg-[#1b2234]/50 transition-colors">
                      <td className="p-4 pl-6 font-mono text-emerald-400 font-medium">{ticketId}</td>
                      <td className="p-4 text-white font-medium max-w-[200px] truncate" title={report.title}>{report.title}</td>
                      
                      <td className="p-4">
                        <span className={`flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${badge.style}`}>
                          {badge.icon} {badge.name}
                        </span>
                      </td>
                      
                      <td className="p-4 text-slate-400 truncate max-w-[150px]" title={report.locationName}>{report.locationName}</td>
                      
                      <td className="p-4">
                        <span className={`font-bold text-[11px] uppercase tracking-wider
                          ${report.priority === 'high' ? 'text-rose-500' : 
                            report.priority === 'medium' ? 'text-orange-500' : 'text-emerald-500'}`}>
                          {report.priority}
                        </span>
                      </td>
                      
                      {/* DYNAMIC DROPDOWN FOR STATUS */}
                      <td className="p-4">
                        <select 
                          value={report.status}
                          onChange={(e) => handleStatusChange(report._id, e.target.value)}
                          className={`text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border appearance-none outline-none cursor-pointer
                            ${report.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' : 
                              report.status === 'In Progress' ? 'bg-orange-500/10 text-orange-500 border-orange-500/30' : 
                              'bg-cyan-500/10 text-cyan-500 border-cyan-500/30'}`}
                        >
                          <option value="Pending" className="bg-[#151c27] text-cyan-500">Pending</option>
                          <option value="In Progress" className="bg-[#151c27] text-orange-500">In Progress</option>
                          <option value="Resolved" className="bg-[#151c27] text-emerald-500">Resolved</option>
                        </select>
                      </td>
                      
                      <td className="p-4 text-slate-400 text-xs font-medium">{formatDate(report.createdAt)}</td>
                      <td className="p-4 text-slate-300">{report.reportedBy?.name || 'Citizen'}</td>
                      
                      {/* ACTIONS */}
                      <td className="p-4 pr-6 flex justify-center gap-2">
                        {report.status !== 'Resolved' && (
                          <button 
                            onClick={() => handleStatusChange(report._id, 'Resolved')}
                            className="p-1.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 rounded hover:bg-emerald-500 hover:text-white transition-colors"
                            title="Mark as Resolved"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button 
                          onClick={() => handleDelete(report._id)}
                          className="p-1.5 bg-rose-500/10 text-rose-500 border border-rose-500/30 rounded hover:bg-rose-500 hover:text-white transition-colors"
                          title="Delete Report"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>
    </>
  );
}