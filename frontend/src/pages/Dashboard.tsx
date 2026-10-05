import React, { useState } from 'react';
import { Search, Plus, ChevronRight, Inbox, Filter } from 'lucide-react';
import { useCases } from '../context/CaseContext';
import { StatusBadge } from '../components/common/Badge';

export const Dashboard: React.FC = () => {
  const { cases, setActiveCaseId, setActiveTab, isLoadingCases } = useCases();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  // Compute live metrics from actual case data
  const totalCases = cases.length;
  const inProgress = cases.filter(c => c.status === 'In Progress' || c.status === 'AI Analyzing' || c.status === 'Escalated').length;
  const pendingInfo = cases.filter(c => c.status === 'Pending Info' || c.status === 'Draft').length;
  const resolved = cases.filter(c => c.status === 'Resolved').length;

  // Filter cases based on search and status
  const filteredCases = cases.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.vendorName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedStatus === 'All' || c.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCaseClick = (id: string) => {
    setActiveCaseId(id);
    setActiveTab('case-details');
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn max-w-5xl mx-auto">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Your Grievances
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Track and manage your filed consumer claims, generated notices, and next steps.
          </p>
        </div>
        <button
          onClick={() => setActiveTab('new-case')}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-md bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-colors shadow-2xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Grievance</span>
        </button>
      </div>

      {/* Compact Overview Bar - Simple, not huge cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white border border-slate-200 rounded-lg p-3 text-xs shadow-2xs">
        <div className="px-3 py-1.5">
          <span className="text-slate-500 block text-[11px] font-medium uppercase tracking-wider">Total</span>
          <span className="text-xl font-bold text-slate-900">{totalCases}</span>
        </div>
        <div className="px-3 py-1.5 border-l border-slate-100 sm:border-slate-200">
          <span className="text-slate-500 block text-[11px] font-medium uppercase tracking-wider">Active</span>
          <span className="text-xl font-bold text-blue-600">{inProgress}</span>
        </div>
        <div className="px-3 py-1.5 border-l border-slate-100 sm:border-slate-200">
          <span className="text-slate-500 block text-[11px] font-medium uppercase tracking-wider">Action Needed</span>
          <span className="text-xl font-bold text-amber-600">{pendingInfo}</span>
        </div>
        <div className="px-3 py-1.5 border-l border-slate-100 sm:border-slate-200">
          <span className="text-slate-500 block text-[11px] font-medium uppercase tracking-wider">Resolved</span>
          <span className="text-xl font-bold text-emerald-600">{resolved}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search grievances by title, merchant, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-md pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 transition-colors shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400 hidden sm:block shrink-0" />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-white border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-slate-400 w-full sm:w-44 shadow-2xs cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="In Progress">In Progress</option>
            <option value="Pending Info">Pending Info</option>
            <option value="Resolved">Resolved</option>
            <option value="Draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Cases List */}
      <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100 overflow-hidden shadow-2xs">
        {isLoadingCases ? (
          <div className="p-8 text-center space-y-2">
            <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500">Loading your grievances...</p>
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="py-12 px-4 text-center space-y-3">
            <Inbox className="w-8 h-8 text-slate-300 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-800">No grievances found</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              {searchQuery || selectedStatus !== 'All' 
                ? 'Try adjusting your search terms or status filter.'
                : 'You have not registered any grievance cases yet.'}
            </p>
            {searchQuery || selectedStatus !== 'All' ? (
              <button
                onClick={() => { setSearchQuery(''); setSelectedStatus('All'); }}
                className="text-xs text-indigo-600 font-medium hover:underline"
              >
                Reset filters
              </button>
            ) : (
              <button
                onClick={() => setActiveTab('new-case')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create your first case</span>
              </button>
            )}
          </div>
        ) : (
          filteredCases.map((c) => {
            const shortId = c.id.length > 8 ? c.id.substring(c.id.length - 6).toUpperCase() : c.id;
            return (
              <div
                key={c.id}
                onClick={() => handleCaseClick(c.id)}
                className="p-4 hover:bg-slate-50/80 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                {/* Left side: ID, Title, Category · Status */}
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-slate-400 font-medium">
                      #{shortId}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {c.category}
                    </span>
                    <span className="text-slate-300">•</span>
                    <StatusBadge status={c.status} />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                    {c.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-1">
                    {c.description}
                  </p>
                </div>

                {/* Right side: Vendor, Amount, Date & Arrow */}
                <div className="flex items-center justify-between sm:justify-end sm:gap-6 shrink-0 pt-2 sm:pt-0 border-t border-slate-50 sm:border-t-0">
                  <div className="text-left sm:text-right">
                    <div className="text-xs font-semibold text-slate-900">{c.claimedAmount}</div>
                    <div className="text-[11px] text-slate-400">{c.vendorName}</div>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span>Updated {c.lastUpdated}</span>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
