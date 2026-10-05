import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { HelpCircle, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

interface AIFollowUpCardProps {
  caseId: string;
  initialAnswers?: Record<string, string>;
  onAnswersSubmitted?: () => void;
}

export const AIFollowUpCard: React.FC<AIFollowUpCardProps> = ({ caseId, initialAnswers, onAnswersSubmitted }) => {
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const fetchQuestions = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await api.getFollowUpQuestions(caseId);
      const qList = res.questions || [];
      setQuestions(qList);
      const initial: Record<string, string> = {};
      qList.forEach((_q, idx) => {
        initial[`q_${idx}`] = '';
      });
      setAnswers(initial);
    } catch (err: any) {
      setError(err.message || 'Failed to generate AI follow-up questions.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // If questions haven't been loaded yet, check if there are any answers or questions
    if (!initialAnswers || Object.keys(initialAnswers).length === 0) {
      fetchQuestions();
    }
  }, [caseId]);

  const handleInputChange = (key: string, value: string) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const formattedAnswers: Record<string, string> = {};
    questions.forEach((q, idx) => {
      if (answers[`q_${idx}`]?.trim()) {
        formattedAnswers[q] = answers[`q_${idx}`].trim();
      }
    });

    try {
      await api.submitAnswers(caseId, formattedAnswers);
      setIsSuccess(true);
      if (onAnswersSubmitted) onAnswersSubmitted();
    } catch (err: any) {
      setError(err.message || 'Failed to submit answers.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If case already has answered questions
  if (initialAnswers && Object.keys(initialAnswers).length > 0 && !questions.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Provided Information</span>
          </h3>
          <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">Recorded</span>
        </div>
        <div className="space-y-2 text-xs">
          {Object.entries(initialAnswers).map(([q, a], idx) => (
            <div key={idx} className="bg-slate-50 border border-slate-200/60 rounded p-2.5 space-y-1">
              <span className="text-slate-500 font-medium block">{q}</span>
              <span className="text-slate-900 font-semibold block">{a}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2.5 text-xs">
        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>Answers saved and integrated into your case context.</span>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 shadow-2xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Targeted Follow-Up Details</span>
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Answering these questions strengthens your claim</p>
        </div>

          {questions.length === 0 && !isLoading && (
          <button
            type="button"
            onClick={fetchQuestions}
            className="px-3 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors shadow-2xs"
          >
            Generate Questions
          </button>
        )}
      </div>

      {isLoading && (
        <div className="py-4 text-center text-xs text-slate-400">
          Generating targeted questions with AI...
        </div>
      )}

      {error && (
        <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {questions.length > 0 && (
        <form onSubmit={handleSubmit} className="space-y-3">
          {questions.map((q, idx) => (
            <div key={idx} className="space-y-1">
              <label className="text-xs text-slate-700 font-medium flex items-start gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>{q}</span>
              </label>
              <input
                type="text"
                placeholder="Enter details..."
                value={answers[`q_${idx}`] || ''}
                onChange={(e) => handleInputChange(`q_${idx}`, e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 px-3 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors shadow-2xs disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Answers to Case'}
          </button>
        </form>
      )}
    </div>
  );
};
