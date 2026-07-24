import React, { useState, useEffect } from 'react';
import { FileText, Download, Copy, Check, Sparkles, X, Save } from 'lucide-react';
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

  const handleDownload = (format: 'txt' | 'pdf') => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">AI Formal Legal Notice & Complaint Generator</h3>
              <p className="text-xs text-slate-400">Synthesize case facts, evidence, & Qdrant statutory rights into a legal draft</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl">
              {error}
            </div>
          )}

          {!complaint && !loading && (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto">
                <Sparkles className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h4 className="text-white font-medium text-lg">Generate Formal Legal Complaint</h4>
                <p className="text-slate-400 text-sm">
                  Our AI legal specialist will construct a structured, formal legal notice with statutory references, chronological timeline of facts, and relief demands.
                </p>
              </div>

              <div className="max-w-md mx-auto text-left space-y-1">
                <label className="text-xs font-medium text-slate-300">Special Instructions / Specific Demands (Optional):</label>
                <textarea
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  placeholder="e.g. Demand 100% full refund plus Rs. 5,000 compensation for mental harassment within 15 days..."
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={loading}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-colors shadow-lg shadow-indigo-600/20 flex items-center justify-center space-x-2 mx-auto"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate Legal Notice Draft</span>
              </button>
            </div>
          )}

          {loading && (
            <div className="text-center py-16 space-y-3">
              <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-indigo-400 font-medium text-sm">Synthesizing Case Facts, Evidence & Qdrant Statutory Provisions...</p>
              <p className="text-slate-500 text-xs">Drafting formal legal notice structure via Groq LLM</p>
            </div>
          )}

          {complaint && !loading && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Version {complaint.version} | Last Updated: {new Date(complaint.updated_at).toLocaleString()}</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg flex items-center space-x-1 transition-colors"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{saving ? 'Saving...' : 'Save Edits'}</span>
                  </button>
                  <button
                    onClick={handleCopy}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg flex items-center space-x-1 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy Text'}</span>
                  </button>
                  <button
                    onClick={() => handleDownload('txt')}
                    className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-lg flex items-center space-x-1 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download TXT</span>
                  </button>
                  <button
                    onClick={() => handleDownload('pdf')}
                    className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg flex items-center space-x-1 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>

              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={16}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-sm text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        {complaint && !loading && (
          <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between">
            <button
              onClick={handleGenerate}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Regenerate Fresh Draft</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-xl transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
