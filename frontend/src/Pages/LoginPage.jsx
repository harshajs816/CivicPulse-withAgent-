import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { 
  Building2, 
  Map, 
  Users, 
  ShieldCheck, 
  ArrowLeft, 
  Eye, 
  EyeOff
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

const loginUser = async (data) => {
  const response = await axios.post("http://localhost:5000/api/auth/login", data);
  return response.data;
};

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

 const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      toast.success("Login Successfull")
      console.log("Login successful:", data); // Ye console me dikh raha hai
      reset();
      
      const userData = data?.user || data; 
      
      // User ki details stringify karke save karein
      localStorage.setItem("user", JSON.stringify(userData));
      
      // Agar backend se token bhi aa raha hai (e.g., JWT), toh usko bhi save kar lein
      if (data?.token) {
        localStorage.setItem("token", data.token);
      }

      // 2. ROLE CHECK KAREIN AUR REDIRECT KAREIN
    const userRole = userData?.role; 

      if (userRole === 'SUPERADMIN') {
        navigate('/superAdmin'); // Jaisa aapne set kiya hai
      } else if (userRole === 'DEPARTMENT') {
        navigate('/department'); // NAYA: Department worker ke liye
      } else {
        navigate('/'); // Default / Citizen ke liye
      }
    },
    onError: (error) => {

      toast.error("Check Your Email & password")
      console.error(
        "Login failed:",
        error.response?.data || error.message
      );
    },
  });

  return (
    <div className="min-h-screen flex font-sans text-slate-200 bg-[#09101a] overflow-hidden selection:bg-cyan-500/30">
      
      {/* ================= LEFT SIDE (Branding & Features) ================= */}
      <div className="hidden lg:flex w-[55%] relative flex-col items-center justify-center p-12 bg-[#09101a] border-r border-slate-800/60 z-10">
        
        {/* Faint Grid Background */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
        </div>
        
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-cyan-900/30 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#09101a] rounded-full blur-[80px] pointer-events-none"></div>

        <div className="w-full max-w-md relative z-10 flex flex-col items-center">
          
          {/* Logo Box */}
          <div className="w-16 h-16 bg-[#00e5ff] rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(0,229,255,0.4)] mb-6">
            <Building2 className="w-8 h-8 text-slate-900 stroke-[2.5px]" />
          </div>
          
          {/* Title */}
          <h1 className="text-[40px] font-extrabold text-[#00e5ff] tracking-wide mb-2 drop-shadow-[0_0_15px_rgba(0,229,255,0.3)]">
            CivicPulse
          </h1>
          <p className="text-slate-400 text-sm font-medium tracking-wide mb-12">
            Smart City Issue Reporting
          </p>

          {/* Feature Cards */}
          <div className="w-full space-y-4 mb-12">
            
            {/* Feature 1 */}
            <div className="flex items-center gap-4 bg-[#111926]/80 backdrop-blur-md border border-slate-800/80 p-5 rounded-xl">
              <div className="bg-[#152b36] p-3 rounded-lg border border-[#1d404b]">
                <Map className="w-5 h-5 text-[#00e5ff]" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">Real-time Mapping</h3>
                <p className="text-slate-400 text-[13px] mt-1">Track issues on interactive maps with precise location data</p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-center gap-4 bg-[#111926]/80 backdrop-blur-md border border-slate-800/80 p-5 rounded-xl">
              <div className="bg-[#152b36] p-3 rounded-lg border border-[#1d404b]">
                <Users className="w-5 h-5 text-[#00e5ff]" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">Community Driven</h3>
                <p className="text-slate-400 text-[13px] mt-1">Connect with neighbors to solve local problems together</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-center gap-4 bg-[#111926]/80 backdrop-blur-md border border-slate-800/80 p-5 rounded-xl">
              <div className="bg-[#152b36] p-3 rounded-lg border border-[#1d404b]">
                <ShieldCheck className="w-5 h-5 text-[#00e5ff]" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">Secure & Private</h3>
                <p className="text-slate-400 text-[13px] mt-1">Your data is protected with enterprise-grade security</p>
              </div>
            </div>

          </div>

          {/* Stats Row */}
          <div className="flex justify-between w-full gap-4">
            <div className="flex-1 bg-[#111926]/80 border border-slate-800/80 rounded-xl p-4 text-center">
              <h4 className="text-2xl font-bold text-[#00e5ff]">1,247</h4>
              <p className="text-slate-400 text-xs mt-1 font-medium">Issues Resolved</p>
            </div>
            <div className="flex-1 bg-[#111926]/80 border border-slate-800/80 rounded-xl p-4 text-center">
              <h4 className="text-2xl font-bold text-[#00e5ff]">3,892</h4>
              <p className="text-slate-400 text-xs mt-1 font-medium">Active Citizens</p>
            </div>
            <div className="flex-1 bg-[#111926]/80 border border-slate-800/80 rounded-xl p-4 text-center">
              <h4 className="text-2xl font-bold text-[#00e5ff]">156</h4>
              <p className="text-slate-400 text-xs mt-1 font-medium">Neighborhoods</p>
            </div>
          </div>

        </div>
      </div>


      {/* ================= RIGHT SIDE (Form Panel) ================= */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center items-center p-6 bg-[#0c121e] relative">
        
        <div className="w-full max-w-md relative mt-12 lg:mt-0">
          
          {/* Back to Home Tab */}
          <button 
            onClick={() => navigate('/')}
            className="absolute -top-[42px] left-0 flex items-center gap-2 px-4 py-2.5 bg-[#151b2b] border-t border-l border-r border-slate-800 rounded-t-lg text-xs font-medium text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </button>

          {/* Form Card Container */}
          <div className="bg-[#151b2b] border border-slate-800 rounded-b-2xl rounded-tr-2xl p-8 sm:p-10 shadow-2xl">
            
            <h2 className="text-2xl font-bold text-white mb-2">Sign in to CivicPulse</h2>
            <p className="text-sm text-slate-400 mb-8">Welcome back! Please enter your details.</p>

            {/* Yahan par onSubmit change kiya gaya hai */}
            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              
              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">Email</label>
                <input 
                  type="email" 
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Please enter a valid email address",
                    },
                  })}
                  placeholder="Enter your email" 
                  className="w-full bg-[#1e2738] border border-slate-700/60 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-[#00e5ff] focus:ring-1 focus:ring-[#00e5ff] transition-all"
                />
                {errors.email && (
                    <p className="text-red-500">{errors.email.message}</p>
                )}
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    {...register("password", {
                         required: "Password is required",
                         minLength: {
                           value: 6,
                           message: "Password must be at least 6 characters",
                         },
                    })}
                    placeholder="Enter your password" 
                    className="w-full bg-[#1e2738] border border-slate-700/60 rounded-lg pl-4 pr-11 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-[#00e5ff] focus:ring-1 focus:ring-[#00e5ff] transition-all"
                  />
                 {errors.password && ( <p className="text-red-500">{errors.password.message} </p>)}

                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3.5 text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className="w-full bg-[#00e5ff] hover:bg-[#00d6ef] text-slate-900 font-bold text-sm py-3 rounded-lg shadow-[0_0_20px_rgba(0,229,255,0.3)] transition-all hover:shadow-[0_0_25px_rgba(0,229,255,0.5)] mt-6"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Signing in..." : "Sign in"}
              </button>

            </form>

            {/* Divider */}
            <div className="flex items-center my-8">
              <div className="flex-1 border-t border-slate-700"></div>
              <span className="px-4 text-sm text-slate-400 bg-[#151b2b]">or</span>
              <div className="flex-1 border-t border-slate-700"></div>
            </div>

            {/* Footer Link */}
            <p className="text-center text-sm text-slate-400 mt-8">
              Don't have an account? <a href="/register" className="text-[#00e5ff] font-medium hover:underline underline-offset-4">Sign up for free</a>
            </p>

          </div>
        </div>
      </div>

    </div>
  );
}