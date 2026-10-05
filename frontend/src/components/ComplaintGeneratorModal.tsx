import React, { useState, useEffect } from 'react';
import { FileText, Download, Copy, Check, Sparkles, X, Save, Eye, Edit3, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { MarkdownView } from './common/MarkdownView';

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
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-6 font-sans">
        <MarkdownView content={text} />
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col shadow-lg overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 bg-white border border-slate-200 text-slate-700 rounded-md">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Consumer Notice Generator</h3>
              <p className="text-[11px] text-slate-500">Structured formal legal notice grounded in case facts & Consumer Protection Act 2019</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-md">
              {error}
            </div>
          )}

          {!complaint && !loading && (
            <div className="text-center py-8 space-y-4">
              <div className="w-10 h-10 bg-slate-100 border border-slate-200 text-slate-700 rounded-lg flex items-center justify-center mx-auto">
                <Sparkles className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h4 className="text-slate-900 font-semibold text-sm">Generate Formal Complaint Notice</h4>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Groq AI synthesizes your grievance facts, chronology, and statutory consumer protection rights into a formal 14-day legal demand letter.
                </p>
              </div>

              <div className="max-w-md mx-auto text-left space-y-1">
                <label className="text-[11px] font-medium text-slate-700">Special Instructions or Demands (Optional):</label>
                <textarea
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  placeholder="e.g. Demand 100% full refund plus statutory 12% interest within 14 days..."
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white transition-all"
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={loading}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-md transition-colors flex items-center justify-center space-x-1.5 mx-auto shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Legal Notice</span>
              </button>
            </div>
          )}

          {loading && (
            <div className="text-center py-16 space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-slate-700 mx-auto" />
              <p className="text-slate-900 font-medium text-xs">Synthesizing Case Facts & Statutory Rights...</p>
              <p className="text-slate-500 text-[11px]">Drafting formal legal notice structure via Groq LLM</p>
            </div>
          )}

          {complaint && !loading && (
            <div className="space-y-4">
              
              {/* Action Bar & View Mode Toggle */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-3 border-b border-slate-100 pb-3">
                
                {/* View Mode Switcher */}
                <div className="flex p-0.5 bg-slate-100 rounded-md border border-slate-200 text-xs font-medium">
                  <button
                    onClick={() => setViewMode('formatted')}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-all ${viewMode === 'formatted' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Formatted</span>
                  </button>
                  <button
                    onClick={() => setViewMode('raw')}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-all ${viewMode === 'raw' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Markdown</span>
                  </button>
                </div>

                {/* Export Options */}
                <div className="flex items-center space-x-1.5 flex-wrap">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-md flex items-center space-x-1 transition-colors text-xs font-medium"
                  >
                    <Save className="w-3 h-3" />
                    <span>{saving ? 'Saving...' : 'Save'}</span>
                  </button>
                  <button
                    onClick={handleCopy}
                    className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-md flex items-center space-x-1 transition-colors text-xs font-medium"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={() => handleDownload('pdf')}
                    className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-md flex items-center space-x-1 transition-colors text-xs font-medium"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download PDF</span>
                  </button>
                  <button
                    onClick={() => handleDownload('md')}
                    className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-md flex items-center space-x-1 transition-colors text-xs font-medium"
                  >
                    <Download className="w-3 h-3" />
                    <span>.MD</span>
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

              {/* Document Render Body */}
              {viewMode === 'formatted' ? (
                renderFormattedMarkdown(content)
              ) : (
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={16}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md p-3.5 font-mono text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white leading-relaxed transition-all"
                />
              )}

            </div>
          )}
        </div>

        {/* Footer */}
        {complaint && !loading && (
          <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <button
              onClick={handleGenerate}
              className="text-xs text-slate-600 hover:text-slate-900 font-medium flex items-center space-x-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Regenerate Draft</span>
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-md transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
