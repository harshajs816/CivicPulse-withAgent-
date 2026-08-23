import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Building2, MapPin, Clock, CheckCircle2, AlertTriangle, 
  ChevronRight, Trash2, BellRing, FileText, Image as ImageIcon,
  Activity, Calendar
} from 'lucide-react';

export default function TrackReports() {
  const navigate = useNavigate();
  const [myReports, setMyReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // User auth and data fetch
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      setIsLoading(false);
      return; // Not logged in
    }

    const user = JSON.parse(userStr);
    setCurrentUser(user);
    const userId = user._id || user.id;

    const fetchMyReports = async () => {
      try {
        // Hum saari reports laa kar frontend pe filter kar rahe hain 
        // (Best practice: Backend pe '/api/reports/my-reports/:userId' route banayein)
        const res = await axios.get("http://localhost:5000/api/reports/all");
        if (res.data.success) {
          const userReports = res.data.reports.filter(
            report => report.reportedBy?.userId === userId
          );
          setMyReports(userReports);
        }
      } catch (error) {
        console.error("Error fetching track reports:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyReports();
  }, []);

  // Helper functions
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const calculateETA = (priority, createdAt) => {
    const date = new Date(createdAt);
    if (priority === 'high') date.setDate(date.getDate() + 2);
    else if (priority === 'medium') date.setDate(date.getDate() + 5);
    else date.setDate(date.getDate() + 10);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  };

  const handleWithdraw = async (reportId) => {
    if(window.confirm("Are you sure you want to withdraw this report? Authorities will keep it for records but won't take action.")) {
      try {
        // Backend API ko call karein status update karne ke liye
        await axios.put(`http://localhost:5000/api/reports/${reportId}/withdraw`);
        
        // UI mein report ko hatane ki jagah uska status update kar dein
        setMyReports(prev => prev.map(report => 
          report._id === reportId ? { ...report, status: 'Withdrawn' } : report
        ));
        
        alert("Report withdrawn successfully.");
      } catch (error) {
        console.error("Failed to withdraw:", error);
        alert("Failed to withdraw report. Please try again.");
      }
    }
  };

  const handleNudge = () => {
    alert("Authority has been nudged! A reminder notification has been sent.");
  };

  // Tracking Progress Logic
  const getProgressStep = (status) => {
    if (status === 'Resolved') return 4;
    if (status === 'In Progress') return 3;
    if (status === 'Pending') return 1; // 1 means Submitted, 2 means Viewed
    return 1;
  };

  return (
    <div className="min-h-screen bg-[#0d131f] text-slate-200 font-sans pb-24 selection:bg-emerald-500/30">
      
      {/* Navigation Bar */}
      <nav className="flex justify-between items-center max-w-7xl mx-auto pt-6 px-6 mb-8 border-b border-slate-800/50 pb-4">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-2xl tracking-tight cursor-pointer" onClick={() => navigate('/')}>
          <Building2 className="h-7 w-7 drop-shadow-[0_0_12px_rgba(52,211,153,0.6)]" />
          CivicPulse
        </div>
        <div className="hidden md:flex gap-8 text-sm font-medium text-slate-300 items-center">
          <span className="hover:text-white cursor-pointer transition-colors" onClick={() => navigate('/')}>Dashboard</span>
          <span className="hover:text-white cursor-pointer transition-colors" onClick={() => navigate('/community')}>Community</span>
          
          {/* Active Track Tab */}
          <div className="relative group cursor-pointer">
            <span className="bg-[#112a23] text-emerald-400 px-5 py-2.5 rounded-lg border border-[#1b3d33]">
              Track Reports
            </span>
            <div className="absolute -bottom-[18px] left-1/2 -translate-x-1/2 w-4 h-[3px] bg-emerald-400 rounded-t-full shadow-[0_0_8px_rgba(52,211,153,1)]"></div>
          </div>
          
          <span className="hover:text-white cursor-pointer transition-colors">About</span>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6">
        
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-white flex items-center gap-3 tracking-tight">
            <Activity className="w-8 h-8 text-emerald-400" /> My Report Tracking
          </h1>
          <p className="text-slate-400 text-lg">
            Monitor the real-time progress and resolution status of your submitted issues.
          </p>
        </div>

        {/* --- MAIN CONTENT --- */}
        {!currentUser ? (
          <div className="text-center py-20 bg-[#151c2c] rounded-2xl border border-slate-800">
            <AlertTriangle className="w-12 h-12 text-orange-400 mx-auto mb-4 opacity-80" />
            <h2 className="text-xl font-bold text-white mb-2">Authentication Required</h2>
            <p className="text-slate-400 mb-6">Please sign in to view and track your submitted reports.</p>
            <button onClick={() => navigate('/login')} className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-8 py-3 rounded-xl transition-all">
              Sign In Now
            </button>
          </div>
        ) : isLoading ? (
          <div className="text-center py-20 text-slate-400">Fetching your timeline...</div>
        ) : myReports.length === 0 ? (
          <div className="text-center py-20 bg-[#151c2c] rounded-2xl border border-slate-800 border-dashed">
            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">You haven't reported any issues yet.</p>
            <button onClick={() => navigate('/dashboard')} className="mt-4 text-emerald-400 hover:underline font-medium">
              Go to Dashboard to create one
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {myReports.map((report) => {
              const currentStep = getProgressStep(report.status);
              
              return (
                <div key={report._id} className="bg-[#1b2234] border border-slate-700/50 rounded-2xl p-6 transition-all shadow-lg overflow-hidden relative">
                  
                 {/* Decorative background glow */}
               <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] pointer-events-none opacity-20 -translate-y-1/2 translate-x-1/2
               ${report.status === 'Resolved' ? 'bg-emerald-500' : 
             report.status === 'In Progress' ? 'bg-orange-500' : 
            report.status === 'Withdrawn' ? 'bg-slate-600' : 'bg-cyan-500'}`}>
              </div>

                  {/* Header Row */}
                  <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-6 relative z-10">
                    <div className="flex gap-4">
                      {/* Thumbnail if image exists */}
                      {report.image ? (
                        <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-slate-700">
                          <img src={report.image} alt="Report" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-xl bg-[#151c2c] shrink-0 border border-slate-700 flex flex-col items-center justify-center text-slate-600">
                           <ImageIcon className="w-6 h-6 mb-1" />
                           <span className="text-[9px] uppercase tracking-wider">No Image</span>
                        </div>
                      )}
                      
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                            {report.category}
                          </span>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {formatDate(report.createdAt)}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-1">{report.title}</h3>
                        <p className="text-sm text-slate-400 flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-cyan-400" /> {report.locationName}
                        </p>
                      </div>
                    </div>

                    {/* Report ID & ETA */}
                    <div className="bg-[#151c2c] border border-slate-700/50 p-3 rounded-xl text-right shrink-0 min-w-[140px]">
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Ticket ID</p>
                      <p className="text-sm font-mono text-emerald-400 mb-3">#{report._id.slice(-6).toUpperCase()}</p>
                      
                      {report.status !== 'Resolved' && (
                        <>
                          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Expected By</p>
                          <p className="text-sm font-semibold text-white flex items-center justify-end gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-orange-400" /> {calculateETA(report.priority, report.createdAt)}
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* VISUAL TRACKING TIMELINE */}
                   
                   {report.status === 'Withdrawn' ? (
                 <div className="py-6 text-center border-y border-slate-700/50 my-2 bg-slate-800/20 rounded-lg">
                   <p className="text-slate-400 font-medium text-sm flex items-center justify-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> This report was withdrawn by you and is closed.
                    </p>
                 </div>
                 ) : (
                  <div className="relative pt-4 pb-2 z-10">
                <div className="relative pt-4 pb-2 z-10">
                    <div className="absolute top-7 left-0 w-full h-1 bg-slate-800 rounded-full"></div>
                    <div 
                      className={`absolute top-7 left-0 h-1 rounded-full transition-all duration-1000 
                        ${report.status === 'Resolved' ? 'bg-emerald-500 w-full' : 
                          report.status === 'In Progress' ? 'bg-orange-500 w-[66%]' : 'bg-cyan-500 w-[33%]'}`}
                    ></div>

                    <div className="flex justify-between relative">
                      
                      {/* Step 1: Submitted */}
                      <div className="flex flex-col items-center gap-2 relative">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center z-10 border-4 border-[#1b2234] 
                          ${currentStep >= 1 ? 'bg-cyan-500 text-slate-900 shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'bg-slate-700 text-slate-400'}`}>
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <span className={`text-[11px] font-bold uppercase tracking-wider ${currentStep >= 1 ? 'text-white' : 'text-slate-500'}`}>Submitted</span>
                      </div>

                      {/* Step 2: Under Review */}
                      <div className="flex flex-col items-center gap-2 relative">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center z-10 border-4 border-[#1b2234] 
                          ${currentStep >= 2 ? 'bg-cyan-500 text-slate-900 shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'bg-slate-800 text-slate-500'}`}>
                          {currentStep >= 2 ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-2 h-2 bg-slate-500 rounded-full"></div>}
                        </div>
                        <span className={`text-[11px] font-bold uppercase tracking-wider ${currentStep >= 2 ? 'text-white' : 'text-slate-500'}`}>Under Review</span>
                      </div>

                      {/* Step 3: Action Taken */}
                      <div className="flex flex-col items-center gap-2 relative">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center z-10 border-4 border-[#1b2234] 
                          ${currentStep >= 3 ? 'bg-orange-500 text-slate-900 shadow-[0_0_10px_rgba(249,115,22,0.5)]' : 'bg-slate-800 text-slate-500'}`}>
                          {currentStep >= 3 ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-2 h-2 bg-slate-500 rounded-full"></div>}
                        </div>
                        <span className={`text-[11px] font-bold uppercase tracking-wider ${currentStep >= 3 ? 'text-white' : 'text-slate-500'}`}>In Progress</span>
                      </div>

                      {/* Step 4: Resolved */}
                      <div className="flex flex-col items-center gap-2 relative">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center z-10 border-4 border-[#1b2234] 
                          ${currentStep >= 4 ? 'bg-emerald-500 text-slate-900 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-slate-800 text-slate-500'}`}>
                          {currentStep >= 4 ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-2 h-2 bg-slate-500 rounded-full"></div>}
                        </div>
                        <span className={`text-[11px] font-bold uppercase tracking-wider ${currentStep >= 4 ? 'text-emerald-400' : 'text-slate-500'}`}>Resolved</span>
                      </div>

                    </div>
                  </div>
                  </div>
                  )}


                  {/* Actions Footer */}
                  <div className="mt-6 pt-4 border-t border-slate-700/50 flex justify-between items-center z-10 relative">
                    {report.status === 'Pending' ? (
                      <button onClick={() => handleWithdraw(report._id)} className="text-xs font-medium text-slate-400 hover:text-rose-400 flex items-center gap-1.5 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" /> Withdraw Report
                      </button>
                    ) : (
                      <span className="text-xs text-slate-500 italic">Report is locked for processing</span>
                    )}

                    <div className="flex gap-3">
                      {report.priority === 'high' && report.status === 'Pending' && (
                        <button onClick={handleNudge} className="flex items-center gap-1.5 text-xs font-bold text-orange-400 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 px-3 py-1.5 rounded-lg transition-all">
                          <BellRing className="w-3.5 h-3.5" /> Nudge Authority
                        </button>
                      )}
                      <button className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 px-3 py-1.5 rounded-lg transition-all">
                        View Details <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}