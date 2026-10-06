import React, { useState } from 'react';
import { 
  Scale, ArrowRight, 
  AlertCircle, User, Mail, Lock, LogIn,
  Laptop, Smartphone, Tv, CreditCard,
  FileCheck, Sparkles, CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { login, signup } = useAuth();
  
  // Auth Modal state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenAuth = (loginMode: boolean = true) => {
    setIsLoginMode(loginMode);
    setError('');
    setShowAuthModal(true);
  };

  const handleDemoLogin = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      await login('demo@example.com', 'password123');
    } catch {
      window.location.reload();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (isLoginMode) {
        await login(email, password);
      } else {
        if (!name.trim()) {
          throw new Error('Please enter your full name');
        }
        await signup(name, email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-slate-900 selection:text-white flex flex-col">
      
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 lg:px-8 py-3.5 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-xs">
              <Scale className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight">Grievance<span className="text-indigo-600">AI</span></span>
                <span className="text-[10px] bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-full font-semibold">
                  Consumer Assistant
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">Fast, simple dispute resolution</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => handleOpenAuth(true)}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors btn-tactile"
            >
              Sign In
            </button>
            <button
              onClick={handleDemoLogin}
              className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold text-xs border border-slate-200 transition-colors btn-tactile"
            >
              Explore Demo
            </button>
            <button
              onClick={() => handleOpenAuth(false)}
              className="hidden sm:inline-flex px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xs transition-colors btn-tactile"
            >
              Get Started Free
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-4 lg:px-8 pt-10 pb-12 bg-gradient-to-b from-white via-slate-50/50 to-slate-50 border-b border-slate-200 text-center animate-fadeIn">
        <div className="max-w-3xl mx-auto space-y-4">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Smart dispute assistance for Indian consumers
          </div>
          
          <h1 className="text-2xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-snug">
            Resolve consumer disputes without the headache.
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            Got stuck with a broken product, denied warranty, or unfair refund refusal? Just describe what happened in everyday words. We help you organize the facts, understand your rights, and create clear complaint letters that companies actually respond to.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={handleDemoLogin}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm shadow-xs transition-all btn-tactile"
            >
              <span>Explore Demo Cases</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleOpenAuth(false)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-white hover:bg-slate-100 text-slate-800 font-semibold text-xs sm:text-sm border border-slate-200 transition-all btn-tactile"
            >
              <span>Create Free Account</span>
            </button>
          </div>

          {/* Key Quick Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto pt-6 border-t border-slate-200/80">
            <div className="space-y-0.5">
              <div className="text-lg font-bold text-slate-900">₹0 Fee</div>
              <div className="text-[11px] text-slate-500 font-medium">100% Free to use</div>
            </div>
            <div className="space-y-0.5">
              <div className="text-lg font-bold text-indigo-600">Plain English</div>
              <div className="text-[11px] text-slate-500 font-medium">No confusing jargon</div>
            </div>
            <div className="space-y-0.5">
              <div className="text-lg font-bold text-emerald-600">Quick Drafts</div>
              <div className="text-[11px] text-slate-500 font-medium">Generated in seconds</div>
            </div>
            <div className="space-y-0.5">
              <div className="text-lg font-bold text-slate-900">Ready to Send</div>
              <div className="text-[11px] text-slate-500 font-medium">Direct company notices</div>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Coverage Strip with Real Logos */}
      <section className="border-b border-slate-200 bg-white py-6 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-left shrink-0">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              Popular Brands Covered
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              Warranty, return & billing policies supported
            </span>
          </div>

          <div className="flex items-center gap-5 sm:gap-7 flex-wrap justify-center">
            
            {/* HP Logo */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-all shadow-2xs" title="HP India">
              <div className="w-5 h-5 rounded-full bg-[#0096D6] flex items-center justify-center text-white font-black italic text-[10px] tracking-tighter">
                hp
              </div>
              <span className="font-bold text-xs text-slate-800">HP</span>
            </div>

            {/* Acer Logo */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-all shadow-2xs" title="Acer">
              <span className="text-[#83B81A] font-extrabold text-sm tracking-tight font-sans lowercase">acer</span>
            </div>

            {/* Samsung Logo */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#034EA2] text-white hover:opacity-95 transition-all shadow-2xs" title="Samsung">
              <span className="font-extrabold text-[11px] tracking-widest font-sans">SAMSUNG</span>
            </div>

            {/* Apple Logo */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-all shadow-2xs" title="Apple">
              <svg className="h-4 w-auto fill-slate-900" viewBox="0 0 170 170">
                <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.6-7.7-11.72-13.98-6.19-9.5-11.04-20.2-14.55-32.09-3.51-11.89-5.27-23.01-5.27-33.37 0-14.67 3.82-26.68 11.45-36.03 7.63-9.35 17.07-14.15 28.32-14.41 4.58 0 9.8 1.25 15.66 3.75 5.86 2.5 9.74 3.79 11.64 3.88 1.52-.1 5.56-1.47 12.12-4.12 6.56-2.65 12.28-3.8 17.15-3.46 13.06.66 23.46 5.43 31.2 14.3-11.41 6.86-17 16.32-16.78 28.38.21 9.47 3.86 17.39 10.96 23.75 7.1 6.36 15.48 10.02 25.13 10.98-2.17 6.5-4.8 12.7-7.88 18.6zM119.22 33.15c0-7.27 2.65-14.18 7.95-20.73 5.3-6.55 11.87-10.94 19.71-13.17.65 2.17.98 4.35.98 6.52 0 7.28-2.77 14.24-8.31 20.89-5.54 6.64-12.3 11.07-20.28 13.29-.05-2.28-.05-4.56-.05-6.8z" />
              </svg>
              <span className="font-semibold text-xs text-slate-800">Apple</span>
            </div>

            {/* Flipkart Logo */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-all shadow-2xs" title="Flipkart">
              <div className="w-4 h-4 rounded-xs bg-[#2874F0] flex items-center justify-center relative overflow-hidden">
                <span className="text-[#FFE500] font-black italic text-[10px]">f</span>
              </div>
              <span className="font-bold text-xs text-[#2874F0]">Flipkart</span>
            </div>

            {/* Amazon Logo */}
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-all shadow-2xs" title="Amazon.in">
              <span className="font-extrabold text-xs text-slate-900 tracking-tight">amazon<span className="text-[#FF9900]">.in</span></span>
              <svg className="w-3.5 h-1.5 text-[#FF9900] ml-0.5" viewBox="0 0 40 12" fill="none">
                <path d="M2 3c8 7 24 8 36 0" stroke="#FF9900" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </div>

            {/* HDFC Bank Logo */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-all shadow-2xs" title="HDFC Bank">
              <div className="w-4 h-4 rounded-xs bg-[#004C8F] p-0.5 flex items-center justify-center">
                <div className="w-full h-full bg-[#ED1C24] flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-[#004C8F] flex items-center justify-center">
                    <div className="w-0.5 h-0.5 bg-white" />
                  </div>
                </div>
              </div>
              <span className="font-bold text-[11px] text-[#004C8F] tracking-tight">HDFC BANK</span>
            </div>

            {/* Croma Logo */}
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-all shadow-2xs" title="Tata Croma">
              <span className="font-black text-xs text-[#00A3A6] tracking-wider uppercase font-sans">croma</span>
              <div className="w-1.5 h-1.5 rounded-full bg-[#00A3A6]" />
            </div>

          </div>
        </div>
      </section>

      {/* Common Relatable Indian Scenarios */}
      <section className="px-4 lg:px-8 py-12 max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-1.5 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
            <FileCheck className="w-3.5 h-3.5 text-indigo-600" /> Relatable Indian Scenarios
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Common disputes we help resolve
          </h2>
          <p className="text-xs text-slate-500">
            From unfair warranty rejections to delivery traps, see how simple it is to get help.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: HP */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-2xs card-enterprise flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center">
                <Laptop className="w-4 h-4 text-slate-700" />
              </div>
              <div className="text-xs font-bold text-slate-900">HP Laptop Motherboard Warranty Denial</div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Service center claimed 'liquid damage' on a 45-day-old laptop and demanded ₹34,500. Flipkart refused return assistance.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="font-semibold text-slate-900 font-mono">₹68,990</span>
              <span className="text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded text-[10px]">Warranty Claim</span>
            </div>
          </div>

          {/* Card 2: Samsung */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-2xs card-enterprise flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center">
                <Smartphone className="w-4 h-4 text-slate-700" />
              </div>
              <div className="text-xs font-bold text-slate-900">Samsung Green Line Post-Update</div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Vertical line appeared immediately following Samsung's official OTA software update. Service center quoted ₹14,500.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="font-semibold text-slate-900 font-mono">₹54,999</span>
              <span className="text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded text-[10px]">Display Defect</span>
            </div>
          </div>

          {/* Card 3: Flipkart */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-2xs card-enterprise flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center">
                <Tv className="w-4 h-4 text-slate-700" />
              </div>
              <div className="text-xs font-bold text-slate-900">Flipkart Broken TV on Open-Box Delivery</div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Delivery person took OTP before unpacking. Inner panel was shattered upon installation; seller refused refund.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="font-semibold text-slate-900 font-mono">₹32,999</span>
              <span className="text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded text-[10px]">Transit Damage</span>
            </div>
          </div>

          {/* Card 4: HDFC */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-2xs card-enterprise flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-slate-700" />
              </div>
              <div className="text-xs font-bold text-slate-900">Unauthorized UPI Recurring Auto-Debit</div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Three recurring debits executed without advance SMS alert. Bank delayed chargeback despite prompt notice.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="font-semibold text-slate-900 font-mono">₹14,999</span>
              <span className="text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded text-[10px]">Billing Dispute</span>
            </div>
          </div>
        </div>

        <div className="text-center pt-2">
          <button
            onClick={handleDemoLogin}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors btn-tactile"
          >
            <span>Explore All 7 Real Indian Cases in Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 3 Step Simple Redressal Flow */}
      <section className="px-4 lg:px-8 py-12 bg-white border-y border-slate-200">
        <div className="max-w-5xl mx-auto space-y-10">
          
          <div className="text-center space-y-1.5 max-w-lg mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              How it works in 3 simple steps
            </h2>
            <p className="text-xs text-slate-500">
              From a frustrating problem to a professional complaint in minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-2.5 relative card-enterprise">
              <span className="w-7 h-7 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center shadow-2xs">1</span>
              <h3 className="text-xs font-bold text-slate-900">1. Explain what happened</h3>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Type out the issue in your own words. Mention the brand, what went wrong, and what you're asking for (refund, replacement, or repair).
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-2.5 relative card-enterprise">
              <span className="w-7 h-7 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center shadow-2xs">2</span>
              <h3 className="text-xs font-bold text-slate-900">2. Review the breakdown</h3>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Our AI organizes the timeline, checks company warranty and refund policies, and highlights helpful evidence.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-2.5 relative card-enterprise">
              <span className="w-7 h-7 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center shadow-2xs">3</span>
              <h3 className="text-xs font-bold text-slate-900">3. Send your complaint</h3>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Receive a professional, formal complaint letter ready to email to customer care and company grievance officers.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>© 2026 GrievanceAI • Helping Indian consumers resolve purchase and warranty disputes.</span>
          <div className="flex items-center gap-4">
            <button onClick={() => handleOpenAuth(true)} className="hover:text-slate-800 transition-colors">Sign In</button>
            <button onClick={handleDemoLogin} className="hover:text-slate-800 transition-colors">Demo Mode</button>
            <button onClick={() => handleOpenAuth(false)} className="hover:text-slate-800 transition-colors">Create Account</button>
          </div>
        </div>
      </footer>

      {/* AUTH MODAL */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeInFast">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 sm:p-8 space-y-5 shadow-xl relative animate-scaleIn">
            <button 
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 text-xs font-bold p-1 rounded"
            >
              ✕
            </button>

            <div className="text-center space-y-1.5">
              <div className="inline-flex p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-900 mb-1">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                {isLoginMode ? 'Sign In to GrievanceAI' : 'Create Free Account'}
              </h2>
              <p className="text-xs text-slate-500">
                {isLoginMode ? 'Access your consumer cases and complaint drafts' : 'Get fast help with consumer disputes across India'}
              </p>
            </div>

            {/* Auth Tab Switcher */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => { setIsLoginMode(true); setError(''); }}
                className={`py-1.5 rounded-lg transition-all ${isLoginMode ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setIsLoginMode(false); setError(''); }}
                className={`py-1.5 rounded-lg transition-all ${!isLoginMode ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Sign Up
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmitAuth} className="space-y-3.5">
              {!isLoginMode && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Atharva Kulkarni"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    placeholder="user@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-2 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50 btn-tactile"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Authenticating...' : isLoginMode ? 'Sign In' : 'Create Account'}</span>
              </button>
            </form>

            <div className="border-t border-slate-100 pt-3 text-center">
              <button
                onClick={() => { setShowAuthModal(false); handleDemoLogin(); }}
                className="text-xs text-slate-700 hover:text-slate-900 font-semibold"
              >
                Instant Access via Demo Mode →
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
