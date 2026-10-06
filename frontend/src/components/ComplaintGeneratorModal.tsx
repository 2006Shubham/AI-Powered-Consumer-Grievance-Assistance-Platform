import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, Download, Copy, Check, Sparkles, X, Save, Eye, Edit3, 
  Loader2, ArrowLeft, Building2, User, 
  ShieldCheck, RefreshCw, IndianRupee, AlertCircle
} from 'lucide-react';
import { api, type ComplaintGeneratePayload } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MarkdownView } from './common/MarkdownView';
import type { GrievanceCase } from '../types/case';

const INDIAN_STATES = [
  'Maharashtra',
  'Karnataka',
  'Delhi NCR',
  'Haryana',
  'Telangana',
  'Tamil Nadu',
  'Uttar Pradesh',
  'West Bengal',
  'Gujarat',
  'Rajasthan',
  'Kerala',
  'Punjab',
  'Madhya Pradesh',
  'Andhra Pradesh',
  'Bihar',
  'Odisha',
  'Other'
];

interface ComplaintGeneratorModalProps {
  caseId: string;
  isOpen: boolean;
  onClose: () => void;
  onComplaintGenerated?: () => void;
  currentCase?: GrievanceCase;
}

export const ComplaintGeneratorModal: React.FC<ComplaintGeneratorModalProps> = ({
  caseId,
  isOpen,
  onClose,
  onComplaintGenerated,
  currentCase,
}) => {
  const { user } = useAuth();

  // Mode: 'form' (intake details before generating) or 'preview' (view/export generated letter)
  const [step, setStep] = useState<'form' | 'preview'>('form');

  // Intake Form State
  const [complainantName, setComplainantName] = useState('');
  const [complainantPhone, setComplainantPhone] = useState('');
  const [complainantEmail, setComplainantEmail] = useState('');
  const [complainantCity, setComplainantCity] = useState('Mumbai');
  const [complainantState, setComplainantState] = useState('Maharashtra');

  const [companyName, setCompanyName] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupSource, setLookupSource] = useState<string | null>(null);

  const [orderId, setOrderId] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [claimedAmount, setClaimedAmount] = useState('');
  const [desiredResolution, setDesiredResolution] = useState('');
  const [noticePeriodDays, setNoticePeriodDays] = useState<number>(15);
  const [customInstructions, setCustomInstructions] = useState('');

  // Generated Letter State
  const [complaint, setComplaint] = useState<any>(null);
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'formatted' | 'raw'>('formatted');

  const lookupTimeoutRef = useRef<any>(null);

  // Initialize data on modal open
  useEffect(() => {
    if (isOpen) {
      setError(null);
      // Pre-fill from currentCase & user profile
      const initialCompName = currentCase?.vendorName || '';
      setCompanyName(initialCompName);
      setComplainantName(user?.name || 'Aggrieved Consumer');
      setComplainantEmail(user?.email || '');
      setOrderId(currentCase?.transactionId || '');
      setPurchaseDate(currentCase?.purchaseDate || '');
      setClaimedAmount(currentCase?.claimedAmount || '');
      setDesiredResolution(currentCase?.desiredResolution || 'Full refund to original payment method');

      // Auto-trigger company lookup for initial company + city/state
      if (initialCompName) {
        performCompanyLookup(initialCompName, 'Mumbai', 'Maharashtra');
      }

      fetchExistingComplaint();
    }
  }, [isOpen, caseId, currentCase, user]);

  const fetchExistingComplaint = async () => {
    try {
      const doc = await api.getComplaint(caseId);
      if (doc && doc.content) {
        setComplaint(doc);
        setContent(doc.content);
        setStep('preview');
      } else {
        setStep('form');
      }
    } catch {
      setStep('form');
    }
  };

  const performCompanyLookup = async (name: string, city: string, state: string) => {
    if (!name.trim()) return;
    setIsLookingUp(true);
    try {
      const res = await api.lookupCompanyInfo(caseId, name, city, state);
      if (res) {
        setCompanyAddress(res.address);
        setCompanyEmail(res.email);
        setLookupSource(res.source);
      }
    } catch {
      // Keep existing manual inputs
    } finally {
      setIsLookingUp(false);
    }
  };

  const triggerCompanyLookupDebounced = (name: string, city: string, state: string) => {
    if (lookupTimeoutRef.current) clearTimeout(lookupTimeoutRef.current);
    lookupTimeoutRef.current = setTimeout(() => {
      performCompanyLookup(name, city, state);
    }, 400);
  };

  const handleStateChange = (newState: string) => {
    setComplainantState(newState);
    triggerCompanyLookupDebounced(companyName, complainantCity, newState);
  };

  const handleCityChange = (newCity: string) => {
    setComplainantCity(newCity);
    triggerCompanyLookupDebounced(companyName, newCity, complainantState);
  };

  const handleCompanyNameChange = (newName: string) => {
    setCompanyName(newName);
    triggerCompanyLookupDebounced(newName, complainantCity, complainantState);
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload: ComplaintGeneratePayload = {
        complainant_name: complainantName.trim() || 'Aggrieved Consumer',
        complainant_phone: complainantPhone.trim(),
        complainant_email: complainantEmail.trim(),
        complainant_city: complainantCity.trim(),
        complainant_state: complainantState.trim(),
        complainant_address: `${complainantCity.trim()}, ${complainantState.trim()}, India`,
        company_name: companyName.trim() || 'Opposite Party',
        company_address: companyAddress.trim(),
        company_email: companyEmail.trim(),
        order_id: orderId.trim(),
        purchase_date: purchaseDate.trim(),
        claimed_amount: claimedAmount.trim(),
        desired_resolution: desiredResolution.trim(),
        notice_period_days: noticePeriodDays,
        custom_instructions: customInstructions.trim(),
      };

      const doc = await api.generateComplaint(caseId, payload);
      setComplaint(doc);
      setContent(doc.content || '');
      setStep('preview');
      if (onComplaintGenerated) onComplaintGenerated();
    } catch (err: any) {
      setError(err.message || 'Failed to generate legal notice draft.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await api.updateComplaint(caseId, content);
      setComplaint(updated);
    } catch (err: any) {
      setError(err.message || 'Failed to save edits.');
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (format: 'txt' | 'pdf' | 'md') => {
    const token = localStorage.getItem('access_token');
    const url = `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/cases/${caseId}/complaint/export?format=${format}`;
    
    fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.blob())
      .then(blob => {
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `Legal_Notice_${caseId}.${format}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch(() => setError(`Failed to download ${format.toUpperCase()} file.`));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 bg-white border border-slate-200 text-slate-800 rounded-lg shadow-xs">
              <FileText className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-slate-900">Legal Notice Generator</h3>
                {step === 'preview' && (
                  <span className="px-2 py-0.5 text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                    Notice Ready
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                {step === 'form' 
                  ? 'Confirm particulars to auto-resolve official addresses and create a zero-placeholder notice'
                  : 'Complete formal legal demand ready to send to the grievance officer'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: PRE-GENERATION INTAKE FORM */}
          {step === 'form' && !loading && (
            <div className="space-y-5">
              
              {/* Informational Guidance Banner */}
              <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-lg flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div className="text-xs text-indigo-950 space-y-0.5">
                  <p className="font-medium">Zero-Edit Automated Notice Intake</p>
                  <p className="text-indigo-800 text-[11px] leading-relaxed">
                    Confirm your location and dispute specifics below. We automatically query our verified directory to match the company's regional nodal officer and registered office in your state.
                  </p>
                </div>
              </div>

              {/* Grid: 2 Columns for Particulars */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Column 1: Complainant Details */}
                <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-200 text-slate-800">
                    <User className="w-3.5 h-3.5 text-slate-600" />
                    <h4 className="text-xs font-semibold uppercase tracking-wider">1. Complainant Particulars</h4>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">Full Legal Name</label>
                    <input
                      type="text"
                      value={complainantName}
                      onChange={(e) => setComplainantName(e.target.value)}
                      placeholder="e.g. Ramesh Sharma"
                      className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-1">Mobile Number</label>
                      <input
                        type="tel"
                        value={complainantPhone}
                        onChange={(e) => setComplainantPhone(e.target.value)}
                        placeholder="+91 9876543210"
                        className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        value={complainantEmail}
                        onChange={(e) => setComplainantEmail(e.target.value)}
                        placeholder="user@example.com"
                        className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-1">State / Territory</label>
                      <select
                        value={complainantState}
                        onChange={(e) => handleStateChange(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-md px-2.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                      >
                        {INDIAN_STATES.map(st => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-1">City / Region</label>
                      <input
                        type="text"
                        value={complainantCity}
                        onChange={(e) => handleCityChange(e.target.value)}
                        placeholder="e.g. Mumbai, Bengaluru"
                        className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>
                  </div>

                </div>

                {/* Column 2: Respondent Company & Auto-Address Lookup */}
                <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 text-slate-800">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-slate-600" />
                      <h4 className="text-xs font-semibold uppercase tracking-wider">2. Opposite Party (Company)</h4>
                    </div>
                    {lookupSource === 'verified_directory' ? (
                      <span className="flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified Desk
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => performCompanyLookup(companyName, complainantCity, complainantState)}
                        className="flex items-center gap-1 text-[10px] text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        <RefreshCw className={`w-2.5 h-2.5 ${isLookingUp ? 'animate-spin' : ''}`} /> Refresh
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">Company / Brand Name</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => handleCompanyNameChange(e.target.value)}
                      placeholder="e.g. Flipkart, Amazon, Samsung, HP"
                      className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-medium text-slate-700">Resolved Regional Office Address</label>
                      {isLookingUp && <span className="text-[10px] text-slate-400">Searching directory...</span>}
                    </div>
                    <textarea
                      value={companyAddress}
                      onChange={(e) => setCompanyAddress(e.target.value)}
                      placeholder="Auto-resolving based on your city & state..."
                      rows={2}
                      className="w-full bg-white border border-slate-200 rounded-md p-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">Nodal Grievance Email</label>
                    <input
                      type="email"
                      value={companyEmail}
                      onChange={(e) => setCompanyEmail(e.target.value)}
                      placeholder="e.g. grievance.officer@flipkart.com"
                      className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>

                </div>

              </div>

              {/* Dispute & Claim Terms */}
              <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200 text-slate-800">
                  <IndianRupee className="w-3.5 h-3.5 text-slate-600" />
                  <h4 className="text-xs font-semibold uppercase tracking-wider">3. Dispute Terms & Remedy Sought</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">Order / Invoice ID</label>
                    <input
                      type="text"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      placeholder="e.g. OD3298410294"
                      className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">Purchase / Event Date</label>
                    <input
                      type="text"
                      value={purchaseDate}
                      onChange={(e) => setPurchaseDate(e.target.value)}
                      placeholder="e.g. 15 Sep 2026"
                      className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">Disputed Amount</label>
                    <input
                      type="text"
                      value={claimedAmount}
                      onChange={(e) => setClaimedAmount(e.target.value)}
                      placeholder="e.g. ₹30,000"
                      className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">Primary Remedy Demanded</label>
                    <input
                      type="text"
                      value={desiredResolution}
                      onChange={(e) => setDesiredResolution(e.target.value)}
                      placeholder="e.g. 100% full refund of ₹30,000 to bank account"
                      className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">Notice Compliance Period</label>
                    <select
                      value={noticePeriodDays}
                      onChange={(e) => setNoticePeriodDays(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                    >
                      <option value={7}>7 Days (Urgent)</option>
                      <option value={15}>15 Days (Standard Legal)</option>
                      <option value={30}>30 Days (Extended)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Special Demands / Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={customInstructions}
                    onChange={(e) => setCustomInstructions(e.target.value)}
                    placeholder="e.g. Demand replacement within 5 days or threaten filing on e-Daakhil"
                    className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

              </div>

              {/* Bottom Generate CTA */}
              <div className="pt-2 flex items-center justify-between">
                {complaint && (
                  <button
                    type="button"
                    onClick={() => setStep('preview')}
                    className="text-xs text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>View Previously Generated Notice</span>
                  </button>
                )}
                <div className="ml-auto flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-3 py-2 text-xs text-slate-600 hover:text-slate-900 font-medium rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={loading}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-lg transition-colors flex items-center space-x-1.5 shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Generate Finished Legal Notice</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* LOADING STATE */}
          {loading && (
            <div className="text-center py-20 space-y-3">
              <Loader2 className="w-7 h-7 animate-spin text-slate-800 mx-auto" />
              <div className="space-y-1">
                <p className="text-slate-900 font-semibold text-sm">Formulating Formal Legal Demand Notice...</p>
                <p className="text-slate-500 text-xs">Injecting verified particulars, statutory grounds & company nodal addresses via Groq LLM</p>
              </div>
            </div>
          )}

          {/* STEP 2: FINISHED LETTER PREVIEW & ACTIONS */}
          {step === 'preview' && !loading && (
            <div className="space-y-4">
              
              {/* Top Control Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-3 border-b border-slate-100 pb-3">
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setStep('form')}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-slate-700 hover:text-slate-950 font-medium border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-xs"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Edit Particulars</span>
                  </button>

                  {/* Formatted vs Raw Mode Switcher */}
                  <div className="flex p-0.5 bg-slate-100 rounded-md border border-slate-200 text-xs font-medium">
                    <button
                      onClick={() => setViewMode('formatted')}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-all ${viewMode === 'formatted' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Formatted View</span>
                    </button>
                    <button
                      onClick={() => setViewMode('raw')}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-all ${viewMode === 'raw' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Raw Markdown</span>
                    </button>
                  </div>
                </div>

                {/* Export & Save Buttons */}
                <div className="flex items-center space-x-1.5 flex-wrap">
                  {viewMode === 'raw' && (
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-md flex items-center space-x-1 transition-colors text-xs font-medium"
                    >
                      <Save className="w-3 h-3" />
                      <span>{saving ? 'Saving...' : 'Save Draft'}</span>
                    </button>
                  )}
                  <button
                    onClick={handleCopy}
                    className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-md flex items-center space-x-1 transition-colors text-xs font-medium"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied Notice' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={() => handleDownload('pdf')}
                    className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-md flex items-center space-x-1 transition-colors text-xs font-medium"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download PDF</span>
                  </button>
                  <button
                    onClick={() => handleDownload('txt')}
                    className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-md flex items-center space-x-1 transition-colors text-xs font-medium"
                  >
                    <Download className="w-3 h-3" />
                    <span>TXT</span>
                  </button>
                </div>
              </div>

              {/* Rendered Document View */}
              {viewMode === 'formatted' ? (
                <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 font-sans shadow-xs">
                  <MarkdownView content={content} />
                </div>
              ) : (
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={18}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md p-3.5 font-mono text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white leading-relaxed transition-all"
                />
              )}

            </div>
          )}
        </div>

        {/* Footer */}
        {step === 'preview' && !loading && (
          <div className="px-5 py-3 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between">
            <button
              onClick={() => setStep('form')}
              className="text-xs text-slate-600 hover:text-slate-900 font-medium flex items-center space-x-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Modify Details & Regenerate</span>
            </button>
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-md transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
