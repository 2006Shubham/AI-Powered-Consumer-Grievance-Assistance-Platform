import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Upload, FileText, Trash2, AlertCircle, Paperclip, Image as ImageIcon } from 'lucide-react';

interface EvidenceItem {
  id: string;
  case_id: string;
  original_filename: string;
  storage_key: string;
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
    <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Paperclip className="w-4 h-4 text-slate-400" />
            <span>Supporting Evidence</span>
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Attach invoices, receipts, screenshots, or emails</p>
        </div>

        {/* Upload Controls */}
        <div className="flex items-center gap-2">
          <select
            value={evidenceType}
            onChange={(e) => setEvidenceType(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-indigo-600 cursor-pointer"
          >
            <option value="invoice">Invoice</option>
            <option value="receipt">Receipt</option>
            <option value="screenshot">Screenshot</option>
            <option value="email">Email</option>
            <option value="warranty">Warranty</option>
            <option value="other">Other</option>
          </select>

          <label className="px-3 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium cursor-pointer inline-flex items-center gap-1.5 transition-colors shadow-2xs">
            <Upload className="w-3.5 h-3.5" />
            <span>{isUploading ? 'Uploading...' : 'Attach'}</span>
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
        <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="py-4 text-center text-xs text-slate-400">
          Loading evidence...
        </div>
      ) : evidenceList.length === 0 ? (
        <div className="py-6 text-center border border-dashed border-slate-200 rounded-md text-xs text-slate-400">
          No files attached yet. Upload receipts or screenshots to substantiate your claim.
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {evidenceList.map((file) => (
            <div
              key={file.id}
              className="py-2.5 flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-1.5 rounded bg-slate-100 text-slate-500 shrink-0">
                  {file.mime_type.includes('image') ? <ImageIcon className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-slate-900 truncate">{file.original_filename}</p>
                  <p className="text-[10px] text-slate-400 capitalize">
                    {file.evidence_type} • {formatBytes(file.size_bytes)}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleDelete(file.id)}
                title="Delete file"
                className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
