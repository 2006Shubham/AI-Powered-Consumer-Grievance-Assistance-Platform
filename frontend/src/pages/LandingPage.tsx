import React, { useState } from 'react';
import { 
  ShieldCheck, Scale, Sparkles, ArrowRight, CheckCircle2, 
  FileText, Zap, Lock, BookOpen, AlertCircle, User, Mail, LogIn 
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
      // Fallback: local demo auth
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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-600 selection:text-white flex flex-col">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 lg:px-8 py-3.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-600/20">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight">Grievance<span className="text-indigo-600">AI</span></span>
                <span className="inline-flex items-center gap-1 text-[10px] bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-full font-semibold">
                  <Sparkles className="w-2.5 h-2.5 text-indigo-600" /> RAG System
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">AI Consumer Protection Platform</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleOpenAuth(true)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-all"
            >
              Sign In
            </button>
            <button
              onClick={handleDemoLogin}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs border border-slate-200 transition-all"
            >
              Explore Demo
            </button>
            <button
              onClick={() => handleOpenAuth(false)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition-all"
            >
              Get Started Free
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-4 lg:px-8 pt-16 pb-14 bg-gradient-to-b from-white to-slate-50 border-b border-slate-200 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-indigo-600" /> Grounded in Consumer Protection Act 2019 & RBI Norms
          </div>
          
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Fight Unfair Merchant Practices & Protect Your Consumer Rights with AI
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Bought a defective product? Refused a refund? Facing unauthorized bank charges? 
            Describe your grievance in plain words. Our Groq AI cross-references statutory consumer laws, evaluates evidence strength, and auto-drafts formal demand notices in seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={handleDemoLogin}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-xs transition-all"
            >
              <span>Try Live Platform Demo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleOpenAuth(false)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-sm border border-slate-200 transition-all"
            >
              <span>Create Free Account</span>
            </button>
          </div>

          {/* Key Quick Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto pt-8 border-t border-slate-200/80">
            <div className="space-y-0.5">
              <div className="text-xl font-extrabold text-slate-900">100% Free</div>
              <div className="text-xs text-slate-500 font-medium">For All Consumers</div>
            </div>
            <div className="space-y-0.5">
              <div className="text-xl font-extrabold text-indigo-600">LLaMA 3.3 70B</div>
              <div className="text-xs text-slate-500 font-medium">Groq RAG Intelligence</div>
            </div>
            <div className="space-y-0.5">
              <div className="text-xl font-extrabold text-emerald-600">14-Day Notice</div>
              <div className="text-xs text-slate-500 font-medium">Statutory Compliance</div>
            </div>
            <div className="space-y-0.5">
              <div className="text-xl font-extrabold text-slate-900">e-Daakhil Ready</div>
              <div className="text-xs text-slate-500 font-medium">Consumer Forum Drafts</div>
            </div>
          </div>
        </div>
      </section>

      {/* What It Is & Why It Matters Section */}
      <section className="px-4 lg:px-8 py-16 max-w-6xl mx-auto space-y-12">
        
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            What Is GrievanceAI & Why Does It Exist?
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Large corporations have dedicated legal departments to handle complaints. Everyday consumers often don't know their statutory rights and give up on valid refunds because legal representation feels technical, costly, and overwhelming.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Card 1: What It Is */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">What It Is</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              GrievanceAI is an intelligent, automated consumer protection assistant. It takes your plain-language description of any transaction dispute—whether an Amazon order, a bank charge, a utility bill, or a telecom issue—and matches it against real consumer protection statutes.
            </p>
            <ul className="space-y-2 text-xs text-slate-700 pt-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Translates everyday complaints into formal legal language</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>RAG vector database grounded in Consumer Protection Act 2019</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Auto-generates legal notices you can issue directly to sellers</span>
              </li>
            </ul>
          </div>

          {/* Card 2: Why It Matters */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Why It Matters</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Most merchants rely on consumer friction—hoping you'll get tired of automated customer care bots. A formal legal notice referencing statutory sections shifts the burden back to the vendor, forcing resolution within 14 calendar days.
            </p>
            <ul className="space-y-2 text-xs text-slate-700 pt-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Levels the playing field against large corporations</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Saves thousands of dollars in attorney fees</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Evaluates your evidence checklist before formal court filing</span>
              </li>
            </ul>
          </div>

        </div>

      </section>

      {/* How It Works (3 Easy Steps) */}
      <section className="px-4 lg:px-8 py-16 bg-white border-y border-slate-200">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              3 Simple Steps to Escalate Your Grievance
            </h2>
            <p className="text-xs text-slate-500">Fast, automated, and legally grounded</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Step 1 */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-3 relative">
              <span className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">1</span>
              <h3 className="text-sm font-bold text-slate-900">Describe What Happened</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Type your story naturally or select a sample scenario. Groq AI automatically extracts vendor details, order IDs, dates, and claimed amounts.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-3 relative">
              <span className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">2</span>
              <h3 className="text-sm font-bold text-slate-900">RAG Legal Matching</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Our RAG engine searches vector-embedded legal statutes (CPA 2019, RBI Banking Ombudsman rules, TRAI norms) and computes your claim strength.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-3 relative">
              <span className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">3</span>
              <h3 className="text-sm font-bold text-slate-900">Download Legal Notice</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Receive a professionally formatted demand notice with a 14-day statutory deadline, ready to email to the vendor or submit to consumer forums.
              </p>
            </div>

          </div>

          {/* CTA Banner */}
          <div className="text-center pt-4">
            <button
              onClick={handleDemoLogin}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch Demo Case Assistant</span>
            </button>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>© 2026 GrievanceAI Platform • Empowering Consumer Rights with Grounded RAG Intelligence</span>
          <div className="flex items-center gap-4">
            <button onClick={() => handleOpenAuth(true)} className="hover:text-slate-800 transition-colors">Sign In</button>
            <button onClick={handleDemoLogin} className="hover:text-slate-800 transition-colors">Demo Mode</button>
            <button onClick={() => handleOpenAuth(false)} className="hover:text-slate-800 transition-colors">Create Account</button>
          </div>
        </div>
      </footer>

      {/* AUTH MODAL */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 sm:p-8 space-y-6 shadow-xl relative">
            <button 
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 text-xs font-bold p-1"
            >
              ✕
            </button>

            <div className="text-center space-y-1.5">
              <div className="inline-flex p-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 mb-1">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900">
                {isLoginMode ? 'Sign In to GrievanceAI' : 'Create Free Account'}
              </h2>
              <p className="text-xs text-slate-500">
                {isLoginMode ? 'Access your consumer cases and legal notice drafts' : 'Start escalating grievances with RAG AI guidance'}
              </p>
            </div>

            {/* Auth Tab Switcher */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => { setIsLoginMode(true); setError(''); }}
                className={`py-1.5 rounded-lg transition-all ${isLoginMode ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setIsLoginMode(false); setError(''); }}
                className={`py-1.5 rounded-lg transition-all ${!isLoginMode ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Sign Up
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
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
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Processing...' : isLoginMode ? 'Sign In' : 'Create Account'}</span>
              </button>
            </form>

            <div className="border-t border-slate-100 pt-3 text-center">
              <button
                onClick={() => { setShowAuthModal(false); handleDemoLogin(); }}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold"
              >
                Or instant login with Demo Mode →
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
