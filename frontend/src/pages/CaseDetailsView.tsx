import React, { useState } from 'react';
import { 
  ArrowLeft, Scale, Sparkles, Copy, Download, Check, FileText, 
  Clock, ShieldCheck, Send, MessageSquare, 
  Paperclip, CheckCircle2, X, Eye 
} from 'lucide-react';
import { useCases } from '../context/CaseContext';
import { CategoryBadge, StatusBadge, UrgencyBadge } from '../components/common/Badge';
import { ComplaintGeneratorModal } from '../components/ComplaintGeneratorModal';
import { SmartEvidenceChecklist } from '../components/SmartEvidenceChecklist';

export const CaseDetailsView: React.FC = () => {
  const { activeCaseId, getCaseById, setActiveTab, updateCaseStatus } = useCases();

  const currentCase = activeCaseId ? getCaseById(activeCaseId) : undefined;

  // Modal & AI States
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [noticeText, setNoticeText] = useState('');
  const [copied, setCopied] = useState(false);

  // Chat Q&A State
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; time: string }>>([
    {
      sender: 'ai',
      text: `Hello! I have analyzed Case #${currentCase?.id || '1042'} under the Consumer Protection Act 2019. How can I assist with your escalation?`,
      time: 'Just now'
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');

  // Preview Evidence Modal
  const [previewFile, setPreviewFile] = useState<string | null>(null);

  if (!currentCase) {
    return (
      <div className="text-center py-20 bg-slate-900/50 rounded-2xl border border-slate-800 space-y-4">
        <h2 className="text-xl font-bold text-white">No Case Selected</h2>
        <p className="text-sm text-slate-400">Select a case from the dashboard to inspect details and AI advice.</p>
        <button 
          onClick={() => setActiveTab('dashboard')}
          className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const handleOpenNoticeModal = () => {
    setNoticeText(currentCase.generatedNotice || `FORMAL CONSUMER DEMAND NOTICE\n\nCase ID: #${currentCase.id}\nVendor: ${currentCase.vendorName}\nClaimed Amount: ${currentCase.claimedAmount}\n\nNotice content generated based on Consumer Protection Act rules.`);
    setShowNoticeModal(true);
  };

  const handleCopyNotice = () => {
    navigator.clipboard.writeText(noticeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadNotice = () => {
    const element = document.createElement("a");
    const file = new Blob([noticeText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `Legal_Notice_Case_${currentCase.id}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleSendQuery = (textToSend?: string) => {
    const q = textToSend || inputQuery;
    if (!q.trim()) return;

    const userMsg = { sender: 'user' as const, text: q, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setChatMessages(prev => [...prev, userMsg]);
    setInputQuery('');

    // RAG AI simulated reply
    setTimeout(() => {
      let aiReply = "Based on Consumer Forum precedents, if the vendor fails to respond within 14 calendar days of formal notice receipt, you can file a direct online e-Daakhil petition without mandatory attorney fees.";
      if (q.includes('Ombudsman') || q.includes('bank')) {
        aiReply = "Under Reserve Bank of India Ombudsman rules, unauthorized electronic transactions must be provisionally credited to your account within 10 working days of lodging a complaint.";
      } else if (q.includes('interest')) {
        aiReply = "You are statutory entitled to claim 9% to 12% per annum interest on withheld funds from the date of initial grievance request.";
      }
      setChatMessages(prev => [...prev, { sender: 'ai', text: aiReply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    }, 800);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      
      {/* Top Header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <button 
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </button>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-950/80 border border-indigo-800 px-2.5 py-1 rounded-md">
              #{currentCase.id}
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
              {currentCase.title}
            </h1>
          </div>
        </div>

        {/* Top Header Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenNoticeModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 hover:scale-105 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>View / Edit Legal Notice</span>
          </button>
          {currentCase.status !== 'Resolved' && (
            <button
              onClick={() => updateCaseStatus(currentCase.id, 'Resolved')}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-semibold text-xs transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Mark Resolved</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Split Layout: 60% Left / 40% Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT PANEL (7 Cols on desktop = ~60%) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Metadata Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CategoryBadge category={currentCase.category} />
                <StatusBadge status={currentCase.status} />
              </div>
              <UrgencyBadge urgency={currentCase.urgency} />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-950 border border-slate-800/80 rounded-xl p-3.5 text-xs">
              <div>
                <span className="text-slate-500 block">Vendor Name</span>
                <span className="font-semibold text-slate-200">{currentCase.vendorName}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Claimed Amount</span>
                <span className="font-bold text-emerald-400">{currentCase.claimedAmount}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Transaction ID</span>
                <span className="font-mono text-slate-300">{currentCase.transactionId}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Purchase Date</span>
                <span className="text-slate-300">{currentCase.purchaseDate}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Date Logged</span>
                <span className="text-slate-300">{currentCase.createdDate}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Desired Relief</span>
                <span className="text-indigo-300 font-medium">{currentCase.desiredResolution}</span>
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <span className="text-xs font-semibold text-slate-400">Statement of Facts</span>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 border border-slate-800/50 rounded-xl p-3">
                {currentCase.description}
              </p>
            </div>

          </div>

          {/* Timeline of Events */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Case Timeline & Lifecycle</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {currentCase.timeline.filter(t => t.status === 'completed').length} / {currentCase.timeline.length} Steps
              </span>
            </div>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-800">
              {currentCase.timeline.map((event) => (
                <div key={event.id} className="relative group">
                  
                  {/* Circle dot icon */}
                  <div className={`absolute -left-[27px] top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    event.status === 'completed'
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : event.status === 'current'
                      ? 'bg-indigo-500 text-white ring-4 ring-indigo-950 animate-pulse'
                      : 'bg-slate-800 text-slate-500'
                  }`}>
                    {event.status === 'completed' ? '✓' : ''}
                  </div>

                  <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 space-y-1 hover:border-slate-700 transition-colors">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-200">{event.title}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{event.date}</span>
                    </div>
                    <p className="text-xs text-slate-400">{event.description}</p>
                  </div>

                </div>
              ))}
            </div>

          </div>

          {/* Smart Evidence Checklist */}
          <SmartEvidenceChecklist caseId={currentCase.id} />

          {/* Evidence Attachments */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Uploaded Evidence & Proof</h3>
              </div>
              <span className="text-xs text-indigo-400 font-medium">
                {currentCase.evidence.length} File(s)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentCase.evidence.map((file) => (
                <div 
                  key={file.id} 
                  className="bg-slate-950 border border-slate-800 hover:border-indigo-500/50 rounded-xl p-3 flex items-center justify-between gap-2 transition-all"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-semibold text-slate-200 truncate">{file.name}</div>
                      <div className="text-[10px] text-slate-500">{file.size} • {file.tag}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => setPreviewFile(file.name)}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg shrink-0 transition-colors"
                    title="Preview Document"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

          </div>

        </div>

        {/* RIGHT PANEL (5 Cols on desktop = ~40%) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* RAG AI Legal Guidance Card */}
          <div className="relative overflow-hidden bg-gradient-to-b from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-2xl p-5 space-y-4">
            
            <div className="flex items-center justify-between border-b border-indigo-500/20 pb-3">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">RAG Legal Intelligence</h3>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/50 px-2 py-0.5 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{currentCase.ragGuidance.confidenceScore}% Match</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Statutory Reference</div>
                <div className="text-xs font-bold text-slate-200 mt-0.5">{currentCase.ragGuidance.actName}</div>
                <div className="text-xs font-semibold text-indigo-300 mt-0.5">{currentCase.ragGuidance.sectionTitle}</div>
              </div>

              <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 text-xs space-y-1">
                <span className="font-semibold text-slate-300 block">Retrieved Rights Summary:</span>
                <p className="text-slate-400 leading-relaxed">{currentCase.ragGuidance.legalRightSummary}</p>
              </div>

              <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-xl p-3 text-xs space-y-1">
                <span className="font-semibold text-emerald-400 block">Recommended AI Action:</span>
                <p className="text-emerald-300/90">{currentCase.ragGuidance.recommendedAction}</p>
              </div>
            </div>

            <button
              onClick={handleOpenNoticeModal}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate / Review Complaint Draft</span>
            </button>

          </div>

          {/* AI Interactive Q&A Assistant Chat */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col h-[480px]">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">AI Grievance Assistant</h3>
              </div>
              <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800">
                Online
              </span>
            </div>

            {/* Chat Stream */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl p-3 text-xs space-y-1 ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'bg-slate-950 border border-slate-800 text-slate-300 rounded-bl-none'
                  }`}>
                    <p className="leading-relaxed">{msg.text}</p>
                    <span className="text-[9px] text-slate-400 block text-right">{msg.time}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Suggestion Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {[
                "What if vendor ignores 14-day notice?",
                "Can I file with Banking Ombudsman?",
                "How do I claim interest?"
              ].map((chip, i) => (
                <button
                  key={i}
                  onClick={() => handleSendQuery(chip)}
                  className="text-[10px] bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-full px-2.5 py-1 whitespace-nowrap transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSendQuery(); }}
              className="flex items-center gap-2 pt-1 border-t border-slate-800"
            >
              <input
                type="text"
                placeholder="Ask legal advice about this grievance..."
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
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
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 text-center">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="font-bold text-white text-sm">{previewFile}</span>
              <button onClick={() => setPreviewFile(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-8 space-y-3">
              <FileText className="w-12 h-12 text-indigo-400 mx-auto" />
              <div className="text-xs font-semibold text-slate-200">Verified Evidence Artifact</div>
              <p className="text-[11px] text-slate-500">Document cryptographically hashed for legal verification.</p>
            </div>
            <button
              onClick={() => setPreviewFile(null)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
