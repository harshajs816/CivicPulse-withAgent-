import React, { useState } from 'react';
import axios from 'axios';
import { 
  FileText, User, Droplets, Trash2, Zap, 
  HardHat, ClipboardList, MapPin, AlertTriangle, Send, Loader2, CheckCircle2 
} from 'lucide-react';

export default function SubmitReport() {
  const [formData, setFormData] = useState({
    name: '',
    category: 'construction', // Default selected to match image
    title: '',
    location: '',
    priority: 'high', // Default selected to match image
    description: ''
  });

  // API Interaction States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  // Categories configuration
  const categories = [
    { id: 'water', name: 'Water & Pipe', icon: Droplets, color: 'text-cyan-400', activeBorder: 'border-cyan-400', dept: 'Water Department' },
    { id: 'garbage', name: 'Garbage', icon: Trash2, color: 'text-slate-300', activeBorder: 'border-slate-300', dept: 'Sanitation Department' },
    { id: 'electricity', name: 'Electricity', icon: Zap, color: 'text-orange-500', activeBorder: 'border-orange-500', dept: 'Electricity Board' },
    { id: 'construction', name: 'Construction', icon: HardHat, color: 'text-orange-600', activeBorder: 'border-orange-600', dept: 'Construction Department' },
    { id: 'other', name: 'Other', icon: ClipboardList, color: 'text-pink-300', activeBorder: 'border-pink-300', dept: 'Other Department' }
  ];

  // Priorities configuration
  const priorities = [
    { id: 'low', name: 'Low', activeColor: 'text-emerald-400', activeBorder: 'border-emerald-400' },
    { id: 'medium', name: 'Medium', activeColor: 'text-orange-400', activeBorder: 'border-orange-400' },
    { id: 'high', name: 'High', activeColor: 'text-rose-500', activeBorder: 'border-rose-500' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategorySelect = (categoryId) => {
    setFormData(prev => ({ ...prev, category: categoryId }));
  };

  const handlePrioritySelect = (priorityId) => {
    setFormData(prev => ({ ...prev, priority: priorityId }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  setIsSubmitting(true);
  setStatusMessage({ type: '', text: '' });

  try {
    const payload = {
      title: formData.title,
      description: formData.description,
      locationName: formData.location,
      category: formData.category,
      priority: formData.priority,
      reportedBy: {
        name: formData.name
      },
      status: 'Pending'
    };

    console.log("Sending report:", payload);

    const res = await axios.post(
      "http://localhost:5000/api/reports/create",
      payload
    );

    console.log("Report response:", res.data);

    setStatusMessage({
      type: 'success',
      text: 'Report submitted successfully!'
    });

    setFormData({
      name: '',
      category: 'construction',
      title: '',
      location: '',
      priority: 'high',
      description: ''
    });

    setTimeout(() => {
      setStatusMessage({
        type: '',
        text: ''
      });
    }, 3000);

  } catch (error) {
    console.error("Submission error:", error);

    if (error.code === 'ERR_NETWORK') {
      setStatusMessage({
        type: 'error',
        text: 'Cannot connect to the backend server. Make sure your server is running on port 5000.'
      });
    } else if (error.response) {
      console.error("Server error:", error.response.data);

      setStatusMessage({
        type: 'error',
        text: error.response.data?.message || 'Server rejected the report.'
      });
    } else {
      setStatusMessage({
        type: 'error',
        text: 'Failed to submit report. Please try again.'
      });
    }
  } finally {
    setIsSubmitting(false);
  }
};

  // Get currently selected category data for the routing text
  const selectedCategoryData = categories.find(c => c.id === formData.category);

  return (
    <div className="min-h-screen bg-[#0d1219] flex items-center justify-center p-4 font-sans text-slate-300">
      
      {/* FORM CONTAINER */}
      <div className="w-full max-w-3xl bg-[#151c27] border border-slate-800/80 rounded-2xl p-6 md:p-8 shadow-2xl relative">
        
        {/* HEADER */}
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-emerald-500/10 rounded-xl">
            <FileText className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">Submit New Report</h2>
            <p className="text-sm text-slate-400 mt-1">Report will be auto-routed to the right department</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* YOUR NAME */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-2">
              <User className="w-4 h-4" /> Your Name
            </label>
            <input 
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Full name..."
              className="w-full bg-[#0d1219] border border-slate-700/60 rounded-lg p-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
              required
            />
          </div>

          {/* CATEGORY SELECTION */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-2">
              Category <span className="text-emerald-400 font-medium">(Auto-routes to department)</span>
            </label>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {categories.map((cat) => {
                const isActive = formData.category === cat.id;
                return (
                  <div 
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat.id)}
                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border cursor-pointer transition-all duration-200
                      ${isActive 
                        ? `bg-[#1a2332] ${cat.activeBorder}` 
                        : 'bg-[#0d1219] border-slate-700/60 hover:border-slate-500'
                      }`}
                  >
                    <cat.icon className={`w-6 h-6 ${isActive ? cat.color : 'text-slate-400'}`} />
                    <span className={`text-xs font-medium ${isActive ? cat.color : 'text-slate-400'}`}>
                      {cat.name}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* ROUTING INFO BOX */}
            {selectedCategoryData && (
              <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2 text-emerald-400 text-sm font-medium transition-all">
                <span className="text-emerald-500">→</span> Will be sent to: {selectedCategoryData.dept}
              </div>
            )}
          </div>

          {/* ISSUE TITLE */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Issue Title</label>
            <input 
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Brief description of the issue..."
              className="w-full bg-[#0d1219] border border-slate-700/60 rounded-lg p-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
              required
            />
          </div>

          {/* LOCATION */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-2">
              <MapPin className="w-4 h-4" /> Location
            </label>
            <input 
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Area, City..."
              className="w-full bg-[#0d1219] border border-slate-700/60 rounded-lg p-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
              required
            />
          </div>

          {/* PRIORITY SELECTION */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-2">
              <AlertTriangle className="w-4 h-4" /> Priority
            </label>
            <div className="flex gap-3">
              {priorities.map((p) => {
                const isActive = formData.priority === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handlePrioritySelect(p.id)}
                    className={`flex-1 py-3 rounded-lg border text-sm font-medium transition-all duration-200
                      ${isActive 
                        ? `bg-[#1a2332] ${p.activeBorder} ${p.activeColor}` 
                        : 'bg-[#0d1219] border-slate-700/60 text-slate-400 hover:border-slate-500'
                      }`}
                  >
                    {p.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Description <span className="text-slate-500">(Optional)</span>
            </label>
            <textarea 
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="More details about the issue..."
              rows="4"
              className="w-full bg-[#0d1219] border border-slate-700/60 rounded-lg p-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 transition-colors resize-y"
            ></textarea>
          </div>

          {/* Success or Error Messages */}
          {statusMessage.text && (
            <div className={`p-4 rounded-lg flex items-center gap-3 text-sm font-medium ${
              statusMessage.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}>
              {statusMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
              {statusMessage.text}
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <button 
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-lg py-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-[0_0_15px_rgba(34,211,238,0.3)] mt-8 ${
              isSubmitting ? 'opacity-80 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Submitting...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" /> Submit Report
              </>
            )}
          </button>

        </form>
      </div>
    </div>
  );
}