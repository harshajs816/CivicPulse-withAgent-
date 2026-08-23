import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import axios from 'axios'; 
import { 
  ClipboardList, Clock, CheckCircle2, MapPin, Plus, LogIn,
  Building2, AlertTriangle, Droplets, X, Navigation,
  UploadCloud, ChevronDown, Loader2, Image as ImageIcon, User,Trash2,LogOut
} from 'lucide-react';

import { Card, CardContent } from "@/components/ui/card"; 
import { Button } from "@/components/ui/button";

// --- MAP IMPORTS ---
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Leaflet Marker Icon Fix (using CDN to avoid bundler image issues)
const defaultIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

export default function CivicPulseDashboard() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate(); 

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    priority: '',
    locationName: '',
    coordinates: { lat: null, lng: null },
    description: '',
    image: ''
  });
  const [locLoading, setLocLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportsList, setReportsList] = useState([]); // Database se reports store karne ke liye

  // 1. Fetch User & Reports on Load
  useEffect(() => {
    // User fetch
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUserData(JSON.parse(storedUser));
      } catch (e) {
        setUserData({ name: storedUser });
      }
    }

    // Reports fetch
    const fetchReports = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/reports/all");
        if (res.data.success) {
          setReportsList(res.data.reports);
        }
      } catch (error) {
        console.error("Error fetching reports", error);
      }
    };
    fetchReports();
  }, []);

  // handel image 
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit check
        alert("File size should be less than 5MB");
        return;
      }
      
      const reader = new FileReader();
      reader.readAsDataURL(file); // Image ko Base64 string me convert karega
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result }));
      };
    }
  };
  // 2. Form Handlers
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const fetchLocationAndAddress = () => {
    if (!("geolocation" in navigator)) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        try {
          const res = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          );
          const placeName = res.data.display_name;
          setFormData(prev => ({
            ...prev,
            locationName: placeName,
            coordinates: { lat, lng }
          }));
        } catch (error) {
          setFormData(prev => ({
            ...prev,
            locationName: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
            coordinates: { lat, lng }
          }));
        } finally {
          setLocLoading(false);
        }
      },
      (error) => {
        alert("Please allow location access");
        setLocLoading(false);
      }
    );
  };

  // Logout Function
  const handleLogout = () => {
    if(window.confirm("Are you sure you want to log out?")) {
    
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      
      // 2. State ko null karein taaki UI update ho jaye
      setUserData(null);
       navigate('/')
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // MANUAL VALIDATION
    if (!formData.title || !formData.category || !formData.priority || !formData.locationName || !formData.description) {
      alert("Please fill all the required fields!");
      return; 
    }
    if (!formData.coordinates.lat) {
      alert("Please click the location button to fetch your coordinates!");
      return;
    }

    setIsSubmitting(true);

    try {
      const storedUserStr = localStorage.getItem("user");
      if (!storedUserStr) {
        alert("Please login first to submit a report.");
        setIsSubmitting(false);
        return;
      }

      const user = JSON.parse(storedUserStr);
      const payload = {
        ...formData,
        reportedBy: {
          userId: user._id || user.id, 
          name: user.name || user.username || "Unknown Citizen",
          email: user.email || ""
        }
      };

      const token = localStorage.getItem("token");
      const response = await axios.post("http://localhost:5000/api/reports/create", payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        alert("Report successfully submitted!");
        
        // Instant Map & Feed Update
        setReportsList(prev => [response.data.report, ...prev]);

        setFormData({
          title: '', category: '', priority: '', locationName: '',
          coordinates: { lat: null, lng: null }, description: ''
        });
        setIsDialogOpen(false); 
      }
    } catch (error) {
      console.error(error);
      alert("Failed to submit report. Ensure backend is running!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClick = () => {
    const user = localStorage.getItem("user");
    if (user) {
      setIsDialogOpen(true);
    } else {
      navigate("/register"); 
    }
  };
  
  return (
    <div className="min-h-screen bg-[#0d131f] text-slate-200 font-sans p-6 pb-24 relative">
        
        {/* Navigation Bar */}
        <nav className="flex justify-between items-center mb-12 max-w-7xl mx-auto pt-4">
           <div className="flex items-center gap-2 text-emerald-400 font-bold text-2xl tracking-tight">
             <Building2 className="h-7 w-7 drop-shadow-[0_0_12px_rgba(52,211,153,0.6)]" />
             CivicPulse
           </div>

           <div className="hidden md:flex gap-8 text-sm font-medium text-slate-300 items-center">
             <div className="relative group cursor-pointer">
               <span className="bg-[#112a23] text-emerald-400 px-5 py-2.5 rounded-lg border border-[#1b3d33]">
                 Dashboard
               </span>
               <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-[2px] bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,1)]"></div>
             </div>
             <span onClick={() => navigate("/community")} className="hover:text-white cursor-pointer transition-colors">Community</span>
             <span  onClick={() => navigate("/track-reports")}  className="hover:text-white cursor-pointer transition-colors">Track Reports</span>
             <span className="hover:text-white cursor-pointer transition-colors">About</span>
           </div>

          
          {/* Auth Section */}
           {userData ? (
             <div className="flex items-center gap-3">
               {/* User Profile Badge */}
               <div className="flex items-center gap-3 bg-[#151c2c] py-2 px-4 rounded-lg border border-slate-800 shadow-sm">
                 <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/50">
                   <User className="w-4 h-4" />
                 </div>
                 <span className="text-sm font-semibold text-white">
                   {userData.name || userData.username || 'User'}
                 </span>
               </div>
               
               {/* Logout Button */}
               <button 
                 onClick={handleLogout}
                 className="p-2.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/30 hover:border-rose-500/50 transition-all shadow-sm"
                 title="Log Out"
               >
                 <LogOut className="w-4 h-4 stroke-[2.5px]" />
               </button>
             </div>
           ) : (
             <Button 
               onClick={() => navigate('/login')} 
               className="bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-bold rounded-lg px-6 flex items-center gap-2 transition-all border-none"
             >
               <LogIn className="w-4 h-4 stroke-[2.5px]" /> Sign In
             </Button>
           )}
        </nav>

        <div className="max-w-7xl mx-auto">
            <div className="mb-10">
              <h1 className="text-4xl md:text-[42px] font-semibold mb-3 text-white tracking-tight">
                Your Community Insights
              </h1>
              <p className="text-slate-400 text-lg">
                Track and report issues in your neighborhood
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
               <Card className="bg-[#151c2c] border-y border-r border-slate-800/80 border-l-[3px] border-l-cyan-400 rounded-xl shadow-lg">
                 <CardContent className="p-7">
                    <p className="text-xs font-bold text-slate-400 mb-5 tracking-widest uppercase">Total Reports</p>
                    <div className="flex items-center gap-6">
                       <div className="text-cyan-400 drop-shadow-[0_0_18px_rgba(34,211,238,0.8)]">
                         <ClipboardList className="h-10 w-10 stroke-[2px]" />
                       </div>
                       <span className="text-5xl font-bold text-white">{reportsList.length || 0}</span>
                    </div>
                 </CardContent>
               </Card>
               <Card className="bg-[#151c2c] border-y border-r border-slate-800/80 border-l-[3px] border-l-orange-500 rounded-xl shadow-lg">
                 <CardContent className="p-7">
                    <p className="text-xs font-bold text-slate-400 mb-5 tracking-widest uppercase">In Process</p>
                    <div className="flex items-center gap-6">
                       <div className="text-orange-500 drop-shadow-[0_0_18px_rgba(249,115,22,0.8)]">
                         <Clock className="h-10 w-10 stroke-[2px]" />
                       </div>
                       <span className="text-5xl font-bold text-white">{reportsList.filter(r => r.status === 'In Progress').length || 0}</span>
                    </div>
                 </CardContent>
               </Card>
               <Card className="bg-[#151c2c] border-y border-r border-slate-800/80 border-l-[3px] border-l-emerald-400 rounded-xl shadow-lg">
                 <CardContent className="p-7">
                    <p className="text-xs font-bold text-slate-400 mb-5 tracking-widest uppercase">Resolved</p>
                    <div className="flex items-center gap-6">
                       <div className="text-emerald-400 drop-shadow-[0_0_18px_rgba(52,211,153,0.8)]">
                         <CheckCircle2 className="h-10 w-10 stroke-[2px]" />
                       </div>
                       <span className="text-5xl font-bold text-white">{reportsList.filter(r => r.status === 'Resolved').length || 0}</span>
                    </div>
                 </CardContent>
               </Card>
            </div>

            {/* Map and Activity Feed Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               
               {/* Map Container */}
               <div className="lg:col-span-2 flex flex-col gap-4">
                 <div className="bg-[#151c2c] rounded-xl border border-slate-800/80 p-5 shadow-lg">
                   <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                     <MapPin className="text-emerald-400 w-5 h-5"/> Live Issue Locations
                   </h2>
                   
                   {/* React Leaflet Map */}
                   <div className="w-full h-[400px] rounded-lg border border-slate-700/50 relative overflow-hidden z-0">
                      <MapContainer 
                        center={[27.1767, 78.0081]} // Initial Center (Agra as default)
                        zoom={11} 
                        style={{ height: '100%', width: '100%', backgroundColor: '#090d14' }}
                      >
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          attribution='&copy; OpenStreetMap contributors'
                        />
                        
                        {/* Loop through reports to create pins */}
                        {reportsList.map((report) => (
                          report.coordinates && report.coordinates.lat ? (
                            <Marker 
                              key={report._id || Math.random()} 
                              position={[report.coordinates.lat, report.coordinates.lng]}
                              icon={defaultIcon}
                            >
                              <Popup className="custom-popup">
                                <div className="p-1 min-w-[150px]">
                                  <h3 className="font-bold text-slate-800 text-sm mb-1">{report.title}</h3>
                                  <p className="text-xs text-slate-500 font-medium border-b pb-1 mb-1">
                                    <span className="text-emerald-600">{report.category.toUpperCase()}</span> • Priority: {report.priority}
                                  </p>
                                  <p className="text-xs text-slate-700 mt-1 line-clamp-2">{report.description}</p>
                                  <p className="text-[10px] text-slate-400 mt-2 font-semibold italic">Reported By: {report.reportedBy?.name || 'Citizen'}</p>
                                </div>
                              </Popup>
                            </Marker>
                          ) : null
                        ))}
                      </MapContainer>
                   </div>
                 </div>
                 
                 {/* Map Legend */}
                 <div className="bg-[#151c2c] rounded-xl border border-slate-800/80 p-4 shadow-lg flex justify-center gap-8">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]"></div>
                      <span className="text-sm text-slate-300 font-medium">Pending</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)]"></div>
                      <span className="text-sm text-slate-300 font-medium">In Progress</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]"></div>
                      <span className="text-sm text-slate-300 font-medium">Resolved</span>
                    </div>
                 </div>
               </div>

               {/* Dynamic Recent Activity Timeline */}
               <div className="bg-[#151c2c] rounded-xl border border-slate-800/80 p-6 shadow-lg flex flex-col h-full">
                 <h2 className="text-lg font-semibold text-white mb-6">Recent Activity</h2>
                 <div className="flex-1 border-r-2 border-emerald-900/50 pr-4 space-y-8 relative overflow-y-auto custom-scrollbar max-h-[460px]">
                    
                    {reportsList.length === 0 ? (
                       <p className="text-slate-400 text-sm text-center mt-10">No recent reports found.</p>
                    ) : (
                      reportsList.slice(0, 5).map((report, idx) => (
                        <div className="flex gap-4" key={idx}>
                          <div className="shrink-0 w-10 h-10 rounded-full bg-cyan-900/40 flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.15)] mt-1">
                            {report.status === 'Resolved' ? (
                              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                            ) : report.status === 'In Progress' ? (
                              <Clock className="h-5 w-5 text-orange-500" />
                            ) : (
                              <AlertTriangle className="h-5 w-5 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                            )}
                          </div>
                          <div>
                            <h3 className="text-white font-semibold text-sm capitalize">{report.title} - {report.status || 'Pending'}</h3>
                            <p className="text-xs text-slate-400 mt-1.5">{report.locationName}</p>
                            <p className="text-[10px] text-emerald-400 mt-1.5 font-medium">Reported by {report.reportedBy?.name || 'Citizen'}</p>
                          </div>
                        </div>
                      ))
                    )}
                    
                 </div>
               </div>
            </div>
        </div>

        {/* Floating Action Button (+ REPORT ISSUE) */}
        <Button onClick={handleClick} className="fixed bottom-8 right-8 bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-bold rounded-full px-6 py-6 shadow-[0_4px_14px_rgba(52,211,153,0.4)] flex items-center gap-2 text-sm uppercase tracking-wide z-40 border-none">
          <Plus className="h-5 w-5 stroke-[2.5px]" /> Report Issue
        </Button>

        {/* --- MODAL DIALOG PORTION --- */}
        {isDialogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 transition-all duration-300">
            <div className="bg-[#0f1523] border border-slate-700/60 w-full max-w-lg rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              
              <div className="flex justify-between items-center px-6 py-5 border-b border-slate-800/80 bg-gradient-to-r from-[#0f1523] to-[#151e2e]">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                    <span className="bg-emerald-500/20 text-emerald-400 p-1.5 rounded-lg border border-emerald-500/30">
                      <UploadCloud className="w-5 h-5" />
                    </span>
                    Submit New Report
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Help us improve your neighborhood</p>
                </div>
                <button 
                  onClick={() => setIsDialogOpen(false)} 
                  className="text-slate-400 hover:text-white hover:bg-slate-800 p-2 rounded-full transition-all border-none"
                >
                  <X className="w-5 h-5 stroke-[2.5px]" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="flex flex-col" noValidate>
                <div className="p-6 space-y-5 overflow-y-auto max-h-[65vh] custom-scrollbar">
                  
                  {/* Title */}
                  <div className="group">
                    <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-2 group-focus-within:text-cyan-400 transition-colors">Report Title</label>
                    <input 
                      type="text" 
                      name="title"
                      value={formData.title} 
                      onChange={handleChange} 
                      required
                      placeholder="e.g., Deep Pothole on Main Street" 
                      className="w-full bg-[#1b2234] border border-slate-700/60 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all shadow-inner" 
                    />
                  </div>
                  
                  {/* Category & Priority Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="group">
                      <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-2 group-focus-within:text-cyan-400 transition-colors">Category</label>
                      <div className="relative">
                        <select 
                         name="category" 
                         value={formData.category} 
                         onChange={handleChange} 
                         required 
                         className="w-full bg-[#1b2234] border border-slate-700/60 rounded-xl px-4 py-3 text-sm text-slate-200 cursor-pointer appearance-none"
                        >
                           <option value="" disabled>Select issue...</option> 
                           <option value="pothole">Pothole / Road Damage</option>
                           <option value="streetlight">Streetlight Outage</option>
                           <option value="water">Water Leakage</option>
                           <option value="garbage">Garbage / Waste</option>
                           <option value="other">Other Issues</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>
                    </div>

                    <div className="group">
                      <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-2 group-focus-within:text-cyan-400 transition-colors">Priority</label>
                      <div className="relative">
                        <select 
                         name="priority" 
                         value={formData.priority} 
                         onChange={handleChange} 
                         required 
                         className="w-full bg-[#1b2234] border border-slate-700/60 rounded-xl px-4 py-3 text-sm text-slate-200 cursor-pointer appearance-none"
                        >
                           <option value="" disabled>Select level...</option> 
                           <option value="high" className="text-rose-400">High (Safety Risk)</option>
                           <option value="medium" className="text-orange-400">Medium</option>
                           <option value="low" className="text-emerald-400">Low</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="group">
                    <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-2 group-focus-within:text-cyan-400 transition-colors">Location</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                        <input 
                          type="text" 
                          name="locationName"
                          value={formData.locationName} 
                          onChange={handleChange} 
                          required
                          placeholder="Fetch location by clicking the arrow..." 
                          className="w-full bg-[#1b2234] border border-slate-700/60 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all" 
                        />
                      </div>
                      <button 
                        type="button"
                        onClick={fetchLocationAndAddress}
                        disabled={locLoading}
                        className={`${locLoading || formData.coordinates.lat ? 'bg-emerald-500 text-white shadow-lg' : 'bg-cyan-500 hover:bg-cyan-400 text-slate-900'} p-3 rounded-xl transition-all shrink-0 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] group/loc`}
                        title="Use Current Location"
                      >
                         {locLoading ? (
                           <Loader2 className="w-5 h-5 animate-spin" />
                         ) : formData.coordinates.lat ? (
                           <CheckCircle2 className="w-5 h-5" />
                         ) : (
                           <Navigation className="w-5 h-5 fill-current stroke-current group-hover/loc:scale-110 transition-transform" />
                         )}
                      </button>
                    </div>
                  </div>

                  {/* Detailed Description */}
                  <div className="group">
                    <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-2 group-focus-within:text-cyan-400 transition-colors">Detailed Description</label>
                    <textarea 
                      name="description" 
                      value={formData.description} 
                      onChange={handleChange} 
                      rows="3" 
                      required
                      placeholder="Provide detailed information about the issue (e.g., landmarks, how long it's been there)..." 
                      className="w-full bg-[#1b2234] border border-slate-700/60 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all resize-none shadow-inner"
                    ></textarea>
                  </div>

                  {/* Drag & Drop Visual */}
                  <div>
                    {/* Interactive Drag & Drop Image Upload */}
<div>
  <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-2">
    Evidence Photo (Optional)
  </label>
  
  {formData.image ? (
    // Image Preview Section
    <div className="relative w-full h-40 rounded-xl overflow-hidden border-2 border-slate-700/60 group">
      <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
      <button 
        type="button"
        onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
        className="absolute top-2 right-2 bg-rose-500/80 hover:bg-rose-500 text-white p-1.5 rounded-md backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  ) : (
    // Upload UI
    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-700/60 border-dashed rounded-xl cursor-pointer bg-[#1b2234] hover:bg-[#222a3f] hover:border-cyan-500/50 transition-all group">
      <div className="flex flex-col items-center justify-center pt-5 pb-6">
        <div className="bg-slate-800 p-2 rounded-full mb-2 group-hover:scale-110 transition-transform">
          <ImageIcon className="w-6 h-6 text-cyan-400" />
        </div>
        <p className="mb-1 text-sm text-slate-300"><span className="font-semibold text-cyan-400">Click to upload</span></p>
        <p className="text-xs text-slate-500">JPG, PNG (MAX. 5MB)</p>
      </div>
      <input 
        type="file" 
        className="hidden" 
        accept="image/*"
        onChange={handleImageUpload} // <--- Naya handler yahan attach kiya
      />
    </label>
  )}
</div>
                  </div>

                </div>

                {/* Footer Actions */}
                <div className="flex justify-end gap-3 p-5 border-t border-slate-800/80 bg-[#0c121e]">
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)} 
                    className="bg-transparent hover:bg-slate-800 text-slate-300 border-slate-700 transition-colors px-6 rounded-lg"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold px-8 rounded-lg shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all border-none"
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                    {isSubmitting ? "Submitting..." : "Submit Report"}
                  </Button>
                </div>
              </form>

            </div>
          </div>
        )}
    </div>
  );
}