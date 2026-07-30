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
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* Header Banner */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Grounded RAG Legal Engine
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Consumer Grievance Dashboard
            </h1>
            <p className="text-sm text-slate-600">
              Manage your active grievances, review statutory legal advice, and generate formal notices.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('new-case')}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm transition-all shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Case</span>
          </button>
        </div>

        {/* Featured Demo Scenarios Quick Launcher for Presentations */}
        <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div 
            onClick={() => handleCaseClick('1042')}
            className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200/80 hover:bg-indigo-100/80 transition-all cursor-pointer flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                TV
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                  Demo Case 1: Defective OLED Smart TV
                </span>
                <p className="text-[11px] text-slate-500">CPA 2019 Warranty & Refusal Dispute ($1,299)</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-indigo-600 group-hover:translate-x-1 transition-transform" />
          </div>

          <div 
            onClick={() => handleCaseClick('1039')}
            className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-all cursor-pointer flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                $
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                  Demo Case 2: Unauthorized Subscription Debit
                </span>
                <p className="text-[11px] text-slate-500">RBI Ombudsman & E-Commerce Rules ($240)</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Metrics Summary Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Cases</span>
            <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{totalCases}</span>
            <span className="text-xs text-slate-500 ml-2">Logged</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Pending Info</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-600">{pendingAction}</span>
            <span className="text-xs text-slate-500 ml-2">Action required</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">In Progress</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-blue-600">{inProgress}</span>
            <span className="text-xs text-slate-500 ml-2">Active notices</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Resolved Cases</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600">{resolved}</span>
            <span className="text-xs text-slate-500 ml-2">Settled</span>
          </div>
        </div>

      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4 shadow-xs">
        
        <div className="flex flex-col md:flex-row items-center gap-4">
          
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by case #, title, or vendor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
            />
          </div>

          {/* Status Dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-indigo-600 w-full md:w-48"
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
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>

      {/* Case Cards Grid */}
      {filteredCases.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 space-y-3 shadow-xs">
          <ShieldCheck className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No cases match your filter</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">Try clearing search terms or status filters.</p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('All'); setSelectedStatus('All'); }}
            className="text-xs text-indigo-600 font-semibold hover:underline"
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
                className="group bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl p-5 space-y-4 hover:shadow-md cursor-pointer transition-all duration-150 flex flex-col justify-between"
              >
                <div>
                  
                  {/* Card Header: Case # & Status */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                        #{c.id.length > 8 ? c.id.substring(0, 8) : c.id}
                      </span>
                      <CategoryBadge category={c.category} />
                    </div>
                    <UrgencyBadge urgency={c.urgency} />
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
                    {c.title}
                  </h3>

                  {/* Description snippet */}
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                    {c.description}
                  </p>

                </div>

                <div className="space-y-3.5 pt-3 border-t border-slate-100">
                  
                  {/* Vendor & Amount metadata */}
                  <div className="flex items-center justify-between text-xs text-slate-700 font-medium">
                    <span className="text-slate-500 truncate max-w-[140px]">{c.vendorName}</span>
                    <span className="text-slate-900 font-bold">{c.claimedAmount}</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Stage Status</span>
                      <StatusBadge status={c.status} />
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          c.status === 'Resolved' ? 'bg-emerald-500' : 'bg-indigo-600'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Footer metadata */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <div className="flex items-center gap-1">
                      <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                      <span>{c.evidence.length} File(s)</span>
                    </div>
                    <div className="flex items-center gap-1 font-semibold text-indigo-600 group-hover:translate-x-0.5 transition-transform">
                      <span>Open Details</span>
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
