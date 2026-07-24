import React, { useState } from 'react';
import { api } from '../services/api';
import { Scale, BookOpen, ShieldCheck, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

interface LawItem {
  title: string;
  source: string;
  summary: string;
}

interface RAGGuidanceData {
  summary_analysis: string;
  applicable_laws: LawItem[];
  recommended_remedies: string[];
  next_steps: string[];
}

interface RAGGuidanceCardProps {
  caseId: string;
}

export const RAGGuidanceCard: React.FC<RAGGuidanceCardProps> = ({ caseId }) => {
  const [guidance, setGuidance] = useState<RAGGuidanceData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchGuidance = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await api.getAIGuidance(caseId);
      setGuidance(data);
    } catch (err: any) {
      setError(err.message || 'Failed to generate RAG legal guidance.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>RAG AI Legal Intelligence & Rights</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-semibold uppercase tracking-wider border border-amber-500/20">
                Grounded Guidance
              </span>
            </h3>
            <p className="text-xs text-slate-400">Statutory provisions retrieved from Consumer Protection Acts & TRAI/RBI Frameworks</p>
          </div>
        </div>

        {!guidance && !isLoading && (
          <button
            type="button"
            onClick={fetchGuidance}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-indigo-600 hover:opacity-95 text-white text-xs font-bold shadow-lg flex items-center gap-2 transition-all shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Legal Guidance</span>
          </button>
        )}
      </div>

      {isLoading && (
        <div className="py-8 text-center text-xs text-amber-300 animate-pulse space-y-2">
          <Scale className="w-7 h-7 mx-auto animate-bounce" />
          <p>Querying vector store & retrieving applicable consumer protection statutes...</p>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {guidance && (
        <div className="space-y-5 pt-2">
          {/* Summary Analysis */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed">
            <h4 className="font-bold text-amber-400 mb-1.5 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Legal Merit Analysis</span>
            </h4>
            {guidance.summary_analysis}
          </div>

          {/* Applicable Statutory Provisions */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span>Retrieved Statutory References</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {guidance.applicable_laws.map((law, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">{law.title}</span>
                  </div>
                  <span className="inline-block text-[10px] text-indigo-400 font-mono">{law.source}</span>
                  <p className="text-[11px] text-slate-400">{law.summary}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Remedies & Next Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-emerald-400">Statutory Remedies Available</h4>
              <ul className="space-y-1.5">
                {guidance.recommended_remedies.map((remedy, idx) => (
                  <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                    <span className="text-emerald-400 shrink-0">•</span>
                    <span>{remedy}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-sky-400">Recommended Action Steps</h4>
              <ul className="space-y-1.5">
                {guidance.next_steps.map((step, idx) => (
                  <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                    <ArrowRight className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
