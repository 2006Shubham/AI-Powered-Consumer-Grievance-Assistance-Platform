import React, { useState } from 'react';
import { 
  Loader2, ArrowLeft, ArrowRight, ShieldCheck, 
  HelpCircle, AlertCircle
} from 'lucide-react';
import { useCases } from '../context/CaseContext';
import type { CaseCategory } from '../types/case';

interface ScenarioPreset {
  title: string;
  category: CaseCategory;
  vendorName: string;
  claimedAmount: string;
  desiredResolution: string;
  description: string;
}

const PRESET_SCENARIOS: ScenarioPreset[] = [
  {
    title: 'Defective Smart TV Warranty Denial',
    category: 'Electronics',
    vendorName: 'ElectroTech Megastore',
    claimedAmount: '$1,299.00',
    desiredResolution: 'Full Refund or Unit Replacement',
    description: 'I purchased a 55-inch OLED Smart TV from ElectroTech for $1,299. After 2 months of normal use, the display panel failed completely. The authorized service center denied warranty repair alleging liquid damage, which is false and unverified. They refuse to refund or replace the unit.'
  },
  {
    title: 'Unauthorized Subscription Auto-Debit',
    category: 'Banking',
    vendorName: 'CloudStream Global Services',
    claimedAmount: '$240.00',
    desiredResolution: 'Immediate Charge Reversal & Account Cancellation',
    description: 'CloudStream billed my debit card $60 per month for four consecutive months ($240 total) after I cancelled the service trial within the 7-day trial window. Despite cancellation emails and repeated support tickets, they refuse to refund the disputed transactions.'
  },
  {
    title: 'Abnormally High Electricity Bill',
    category: 'Utilities',
    vendorName: 'City Power & Grid Co.',
    claimedAmount: '$450.00',
    desiredResolution: 'Meter Calibration & Bill Adjustment to Average',
    description: 'City Power sent an electricity invoice for $450 in June, over 300% above my historical average, even though our family was out of town for two weeks with all main breakers switched off. Customer care refuses to calibrate the digital meter or adjust the charges.'
  }
];

export const NewCaseWizard: React.FC = () => {
  const { addNewCase, setActiveTab } = useCases();

  // Form State
  const [description, setDescription] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [claimedAmount, setClaimedAmount] = useState('');
  const [category, setCategory] = useState<CaseCategory>('Electronics');
  const [desiredResolution, setDesiredResolution] = useState('Full Refund');
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleApplyPreset = (preset: ScenarioPreset) => {
    setDescription(preset.description);
    setVendorName(preset.vendorName);
    setClaimedAmount(preset.claimedAmount);
    setCategory(preset.category);
    setDesiredResolution(preset.desiredResolution);
    setShowOptionalFields(true);
    setSubmitError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setSubmitError('Please describe your grievance before continuing.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    // Derive a clean, concise title from description or vendor
    let title = '';
    if (vendorName) {
      title = `${category} Dispute with ${vendorName}`;
    } else {
      const firstSentence = description.split('.')[0].trim();
      title = firstSentence.length > 60 ? firstSentence.substring(0, 57) + '...' : firstSentence;
    }

    try {
      await addNewCase({
        title: title || 'Consumer Grievance Claim',
        description: description.trim(),
        category,
        vendorName: vendorName.trim() || undefined,
        claimedAmount: claimedAmount.trim() || undefined,
        desiredResolution: desiredResolution.trim() || undefined,
      });
      // addNewCase automatically updates activeCaseId and switches to 'case-details'
    } catch (err: any) {
      console.error('Case submission error:', err);
      setSubmitError(err.message || 'Failed to submit grievance. Please verify backend connection.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      
      {/* Top Header */}
      <div>
        <button 
          onClick={() => setActiveTab('dashboard')}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors mb-3 font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Grievances
        </button>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Register a Grievance
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Describe your issue in plain language. Our Groq AI analyzes your claim, extracts key facts, cites relevant consumer protection statutes, and asks clarifying questions.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-medium shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Consumer Protection Act</span>
          </div>
        </div>
      </div>

      {/* Preset Scenarios Strip */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wide">
            Or pick a common scenario to test:
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {PRESET_SCENARIOS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(preset)}
              className="text-left p-2.5 bg-white border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30 rounded-md transition-all text-xs group"
            >
              <div className="font-semibold text-slate-800 group-hover:text-indigo-900 leading-tight">
                {preset.title}
              </div>
              <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                <span>{preset.vendorName}</span>
                <span className="font-mono text-slate-700">{preset.claimedAmount}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Submission Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-lg p-5 sm:p-6 space-y-5">
        
        {submitError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-md flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        {/* Section 1: Grievance Description */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-900">
              1. What happened? <span className="text-rose-500">*</span>
            </label>
            <span className="text-[11px] text-slate-400">Natural language input</span>
          </div>
          <textarea
            rows={6}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Explain what happened in detail: mention the company name, date of purchase or incident, what product or service failed, how customer care responded, and what outcome you are asking for..."
            className="w-full bg-slate-50 border border-slate-200 rounded-md p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-all resize-y leading-relaxed"
          />
          <p className="text-[11px] text-slate-500">
            Be as specific as possible. The AI engine uses these details to cross-reference consumer protection rules.
          </p>
        </div>

        {/* Section 2: Optional Structured Fields Toggle */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-800">2. Specific Details</span>
              <p className="text-[11px] text-slate-500">
                Optional. You can provide these now, or let the AI extract them automatically.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowOptionalFields(!showOptionalFields)}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              {showOptionalFields ? 'Hide Details' : 'Add Details'}
            </button>
          </div>

          {showOptionalFields && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-3 border-t border-slate-100">
              
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Merchant / Company Name</label>
                <input
                  type="text"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  placeholder="e.g. Amazon, ElectroTech, HDFC Bank"
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Disputed / Claimed Amount</label>
                <input
                  type="text"
                  value={claimedAmount}
                  onChange={(e) => setClaimedAmount(e.target.value)}
                  placeholder="e.g. $1,299.00 or ₹45,000"
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as CaseCategory)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
                >
                  <option value="Electronics">Electronics & Appliances</option>
                  <option value="E-commerce">E-commerce & Online Orders</option>
                  <option value="Banking">Banking & Financial Services</option>
                  <option value="Utilities">Utilities & Public Services</option>
                  <option value="Telecommunications">Telecommunications & Internet</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Desired Outcome</label>
                <input
                  type="text"
                  value={desiredResolution}
                  onChange={(e) => setDesiredResolution(e.target.value)}
                  placeholder="e.g. Full Refund, Replacement Unit, Free Repair"
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
                />
              </div>

            </div>
          )}
        </div>

        {/* Submit Action Area */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>AI will organize facts, check statutory remedies, and ask 3 follow-up questions.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => {
                setDescription('');
                setVendorName('');
                setClaimedAmount('');
                setSubmitError(null);
              }}
              className="px-3 py-2 rounded-md text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              Clear
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !description.trim()}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-medium text-xs shadow-xs transition-colors shrink-0"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Analyzing with AI...</span>
                </>
              ) : (
                <>
                  <span>Submit & Analyze Grievance</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>

      </form>

    </div>
  );
};
