import React, { useState } from 'react';
import { 
  Sparkles, Loader2, CheckCircle2, ArrowRight, ArrowLeft, ShieldCheck, 
  UploadCloud, FileText, Trash2 
} from 'lucide-react';
import { useCases } from '../context/CaseContext';
import type { CaseCategory } from '../types/case';

export const NewCaseWizard: React.FC = () => {
  const { addNewCase, setActiveTab } = useCases();

  // Form State
  const [naturalDescription, setNaturalDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic AI Extracted / Follow-up Fields
  const [category, setCategory] = useState<CaseCategory>('Electronics');
  const [vendorName, setVendorName] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [claimedAmount, setClaimedAmount] = useState('');
  const [desiredResolution, setDesiredResolution] = useState('Full Refund');
  const [evidenceTag, setEvidenceTag] = useState<'Invoice / Receipt' | 'Warranty Document' | 'Vendor Email' | 'Product Photo / Screenshot'>('Invoice / Receipt');
  
  // Attached Files
  const [attachedFiles, setAttachedFiles] = useState<Array<{ name: string; size: string; tag: string }>>([]);

  const presetExamples = [
    "I bought a 55-inch TV on Amazon for $1,299. After 2 months, screen went black. Vendor refused warranty repair claiming liquid damage, which is false.",
    "Bank auto-debited $240 across 4 months for a cloud service trial I explicitly cancelled on day 3 via app interface.",
    "Utility company sent $450 electricity bill for June, 400% above historical average while family was out of town for 2 weeks."
  ];

  const handleApplyPreset = (text: string) => {
    setNaturalDescription(text);
  };

  const handleAnalyzeWithAI = () => {
    if (!naturalDescription.trim()) return;

    setIsAnalyzing(true);
    setAnalysisStep(1);

    setTimeout(() => setAnalysisStep(2), 600);
    setTimeout(() => setAnalysisStep(3), 1200);
    setTimeout(() => {
      setIsAnalyzing(false);
      setHasAnalyzed(true);

      const lower = naturalDescription.toLowerCase();
      if (lower.includes('bank') || lower.includes('debit') || lower.includes('account')) {
        setCategory('Banking');
        setVendorName('CloudStream Global Services');
        setTransactionId('TXN-998241');
        setPurchaseDate('2026-06-01');
        setClaimedAmount('$240.00');
        setDesiredResolution('Full Refund of Auto-debits');
      } else if (lower.includes('utility') || lower.includes('bill') || lower.includes('electricity')) {
        setCategory('Utilities');
        setVendorName('City Power & Grid Co.');
        setTransactionId('UTL-44910');
        setPurchaseDate('2026-07-01');
        setClaimedAmount('$450.00');
        setDesiredResolution('Meter Calibration & Bill Adjustment');
      } else {
        setCategory('Electronics');
        setVendorName('ElectroTech Megastore');
        setTransactionId('TXN-8829104');
        setPurchaseDate('2026-05-12');
        setClaimedAmount('$1,299.00');
        setDesiredResolution('Full Refund or Product Replacement');
      }
    }, 1800);
  };

  const handleSimulateFileUpload = () => {
    const fileNames = ['Purchase_Receipt_Invoice.pdf', 'Warranty_Card_Scan.jpg', 'Support_Email_Thread.pdf'];
    const randomFile = fileNames[Math.floor(Math.random() * fileNames.length)];
    
    setAttachedFiles(prev => [
      ...prev,
      { name: randomFile, size: `${(Math.random() * 2 + 0.5).toFixed(1)} MB`, tag: evidenceTag }
    ]);
  };

  const handleRemoveFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitCase = async (e?: React.FormEvent) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    if (isSubmitting) return;
    setIsSubmitting(true);

    const title = naturalDescription.length > 60 
      ? naturalDescription.substring(0, 60) + '...' 
      : naturalDescription || 'Consumer Grievance Claim';

    try {
      await addNewCase({
        title,
        category,
        status: 'In Progress',
        urgency: 'High',
        vendorName: vendorName || 'Specified Merchant',
        purchaseDate: purchaseDate || '2026-06-01',
        transactionId: transactionId || 'TXN-GEN-1002',
        claimedAmount: claimedAmount || '$0.00',
        desiredResolution: desiredResolution || 'Full Refund',
        description: naturalDescription,
        evidence: attachedFiles.map((f, idx) => ({
          id: `ev-${idx}`,
          name: f.name,
          size: f.size,
          uploadDate: new Date().toISOString().split('T')[0],
          tag: f.tag as any,
          fileType: f.name.endsWith('.pdf') ? 'pdf' : 'image'
        }))
      });
      setActiveTab('case-details');
    } catch (err) {
      console.error('Case submit error:', err);
      setActiveTab('case-details');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn pb-16">
      
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <button 
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors mb-2 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </button>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            New Case Assistant <Sparkles className="w-5 h-5 text-indigo-600" />
          </h1>
          <p className="text-xs text-slate-500">
            Describe your grievance in natural language. Groq AI extracts facts and references statutory laws.
          </p>
        </div>
      </div>

      {/* Step 1: Input */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
        
        <div className="flex items-center justify-between">
          <label className="block text-sm font-bold text-slate-900">
            1. Describe Your Issue in Plain Language
          </label>
          <span className="text-xs text-slate-500 font-mono">Step 1 of 3</span>
        </div>

        <textarea
          rows={5}
          value={naturalDescription}
          onChange={(e) => setNaturalDescription(e.target.value)}
          placeholder="Explain what happened, which product or service was involved, when you contacted customer support, and what outcome you desire..."
          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all resize-y"
        />

        {/* Preset Prompt Hints */}
        <div className="space-y-2 pt-1">
          <span className="text-xs font-semibold text-slate-500">Sample Prompts:</span>
          <div className="flex flex-wrap gap-2">
            {presetExamples.map((ex, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleApplyPreset(ex)}
                className="text-left text-xs bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg p-2.5 transition-colors max-w-full"
              >
                "{ex.substring(0, 65)}..."
              </button>
            ))}
          </div>
        </div>

        {/* Analyze Action CTA */}
        {!hasAnalyzed && (
          <div className="pt-2">
            <button
              type="button"
              disabled={isAnalyzing || !naturalDescription.trim()}
              onClick={handleAnalyzeWithAI}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs shadow-xs transition-all"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Analyzing Grievance with AI RAG...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze Case with AI</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Animated AI Processing Status Indicator */}
        {isAnalyzing && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 space-y-2 animate-fadeIn">
            <div className="flex items-center gap-2 text-xs text-indigo-900 font-semibold">
              <Sparkles className="w-4 h-4 text-indigo-600 animate-bounce" />
              Running Groq Natural Language Legal Engine
            </div>
            <div className="space-y-1.5 text-xs text-slate-700 pl-6">
              <div className={`flex items-center gap-2 ${analysisStep >= 1 ? 'text-emerald-700' : 'text-slate-400'}`}>
                {analysisStep >= 1 ? <CheckCircle2 className="w-3.5 h-3.5" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300" />}
                Extracting Vendor Name, Transaction ID, & Claim Amounts
              </div>
              <div className={`flex items-center gap-2 ${analysisStep >= 2 ? 'text-emerald-700' : 'text-slate-400'}`}>
                {analysisStep >= 2 ? <CheckCircle2 className="w-3.5 h-3.5" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300" />}
                Cross-referencing Consumer Protection Act (2019) Clauses
              </div>
              <div className={`flex items-center gap-2 ${analysisStep >= 3 ? 'text-emerald-700' : 'text-slate-400'}`}>
                {analysisStep >= 3 ? <CheckCircle2 className="w-3.5 h-3.5" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300" />}
                Drafting Formal Consumer Notice & Evidence Plan
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Step 2: Extracted Details */}
      {hasAnalyzed && (
        <form onSubmit={handleSubmitCase} noValidate className="space-y-6 animate-fadeIn">
          
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-xs">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h2 className="text-sm font-bold text-slate-900">
                  2. AI Extracted Case Facts
                </h2>
              </div>
              <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                Confidence: 94%
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Category */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as CaseCategory)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                >
                  <option value="Electronics">Electronics & Appliances</option>
                  <option value="E-commerce">E-commerce & Digital Retail</option>
                  <option value="Banking">Banking & Financial Services</option>
                  <option value="Utilities">Utilities & Energy</option>
                  <option value="Telecommunications">Telecommunications</option>
                </select>
              </div>

              {/* Vendor Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">Merchant / Vendor Name</label>
                <input
                  type="text"
                  required
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  placeholder="e.g., ElectroTech Megastore, Amazon"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>

              {/* Transaction ID */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">Order / Transaction ID</label>
                <input
                  type="text"
                  required
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="e.g. TXN-8829104"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>

              {/* Purchase Date */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">Purchase / Incident Date</label>
                <input
                  type="date"
                  required
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>

              {/* Claimed Amount */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">Claimed Amount ($)</label>
                <input
                  type="text"
                  required
                  value={claimedAmount}
                  onChange={(e) => setClaimedAmount(e.target.value)}
                  placeholder="e.g. $1,299.00"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>

              {/* Desired Resolution */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">Desired Relief</label>
                <input
                  type="text"
                  required
                  value={desiredResolution}
                  onChange={(e) => setDesiredResolution(e.target.value)}
                  placeholder="e.g., Full Refund, Replacement Unit"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>

            </div>

          </div>

          {/* Step 3: Evidence File Attachment */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
            
            <div className="flex items-center justify-between">
              <label className="block text-sm font-bold text-slate-900">
                3. Attach Supporting Evidence Documents
              </label>
              <span className="text-xs text-slate-500 font-mono">Step 3 of 3</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <div 
                  onClick={handleSimulateFileUpload}
                  className="border-2 border-dashed border-slate-200 hover:border-indigo-500 bg-slate-50 rounded-xl p-6 text-center cursor-pointer transition-all hover:bg-white"
                >
                  <UploadCloud className="w-7 h-7 text-indigo-600 mx-auto mb-1.5" />
                  <div className="text-xs font-semibold text-slate-800">Click to attach supporting files</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Supports PDF, PNG, JPG (Max 15MB)</div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">Document Tag</label>
                <select
                  value={evidenceTag}
                  onChange={(e) => setEvidenceTag(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800"
                >
                  <option value="Invoice / Receipt">Invoice / Receipt</option>
                  <option value="Warranty Document">Warranty Document</option>
                  <option value="Vendor Email">Vendor Email</option>
                  <option value="Product Photo / Screenshot">Product Photo / Screenshot</option>
                </select>
                <button
                  type="button"
                  onClick={handleSimulateFileUpload}
                  className="w-full text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg transition-colors"
                >
                  Add Sample File
                </button>
              </div>
            </div>

            {/* Attached Files List */}
            {attachedFiles.length > 0 && (
              <div className="space-y-2 pt-1">
                <div className="text-xs font-semibold text-slate-700">Attached ({attachedFiles.length}):</div>
                <div className="space-y-2">
                  {attachedFiles.map((file, i) => (
                    <div key={i} className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-600" />
                        <span className="font-medium text-slate-800">{file.name}</span>
                        <span className="text-[10px] text-slate-500">({file.size})</span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-200 text-slate-700">
                          {file.tag}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(i)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Submit Action Bar */}
          <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <div>
              <div className="text-xs font-bold text-slate-900">Ready to Register Grievance</div>
              <div className="text-xs text-slate-500">FastAPI backend and Groq LLM legal engine will process your case.</div>
            </div>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmitCase}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition-all disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Filing Case...' : 'Submit Case & View Details'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </form>
      )}

    </div>
  );
};
