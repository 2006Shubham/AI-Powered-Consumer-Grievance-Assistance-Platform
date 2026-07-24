import React from 'react';
import { Scale, PlusCircle, LayoutDashboard, FolderOpen, Sparkles, Bell } from 'lucide-react';
import { useCases } from '../../context/CaseContext';

export const Header: React.FC = () => {
  const { activeTab, setActiveTab, cases } = useCases();

  const totalActive = cases.filter(c => c.status !== 'Resolved').length;

  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Scale className="w-5 h-5 text-indigo-400 group-hover:rotate-12 transition-transform" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-white tracking-tight">Grievance<span className="text-indigo-400">AI</span></span>
              <span className="inline-flex items-center gap-1 text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 px-1.5 py-0.5 rounded-full font-medium">
                <Sparkles className="w-2.5 h-2.5" /> RAG v2.4
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">AI-Powered Consumer Rights Assistance</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800/80">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'dashboard'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all text-slate-400 hover:text-white hover:bg-slate-800/50`}
          >
            <FolderOpen className="w-4 h-4" />
            <span className="hidden sm:inline">My Cases</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300 font-mono">
              {cases.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('new-case')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'new-case'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30 font-semibold'
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Case</span>
          </button>
        </nav>

        {/* Right User & Actions */}
        <div className="flex items-center gap-3">
          <button className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors">
            <Bell className="w-5 h-5" />
            {totalActive > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
            )}
          </button>

          <div className="h-6 w-[1px] bg-slate-800 hidden sm:block" />

          <div className="flex items-center gap-2.5 pl-1 cursor-pointer">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xs ring-2 ring-slate-800">
              JD
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-semibold text-slate-200">Jane Doe</div>
              <div className="text-[10px] text-slate-400">Verified Consumer</div>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
};
