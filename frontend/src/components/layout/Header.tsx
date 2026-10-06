import React from 'react';
import { Scale, PlusCircle, LayoutDashboard, FolderOpen, LogOut } from 'lucide-react';
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
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 lg:px-8 py-3 transition-all shadow-2xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
            <Scale className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg text-slate-900 tracking-tight">Grievance<span className="text-indigo-600">AI</span></span>
              <span className="inline-flex items-center gap-1 text-[10px] bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-full font-semibold">
                India Redressal
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">Smart Resolution Platform</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all btn-tactile ${
              activeTab === 'dashboard'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-slate-500" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={handleMyCasesClick}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all btn-tactile ${
              activeTab === 'case-details'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Disputes</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700 font-mono">
              {cases.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('new-case')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all btn-tactile ${
              activeTab === 'new-case'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-800 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Grievance</span>
          </button>
        </nav>

        {/* Right User & Actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 pl-1">
            <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-white font-bold text-xs shadow-2xs">
              {getUserInitials(user?.name)}
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-bold text-slate-900">{user?.name || 'Verified Consumer'}</div>
              <div className="text-[10px] text-slate-500">{activeCount} active claims</div>
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
