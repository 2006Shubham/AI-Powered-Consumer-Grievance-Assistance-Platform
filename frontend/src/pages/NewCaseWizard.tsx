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

  // Dynamic AI Extracted / Follow-up Fields
  const [category, setCategory] = useState<CaseCategory>('Electronics');
  const [vendorName, setVendorName] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [claimedAmount, setClaimedAmount] = useState('');
  const [desiredResolution, setDesiredResolution] = useState('Full Refund');
  const [evidenceTag, setEvidenceTag] = useState<'Invoice / Receipt' | 'Warranty Document' | 'Vendor Email' | 'Product Photo / Screenshot'>('Invoice / Receipt');
  
  // Mock Attached Files
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

    // Simulate multi-step AI analysis sequence
    setTimeout(() => setAnalysisStep(2), 700);
    setTimeout(() => setAnalysisStep(3), 1400);
    setTimeout(() => {
      setIsAnalyzing(false);
      setHasAnalyzed(true);

      // Auto-extract mock details from prompt text if available
      const lower = naturalDescription.toLowerCase();
      if (lower.includes('bank') || fontContains(lower, ['debit', 'account', 'charge'])) {
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
    }, 2100);
  };

  function fontContains(str: string, words: string[]) {
    return words.some(w => str.includes(w));
  }

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

  const handleSubmitCase = (e?: React.FormEvent) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }

    const title = naturalDescription.length > 60 
      ? naturalDescription.substring(0, 60) + '...' 
      : naturalDescription || 'Consumer Grievance Claim';

    addNewCase({
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
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn pb-16">
      
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <button 
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </button>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            New Case Assistant <Sparkles className="w-5 h-5 text-indigo-400" />
          </h1>
          <p className="text-xs text-slate-400">
            Describe your grievance naturally. Our RAG engine extracts key legal facts and drafts formal consumer notices.
          </p>
        </div>
      </div>

      {/* Step 1: Conversational Input */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
        
        <div className="flex items-center justify-between">
          <label className="block text-sm font-semibold text-slate-200">
            1. Describe Your Problem in Natural Language
          </label>
          <span className="text-xs text-slate-500 font-mono">Step 1 of 3</span>
        </div>

        <textarea
          rows={5}
          value={naturalDescription}
          onChange={(e) => setNaturalDescription(e.target.value)}
          placeholder="Explain what happened, which product/service was involved, when you contacted customer support, and why you feel aggrieved..."
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-y"
        />

        {/* Preset Prompt Hints */}
        <div className="space-y-2 pt-1">
          <span className="text-xs font-medium text-slate-400">Quick Try Examples:</span>
          <div className="flex flex-wrap gap-2">
            {presetExamples.map((ex, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleApplyPreset(ex)}
                className="text-left text-xs bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg p-2.5 transition-colors max-w-full"
              >
                "{ex.substring(0, 65)}..."
              </button>
            ))}
          </div>
        </div>

        {/* Analyze Action CTA */}
        {!hasAnalyzed && (
          <div className="pt-3">
            <button
              type="button"
              disabled={isAnalyzing || !naturalDescription.trim()}
              onClick={handleAnalyzeWithAI}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all"
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
          <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-4 space-y-2 animate-fadeIn">
            <div className="flex items-center gap-2 text-xs text-indigo-300 font-semibold">
              <Sparkles className="w-4 h-4 text-indigo-400 animate-bounce" />
              Processing Natural Language Pipeline
            </div>
            <div className="space-y-1.5 text-xs text-slate-300 pl-6">
              <div className={`flex items-center gap-2 ${analysisStep >= 1 ? 'text-emerald-400' : 'text-slate-500'}`}>
                {analysisStep >= 1 ? <CheckCircle2 className="w-3.5 h-3.5" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-600" />}
                Extracting Vendor Name, Dates, & Claim Amounts
              </div>
              <div className={`flex items-center gap-2 ${analysisStep >= 2 ? 'text-emerald-400' : 'text-slate-500'}`}>
                {analysisStep >= 2 ? <CheckCircle2 className="w-3.5 h-3.5" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-600" />}
                Cross-referencing Consumer Protection Act (2019) Clauses
              </div>
              <div className={`flex items-center gap-2 ${analysisStep >= 3 ? 'text-emerald-400' : 'text-slate-500'}`}>
                {analysisStep >= 3 ? <CheckCircle2 className="w-3.5 h-3.5" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-600" />}
                Formulating Legal Notice Draft & Follow-up Questions
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Step 2: AI Dynamic Follow-up Details */}
      {hasAnalyzed && (
        <form onSubmit={handleSubmitCase} noValidate className="space-y-8 animate-fadeIn">
          
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-bold text-white">
                  2. AI Extracted Facts & Follow-up Details
                </h2>
              </div>
              <span className="text-xs text-emerald-400 font-mono bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded">
                AI Confidence: 94%
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Category */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">Grievance Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as CaseCategory)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
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
                <label className="block text-xs font-semibold text-slate-300">Vendor / Merchant Name</label>
                <input
                  type="text"
                  required
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  placeholder="e.g., ElectroTech Megastore, Amazon, Bank Name"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Transaction ID */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">Order / Transaction / Account ID</label>
                <input
                  type="text"
                  required
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="e.g. TXN-8829104"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Purchase Date */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">Purchase / Incident Date</label>
                <input
                  type="date"
                  required
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Claimed Amount */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">Claimed Amount ($)</label>
                <input
                  type="text"
                  required
                  value={claimedAmount}
                  onChange={(e) => setClaimedAmount(e.target.value)}
                  placeholder="e.g. $1,299.00"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Desired Resolution */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">Desired Resolution</label>
                <input
                  type="text"
                  required
                  value={desiredResolution}
                  onChange={(e) => setDesiredResolution(e.target.value)}
                  placeholder="e.g., Full Refund into Bank Account, Unit Replacement"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

            </div>

          </div>

          {/* Step 3: File Evidence Attachment */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
            
            <div className="flex items-center justify-between">
              <label className="block text-sm font-semibold text-slate-200">
                3. Attach Supporting Evidence (Invoices, Receipts, Screenshots)
              </label>
              <span className="text-xs text-slate-500 font-mono">Step 3 of 3</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <div 
                  onClick={handleSimulateFileUpload}
                  className="border-2 border-dashed border-slate-800 hover:border-indigo-500/60 bg-slate-950/60 rounded-xl p-6 text-center cursor-pointer transition-all hover:bg-slate-950"
                >
                  <UploadCloud className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                  <div className="text-xs font-semibold text-slate-300">Click to upload supporting documents</div>
                  <div className="text-[11px] text-slate-500 mt-1">Supports PDF, PNG, JPG (Max 15MB)</div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-400">Document Tag</label>
                <select
                  value={evidenceTag}
                  onChange={(e) => setEvidenceTag(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-300"
                >
                  <option value="Invoice / Receipt">Invoice / Receipt</option>
                  <option value="Warranty Document">Warranty Document</option>
                  <option value="Vendor Email">Vendor Email</option>
                  <option value="Product Photo / Screenshot">Product Photo / Screenshot</option>
                </select>
                <button
                  type="button"
                  onClick={handleSimulateFileUpload}
                  className="w-full text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 rounded-lg transition-colors"
                >
                  Add Sample Document
                </button>
              </div>
            </div>

            {/* Attached Files List */}
            {attachedFiles.length > 0 && (
              <div className="space-y-2 pt-2">
                <div className="text-xs font-semibold text-slate-400">Attached Documents ({attachedFiles.length}):</div>
                <div className="space-y-2">
                  {attachedFiles.map((file, i) => (
                    <div key={i} className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-400" />
                        <span className="font-medium text-slate-200">{file.name}</span>
                        <span className="text-[10px] text-slate-500">({file.size})</span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-800">
                          {file.tag}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(i)}
                        className="text-slate-500 hover:text-rose-400 p-1"
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
          <div className="flex items-center justify-between bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-5 shadow-2xl">
            <div>
              <div className="text-xs font-bold text-white">Ready to File Case</div>
              <div className="text-xs text-slate-400">AI Legal Notice will be automatically generated.</div>
            </div>
            <button
              type="button"
              onClick={handleSubmitCase}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-sm shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <span>Submit Case & Generate Notice</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </form>
      )}

    </div>
  );
};
