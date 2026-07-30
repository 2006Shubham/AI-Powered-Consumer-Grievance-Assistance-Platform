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
    <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-600">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>RAG Legal Intelligence</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-semibold border border-amber-200">
                Grounded Statutory Law
              </span>
            </h3>
            <p className="text-xs text-slate-500">Consumer Protection Act 2019 & TRAI/RBI regulatory frameworks</p>
          </div>
        </div>

        {!guidance && !isLoading && (
          <button
            type="button"
            onClick={fetchGuidance}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center gap-2 transition-all shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Guidance</span>
          </button>
        )}
      </div>

      {isLoading && (
        <div className="py-6 text-center text-xs text-indigo-900 animate-pulse space-y-2">
          <Scale className="w-6 h-6 mx-auto text-indigo-600 animate-bounce" />
          <p>Querying vector database & retrieving applicable consumer protection statutes...</p>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {guidance && (
        <div className="space-y-4 pt-1">
          {/* Summary Analysis */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed">
            <h4 className="font-bold text-indigo-900 mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Statutory Legal Analysis</span>
            </h4>
            {guidance.summary_analysis}
          </div>

          {/* Applicable Statutory Provisions */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>Retrieved Consumer Protection Statutes</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {guidance.applicable_laws.map((law, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">{law.title}</span>
                  </div>
                  <span className="inline-block text-[10px] text-indigo-700 font-mono font-semibold">{law.source}</span>
                  <p className="text-[11px] text-slate-600">{law.summary}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Remedies & Next Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="text-xs font-bold text-emerald-800">Statutory Remedies</h4>
              <ul className="space-y-1.5">
                {guidance.recommended_remedies.map((remedy, idx) => (
                  <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                    <span className="text-emerald-600 shrink-0 font-bold">•</span>
                    <span>{remedy}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="text-xs font-bold text-indigo-800">Action Plan</h4>
              <ul className="space-y-1.5">
                {guidance.next_steps.map((step, idx) => (
                  <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                    <ArrowRight className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
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
