import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import AiReportCard from '../Agents/AiReportCard';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Droplets,
  Trash2,
  Zap,
  HardHat,
  MoreHorizontal,
  Filter,
  RefreshCw,
  Loader2,
} from 'lucide-react';

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

export default function AdminDashboard() {
  // =========================================================
  // STATES
  // =========================================================

  const [reports, setReports] = useState([]);
  const [selectedDept, setSelectedDept] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');

  // =========================================================
  // DEPARTMENT CONFIG
  // =========================================================

  const departments = [
    {
      id: 'water',
      name: 'Water & Pipe',
      icon: Droplets,
      color: '#22d3ee',
      bgColor: 'bg-cyan-500',
      textColor: 'text-cyan-400',
    },
    {
      id: 'garbage',
      name: 'Garbage',
      icon: Trash2,
      color: '#a855f7',
      bgColor: 'bg-purple-500',
      textColor: 'text-purple-400',
    },
    {
      id: 'streetlight',
      name: 'Electricity',
      icon: Zap,
      color: '#f97316',
      bgColor: 'bg-orange-500',
      textColor: 'text-orange-400',
    },
    {
      id: 'pothole',
      name: 'Roads & Const.',
      icon: HardHat,
      color: '#f43f5e',
      bgColor: 'bg-rose-500',
      textColor: 'text-rose-400',
    },
    {
      id: 'other',
      name: 'Other',
      icon: MoreHorizontal,
      color: '#64748b',
      bgColor: 'bg-slate-500',
      textColor: 'text-slate-400',
    },
  ];

  // =========================================================
  // FETCH REPORTS
  // =========================================================

  const fetchReports = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setError('');

      const res = await axios.get(
        'http://localhost:5000/api/reports/all'
      );

      if (res.data.success) {
        setReports(res.data.reports || []);
      } else {
        setError('Unable to load reports.');
      }
    } catch (err) {
      console.error('Dashboard data fetch error:', err);

      setError(
        err?.response?.data?.message ||
          'Unable to connect to the server.'
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // =========================================================
  // FILTERED REPORTS
  // =========================================================

  const activeReports = useMemo(() => {
    if (selectedDept === 'all') {
      return reports;
    }

    return reports.filter(
      (report) => report.category === selectedDept
    );
  }, [reports, selectedDept]);

  // =========================================================
  // STATS
  // =========================================================

  const stats = useMemo(() => {
    const total = activeReports.length;

    const inProcess = activeReports.filter(
      (report) => report.status === 'In Progress'
    ).length;

    const resolved = activeReports.filter(
      (report) => report.status === 'Resolved'
    ).length;

    const critical = activeReports.filter(
      (report) =>
        report.priority?.toLowerCase() === 'high' &&
        report.status !== 'Resolved'
    ).length;

    return {
      total,
      inProcess,
      resolved,
      critical,
    };
  }, [activeReports]);

  // =========================================================
  // DEPARTMENT STATS
  // =========================================================

  const departmentStats = useMemo(() => {
    return departments.map((department) => {
      const departmentReports = reports.filter(
        (report) => report.category === department.id
      );

      const resolved = departmentReports.filter(
        (report) => report.status === 'Resolved'
      ).length;

      const total = departmentReports.length;

      const resolvedPercent =
        total === 0
          ? 0
          : Math.round((resolved / total) * 100);

      return {
        ...department,
        count: total,
        resolved,
        resolvedPercent,
      };
    });
  }, [reports]);

  
  const weeklyData = useMemo(() => {
    const days = [
      'Sun',
      'Mon',
      'Tue',
      'Wed',
      'Thu',
      'Fri',
      'Sat',
    ];

    const map = {
      Mon: {
        submitted: 0,
        resolved: 0,
      },
      Tue: {
        submitted: 0,
        resolved: 0,
      },
      Wed: {
        submitted: 0,
        resolved: 0,
      },
      Thu: {
        submitted: 0,
        resolved: 0,
      },
      Fri: {
        submitted: 0,
        resolved: 0,
      },
      Sat: {
        submitted: 0,
        resolved: 0,
      },
      Sun: {
        submitted: 0,
        resolved: 0,
      },
    };

    activeReports.forEach((report) => {
      if (!report.createdAt) return;

      const date = new Date(report.createdAt);

      if (isNaN(date.getTime())) return;

      const dayName = days[date.getDay()];

      if (!map[dayName]) return;

      map[dayName].submitted += 1;

      if (report.status === 'Resolved') {
        map[dayName].resolved += 1;
      }
    });

    return [
      {
        name: 'Mon',
        submitted: map.Mon.submitted,
        resolved: map.Mon.resolved,
      },
      {
        name: 'Tue',
        submitted: map.Tue.submitted,
        resolved: map.Tue.resolved,
      },
      {
        name: 'Wed',
        submitted: map.Wed.submitted,
        resolved: map.Wed.resolved,
      },
      {
        name: 'Thu',
        submitted: map.Thu.submitted,
        resolved: map.Thu.resolved,
      },
      {
        name: 'Fri',
        submitted: map.Fri.submitted,
        resolved: map.Fri.resolved,
      },
      {
        name: 'Sat',
        submitted: map.Sat.submitted,
        resolved: map.Sat.resolved,
      },
      {
        name: 'Sun',
        submitted: map.Sun.submitted,
        resolved: map.Sun.resolved,
      },
    ];
  }, [activeReports]);

  // =========================================================
  // MONTHLY DATA
  // =========================================================

  const monthlyData = useMemo(() => {
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    const monthCounts = {};

    activeReports.forEach((report) => {
      if (!report.createdAt) return;

      const date = new Date(report.createdAt);

      if (isNaN(date.getTime())) return;

      const monthName = monthNames[date.getMonth()];

      monthCounts[monthName] =
        (monthCounts[monthName] || 0) + 1;
    });

    const result = [];

    const currentDate = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i,
        1
      );

      const monthName = monthNames[date.getMonth()];

      result.push({
        name: monthName,
        reports: monthCounts[monthName] || 0,
      });
    }

    return result;
  }, [activeReports]);

  // =========================================================
  // HEADER TITLE
  // =========================================================

  const selectedDepartment = departments.find(
    (department) => department.id === selectedDept
  );

  const headerTitle =
    selectedDept === 'all'
      ? 'Global Dashboard Overview'
      : `${selectedDepartment?.name || 'Department'} Overview`;

  // =========================================================
  // RESOLUTION PERCENTAGE
  // =========================================================

  const resolutionPercentage =
    stats.total === 0
      ? 0
      : Math.round(
          (stats.resolved / stats.total) * 100
        );

  // =========================================================
  // LOADING STATE
  // =========================================================

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />

          <p className="text-sm text-slate-400">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  

  if (error) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="max-w-md w-full bg-[#18202d] border border-rose-500/30 rounded-xl p-6 text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-rose-500/10 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-rose-400" />
          </div>

          <h2 className="text-white font-bold text-lg mb-2">
            Dashboard Error
          </h2>

          <p className="text-slate-400 text-sm mb-5">
            {error}
          </p>

          <button
            onClick={() => fetchReports()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

 

  return (
    <div className="space-y-6">


      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {headerTitle}
            </h2>



            {selectedDept !== 'all' && (
              <span className="bg-emerald-500/10 text-emerald-400 text-[10px] px-2.5 py-1 rounded-full border border-emerald-500/20 uppercase tracking-widest font-bold">
                Filtered
              </span>
            )}
          </div>
<AiReportCard/>
          <p className="text-sm text-slate-500 mt-1">
            Monitor civic complaints, department performance and resolution progress.
          </p>
        </div>

        <button
          onClick={() => fetchReports(true)}
          disabled={isRefreshing}
          className="self-start lg:self-auto inline-flex items-center gap-2 px-4 py-2.5 bg-[#18202d] border border-slate-700/60 hover:border-emerald-500/40 hover:bg-emerald-500/5 rounded-lg text-slate-300 hover:text-emerald-400 transition-colors disabled:opacity-50"
        >
          <RefreshCw
            className={`w-4 h-4 ${
              isRefreshing ? 'animate-spin' : ''
            }`}
          />

          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* =====================================================
          DEPARTMENT FILTER
      ===================================================== */}

      <div className="bg-[#111721] border border-slate-800/70 rounded-xl p-4">

        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-emerald-400" />

          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Department Filter
          </span>
        </div>

        <div className="flex flex-wrap gap-2">

          {/* ALL */}
          <button
            onClick={() => setSelectedDept('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
              selectedDept === 'all'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-[#18202d] text-slate-400 border-slate-700/60 hover:text-slate-200 hover:border-slate-600'
            }`}
          >
            All Departments
          </button>

          {/* DEPARTMENTS */}
          {departmentStats.map((department) => {
            const Icon = department.icon;

            return (
              <button
                key={department.id}
                onClick={() =>
                  setSelectedDept(department.id)
                }
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                  selectedDept === department.id
                    ? 'bg-slate-800 text-white border-slate-600'
                    : 'bg-[#18202d] text-slate-400 border-slate-700/60 hover:text-slate-200 hover:border-slate-600'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    selectedDept === department.id
                      ? department.textColor
                      : ''
                  }`}
                />

                {department.name}

                <span className="ml-1 text-[10px] bg-[#0d1219] px-1.5 py-0.5 rounded text-slate-500">
                  {department.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* =====================================================
          STAT CARDS
      ===================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

        {/* TOTAL */}
        <div className="bg-[#18202d] border-t-2 border-cyan-500 border-x border-b border-slate-700/40 rounded-xl p-5 shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <p className="text-sm font-medium text-slate-400">
              Total Reports
            </p>

            <div className="p-2.5 bg-cyan-500/10 rounded-lg">
              <ClipboardList className="w-5 h-5 text-cyan-400" />
            </div>
          </div>

          <h3 className="text-4xl font-bold text-white">
            {stats.total}
          </h3>

          <p className="text-xs text-slate-500 mt-2">
            {selectedDept === 'all'
              ? 'Across all departments'
              : 'In selected department'}
          </p>
        </div>

        {/* IN PROCESS */}
        <div className="bg-[#18202d] border-t-2 border-orange-500 border-x border-b border-slate-700/40 rounded-xl p-5 shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <p className="text-sm font-medium text-slate-400">
              In Process
            </p>

            <div className="p-2.5 bg-orange-500/10 rounded-lg">
              <Clock className="w-5 h-5 text-orange-400" />
            </div>
          </div>

          <h3 className="text-4xl font-bold text-white">
            {stats.inProcess}
          </h3>

          <p className="text-xs text-slate-500 mt-2">
            Currently being handled
          </p>
        </div>

        {/* RESOLVED */}
        <div className="bg-[#18202d] border-t-2 border-emerald-500 border-x border-b border-slate-700/40 rounded-xl p-5 shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <p className="text-sm font-medium text-slate-400">
              Resolved
            </p>

            <div className="p-2.5 bg-emerald-500/10 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
          </div>

          <h3 className="text-4xl font-bold text-white">
            {stats.resolved}
          </h3>

          <p className="text-xs text-slate-500 mt-2">
            {resolutionPercentage}% resolution rate
          </p>
        </div>

        {/* CRITICAL */}
        <div className="bg-[#18202d] border-t-2 border-rose-500 border-x border-b border-slate-700/40 rounded-xl p-5 shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <p className="text-sm font-medium text-slate-400">
              Critical Issues
            </p>

            <div className="p-2.5 bg-rose-500/10 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            </div>
          </div>

          <h3 className="text-4xl font-bold text-white">
            {stats.critical}
          </h3>

          <p className="text-xs text-slate-500 mt-2">
            High priority pending
          </p>
        </div>
      </div>

      {/* =====================================================
          DEPARTMENT PERFORMANCE
      ===================================================== */}

      {selectedDept === 'all' && (
        <div className="bg-[#18202d] border border-slate-700/40 rounded-xl p-6 shadow-lg">

          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-white font-bold">
                Department Performance
              </h3>

              <p className="text-xs text-slate-400 mt-1">
                Report volume and resolution rate by department
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">

            {departmentStats.map((department) => {
              const Icon = department.icon;

              return (
                <button
                  key={department.id}
                  onClick={() =>
                    setSelectedDept(department.id)
                  }
                  className="text-left bg-[#111721] border border-slate-800/80 rounded-xl p-4 hover:border-slate-600 hover:bg-[#151d29] transition-all"
                >
                  <div className="flex items-center justify-between mb-4">

                    <div
                      className={`p-2 rounded-lg ${department.bgColor}/10`}
                    >
                      <Icon
                        className={`w-5 h-5 ${department.textColor}`}
                      />
                    </div>

                    <span className="text-xs text-slate-500">
                      {department.count} reports
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-white mb-2">
                    {department.name}
                  </h4>

                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-500">
                      Resolution
                    </span>

                    <span
                      className={`text-xs font-bold ${department.textColor}`}
                    >
                      {department.resolvedPercent}%
                    </span>
                  </div>

                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${department.resolvedPercent}%`,
                        backgroundColor: department.color,
                      }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* =====================================================
          CHARTS
      ===================================================== */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* ===================================================
            WEEKLY REPORTS
        =================================================== */}

        <div className="bg-[#18202d] border border-slate-700/40 rounded-xl p-6 shadow-lg">

          <div className="mb-6">
            <h3 className="text-white font-bold">
              Weekly Reports
            </h3>

            <p className="text-xs text-slate-400 mt-1">
              Submitted vs resolved across the week
            </p>
          </div>

          <div className="h-72 w-full">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <LineChart
                data={weeklyData}
                margin={{
                  top: 5,
                  right: 10,
                  left: -20,
                  bottom: 0,
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#2a3441"
                  vertical={false}
                />

                <XAxis
                  dataKey="name"
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />

                <YAxis
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111721',
                    borderColor: '#334155',
                    color: '#fff',
                    borderRadius: '8px',
                  }}
                  labelStyle={{
                    color: '#94a3b8',
                    marginBottom: '4px',
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="submitted"
                  stroke="#22d3ee"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{
                    r: 6,
                    fill: '#22d3ee',
                  }}
                  name="Submitted"
                />

                <Line
                  type="monotone"
                  dataKey="resolved"
                  stroke="#34d399"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{
                    r: 6,
                    fill: '#34d399',
                  }}
                  name="Resolved"
                />

              </LineChart>
            </ResponsiveContainer>

          </div>

          <div className="flex items-center justify-center gap-6 mt-4">

            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <span className="text-xs text-slate-400">
                Submitted
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="text-xs text-slate-400">
                Resolved
              </span>
            </div>

          </div>
        </div>

        {/* ===================================================
            MONTHLY TREND
        =================================================== */}

        <div className="bg-[#18202d] border border-slate-700/40 rounded-xl p-6 shadow-lg">

          <div className="mb-6">
            <h3 className="text-white font-bold">
              Monthly Trend
            </h3>

            <p className="text-xs text-slate-400 mt-1">
              Total reports for the last 6 months
            </p>
          </div>

          <div className="h-72 w-full">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={monthlyData}
                margin={{
                  top: 5,
                  right: 10,
                  left: -20,
                  bottom: 0,
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#2a3441"
                  vertical={false}
                />

                <XAxis
                  dataKey="name"
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />

                <YAxis
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />

                <Tooltip
                  cursor={{
                    fill: '#1f2937',
                  }}
                  contentStyle={{
                    backgroundColor: '#111721',
                    borderColor: '#334155',
                    color: '#fff',
                    borderRadius: '8px',
                  }}
                />

                <Bar
                  dataKey="reports"
                  radius={[5, 5, 0, 0]}
                  name="Total Reports"
                >
                  {monthlyData.map(
                    (entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          index ===
                          monthlyData.length - 1
                            ? '#34d399'
                            : '#1e3a5f'
                        }
                      />
                    )
                  )}
                </Bar>

              </BarChart>
            </ResponsiveContainer>

          </div>
        </div>
      </div>

      {/* =====================================================
          EMPTY STATE
      ===================================================== */}

      {activeReports.length === 0 && (
        <div className="bg-[#18202d] border border-slate-700/40 rounded-xl p-10 text-center">

          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center">
            <ClipboardList className="w-7 h-7 text-slate-500" />
          </div>

          <h3 className="text-white font-semibold mb-1">
            No Reports Found
          </h3>

          <p className="text-sm text-slate-500">
            There are no reports available for the selected department.
          </p>

          {selectedDept !== 'all' && (
            <button
              onClick={() => setSelectedDept('all')}
              className="mt-4 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium hover:bg-emerald-500/20 transition-colors"
            >
              View All Departments
            </button>
          )}
        </div>
      )}

    </div>
  );
}