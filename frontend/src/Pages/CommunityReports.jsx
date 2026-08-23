import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Building2, Users, Plus, Search, Tag, Flag, AlertTriangle, 
  ArrowUpDown, RotateCcw, LayoutGrid, List as ListIcon, 
  MapPin, Clock, CheckCircle2, Droplets, Map, Trash2, Lightbulb,
  ThumbsUp, ThumbsDown, MessageSquare, Share2,ChevronDown
} from 'lucide-react';

// Time formatting helper ("8 hours ago")
const getTimeAgo = (dateString) => {
  if (!dateString) return 'Recently';
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} days ago`;
};

// Category Icon Helper
const getCategoryIcon = (cat) => {
  const category = cat?.toLowerCase();
  if (category?.includes('water')) return <Droplets className="w-3.5 h-3.5" />;
  if (category?.includes('pothole') || category?.includes('road')) return <Map className="w-3.5 h-3.5" />;
  if (category?.includes('light')) return <Lightbulb className="w-3.5 h-3.5" />;
  if (category?.includes('garbage')) return <Trash2 className="w-3.5 h-3.5" />;
  return <Tag className="w-3.5 h-3.5" />;
};

export default function CommunityReports() {
  const navigate = useNavigate();


  const [activeCommentSection, setActiveCommentSection] = useState(null); // Kis post ka comment section khula hai
  const [commentInputs, setCommentInputs] = useState({}); // Comments type karne ke liye state

  // Get current logged-in user from localStorage
  const getCurrentUser = () => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  };

  // --- DYNAMIC INTERACTION HANDLERS ---
  const handleInteraction = async (reportId, action) => {
    const user = getCurrentUser();
    if (!user) return alert("Please login to interact!");

    try {
      const res = await axios.post(`http://localhost:5000/api/reports/${reportId}/interact`, {
        action, // 'like' or 'dislike'
        userId: user._id || user.id
      });

      if (res.data.success) {
        // State update bina page refresh kiye
        setReports(prev => prev.map(report => 
          report._id === reportId 
            ? { ...report, likes: res.data.likes, dislikes: res.data.dislikes }
            : report
        ));
      }
    } catch (error) {
      console.error("Interaction failed:", error);
    }
  };

  const handleCommentSubmit = async (reportId) => {
    const user = getCurrentUser();
    if (!user) return alert("Please login to comment!");

    const text = commentInputs[reportId];
    if (!text || text.trim() === "") return;

    try {
      const res = await axios.post(`http://localhost:5000/api/reports/${reportId}/comment`, {
        userId: user._id || user.id,
        name: user.name || user.username || "Citizen",
        text: text
      });

      if (res.data.success) {
        // UI update with new comments
        setReports(prev => prev.map(report => 
          report._id === reportId 
            ? { ...report, comments: res.data.comments }
            : report
        ));
        // Clear input
        setCommentInputs(prev => ({ ...prev, [reportId]: '' }));
      }
    } catch (error) {
      console.error("Comment failed:", error);
    }
  };

  // --- STATE MANAGEMENT ---
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); 

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: 'all',
    status: 'all',
    priority: 'all',
    sortBy: 'newest'
  });

  // --- FETCH DATA FROM BACKEND ---
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/reports/all");
        if (res.data.success) {
          setReports(res.data.reports);
          setFilteredReports(res.data.reports);
        }
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReports();
  }, []);

  // --- FILTERING & SORTING LOGIC ---
  useEffect(() => {
    let result = [...reports];

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(report => 
        report.title?.toLowerCase().includes(lowerQuery) ||
        report.description?.toLowerCase().includes(lowerQuery) ||
        report.locationName?.toLowerCase().includes(lowerQuery)
      );
    }

    if (filters.category !== 'all') {
      result = result.filter(report => report.category === filters.category);
    }

    if (filters.status !== 'all') {
      result = result.filter(report => report.status === filters.status);
    }

    if (filters.priority !== 'all') {
      result = result.filter(report => report.priority === filters.priority);
    }

    switch (filters.sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'priority-high':
        const priorityWeight = { high: 3, medium: 2, low: 1 };
        result.sort((a, b) => (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0));
        break;
      default:
        break;
    }

    setFilteredReports(result);
  }, [reports, searchQuery, filters]);

  // --- HANDLERS ---
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setSearchQuery('');
    setFilters({ category: 'all', status: 'all', priority: 'all', sortBy: 'newest' });
  };

  const activeIssues = reports.filter(r => r.status === 'Pending' || r.status === 'In Progress').length;
  const resolvedIssues = reports.filter(r => r.status === 'Resolved').length;

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
          <div className="relative group cursor-pointer">
            <span className="bg-[#112a23] text-emerald-400 px-5 py-2.5 rounded-lg border border-[#1b3d33]">
              Community
            </span>
            <div className="absolute -bottom-[18px] left-1/2 -translate-x-1/2 w-4 h-[3px] bg-emerald-400 rounded-t-full shadow-[0_0_8px_rgba(52,211,153,1)]"></div>
          </div>
          <span onClick={() => navigate("/track-reports")}  className="hover:text-white cursor-pointer transition-colors">Track Reports</span>
          <span className="hover:text-white cursor-pointer transition-colors">About</span>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header & Stats */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-bold mb-3 text-white flex items-center gap-3 tracking-tight">
              <Users className="w-10 h-10 text-emerald-400" /> Community Reports
            </h1>
            <p className="text-slate-400 text-lg">
              Browse and track civic issues reported by your community
            </p>

            <div className="flex gap-10 mt-8">
              <div className="text-center">
                <p className="text-4xl font-bold text-emerald-400 mb-1">{reports.length}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Reports</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-emerald-400 mb-1">{activeIssues}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Issues</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-emerald-400 mb-1">{resolvedIssues}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Resolved</p>
              </div>
            </div>
          </div>
          
          <button onClick={() => navigate('/')} className="bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-bold rounded-xl px-6 py-3 flex items-center gap-2 shadow-[0_0_20px_rgba(52,211,153,0.3)] transition-all">
            <Plus className="w-5 h-5 stroke-[2.5px]" /> New Report
          </button>
        </div>

        {/* --- FILTERS SECTION --- */}
        <div className="bg-[#151c2c] border border-slate-800/80 rounded-2xl p-6 shadow-lg mb-6">
          
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search reports by title, description, or location..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1b2234] border border-slate-700/60 rounded-xl pl-12 pr-4 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-inner"
            />
          </div>

          <div className="flex flex-wrap items-end gap-4">
            
            <div className="flex-1 min-w-[160px]">
              <label className="flex items-center gap-1.5 text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-2">
                <Tag className="w-3.5 h-3.5 text-emerald-400" /> Category
              </label>
              <div className="relative">
                <select value={filters.category} onChange={(e) => handleFilterChange('category', e.target.value)} className="w-full bg-[#1b2234] border border-slate-700/60 rounded-lg px-4 py-3 text-sm text-slate-200 cursor-pointer appearance-none">
                  <option value="all">All Categories</option>
                  <option value="pothole">Pothole / Road Damage</option>
                  <option value="streetlight">Streetlight Outage</option>
                  <option value="water">Water Leakage</option>
                  <option value="garbage">Garbage / Waste</option>
                </select>
                <ChevronDown className="absolute right-4 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="flex-1 min-w-[160px]">
              <label className="flex items-center gap-1.5 text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-2">
                <Flag className="w-3.5 h-3.5 text-emerald-400" /> Status
              </label>
              <div className="relative">
                <select value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)} className="w-full bg-[#1b2234] border border-slate-700/60 rounded-lg px-4 py-3 text-sm text-slate-200 cursor-pointer appearance-none">
                  <option value="all">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
                <ChevronDown className="absolute right-4 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="flex-1 min-w-[160px]">
              <label className="flex items-center gap-1.5 text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-2">
                <AlertTriangle className="w-3.5 h-3.5 text-emerald-400" /> Priority
              </label>
              <div className="relative">
                <select value={filters.priority} onChange={(e) => handleFilterChange('priority', e.target.value)} className="w-full bg-[#1b2234] border border-slate-700/60 rounded-lg px-4 py-3 text-sm text-slate-200 cursor-pointer appearance-none">
                  <option value="all">All Priorities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <ChevronDown className="absolute right-4 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="flex-1 min-w-[160px]">
              <label className="flex items-center gap-1.5 text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-2">
                <ArrowUpDown className="w-3.5 h-3.5 text-emerald-400" /> Sort By
              </label>
              <div className="relative">
                <select value={filters.sortBy} onChange={(e) => handleFilterChange('sortBy', e.target.value)} className="w-full bg-[#1b2234] border border-slate-700/60 rounded-lg px-4 py-3 text-sm text-slate-200 cursor-pointer appearance-none">
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="priority-high">Highest Priority</option>
                </select>
                <ChevronDown className="absolute right-4 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <button onClick={resetFilters} className="flex items-center gap-2 bg-[#2d1b1b] hover:bg-[#3d2424] text-rose-400 border border-rose-900/50 rounded-lg px-5 py-3 text-sm font-medium transition-colors h-[46px]">
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
          </div>
        </div>

        {/* View Toggle & Count */}
        <div className="bg-[#151c2c] border border-slate-800/80 rounded-xl p-3 flex justify-between items-center mb-6 shadow-lg">
          <p className="text-sm text-slate-400 ml-3">
            Showing all <span className="text-emerald-400 font-bold">{filteredReports.length}</span> reports
          </p>
          <div className="flex bg-[#1b2234] rounded-lg p-1 border border-slate-700/50">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-[#112a23] text-emerald-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-[#112a23] text-emerald-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <ListIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

              {/* --- PREMIUM CARDS DISPLAY --- */}
           {isLoading ? (
          <div className="text-center py-20 text-slate-400">
            Loading reports...
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="text-center py-20 bg-[#151c2c] rounded-2xl border border-slate-800 border-dashed">
            <p className="text-slate-400">
              No reports found matching your filters.
            </p>

            <button
              onClick={resetFilters}
              className="mt-4 text-emerald-400 hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 gap-6'
                : 'flex flex-col gap-6'
            }
          >
            {filteredReports.map((report) => {
              const currentUser = getCurrentUser();
              const currentUserId = currentUser?._id || currentUser?.id;

              const likes = report.likes || [];
              const dislikes = report.dislikes || [];
              const comments = report.comments || [];

              const hasLiked =
                currentUserId && likes.includes(currentUserId);

              const hasDisliked =
                currentUserId && dislikes.includes(currentUserId);

              return (
                <div key={report._id} className="bg-[#1b2234] border border-slate-700/50 hover:border-slate-600 rounded-xl p-5 flex flex-col gap-4 transition-all hover:shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
                  
                  {/* Top Row: Category & Status */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                      {getCategoryIcon(report.category)}
                      {report.category}
                    </div>
                    
                    <div className={`px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-wider
                      ${report.status === 'Resolved' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 
                        report.status === 'In Progress' ? 'border-orange-500/30 bg-orange-500/10 text-orange-400' : 
                        'border-rose-500/30 bg-rose-500/10 text-rose-400'}`}>
                      {report.status || 'Pending'}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-[17px] font-bold text-white mb-2 leading-tight">{report.title}</h3>
                    <p className="text-[13px] text-slate-300 line-clamp-2 leading-relaxed">
                      {report.description}
                    </p>
                  </div>

                  {/* NAYA BLOCK: IMAGE DISPLAY */}
               {report.image && (
                <div className="w-full h-48 mt-3 mb-2 rounded-lg overflow-hidden border border-slate-700/50">
                <img 
                 src={report.image} 
                 alt="Issue evidence" 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" 
                 />
               </div>
               )} 

                  {/* Location */}
                  <div className="flex items-center gap-2 text-sm text-slate-400 font-medium">
                    <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span className="truncate">{report.locationName}</span>
                  </div>

                  {/* Priority & Time Row */}
                  <div className="flex justify-between items-center mt-1">
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-wider
                      ${report.priority === 'high' ? 'border-rose-500/30 bg-rose-500/10 text-rose-500' : 
                        report.priority === 'medium' ? 'border-orange-500/30 bg-orange-500/10 text-orange-400' : 
                        'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'}`}>
                      <AlertTriangle className="w-3 h-3" />
                      {report.priority === 'high' ? 'Urgent Priority' : `${report.priority} Priority`}
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-cyan-400">
                      <Clock className="w-3.5 h-3.5" />
                      {getTimeAgo(report.createdAt)}
                    </div>
                  </div>

                  {/* Action Row (Likes, Comments, Share) */}
                  <div className="flex justify-between items-center pt-4 mt-2 border-t border-slate-700/50">
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleInteraction(report._id, hasLiked ? 'none' : 'like')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-medium transition-colors ${
                          hasLiked ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400' : 'border-slate-700 bg-slate-800/40 hover:bg-slate-700/80 text-slate-300'
                        }`}
                      >
                        <ThumbsUp className={`w-3.5 h-3.5 ${hasLiked ? 'fill-current' : ''}`} />
                        {likes.length}
                      </button>

                      <button
                        onClick={() => handleInteraction(report._id, hasDisliked ? 'none' : 'dislike')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-medium transition-colors ${
                          hasDisliked ? 'border-rose-500 bg-rose-500/20 text-rose-400' : 'border-slate-700 bg-slate-800/40 hover:bg-slate-700/80 text-slate-300'
                        }`}
                      >
                        <ThumbsDown className={`w-3.5 h-3.5 ${hasDisliked ? 'fill-current' : ''}`} />
                        {dislikes.length}
                      </button>

                      <button
                        onClick={() => setActiveCommentSection(activeCommentSection === report._id ? null : report._id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-medium transition-colors ${
                          activeCommentSection === report._id ? 'border-cyan-500 bg-cyan-500/20 text-cyan-400' : 'border-slate-700 bg-slate-800/40 hover:bg-slate-700/80 text-slate-300'
                        }`}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        {comments.length}
                      </button>
                    </div>

                    <button className="flex items-center justify-center p-1.5 rounded-md border border-slate-700 bg-slate-800/40 hover:bg-slate-700/80 text-slate-300 transition-colors">
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Expandable Comment Section */}
                  {activeCommentSection === report._id && (
                    <div className="mt-2 pt-4 border-t border-slate-700/50">
                      <div className="flex flex-col gap-3 max-h-40 overflow-y-auto mb-4 pr-2">
                        {comments.length === 0 ? (
                          <p className="text-xs text-slate-500 italic text-center py-2">
                            No comments yet. Be the first!
                          </p>
                        ) : (
                          comments.map((c, idx) => (
                            <div key={idx} className="bg-[#151c2c] p-3 rounded-lg border border-slate-800">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-bold text-cyan-400">{c.name}</span>
                                <span className="text-[10px] text-slate-500">{getTimeAgo(c.createdAt)}</span>
                              </div>
                              <p className="text-xs text-slate-300">{c.text}</p>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Add a comment..."
                          value={commentInputs[report._id] || ''}
                          onChange={(e) =>
                            setCommentInputs((prev) => ({
                              ...prev,
                              [report._id]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit(report._id)}
                          className="flex-1 bg-[#151c2c] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                        />
                        <button
                          onClick={() => handleCommentSubmit(report._id)}
                          className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 px-3 py-2 rounded-lg text-xs font-bold transition-colors"
                        >
                          Post
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>  
  );
}
