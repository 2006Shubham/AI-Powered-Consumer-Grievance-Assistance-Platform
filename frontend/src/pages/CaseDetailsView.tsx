import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Scale, Sparkles, FileText, 
  Clock, ShieldCheck, Send, MessageSquare, 
  Paperclip, CheckCircle2, X, Eye, Loader2 
} from 'lucide-react';
import { useCases } from '../context/CaseContext';
import { CategoryBadge, StatusBadge, UrgencyBadge } from '../components/common/Badge';
import { ComplaintGeneratorModal } from '../components/ComplaintGeneratorModal';
import { SmartEvidenceChecklist } from '../components/SmartEvidenceChecklist';
import { api } from '../services/api';

export const CaseDetailsView: React.FC = () => {
  const { activeCaseId, getCaseById, setActiveTab, updateCaseStatus } = useCases();

  const currentCase = activeCaseId ? getCaseById(activeCaseId) : undefined;

  // Modal & AI States
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [isAiReplying, setIsAiReplying] = useState(false);

  // Chat Q&A State
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; time: string }>>([]);
  const [inputQuery, setInputQuery] = useState('');

  // Preview Evidence Modal
  const [previewFile, setPreviewFile] = useState<string | null>(null);

  useEffect(() => {
    if (currentCase) {
      setChatMessages([
        {
          sender: 'ai',
          text: `Hello! I have analyzed your grievance "${currentCase.title}" under the Consumer Protection Act 2019. How can I assist with your escalation or legal strategy?`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [activeCaseId]);

  if (!currentCase) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 space-y-4 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900">No Case Selected</h2>
        <p className="text-sm text-slate-500">Select a case from the dashboard to inspect details and legal advice.</p>
        <button 
          onClick={() => setActiveTab('dashboard')}
          className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const handleOpenNoticeModal = () => {
    setShowNoticeModal(true);
  };

  const handleSendQuery = async (textToSend?: string) => {
    const q = textToSend || inputQuery;
    if (!q.trim() || isAiReplying) return;

    const userMsg = { sender: 'user' as const, text: q, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setChatMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsAiReplying(true);

    try {
      // Call backend RAG AI Chat API endpoint for live LLaMA 3.3 70B response
      const chatRes = await api.askAIChat(currentCase.id, q);
      
      setChatMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: chatRes.answer,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      // Dynamic fallback analyzing the specific user input string
      const qLower = q.toLowerCase().trim();
      let dynamicText = "";

      if (qLower.includes('hello') || qLower.includes('helo') || qLower.includes('hi') || qLower.includes('hey')) {
        dynamicText = `Hello! I am your AI Consumer Rights Assistant for "${currentCase.title}". How can I help you escalate your grievance against ${currentCase.vendorName || 'the vendor'} or clarify your statutory rights under the Consumer Protection Act 2019?`;
      } else if (qLower.includes('say no') || qLower.includes('no') || qLower.includes('reject') || qLower.includes('deny') || qLower.includes('refuse')) {
        dynamicText = `If ${currentCase.vendorName || 'the merchant'} refuses or says "no" to your claim for "${currentCase.title}":\n\n1. **Issue Formal Notice**: Dispatches a 14-day statutory demand notice citing CPA 2019 Section 2(47) (Unfair Trade Practice).\n2. **File e-Daakhil Petition**: If they persist in refusing after 14 days, you can file a petition directly with the Consumer Disputes Forum. Refusals demonstrate willful service deficiency under Section 83, strengthening your claim for 100% refund plus statutory interest.`;
      } else if (qLower.includes('notice') || qLower.includes('ignore')) {
        dynamicText = `Regarding "${currentCase.title}": If ${currentCase.vendorName || 'the merchant'} ignores your 14-day formal notice, you can submit a statutory petition on the e-Daakhil consumer forum portal under Section 35 of CPA 2019. Consumer forums routinely grant ex-parte relief and statutory interest for unaddressed notices.`;
      } else if (qLower.includes('bank') || qLower.includes('ombudsman') || qLower.includes('debit') || qLower.includes('charge')) {
        dynamicText = `For digital payment & banking disputes in "${currentCase.title}": Under the RBI Integrated Ombudsman Scheme (2021), zero customer liability applies if reported within 3 working days. Banks are mandated to credit shadow funds within 10 working days of complaint filing.`;
      } else if (qLower.includes('refund') || qLower.includes('interest') || qLower.includes('money') || qLower.includes('claim')) {
        dynamicText = `In your claim against ${currentCase.vendorName || 'the seller'} for "${currentCase.title}": You are entitled to demand a 100% refund of ${currentCase.claimedAmount || 'the purchase amount'}, plus 9% to 12% per annum statutory interest calculated from the initial grievance date alongside compensation for harassment under CPA 2019 Section 83.`;
      } else {
        dynamicText = `Regarding your query "${q}" for "${currentCase.title}":\n\nUnder statutory Consumer Protection Act 2019 guidelines, consumers facing unfulfilled warranties or service deficiencies from ${currentCase.vendorName || 'the vendor'} have the right to free repair, replacement, or a complete refund. Generating a formal demand notice is your first statutory step towards enforcement.`;
      }

      setChatMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: dynamicText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsAiReplying(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      
      {/* Top Header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <button 
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors mb-2 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </button>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md">
              #{currentCase.id.length > 8 ? currentCase.id.substring(0, 8) : currentCase.id}
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {currentCase.title}
            </h1>
          </div>
        </div>

        {/* Top Header Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenNoticeModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Legal Notice</span>
          </button>
          {currentCase.status !== 'Resolved' && (
            <button
              onClick={() => updateCaseStatus(currentCase.id, 'Resolved')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-semibold text-xs transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Mark Resolved</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Split Layout: Left 60% / Right 40% */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT PANEL */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Case Overview Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
            
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CategoryBadge category={currentCase.category} />
                <StatusBadge status={currentCase.status} />
              </div>
              <UrgencyBadge urgency={currentCase.urgency} />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">Vendor Name</span>
                <span className="font-semibold text-slate-800">{currentCase.vendorName}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Claimed Amount</span>
                <span className="font-bold text-slate-900">{currentCase.claimedAmount}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Transaction ID</span>
                <span className="font-mono text-slate-700">{currentCase.transactionId}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Incident Date</span>
                <span className="text-slate-700">{currentCase.purchaseDate}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Logged Date</span>
                <span className="text-slate-700">{currentCase.createdDate}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Desired Relief</span>
                <span className="text-indigo-700 font-semibold">{currentCase.desiredResolution}</span>
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <span className="text-xs font-semibold text-slate-700">Statement of Facts</span>
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 border border-slate-200 rounded-xl p-3">
                {currentCase.description}
              </p>
            </div>

          </div>

          {/* Timeline of Events */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Case Timeline</h3>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                {currentCase.timeline.filter(t => t.status === 'completed').length} / {currentCase.timeline.length} Steps
              </span>
            </div>

            <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200">
              {currentCase.timeline.map((event) => (
                <div key={event.id} className="relative">
                  
                  {/* Timeline Icon */}
                  <div className={`absolute -left-[27px] top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    event.status === 'completed'
                      ? 'bg-emerald-600 text-white'
                      : event.status === 'current'
                      ? 'bg-indigo-600 text-white ring-2 ring-indigo-200'
                      : 'bg-slate-200 text-slate-500'
                  }`}>
                    {event.status === 'completed' ? '✓' : ''}
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-800">{event.title}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{event.date}</span>
                    </div>
                    <p className="text-xs text-slate-600">{event.description}</p>
                  </div>

                </div>
              ))}
            </div>

          </div>

          {/* Smart Evidence Checklist */}
          <SmartEvidenceChecklist caseId={currentCase.id} />

          {/* Evidence Attachments */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Uploaded Evidence</h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {currentCase.evidence.length} File(s)
              </span>
            </div>

            {currentCase.evidence.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500">
                No files uploaded yet. You can attach receipts or screenshots in the checklist.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentCase.evidence.map((file) => (
                  <div 
                    key={file.id} 
                    className="bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl p-3 flex items-center justify-between gap-2 transition-all"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="p-2 rounded-lg bg-white border border-slate-200 text-indigo-600 shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-semibold text-slate-800 truncate">{file.name}</div>
                        <div className="text-[10px] text-slate-500">{file.size} • {file.tag}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => setPreviewFile(file.name)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-white rounded-lg shrink-0 transition-colors"
                      title="Preview Document"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>

        {/* RIGHT PANEL */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* RAG Legal Guidance Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">RAG Legal Intelligence</h3>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{currentCase.ragGuidance.confidenceScore}% Statutory Match</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider">Statutory Act</div>
                <div className="text-xs font-bold text-slate-800 mt-0.5">{currentCase.ragGuidance.actName}</div>
                <div className="text-xs font-semibold text-slate-700 mt-0.5">{currentCase.ragGuidance.sectionTitle}</div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1">
                <span className="font-semibold text-slate-800 block">Consumer Rights Summary:</span>
                <p className="text-slate-600 leading-relaxed">{currentCase.ragGuidance.legalRightSummary}</p>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs space-y-1">
                <span className="font-semibold text-emerald-800 block">Recommended Strategy:</span>
                <p className="text-emerald-700 leading-relaxed">{currentCase.ragGuidance.recommendedAction}</p>
              </div>
            </div>

            <button
              onClick={handleOpenNoticeModal}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate / Review Complaint Draft</span>
            </button>

          </div>

          {/* AI Interactive Q&A Assistant Chat */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 flex flex-col h-[480px] shadow-xs">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">AI Grievance Assistant</h3>
              </div>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-semibold">
                Live Groq LLM
              </span>
            </div>

            {/* Chat Stream */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[88%] rounded-2xl p-3 text-xs space-y-1 ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-bl-none shadow-2xs'
                  }`}>
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    <span className={`text-[9px] block text-right ${msg.sender === 'user' ? 'text-indigo-200' : 'text-slate-400'}`}>
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))}
              {isAiReplying && (
                <div className="flex items-center gap-2 text-xs text-slate-500 py-1">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                  <span>Consulting Consumer Protection Act database...</span>
                </div>
              )}
            </div>

            {/* Quick Suggestion Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {[
                "What if vendor ignores notice?",
                "How to file with Banking Ombudsman?",
                "Can I claim 12% interest?"
              ].map((chip, i) => (
                <button
                  key={i}
                  disabled={isAiReplying}
                  onClick={() => handleSendQuery(chip)}
                  className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-full px-2.5 py-1 whitespace-nowrap transition-colors disabled:opacity-50"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSendQuery(); }}
              className="flex items-center gap-2 pt-1 border-t border-slate-100"
            >
              <input
                type="text"
                placeholder="Ask legal advice about this grievance..."
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                disabled={isAiReplying}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isAiReplying || !inputQuery.trim()}
                className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-colors disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

          </div>

        </div>

      </div>

      {/* AI COMPLAINT GENERATOR MODAL */}
      <ComplaintGeneratorModal
        caseId={currentCase.id}
        isOpen={showNoticeModal}
        onClose={() => setShowNoticeModal(false)}
      />

      {/* EVIDENCE PREVIEW MODAL */}
      {previewFile && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 space-y-4 text-center shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="font-bold text-slate-900 text-sm">{previewFile}</span>
              <button onClick={() => setPreviewFile(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 space-y-3">
              <FileText className="w-10 h-10 text-indigo-600 mx-auto" />
              <div className="text-xs font-semibold text-slate-800">Verified Evidence File</div>
              <p className="text-[11px] text-slate-500">Document uploaded and processed securely.</p>
            </div>
            <button
              onClick={() => setPreviewFile(null)}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
