import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, Droplets, Trash2, Zap, HardHat, MoreHorizontal } from 'lucide-react';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie
} from 'recharts';

export default function AdminAnalytics() {
  const [isLoading, setIsLoading] = useState(true);
  
  // --- ANALYTICS STATES ---
  const [stats, setStats] = useState({ total: 0, resolved: 0, resolutionRate: 0, avgResponse: '2.4' });
  const [deptData, setDeptData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [priorityData, setPriorityData] = useState([]);
  const [deptRates, setDeptRates] = useState([]);

  // Category Theme Config
  const COLORS = {
    water: '#22d3ee', // Cyan
    garbage: '#a855f7', // Purple
    electricity: '#f97316', // Orange
    road: '#f43f5e', // Rose
    other: '#94a3b8' // Slate
  };

  const STATUS_COLORS = { 'Pending': '#22d3ee', 'In Progress': '#f97316', 'Resolved': '#10b981', 'Withdrawn': '#64748b' };
  const PRIORITY_COLORS = { 'high': '#f43f5e', 'medium': '#f97316', 'low': '#10b981' };

  // --- FETCH & PROCESS DATA ---
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/reports/all");
        if (res.data.success) {
          const reports = res.data.reports;
          
          // 1. Top Cards Calculations
          const total = reports.length;
          const resolved = reports.filter(r => r.status === 'Resolved').length;
          const resolutionRate = total === 0 ? 0 : Math.round((resolved / total) * 100);
          
          setStats({ total, resolved, resolutionRate, avgResponse: '2.4' });

          // 2. Issues by Department (Bar Chart) & Dept Rates
          const categories = [
            { id: 'water', name: 'Water & Pipe' },
            { id: 'garbage', name: 'Garbage' },
            { id: 'electricity', name: 'Electricity' },
            { id: 'road', name: 'Construction' },
            { id: 'other', name: 'Other' }
          ];

          const processedDept = [];
          const processedRates = [];

          categories.forEach(cat => {
            const catReports = reports.filter(r => 
              cat.id === 'other' 
                ? !['water','garbage','electricity','road'].includes(r.category)
                : r.category === cat.id
            );
            
            const catTotal = catReports.length;
            const catResolved = catReports.filter(r => r.status === 'Resolved').length;
            const rate = catTotal === 0 ? 0 : Math.round((catResolved / catTotal) * 100);

            processedDept.push({ name: cat.name, id: cat.id, count: catTotal });
            processedRates.push({ id: cat.id, name: cat.name, rate });
          });

          setDeptData(processedDept);
          setDeptRates(processedRates);

          // 3. Monthly Trend (Area Chart)
          const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          const currentMonth = new Date().getMonth();
          const last6Months = [];
          
          for (let i = 5; i >= 0; i--) {
            let d = new Date();
            d.setMonth(currentMonth - i);
            let mName = monthNames[d.getMonth()];
            
            const mReports = reports.filter(r => new Date(r.createdAt).getMonth() === d.getMonth());
            const mSubmitted = mReports.length;
            const mResolved = mReports.filter(r => r.status === 'Resolved').length;
            
            last6Months.push({ name: mName, submitted: mSubmitted, resolved: mResolved });
          }
          setMonthlyData(last6Months);

          // 4. Status Breakdown (Donut Chart)
          setStatusData([
            { name: 'Pending', value: reports.filter(r => r.status === 'Pending').length },
            { name: 'In Progress', value: reports.filter(r => r.status === 'In Progress').length },
            { name: 'Resolved', value: resolved }
          ]);

          // 5. Priority Breakdown (Donut Chart)
          setPriorityData([
            { name: 'High', value: reports.filter(r => r.priority === 'high').length },
            { name: 'Medium', value: reports.filter(r => r.priority === 'medium').length },
            { name: 'Low', value: reports.filter(r => r.priority === 'low').length }
          ]);

        }
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const getDeptIcon = (id) => {
    if(id === 'water') return <Droplets className="w-3.5 h-3.5 text-cyan-400" />;
    if(id === 'garbage') return <Trash2 className="w-3.5 h-3.5 text-purple-400" />;
    if(id === 'electricity') return <Zap className="w-3.5 h-3.5 text-orange-400" />;
    if(id === 'road') return <HardHat className="w-3.5 h-3.5 text-rose-400" />;
    return <MoreHorizontal className="w-3.5 h-3.5 text-slate-400" />;
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
      {/* TOP CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-[#151c27] border-t-2 border-cyan-500 border-x border-b border-slate-800/80 rounded-xl p-5 shadow-lg">
          <p className="text-sm font-medium text-slate-400 mb-2">Total Issues</p>
          <h2 className="text-4xl font-bold text-cyan-400 mb-1">{stats.total}</h2>
          <p className="text-xs text-slate-600">All time</p>
        </div>
        <div className="bg-[#151c27] border-t-2 border-emerald-500 border-x border-b border-slate-800/80 rounded-xl p-5 shadow-lg">
          <p className="text-sm font-medium text-slate-400 mb-2">Resolved</p>
          <h2 className="text-4xl font-bold text-emerald-400 mb-1">{stats.resolved}</h2>
          <p className="text-xs text-slate-600">Successfully fixed</p>
        </div>
        <div className="bg-[#151c27] border-t-2 border-blue-500 border-x border-b border-slate-800/80 rounded-xl p-5 shadow-lg">
          <p className="text-sm font-medium text-slate-400 mb-2">Resolution Rate</p>
          <h2 className="text-4xl font-bold text-blue-400 mb-1">{stats.resolutionRate}%</h2>
          <p className="text-xs text-slate-600">Overall performance</p>
        </div>
        <div className="bg-[#151c27] border-t-2 border-orange-500 border-x border-b border-slate-800/80 rounded-xl p-5 shadow-lg">
          <p className="text-sm font-medium text-slate-400 mb-2">Avg. Response</p>
          <h2 className="text-4xl font-bold text-orange-400 mb-1">{stats.avgResponse} <span className="text-lg">days</span></h2>
          <p className="text-xs text-slate-600">Time to first action</p>
        </div>
      </div>

      {/* ROW 1: BAR CHART & AREA CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        
        {/* Issues by Department */}
        <div className="bg-[#151c27] border border-slate-800/80 rounded-xl p-6 shadow-lg h-96 flex flex-col">
          <h3 className="text-white font-bold mb-1">Issues by Department</h3>
          <p className="text-xs text-slate-400 mb-6">Total issues per department</p>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: '#1e293b' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={40}>
                  {deptData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.id] || COLORS.other} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Trend Area Chart */}
        <div className="bg-[#151c27] border border-slate-800/80 rounded-xl p-6 shadow-lg h-96 flex flex-col">
          <h3 className="text-white font-bold mb-1">Monthly Trend</h3>
          <p className="text-xs text-slate-400 mb-6">Issues reported vs resolved</p>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSub" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
                <Area type="monotone" dataKey="submitted" stroke="#22d3ee" strokeWidth={2} fillOpacity={1} fill="url(#colorSub)" name="Reported" />
                <Area type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRes)" name="Resolved" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* ROW 2: DONUT CHARTS & PROGRESS BARS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Status Donut */}
        <div className="bg-[#151c27] border border-slate-800/80 rounded-xl p-6 shadow-lg flex flex-col h-72">
          <div>
            <h3 className="text-white font-bold mb-1">Issue Status</h3>
            <p className="text-xs text-slate-400">Current breakdown</p>
          </div>
          <div className="flex-1 flex items-center justify-between">
            <div className="w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={2} dataKey="value" stroke="none">
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-1/2 pl-4 space-y-3">
              {statusData.map(stat => (
                <div key={stat.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[stat.name] }}></span>
                    <span className="text-xs text-slate-400">{stat.name}</span>
                  </div>
                  <span className="text-sm font-bold text-white">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Priority Donut */}
        <div className="bg-[#151c27] border border-slate-800/80 rounded-xl p-6 shadow-lg flex flex-col h-72">
          <div>
            <h3 className="text-white font-bold mb-1">By Priority</h3>
            <p className="text-xs text-slate-400">Urgency distribution</p>
          </div>
          <div className="flex-1 flex items-center justify-between">
            <div className="w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={priorityData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={2} dataKey="value" stroke="none">
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[entry.name.toLowerCase()]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-1/2 pl-4 space-y-3">
              {priorityData.map(stat => (
                <div key={stat.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PRIORITY_COLORS[stat.name.toLowerCase()] }}></span>
                    <span className="text-xs text-slate-400">{stat.name}</span>
                  </div>
                  <span className="text-sm font-bold text-white">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dept Resolution Rates */}
        <div className="bg-[#151c27] border border-slate-800/80 rounded-xl p-6 shadow-lg flex flex-col h-72 overflow-hidden">
          <div>
            <h3 className="text-white font-bold mb-1">Dept. Resolution Rate</h3>
            <p className="text-xs text-slate-400 mb-4">Performance per department</p>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-5">
            {deptRates.map((dept) => (
              <div key={dept.id}>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    {getDeptIcon(dept.id)} {dept.name}
                  </div>
                  <span className={`text-xs font-bold ${COLORS[dept.id] ? `text-[${COLORS[dept.id]}]` : 'text-slate-400'}`} style={{ color: COLORS[dept.id] || COLORS.other }}>
                    {dept.rate}%
                  </span>
                </div>
                <div className="w-full bg-[#1e293b] rounded-full h-1.5">
                  <div 
                    className="h-1.5 rounded-full transition-all duration-1000" 
                    style={{ width: `${dept.rate}%`, backgroundColor: COLORS[dept.id] || COLORS.other }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}