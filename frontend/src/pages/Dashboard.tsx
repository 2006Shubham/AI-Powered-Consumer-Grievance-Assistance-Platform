import React, { useState } from 'react';
import { 
  Search, PlusCircle, Filter, FileText, CheckCircle2, Clock, 
  AlertTriangle, ShieldCheck, ChevronRight, Paperclip, Sparkles 
} from 'lucide-react';
import { useCases } from '../context/CaseContext';
import { CategoryBadge, StatusBadge, UrgencyBadge } from '../components/common/Badge';
import type { CaseStatus } from '../types/case';

export const Dashboard: React.FC = () => {
  const { cases, setActiveCaseId, setActiveTab } = useCases();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  // Compute summary metrics
  const totalCases = cases.length;
  const pendingAction = cases.filter(c => c.status === 'Pending Info' || c.status === 'AI Analyzing').length;
  const inProgress = cases.filter(c => c.status === 'In Progress' || c.status === 'Escalated').length;
  const resolved = cases.filter(c => c.status === 'Resolved').length;

  const categoriesList = ['All', 'Electronics', 'E-commerce', 'Banking', 'Utilities', 'Telecommunications'];
  const statusList = ['All', 'In Progress', 'Pending Info', 'AI Analyzing', 'Escalated', 'Resolved'];

  // Filter cases
  const filteredCases = cases.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.id.includes(searchQuery) ||
                          c.vendorName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || c.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleCaseClick = (id: string) => {
    setActiveCaseId(id);
    setActiveTab('case-details');
  };

  const getStageProgress = (status: CaseStatus) => {
    switch(status) {
      case 'Draft': return 15;
      case 'AI Analyzing': return 35;
      case 'Pending Info': return 50;
      case 'In Progress': return 75;
      case 'Escalated': return 88;
      case 'Resolved': return 100;
      default: return 20;
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900/40 via-slate-900 to-slate-900 border border-indigo-500/20 p-6 sm:p-8">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" /> AI Legal Assistant Active
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Consumer Grievance Resolution Hub
            </h1>
            <p className="text-sm text-slate-300">
              Automated RAG guidance, instant legal notice drafting, and statutory Consumer Protection Act enforcement.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('new-case')}
            className="flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Create New Case</span>
          </button>
        </div>
      </div>

      {/* Metrics Summary Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Cases</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-bold text-white">{totalCases}</span>
            <span className="text-xs text-slate-400 ml-2">Logged</span>
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Pending Action</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-bold text-amber-400">{pendingAction}</span>
            <span className="text-xs text-slate-400 ml-2">Requires input</span>
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">In Progress / Escalated</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-bold text-blue-400">{inProgress}</span>
            <span className="text-xs text-slate-400 ml-2">Active legal notices</span>
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Resolved Cases</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-bold text-emerald-400">{resolved}</span>
            <span className="text-xs text-slate-400 ml-2">100% refund recovered</span>
          </div>
        </div>

      </div>

      {/* Search & Filter Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-4">
        
        <div className="flex flex-col md:flex-row items-center gap-4">
          
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by case #, grievance title, or vendor name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>

          {/* Status Dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 w-full md:w-48"
            >
              <option value="All">All Statuses</option>
              {statusList.filter(s => s !== 'All').map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-semibold text-slate-500 pr-2">Category:</span>
          {categoriesList.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>

      {/* Case Cards Responsive Grid */}
      {filteredCases.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800 space-y-3">
          <ShieldCheck className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-slate-300">No cases match your filters</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">Try adjusting your search keywords or clearing the category filter.</p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('All'); setSelectedStatus('All'); }}
            className="text-xs text-indigo-400 font-semibold hover:underline"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCases.map(c => {
            const progress = getStageProgress(c.status);
            return (
              <div
                key={c.id}
                onClick={() => handleCaseClick(c.id)}
                className="group relative bg-slate-900/80 border border-slate-800/90 hover:border-indigo-500/50 rounded-2xl p-5 space-y-4 hover:shadow-2xl hover:shadow-indigo-500/10 cursor-pointer transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  
                  {/* Card Header: Case # & Status */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-950/60 border border-indigo-800/50 px-2 py-0.5 rounded">
                        #{c.id}
                      </span>
                      <CategoryBadge category={c.category} />
                    </div>
                    <UrgencyBadge urgency={c.urgency} />
                  </div>

                  {/* Title */}
                  <h3 className="font-semibold text-slate-100 text-base group-hover:text-indigo-300 transition-colors line-clamp-2">
                    {c.title}
                  </h3>

                  {/* Description snippet */}
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                    {c.description}
                  </p>

                </div>

                <div className="space-y-4 pt-2 border-t border-slate-800/80">
                  
                  {/* Vendor & Amount metadata */}
                  <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
                    <span className="text-slate-400 truncate max-w-[150px]">{c.vendorName}</span>
                    <span className="text-emerald-400 font-bold">{c.claimedAmount}</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Current Stage</span>
                      <StatusBadge status={c.status} />
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          c.status === 'Resolved' ? 'bg-emerald-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Footer metadata */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <div className="flex items-center gap-1">
                      <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                      <span>{c.evidence.length} Evidence Docs</span>
                    </div>
                    <div className="flex items-center gap-1 font-medium text-indigo-400 group-hover:translate-x-1 transition-transform">
                      <span>View Details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
