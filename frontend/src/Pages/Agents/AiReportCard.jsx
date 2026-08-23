import React, { useState, useEffect } from 'react';
import { Bot, AlertCircle, CheckCircle2, RefreshCw, Sparkles } from 'lucide-react';

const AiReportCard = () => {
  const [reportText, setReportText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAiInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/api/ai-insights'); 
      const data = await response.json();

      if (data.success) {
        setReportText(data.data);
      } else {
        setError("Failed to generate AI insights.");
      }
    } catch (err) {
      setError("Cannot connect to the AI service. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAiInsights();
  }, []);

  return (
    <div className="bg-[#18202d] rounded-xl shadow-lg border border-slate-700/50 p-6 w-full relative overflow-hidden group">
      
      {/* Top Gradient Highlight */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-cyan-400"></div>

      {/* Decorative Glow */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/10 transition-all duration-700"></div>

      {/* Header Section */}
      <div className="flex items-center justify-between mb-5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#111721] rounded-lg border border-slate-700/50 flex items-center justify-center shadow-inner">
            <Bot className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              SuperAdmin AI Insights
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </h2>
            <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Real-time Analysis</p>
          </div>
        </div>
        
        {/* Refresh Button */}
        <button 
          onClick={fetchAiInsights} 
          disabled={loading}
          className="p-2.5 bg-slate-800/50 hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-400 border border-transparent hover:border-emerald-500/30 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          title="Refresh Insights"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-emerald-400" : ""}`} />
        </button>
      </div>

      {/* Content Section */}
      <div className="bg-[#111721] rounded-lg p-5 border border-slate-800/80 min-h-[160px] relative z-10 shadow-inner">
        
        {loading ? (
          // Loading State
          <div className="flex flex-col items-center justify-center h-full min-h-[120px] text-slate-400 py-4">
            <RefreshCw className="w-8 h-8 animate-spin mb-3 text-cyan-400 opacity-80" />
            <p className="text-sm font-medium animate-pulse">AI Agent is analyzing real-time data...</p>
          </div>
          
        ) : error ? (
          // Error State
          <div className="flex items-start gap-3 text-rose-400 bg-rose-500/10 border border-rose-500/20 p-4 rounded-lg">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
          
        ) : (
          // Success State - Rendering Markdown-like text 
          <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-line space-y-2">
            {reportText.includes("All clear") ? (
              <div className="flex items-center gap-2 text-emerald-400 font-medium pb-2 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg">
                <CheckCircle2 className="w-5 h-5" />
                <span>{reportText}</span>
              </div>
            ) : (
              // AI text ko render karna (bold text ko highlight karna)
              <div dangerouslySetInnerHTML={{ 
                __html: reportText.replace(
                  /\*\*(.*?)\*\*/g, 
                  '<strong class="text-white font-bold bg-[#1b2234] px-1.5 py-0.5 rounded border border-slate-700/50 shadow-sm">$1</strong>'
                )
              }} />
            )}
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-slate-800/80 flex justify-between items-center text-[11px] text-slate-500 font-medium">
        <p className="flex items-center gap-1.5">
          Powered by <span className="text-cyan-400 font-bold">Gemini AI</span>
        </p>
        <p className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          {new Date().toLocaleTimeString()}
        </p>
      </div>

    </div>
  );
};

export default AiReportCard;