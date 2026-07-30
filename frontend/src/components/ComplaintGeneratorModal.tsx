import React, { useState, useEffect } from 'react';
import { FileText, Download, Copy, Check, Sparkles, X, Save, Eye, Edit3 } from 'lucide-react';
import { api } from '../services/api';

interface ComplaintGeneratorModalProps {
  caseId: string;
  isOpen: boolean;
  onClose: () => void;
  onComplaintGenerated?: () => void;
}

export const ComplaintGeneratorModal: React.FC<ComplaintGeneratorModalProps> = ({
  caseId,
  isOpen,
  onClose,
  onComplaintGenerated,
}) => {
  const [complaint, setComplaint] = useState<any>(null);
  const [content, setContent] = useState<string>('');
  const [customInstructions, setCustomInstructions] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'formatted' | 'raw'>('formatted');

  useEffect(() => {
    if (isOpen) {
      fetchExistingComplaint();
    }
  }, [isOpen, caseId]);

  const fetchExistingComplaint = async () => {
    try {
      const doc = await api.getComplaint(caseId);
      if (doc) {
        setComplaint(doc);
        setContent(doc.content || '');
      }
    } catch {
      // No complaint draft exists yet
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const doc = await api.generateComplaint(caseId, customInstructions);
      setComplaint(doc);
      setContent(doc.content || '');
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

  const renderFormattedMarkdown = (text: string) => {
    const lines = text.split('\n');
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3 font-sans text-xs shadow-xs text-slate-800 leading-relaxed">
        {lines.map((line, idx) => {
          const trimmed = line.strip ? line.strip() : line.trim();
          if (!trimmed) return <div key={idx} className="h-2" />;

          if (trimmed.startsWith('# ')) {
            return (
              <h1 key={idx} className="text-base sm:text-lg font-extrabold text-slate-900 border-b border-slate-200 pb-2 mb-3 tracking-tight">
                {trimmed.substring(2).replace(/\*\*/g, '')}
              </h1>
            );
          }

          if (trimmed.startsWith('## ')) {
            return (
              <h2 key={idx} className="text-sm font-bold text-indigo-900 mt-4 mb-1.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                <span>{trimmed.substring(3).replace(/\*\*/g, '')}</span>
              </h2>
            );
          }

          if (trimmed.startsWith('### ')) {
            return (
              <h3 key={idx} className="text-xs font-bold text-slate-900 mt-3 mb-1">
                {trimmed.substring(4).replace(/\*\*/g, '')}
              </h3>
            );
          }

          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-2 text-slate-700">
                <span className="text-indigo-600 font-bold">•</span>
                <span>{trimmed.substring(2).replace(/\*\*/g, '')}</span>
              </div>
            );
          }

          if (/^\d+\.\s/.test(trimmed)) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-2 text-slate-700 font-medium">
                <span className="text-indigo-600 font-bold">{trimmed.split(' ')[0]}</span>
                <span>{trimmed.replace(/^\d+\.\s/, '').replace(/\*\*/g, '')}</span>
              </div>
            );
          }

          if (trimmed.startsWith('---') || trimmed.startsWith('***')) {
            return <hr key={idx} className="border-slate-200 my-3" />;
          }

          // Check if line contains bold sections or notice header info
          const isNoticeHeader = trimmed.toUpperCase().startsWith('TO:') || trimmed.toUpperCase().startsWith('SUBJECT:') || trimmed.toUpperCase().startsWith('DEMAND:');

          return (
            <p key={idx} className={isNoticeHeader ? "font-bold text-slate-900 bg-slate-50 border border-slate-200 p-2.5 rounded-xl my-1" : "text-slate-700"}>
              {trimmed}
            </p>
          );
        })}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Formal Consumer Legal Notice Generator</h3>
              <p className="text-xs text-slate-500">Synthesizes case facts and Consumer Protection Act clauses via Groq AI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
              {error}
            </div>
          )}

          {!complaint && !loading && (
            <div className="text-center py-8 space-y-4">
              <div className="w-14 h-14 bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
                <Sparkles className="w-7 h-7" />
              </div>
              <div className="max-w-md mx-auto space-y-1.5">
                <h4 className="text-slate-900 font-bold text-base">Generate Formal Legal Complaint Draft</h4>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Our AI legal engine constructs a structured demand notice referencing statutory consumer rights, chronological timelines, and compensation demands.
                </p>
              </div>

              <div className="max-w-md mx-auto text-left space-y-1">
                <label className="text-xs font-semibold text-slate-700">Special Instructions / Specific Demands (Optional):</label>
                <textarea
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  placeholder="e.g. Demand 100% full refund plus statutory 12% interest within 14 days..."
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={loading}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl transition-colors shadow-xs flex items-center justify-center space-x-2 mx-auto"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate Legal Notice Draft</span>
              </button>
            </div>
          )}

          {loading && (
            <div className="text-center py-16 space-y-3">
              <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-indigo-900 font-bold text-xs">Synthesizing Case Facts & Statutory Rights...</p>
              <p className="text-slate-500 text-[11px]">Drafting formal legal notice structure via Groq LLM</p>
            </div>
          )}

          {complaint && !loading && (
            <div className="space-y-4">
              
              {/* Action Bar & View Mode Toggle */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-3 border-b border-slate-100 pb-3">
                
                {/* View Mode Switcher */}
                <div className="grid grid-cols-2 p-0.5 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold w-full sm:w-auto">
                  <button
                    onClick={() => setViewMode('formatted')}
                    className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${viewMode === 'formatted' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    <Eye className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Formatted Document</span>
                  </button>
                  <button
                    onClick={() => setViewMode('raw')}
                    className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${viewMode === 'raw' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                    <span>Edit Raw Markdown</span>
                  </button>
                </div>

                {/* Export Options */}
                <div className="flex items-center space-x-2 flex-wrap">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center space-x-1 transition-colors font-medium"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{saving ? 'Saving...' : 'Save'}</span>
                  </button>
                  <button
                    onClick={handleCopy}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center space-x-1 transition-colors font-medium"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={() => handleDownload('md')}
                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg flex items-center space-x-1 transition-colors font-medium"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .MD</span>
                  </button>
                  <button
                    onClick={() => handleDownload('pdf')}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg flex items-center space-x-1 transition-colors font-medium"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </button>
                  <button
                    onClick={() => handleDownload('txt')}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center space-x-1 transition-colors font-medium"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>TXT</span>
                  </button>
                </div>
              </div>

              {/* Document Render Body */}
              {viewMode === 'formatted' ? (
                renderFormattedMarkdown(content)
              ) : (
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={16}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-mono text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white leading-relaxed transition-all"
                />
              )}

            </div>
          )}
        </div>

        {/* Footer */}
        {complaint && !loading && (
          <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
            <button
              onClick={handleGenerate}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center space-x-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Regenerate Fresh Draft</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-xl transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
