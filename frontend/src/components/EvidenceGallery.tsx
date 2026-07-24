import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Upload, FileText, Trash2, Download, AlertCircle, FileCheck, Image as ImageIcon } from 'lucide-react';

interface EvidenceItem {
  id: string;
  case_id: string;
  original_filename: string;
  storage_key: str;
  mime_type: string;
  size_bytes: number;
  evidence_type: string;
  created_at: string;
}

interface EvidenceGalleryProps {
  caseId: string;
}

export const EvidenceGallery: React.FC<EvidenceGalleryProps> = ({ caseId }) => {
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [evidenceType, setEvidenceType] = useState('invoice');
  const [error, setError] = useState('');

  const loadEvidence = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await api.getEvidence(caseId);
      setEvidenceList(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load evidence files');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvidence();
  }, [caseId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    setIsUploading(true);
    setError('');

    try {
      await api.uploadEvidence(caseId, file, evidenceType);
      await loadEvidence();
    } catch (err: any) {
      setError(err.message || 'File upload failed');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (evidenceId: string) => {
    try {
      await api.deleteEvidence(caseId, evidenceId);
      setEvidenceList(prev => prev.filter(item => item.id !== evidenceId));
    } catch (err: any) {
      setError(err.message || 'Failed to delete file');
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-indigo-400" />
            <span>Case Evidence & Attachments</span>
          </h3>
          <p className="text-xs text-slate-400">Upload receipts, invoices, screenshots, or warranty documents (.pdf, .png, .jpg, .txt up to 10MB)</p>
        </div>

        {/* Upload Controls */}
        <div className="flex items-center gap-2">
          <select
            value={evidenceType}
            onChange={(e) => setEvidenceType(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="invoice">Invoice</option>
            <option value="receipt">Receipt</option>
            <option value="screenshot">Screenshot</option>
            <option value="product_photo">Product Photo</option>
            <option value="email">Email Thread</option>
            <option value="warranty">Warranty</option>
            <option value="other">Other</option>
          </select>

          <label className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md cursor-pointer flex items-center gap-1.5 transition-all">
            <Upload className="w-4 h-4" />
            <span>{isUploading ? 'Uploading...' : 'Upload File'}</span>
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.txt"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="py-6 text-center text-xs text-slate-400 animate-pulse">
          Loading evidence files...
        </div>
      ) : evidenceList.length === 0 ? (
        <div className="py-8 text-center border-2 border-dashed border-slate-800 rounded-2xl space-y-2">
          <Upload className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-xs text-slate-400">No evidence uploaded yet.</p>
          <p className="text-[11px] text-slate-500">Upload documents to strengthen your complaint during AI analysis and legal notice generation.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {evidenceList.map((file) => (
            <div
              key={file.id}
              className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 group hover:border-slate-700 transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0">
                  {file.mime_type.includes('image') ? <ImageIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{file.original_filename}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                    {file.evidence_type} • {formatBytes(file.size_bytes)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => handleDelete(file.id)}
                  title="Delete file"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
