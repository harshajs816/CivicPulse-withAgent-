import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import axios from 'axios';
import { 
  Building2, 
  Map, 
  Users, 
  ShieldCheck, 
  ArrowLeft, 
  Eye, 
  EyeOff,
  MailCheck, // Naya icon OTP screen ke liye
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';

// --- API FUNCTIONS ---
const registerUser = async (data) => {
  const response = await axios.post("http://localhost:5000/api/auth/register", data);
  return response.data;
};

const verifyOtpUser = async (data) => {
  const response = await axios.post("http://localhost:5000/api/auth/verify-otp", data);
  return response.data;
};

export default function RegisterPage() {
  const navigate = useNavigate();
  
  // States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [otp, setOtp] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  // Watch password to validate confirm password
  const password = watch("password");

  // --- MUTATIONS ---
  const registerMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: (data, variables) => {
      toast.success("OTP sent to your email!");
      setRegisteredEmail(variables.email); // Email save kar rahe hain OTP verify ke liye
      setIsOtpSent(true); // UI change karne ke liye
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Email is already registered");
      console.error("Registration failed:", error.response?.data || error.message);
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: verifyOtpUser,
    onSuccess: (data) => {
      toast.success("Email verified successfully!");
      navigate('/login'); // Verify hote hi login pe bhej do
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Invalid or expired OTP");
    },
  });

  // --- HANDLERS ---
  const onSubmit = (data) => {
    // API backend structure ke hisaab se data bhejein (role & dept set as required)
    const payload = {
      name: data.name,
      email: data.email,
      password: data.password,
      role: "USER" // Citizen by default
    };
    registerMutation.mutate(payload);
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.warning("Please enter a valid 6-digit OTP");
      return;
    }
    verifyOtpMutation.mutate({ email: registeredEmail, otp });
  };

  return (
    <div className="min-h-screen flex font-sans text-slate-200 bg-[#09101a] overflow-hidden selection:bg-cyan-500/30">
      
      {/* ================= LEFT SIDE (Branding & Features - No Changes Here) ================= */}
      <div className="hidden lg:flex w-[55%] relative flex-col items-center justify-center p-12 bg-[#09101a] border-r border-slate-800/60 z-10">
        
        {/* Faint Grid Background */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
        </div>
        
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-cyan-900/30 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#09101a] rounded-full blur-[80px] pointer-events-none"></div>

        <div className="w-full max-w-md relative z-10 flex flex-col items-center">
          
          <div className="w-16 h-16 bg-[#00e5ff] rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(0,229,255,0.4)] mb-6">
            <Building2 className="w-8 h-8 text-slate-900 stroke-[2.5px]" />
          </div>
          
          <h1 className="text-[40px] font-extrabold text-[#00e5ff] tracking-wide mb-2 drop-shadow-[0_0_15px_rgba(0,229,255,0.3)]">
            CivicPulse
          </h1>
          <p className="text-slate-400 text-sm font-medium tracking-wide mb-12">
            Smart City Issue Reporting
          </p>

          {/* Feature Cards */}
          <div className="w-full space-y-4 mb-12">
            <div className="flex items-center gap-4 bg-[#111926]/80 backdrop-blur-md border border-slate-800/80 p-5 rounded-xl">
              <div className="bg-[#152b36] p-3 rounded-lg border border-[#1d404b]">
                <Map className="w-5 h-5 text-[#00e5ff]" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">Real-time Mapping</h3>
                <p className="text-slate-400 text-[13px] mt-1">Track issues on interactive maps with precise location data</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-[#111926]/80 backdrop-blur-md border border-slate-800/80 p-5 rounded-xl">
              <div className="bg-[#152b36] p-3 rounded-lg border border-[#1d404b]">
                <Users className="w-5 h-5 text-[#00e5ff]" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">Community Driven</h3>
                <p className="text-slate-400 text-[13px] mt-1">Connect with neighbors to solve local problems together</p>
              </div>
            </div>

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

      {/* ================= RIGHT SIDE (Form / OTP Panel) ================= */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center items-center p-6 bg-[#0c121e] relative min-h-screen overflow-y-auto">
        
        <div className="w-full max-w-md relative mt-16 lg:mt-0 my-8">
          
          <button 
            onClick={() => navigate('/')}
            className="absolute -top-[42px] left-0 flex items-center gap-2 px-4 py-2.5 bg-[#151b2b] border-t border-l border-r border-slate-800 rounded-t-lg text-xs font-medium text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </button>

          <div className="bg-[#151b2b] border border-slate-800 rounded-b-2xl rounded-tr-2xl p-8 sm:p-10 shadow-2xl transition-all">
            
            {/* ----------------- IF OTP IS NOT SENT (SHOW REGISTRATION FORM) ----------------- */}
            {!isOtpSent ? (
              <>
                <h2 className="text-2xl font-bold text-white mb-2">Create an Account</h2>
                <p className="text-sm text-slate-400 mb-8">Join CivicPulse to start reporting and solving local issues.</p>

                <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-300">Full Name</label>
                      <input 
                        type="text" 
                        {...register("name", { required: "Name is required" })}
                        placeholder="John Doe" 
                        className="w-full bg-[#1e2738] border border-slate-700/60 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-[#00e5ff] focus:ring-1 focus:ring-[#00e5ff] transition-all"
                      />
                      {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-300">Phone</label>
                      <input 
                        type="tel" 
                        {...register("phone", { required: "Phone is required" })}
                        placeholder="+91 9876543210" 
                        className="w-full bg-[#1e2738] border border-slate-700/60 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-[#00e5ff] focus:ring-1 focus:ring-[#00e5ff] transition-all"
                      />
                      {errors.phone && <p className="text-red-500 text-xs">{errors.phone.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-300">Email</label>
                    <input 
                      type="email" 
                      {...register("email", { 
                        required: "Email is required",
                        pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email" }
                      })}
                      placeholder="citizen@example.com" 
                      className="w-full bg-[#1e2738] border border-slate-700/60 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-[#00e5ff] focus:ring-1 focus:ring-[#00e5ff] transition-all"
                    />
                    {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-300">Password</label>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        {...register("password", { 
                          required: "Password is required",
                          minLength: { value: 6, message: "Min 6 characters required" }
                        })}
                        placeholder="Create a password" 
                        className="w-full bg-[#1e2738] border border-slate-700/60 rounded-lg pl-4 pr-11 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-[#00e5ff] focus:ring-1 focus:ring-[#00e5ff] transition-all"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-3 text-slate-400 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-300">Confirm Password</label>
                    <div className="relative">
                      <input 
                        type={showConfirmPassword ? "text" : "password"} 
                        {...register("confirmPassword", {
                          required: "Please confirm your password",
                          validate: value => value === password || "Passwords do not match"
                        })}
                        placeholder="Confirm your password" 
                        className="w-full bg-[#1e2738] border border-slate-700/60 rounded-lg pl-4 pr-11 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-[#00e5ff] focus:ring-1 focus:ring-[#00e5ff] transition-all"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-3 text-slate-400 hover:text-white transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="text-red-500 text-xs">{errors.confirmPassword.message}</p>}
                  </div>

                  <button 
                    type="submit" 
                    disabled={registerMutation.isPending}
                    className="w-full flex items-center justify-center gap-2 bg-[#00e5ff] hover:bg-[#00d6ef] text-slate-900 font-bold text-sm py-3 rounded-lg shadow-[0_0_20px_rgba(0,229,255,0.3)] transition-all hover:shadow-[0_0_25px_rgba(0,229,255,0.5)] mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {registerMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                    {registerMutation.isPending ? "Sending OTP..." : "Create Account"}
                  </button>

                </form>

                <p className="text-center text-sm text-slate-400 mt-8">
                  Already have an account? <a href="/login" className="text-[#00e5ff] font-medium hover:underline underline-offset-4">Sign in</a>
                </p>
              </>
            ) : (

              /* ----------------- IF OTP IS SENT (SHOW OTP VERIFICATION FORM) ----------------- */
              <div className="flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 bg-cyan-900/30 text-[#00e5ff] rounded-full flex items-center justify-center mb-6 border border-cyan-500/20 shadow-[0_0_20px_rgba(0,229,255,0.2)]">
                  <MailCheck className="w-8 h-8" />
                </div>
                
                <h2 className="text-2xl font-bold text-white mb-2">Verify your email</h2>
                <p className="text-sm text-slate-400 mb-8">
                  We've sent a 6-digit code to <br/>
                  <span className="font-semibold text-[#00e5ff]">{registeredEmail}</span>
                </p>

                <form onSubmit={handleVerifyOtp} className="w-full space-y-6">
                  <div className="space-y-1.5">
                    <input 
                      type="text" 
                      maxLength="6"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} // Sirf numbers allow karega
                      placeholder="••••••" 
                      className="w-full text-center tracking-[1em] text-2xl font-mono bg-[#1e2738] border border-slate-700/60 rounded-lg px-4 py-4 text-white placeholder-slate-600 focus:outline-none focus:border-[#00e5ff] focus:ring-1 focus:ring-[#00e5ff] transition-all"
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={verifyOtpMutation.isPending || otp.length !== 6}
                    className="w-full flex items-center justify-center gap-2 bg-[#00e5ff] hover:bg-[#00d6ef] text-slate-900 font-bold text-sm py-3 rounded-lg shadow-[0_0_20px_rgba(0,229,255,0.3)] transition-all hover:shadow-[0_0_25px_rgba(0,229,255,0.5)] disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {verifyOtpMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                    {verifyOtpMutation.isPending ? "Verifying..." : "Verify & Continue"}
                  </button>
                </form>

                <button 
                  onClick={() => setIsOtpSent(false)} 
                  className="mt-6 text-sm text-slate-400 hover:text-[#00e5ff] transition-colors"
                >
                  Wrong email? Change here.
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}