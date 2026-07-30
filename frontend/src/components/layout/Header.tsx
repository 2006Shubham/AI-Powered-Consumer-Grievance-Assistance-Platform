import React from 'react';
import { Scale, PlusCircle, LayoutDashboard, FolderOpen, Sparkles, LogOut } from 'lucide-react';
import { useCases } from '../../context/CaseContext';
import { useAuth } from '../../context/AuthContext';

export const Header: React.FC = () => {
  const { activeTab, setActiveTab, cases, activeCaseId, setActiveCaseId } = useCases();
  const { user, logout } = useAuth();

  const activeCount = cases.filter(c => c.status !== 'Resolved').length;

  const handleMyCasesClick = () => {
    if (activeCaseId) {
      setActiveTab('case-details');
    } else if (cases.length > 0) {
      setActiveCaseId(cases[0].id);
      setActiveTab('case-details');
    } else {
      setActiveTab('dashboard');
    }
  };

  const getUserInitials = (name?: string) => {
    if (!name) return 'CG';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 lg:px-8 py-3.5 transition-all shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-600/20 group-hover:scale-105 transition-transform">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-slate-900 tracking-tight">Grievance<span className="text-indigo-600">AI</span></span>
              <span className="inline-flex items-center gap-1 text-[10px] bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-full font-medium">
                <Sparkles className="w-2.5 h-2.5 text-indigo-600" /> RAG System
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">AI Consumer Protection Platform</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'dashboard'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-slate-500" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={handleMyCasesClick}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'case-details'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">My Cases</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700 font-mono">
              {cases.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('new-case')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'new-case'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                : 'bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Case</span>
          </button>
        </nav>

        {/* Right User & Actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 pl-1">
            <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-700 font-bold text-xs">
              {getUserInitials(user?.name)}
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-semibold text-slate-800">{user?.name || 'Verified User'}</div>
              <div className="text-[10px] text-slate-500">{activeCount} active cases</div>
            </div>
          </div>

          <button 
            onClick={logout}
            title="Sign Out"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
};
