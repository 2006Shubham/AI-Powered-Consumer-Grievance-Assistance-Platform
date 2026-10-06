import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, FileText, Send, Bot, 
  Loader2
} from 'lucide-react';
import { useCases } from '../context/CaseContext';
import { CategoryBadge, StatusBadge } from '../components/common/Badge';
import { ComplaintGeneratorModal } from '../components/ComplaintGeneratorModal';
import { EvidenceGallery } from '../components/EvidenceGallery';
import { CaseTimelineView } from '../components/CaseTimelineView';
import { AIFollowUpCard } from '../components/AIFollowUpCard';
import { MarkdownView } from '../components/common/MarkdownView';
import { api } from '../services/api';
import type { CaseStatus } from '../types/case';

export const CaseDetailsView: React.FC = () => {
  const { cases, activeCaseId, setActiveTab, updateCaseStatus, refreshCases } = useCases();
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Chat State
  const [inputQuery, setInputQuery] = useState('');
  const [isAiReplying, setIsAiReplying] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{
    sender: 'user' | 'ai';
    text: string;
    time: string;
  }>>([
    {
      sender: 'ai',
      text: "### Case Assistant Ready\nI have reviewed your grievance details. Ask me anything about documenting your claim, what steps to take with customer care, or preparing a formal complaint letter.",
      time: 'Just now'
    }
  ]);

  const currentCase = cases.find(c => c.id === activeCaseId) || cases[0];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeCaseId]);

  if (!currentCase) {
    return (
      <div className="py-16 text-center space-y-3">
        <p className="text-sm text-slate-500">No case found or selected.</p>
        <button
          onClick={() => setActiveTab('dashboard')}
          className="text-xs text-slate-900 font-semibold hover:underline"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const shortId = currentCase.id.length > 8 ? currentCase.id.substring(0, 8) : currentCase.id;

  const handleStatusChange = async (newStatus: string) => {
    setStatusUpdating(true);
    try {
      await updateCaseStatus(currentCase.id, newStatus as CaseStatus);
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleSendQuery = async (queryText?: string) => {
    const q = queryText || inputQuery;
    if (!q.trim() || isAiReplying) return;

    const userMsg = {
      sender: 'user' as const,
      text: q,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsAiReplying(true);

    try {
      const res = await api.askAIChat(currentCase.id, q);
      setChatMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: res.answer,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch {
      setChatMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: "I'm unable to analyze this case right now. Your existing case information is unchanged. Please try again in a moment.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsAiReplying(false);
    }
  };

  return (
    <div className="space-y-6 pb-16 max-w-6xl mx-auto">
      
      {/* Top Header Bar */}
      <div className="border-b border-slate-200 pb-4 space-y-3">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Grievances
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-semibold text-slate-500">
                Case #{shortId}
              </span>
              <span className="text-slate-300">•</span>
              <CategoryBadge category={currentCase.category} />
              <StatusBadge status={currentCase.status} />
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500">Filed {currentCase.createdDate}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {currentCase.title}
            </h1>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Status Selector */}
            <select
              value={currentCase.status}
              disabled={statusUpdating}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="bg-white border border-slate-200 rounded-md px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-slate-400 shadow-2xs cursor-pointer"
            >
              <option value="In Progress">Status: In Progress</option>
              <option value="Pending Info">Status: Pending Info</option>
              <option value="Submitted">Status: Submitted</option>
              <option value="Resolved">Status: Resolved</option>
            </select>

            <button
              onClick={() => setShowNoticeModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-colors shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Generate Notice</span>
            </button>
          </div>
        </div>
      </div>

      {/* Two-Column Desktop Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Case details, Facts, Questions, Evidence, Timeline */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Case Information Overview */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 sm:p-6 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Case Information & Facts
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px] font-medium uppercase tracking-wider">Merchant / Vendor</span>
                <span className="font-semibold text-slate-900 mt-0.5 block">{currentCase.vendorName || 'Not specified'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] font-medium uppercase tracking-wider">Disputed Amount</span>
                <span className="font-bold text-slate-900 font-mono mt-0.5 block">{currentCase.claimedAmount || 'Not specified'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] font-medium uppercase tracking-wider">Order / Ref ID</span>
                <span className="font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px] mt-0.5 inline-block">{currentCase.transactionId || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] font-medium uppercase tracking-wider">Incident Date</span>
                <span className="text-slate-700 mt-0.5 block">{currentCase.purchaseDate || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] font-medium uppercase tracking-wider">Desired Outcome</span>
                <span className="text-slate-800 font-medium mt-0.5 block">{currentCase.desiredResolution || 'Resolution requested'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] font-medium uppercase tracking-wider">Category</span>
                <span className="text-slate-700 mt-0.5 block">{currentCase.category}</span>
              </div>
            </div>

            {/* AI Executive Summary if available */}
            {currentCase.summary && (
              <div className="pt-3 border-t border-slate-100 space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  AI Summary
                </span>
                <p className="text-xs text-slate-800 leading-relaxed font-medium">
                  {currentCase.summary}
                </p>
              </div>
            )}

            {/* Statement of Facts */}
            <div className="pt-3 border-t border-slate-100 space-y-1.5">
              <span className="text-xs font-semibold text-slate-900 block">Statement of Facts</span>
              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 border border-slate-200 rounded-md p-3.5 font-normal">
                {currentCase.description}
              </p>
            </div>

            {/* Extracted Key Facts if available */}
            {currentCase.key_facts && currentCase.key_facts.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Identified Case Facts
                </span>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {currentCase.key_facts.map((fact, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-slate-400 font-bold">•</span>
                      <span>{fact}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Targeted Follow-Up Questions from AI */}
          <AIFollowUpCard 
            caseId={currentCase.id} 
            initialAnswers={currentCase.user_answers}
            onAnswersSubmitted={refreshCases} 
          />

          {/* Evidence Attachments */}
          <EvidenceGallery caseId={currentCase.id} />

          {/* Timeline */}
          <CaseTimelineView caseId={currentCase.id} />

        </div>

        {/* RIGHT COLUMN: Unified Contextual AI Assistant */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col h-[560px] shadow-xs">
            
            {/* Assistant Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
                  <Bot className="w-4 h-4 text-slate-900" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Case Assistant</h3>
                  <p className="text-[11px] text-slate-400">Direct Groq AI • Context Grounded</p>
                </div>
              </div>
              <button
                onClick={() => setShowNoticeModal(true)}
                className="text-[11px] text-slate-600 hover:text-slate-900 font-medium underline underline-offset-2"
              >
                Draft Notice
              </button>
            </div>

            {/* Message Stream */}
            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 text-xs">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  {msg.sender === 'user' ? (
                    <div className="max-w-[85%] rounded-lg p-3 leading-relaxed bg-slate-900 text-white shadow-2xs">
                      <p className="text-xs">{msg.text}</p>
                      <span className="text-[9px] block mt-1 text-slate-400 text-right">
                        {msg.time}
                      </span>
                    </div>
                  ) : (
                    <div className="max-w-[95%] rounded-lg p-3.5 leading-relaxed bg-slate-50 border border-slate-200 text-slate-800 shadow-2xs">
                      <MarkdownView content={msg.text} />
                      <span className="text-[9px] block mt-2 text-slate-400">
                        {msg.time}
                      </span>
                    </div>
                  )}
                </div>
              ))}
              {isAiReplying && (
                <div className="flex items-center gap-2 text-xs text-slate-500 py-2 pl-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-700" />
                  <span>Analyzing with Groq AI...</span>
                </div>
              )}
            </div>

            {/* Suggestion Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-2.5 border-t border-slate-100">
              {[
                "What are my refund rights?",
                "Can I demand a full refund or replacement?",
                "How do I escalate if the company refuses to respond?",
                "What if they delay the repair for weeks?"
              ].map((chip, idx) => (
                <button
                  key={idx}
                  disabled={isAiReplying}
                  onClick={() => handleSendQuery(chip)}
                  className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-md transition-colors disabled:opacity-50 shrink-0 font-medium btn-tactile"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSendQuery(); }}
              className="flex items-center gap-2 pt-2 border-t border-slate-100"
            >
              <input
                type="text"
                placeholder="Ask about your case..."
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                disabled={isAiReplying}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isAiReplying || !inputQuery.trim()}
                className="p-2 rounded-md bg-slate-900 hover:bg-slate-800 text-white transition-colors disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

          </div>

        </div>

      </div>

      {/* Complaint Generator Modal */}
      <ComplaintGeneratorModal
        caseId={currentCase.id}
        isOpen={showNoticeModal}
        onClose={() => setShowNoticeModal(false)}
        onComplaintGenerated={refreshCases}
        currentCase={currentCase}
      />

    </div>
  );
};
