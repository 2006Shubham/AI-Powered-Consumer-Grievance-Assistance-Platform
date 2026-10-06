import React, { useState } from 'react';
import { 
  Loader2, ArrowLeft, ArrowRight, ShieldCheck, 
  HelpCircle, AlertCircle, Laptop, Smartphone, Tv, ShoppingCart, CreditCard
} from 'lucide-react';
import { useCases, extractAmountFromDesc, extractVendorFromDesc } from '../context/CaseContext';
import type { CaseCategory } from '../types/case';

interface ScenarioPreset {
  title: string;
  category: CaseCategory;
  vendorName: string;
  claimedAmount: string;
  desiredResolution: string;
  description: string;
  icon: 'laptop' | 'smartphone' | 'tv' | 'shopping' | 'card';
}

const PRESET_SCENARIOS: ScenarioPreset[] = [
  {
    title: 'HP Laptop Motherboard Warranty Denial',
    category: 'Electronics',
    vendorName: 'HP India & Flipkart',
    claimedAmount: '₹68,990',
    desiredResolution: 'Free Motherboard Replacement under Warranty or 100% Refund',
    description: 'Purchased an HP Pavilion 15 laptop on Flipkart for ₹68,990 with 1-Year HP Onsite Warranty. After 45 days, the laptop shut down abruptly and failed to boot. HP Authorized Service Center in Bengaluru falsely classified the defect as "Customer Induced Damage (CID) / Liquid Ingress" without technical proof, demanding ₹34,500 for motherboard replacement. Flipkart refused return assistance citing their 7-day window. Denying repair violates standard manufacturer warranty terms.',
    icon: 'laptop'
  },
  {
    title: 'Samsung Galaxy Green Line Post-Update',
    category: 'Electronics',
    vendorName: 'Samsung India Electronics',
    claimedAmount: '₹54,999',
    desiredResolution: 'Free AMOLED Display Replacement or Full Refund',
    description: 'Own a Samsung Galaxy S23 purchased for ₹54,999 in immaculate physical condition with untripped moisture indicators. Immediately following Samsung\'s official One UI OTA firmware update, a persistent vertical green line appeared across the AMOLED screen. Samsung Smart Care center quoted ₹14,500 for display replacement alleging warranty expired 2 weeks ago. Manufacturer-induced software defects are covered under consumer rights.',
    icon: 'smartphone'
  },
  {
    title: 'Acer Nitro 5 Hinge Fracture & DOA Dispute',
    category: 'Electronics',
    vendorName: 'Acer India & Amazon.in',
    claimedAmount: '₹74,500',
    desiredResolution: 'Immediate Sealed Unit Replacement or ₹74,500 Refund',
    description: 'Purchased an Acer Nitro 5 Gaming Laptop on Amazon.in for ₹74,500. On day 4 of normal use, the right chassis hinge cracked, pinching the display cable and causing screen flickering. Amazon refused replacement without an Acer DOA verification certificate, while Acer service center delayed inspection for 18 days and falsely claimed mechanical hinge fatigue is "customer physical damage" excluded from warranty.',
    icon: 'laptop'
  },
  {
    title: 'Flipkart Open Box Delivery Broken TV Trap',
    category: 'E-commerce',
    vendorName: 'Flipkart Internet Pvt Ltd',
    claimedAmount: '₹32,999',
    desiredResolution: '100% Full Refund of ₹32,999 to Source Bank Account',
    description: 'Ordered a 55-inch 4K Smart TV on Flipkart for ₹32,999. The delivery person demanded the delivery verification OTP before unboxing. Upon unboxing during technician installation 3 hours later, the inner panel was discovered shattered. Flipkart customer support summarily rejected replacement, alleging that OTP verification waived all transit damage claims. Delivery inspection was unfairly refused prior to OTP.',
    icon: 'tv'
  },
  {
    title: 'Apple iPhone 15 Pro Battery Drain & DOA',
    category: 'Electronics',
    vendorName: 'Apple India & Imagine Store',
    claimedAmount: '₹1,34,900',
    desiredResolution: 'Brand New Sealed Unit Replacement or Full Refund',
    description: 'Purchased an Apple iPhone 15 Pro for ₹1,34,900 from an Apple Authorized Reseller. The device overheated to 46.2°C and drained from 100% to 0% in under 4 hours on standby. Deposited device with Apple Authorized Service Provider (AASP) within 5 days of invoice. AASP refused DOA replacement claiming automated diagnostics passed, leaving me with a defective device unfit for daily use.',
    icon: 'smartphone'
  },
  {
    title: 'Unauthorized UPI Recurring Auto-Debit',
    category: 'Banking',
    vendorName: 'HDFC Bank Ltd',
    claimedAmount: '₹14,999',
    desiredResolution: 'Immediate Charge Reversal & Revocation of UPI Mandate',
    description: 'Three unauthorized debits of ₹4,999.66 each occurred on my savings account via an unknown UPI e-mandate. HDFC Bank failed to send mandatory advance SMS alerts. Reported to bank grievance desk within 18 hours (zero liability window). Bank has failed to credit shadow funds within 10 working days.',
    icon: 'card'
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

    const autoVendor = extractVendorFromDesc(description, '');
    const autoAmount = extractAmountFromDesc(description);
    const resolvedVendor = vendorName.trim() || autoVendor || undefined;
    const resolvedAmount = claimedAmount.trim() || autoAmount || undefined;

    // Derive a clean, concise title from description or vendor
    let title = '';
    if (resolvedVendor) {
      title = `${category} Dispute with ${resolvedVendor}`;
    } else {
      const firstSentence = description.split('.')[0].trim();
      title = firstSentence.length > 60 ? firstSentence.substring(0, 57) + '...' : firstSentence;
    }

    try {
      await addNewCase({
        title: title || 'Consumer Grievance Claim',
        description: description.trim(),
        category,
        vendorName: resolvedVendor,
        claimedAmount: resolvedAmount,
        desiredResolution: desiredResolution.trim() || undefined,
      });
    } catch (err: any) {
      console.error('Case submission error:', err);
      setSubmitError(err.message || 'Failed to submit grievance. Please verify backend connection.');
      setIsSubmitting(false);
    }
  };

  const renderPresetIcon = (iconType: string) => {
    switch (iconType) {
      case 'laptop': return <Laptop className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-900 transition-colors" />;
      case 'smartphone': return <Smartphone className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-900 transition-colors" />;
      case 'tv': return <Tv className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-900 transition-colors" />;
      case 'shopping': return <ShoppingCart className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-900 transition-colors" />;
      case 'card': return <CreditCard className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-900 transition-colors" />;
      default: return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fadeIn">
      
      {/* Top Header */}
      <div className="border-b border-slate-200 pb-5">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors mb-3 font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </button>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Register Consumer Grievance
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Describe what happened in simple, everyday language. We'll organize the facts, identify your rights, and draft a clear complaint letter.
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold shrink-0 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Smart Resolution Assistant</span>
          </div>
        </div>
      </div>

      {/* Preset Scenarios Strip */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Popular Indian Consumer Scenarios
            </span>
            <span className="text-[11px] text-slate-400 font-medium">Click any scenario to auto-fill</span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {PRESET_SCENARIOS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(preset)}
              className="text-left p-3 bg-slate-50/80 hover:bg-slate-100/90 border border-slate-200/90 hover:border-slate-300 rounded-lg transition-all text-xs group flex flex-col justify-between space-y-2 card-enterprise"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-slate-700">
                  {renderPresetIcon(preset.icon)}
                  <span className="font-semibold text-slate-900 group-hover:text-slate-950 leading-snug line-clamp-1">
                    {preset.title}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                  {preset.description}
                </p>
              </div>
              <div className="text-[11px] text-slate-600 pt-1.5 border-t border-slate-200/60 flex items-center justify-between font-medium">
                <span className="truncate max-w-[140px] text-slate-500">{preset.vendorName}</span>
                <span className="font-mono font-semibold text-slate-900">{preset.claimedAmount}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Submission Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-5 sm:p-7 space-y-6 shadow-2xs">
        
        {submitError && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        {/* Section 1: Grievance Description */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              1. Grievance Statement <span className="text-rose-500">*</span>
            </label>
            <span className="text-[11px] text-slate-400 font-medium">Natural language input</span>
          </div>
          <textarea
            rows={6}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what occurred: company name, purchase date or transaction ID, nature of product defect or service deficiency, response of customer service, and remedy sought (e.g., full refund in INR, unit replacement, or free repair)..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-all resize-y leading-relaxed"
          />
          <p className="text-[11px] text-slate-500">
            Mention order numbers, dates, or what customer support told you. We'll automatically identify the details and draft your complaint.
          </p>
        </div>

        {/* Section 2: Specific Details */}
        <div className="pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">2. Dispute Metadata</span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Optional. You can specify these now or allow the AI to extract them from your statement.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowOptionalFields(!showOptionalFields)}
              className="text-xs font-semibold text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              {showOptionalFields ? 'Hide Metadata' : '+ Add Metadata'}
            </button>
          </div>

          {showOptionalFields && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100 animate-slideDown">
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Company / Brand / Seller Name</label>
                <input
                  type="text"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  placeholder="e.g. HP India, Flipkart, Amazon.in, Samsung India, Apple, HDFC Bank"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Disputed / Claimed Amount (₹)</label>
                <input
                  type="text"
                  value={claimedAmount}
                  onChange={(e) => setClaimedAmount(e.target.value)}
                  placeholder="e.g. ₹68,990 or ₹1,34,900"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as CaseCategory)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors cursor-pointer"
                >
                  <option value="Electronics">Electronics & Hardware Warranties</option>
                  <option value="E-commerce">E-Commerce, Marketplace Orders & Open Box Delivery</option>
                  <option value="Banking">Banking, UPI & Financial Transactions</option>
                  <option value="Telecommunications">Telecommunications & Mobile Networks</option>
                  <option value="Utilities">Utilities & Public Services</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Desired Relief</label>
                <input
                  type="text"
                  value={desiredResolution}
                  onChange={(e) => setDesiredResolution(e.target.value)}
                  placeholder="e.g. 100% Full Refund, Free Unit Replacement, Free Warranty Repair"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
                />
              </div>

            </div>
          )}
        </div>

        {/* Submit Action Area */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
            <span>AI extracts key facts, organizes timeline details, and drafts a professional complaint notice.</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => {
                setDescription('');
                setVendorName('');
                setClaimedAmount('');
                setSubmitError(null);
              }}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors btn-tactile"
            >
              Clear
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !description.trim()}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold text-xs shadow-xs transition-colors shrink-0 btn-tactile"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Analyzing Grievance...</span>
                </>
              ) : (
                <>
                  <span>File & Analyze Grievance</span>
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
