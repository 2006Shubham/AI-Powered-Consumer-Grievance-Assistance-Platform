import React, { useState, useMemo } from 'react';
import { 
  Search, Plus, ChevronRight, Inbox,
  Building2, IndianRupee, Clock, CheckCircle2 
} from 'lucide-react';
import { useCases } from '../context/CaseContext';
import { StatusBadge, CategoryBadge } from '../components/common/Badge';

export const Dashboard: React.FC = () => {
  const { cases, setActiveCaseId, setActiveTab, isLoadingCases } = useCases();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedVendorFilter, setSelectedVendorFilter] = useState<string>('All');

  // Compute live metrics from actual case data
  const totalCases = cases.length;
  const inProgress = cases.filter(c => c.status === 'In Progress' || c.status === 'AI Analyzing' || c.status === 'Escalated').length;
  const pendingInfo = cases.filter(c => c.status === 'Pending Info' || c.status === 'Draft').length;
  const resolved = cases.filter(c => c.status === 'Resolved').length;

  // Calculate total monetary value disputed in INR
  const totalDisputedAmount = useMemo(() => {
    let sum = 0;
    for (const c of cases) {
      if (!c.claimedAmount) continue;
      const clean = c.claimedAmount.replace(/[^0-9]/g, '');
      const val = parseInt(clean, 10);
      if (!isNaN(val)) sum += val;
    }
    return sum.toLocaleString('en-IN');
  }, [cases]);

  // Unique vendors for quick filtering
  const vendorList = useMemo(() => {
    const list = new Set<string>();
    cases.forEach(c => {
      if (c.vendorName) {
        if (c.vendorName.toLowerCase().includes('hp')) list.add('HP India');
        else if (c.vendorName.toLowerCase().includes('acer')) list.add('Acer India');
        else if (c.vendorName.toLowerCase().includes('samsung')) list.add('Samsung India');
        else if (c.vendorName.toLowerCase().includes('apple')) list.add('Apple India');
        else if (c.vendorName.toLowerCase().includes('flipkart')) list.add('Flipkart');
        else if (c.vendorName.toLowerCase().includes('amazon')) list.add('Amazon India');
        else if (c.vendorName.toLowerCase().includes('hdfc')) list.add('HDFC Bank');
        else list.add(c.vendorName);
      }
    });
    return Array.from(list);
  }, [cases]);

  // Filter cases based on search, vendor and status
  const filteredCases = cases.filter(c => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = c.title.toLowerCase().includes(query) ||
                          c.id.toLowerCase().includes(query) ||
                          c.vendorName.toLowerCase().includes(query) ||
                          (c.transactionId && c.transactionId.toLowerCase().includes(query));
    
    const matchesStatus = selectedStatus === 'All' || c.status === selectedStatus;

    let matchesVendor = true;
    if (selectedVendorFilter !== 'All') {
      matchesVendor = c.vendorName.toLowerCase().includes(selectedVendorFilter.toLowerCase().split(' ')[0]);
    }

    return matchesSearch && matchesStatus && matchesVendor;
  });

  const handleCaseClick = (id: string) => {
    setActiveCaseId(id);
    setActiveTab('case-details');
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn max-w-6xl mx-auto">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Consumer Grievance Workspace
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Track your active disputes, review AI-generated complaints, and manage resolutions in one place.
          </p>
        </div>
        <button
          onClick={() => setActiveTab('new-case')}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors shadow-xs shrink-0 btn-tactile"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Grievance</span>
        </button>
      </div>

      {/* MNC Financial Overview & Status Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
        <div className="px-3 py-1 space-y-1">
          <span className="text-slate-400 block text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-400" /> Total Disputes
          </span>
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight">{totalCases}</div>
          <span className="text-[11px] text-slate-400">Formal claims logged</span>
        </div>

        <div className="px-3 py-1 border-l border-slate-100 sm:border-slate-200 space-y-1">
          <span className="text-slate-400 block text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <IndianRupee className="w-3.5 h-3.5 text-indigo-600" /> Capital at Stake
          </span>
          <div className="text-2xl font-extrabold text-indigo-950 font-mono tracking-tight">
            ₹{totalDisputedAmount}
          </div>
          <span className="text-[11px] text-slate-400">Total disputed claims</span>
        </div>

        <div className="px-3 py-1 border-l border-slate-100 sm:border-slate-200 space-y-1">
          <span className="text-slate-400 block text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-500" /> Action Required
          </span>
          <div className="text-2xl font-extrabold text-amber-600 tracking-tight">{pendingInfo + inProgress}</div>
          <span className="text-[11px] text-slate-400">Under evaluation / notice</span>
        </div>

        <div className="px-3 py-1 border-l border-slate-100 sm:border-slate-200 space-y-1">
          <span className="text-slate-400 block text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Resolution Ready
          </span>
          <div className="text-2xl font-extrabold text-emerald-600 tracking-tight">{resolved}</div>
          <span className="text-[11px] text-slate-400">Redressed or closed</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by product, company (HP, Samsung, Flipkart...), or Transaction ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 transition-colors shadow-2xs"
          />
        </div>

        {/* Brand quick filter */}
        <div className="flex items-center gap-2">
          <select
            value={selectedVendorFilter}
            onChange={(e) => setSelectedVendorFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-xs font-medium text-slate-700 focus:outline-none focus:border-slate-400 shadow-2xs cursor-pointer w-full sm:w-auto"
          >
            <option value="All">All Companies</option>
            {vendorList.map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-xs font-medium text-slate-700 focus:outline-none focus:border-slate-400 shadow-2xs cursor-pointer w-full sm:w-auto"
          >
            <option value="All">All Statuses</option>
            <option value="In Progress">In Progress</option>
            <option value="Pending Info">Action Needed</option>
            <option value="Resolved">Resolved</option>
            <option value="Draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Cases List */}
      <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden shadow-2xs">
        {isLoadingCases ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Loading registered consumer claims...</p>
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="py-16 px-4 text-center space-y-3">
            <Inbox className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-900">No grievances match your criteria</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              {searchQuery || selectedStatus !== 'All' || selectedVendorFilter !== 'All'
                ? 'Try resetting the company filter or clearing your search keywords.'
                : 'You have not registered any grievance claims yet.'}
            </p>
            {searchQuery || selectedStatus !== 'All' || selectedVendorFilter !== 'All' ? (
              <button
                onClick={() => { setSearchQuery(''); setSelectedStatus('All'); setSelectedVendorFilter('All'); }}
                className="text-xs text-indigo-600 font-semibold hover:underline"
              >
                Clear all filters
              </button>
            ) : (
              <button
                onClick={() => setActiveTab('new-case')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors btn-tactile"
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
                className="p-4 sm:p-5 interactive-row cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                {/* Left side: ID, Title, Category · Status */}
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[11px] text-slate-400 font-semibold">
                      #{shortId}
                    </span>
                    <span className="text-slate-300">•</span>
                    <CategoryBadge category={c.category} />
                    <StatusBadge status={c.status} />
                    {c.transactionId && (
                      <>
                        <span className="text-slate-300 hidden md:inline">•</span>
                        <span className="font-mono text-[11px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded hidden md:inline">
                          {c.transactionId}
                        </span>
                      </>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                    {c.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-1 leading-relaxed">
                    {c.description}
                  </p>
                </div>

                {/* Right side: Vendor, Amount, Date & Arrow */}
                <div className="flex items-center justify-between sm:justify-end sm:gap-6 shrink-0 pt-2 sm:pt-0 border-t border-slate-50 sm:border-t-0">
                  <div className="text-left sm:text-right">
                    <div className="text-xs font-bold text-slate-900 font-mono">{c.claimedAmount}</div>
                    <div className="text-[11px] text-slate-500 font-medium">{c.vendorName}</div>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span className="hidden sm:inline">Updated {c.lastUpdated}</span>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all" />
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
