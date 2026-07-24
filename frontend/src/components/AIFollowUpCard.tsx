import React, { useState } from 'react';
import { api } from '../services/api';
import { HelpCircle, Send, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

interface AIFollowUpCardProps {
  caseId: string;
  onAnswersSubmitted?: () => void;
}

export const AIFollowUpCard: React.FC<AIFollowUpCardProps> = ({ caseId, onAnswersSubmitted }) => {
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
      setQuestions(res.questions || []);
      const initialAnswers: Record<string, string> = {};
      (res.questions || []).forEach((q, idx) => {
        initialAnswers[`q_${idx}`] = '';
      });
      setAnswers(initialAnswers);
    } catch (err: any) {
      setError(err.message || 'Failed to generate AI follow-up questions.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (key: string, value: string) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const formattedAnswers: Record<string, string> = {};
    questions.forEach((q, idx) => {
      formattedAnswers[q] = answers[`q_${idx}`] || '';
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

  if (isSuccess) {
    return (
      <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-3">
        <CheckCircle2 className="w-5 h-5 shrink-0" />
        <span className="text-sm font-semibold">Your answers have been saved and added to the case context.</span>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">AI Follow-Up Questions</h3>
            <p className="text-xs text-slate-400">Provide details to strengthen your grievance case</p>
          </div>
        </div>

        {questions.length === 0 && !isLoading && (
          <button
            type="button"
            onClick={fetchQuestions}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all"
          >
            Generate Questions
          </button>
        )}
      </div>

      {isLoading && (
        <div className="py-6 text-center text-xs text-slate-400 animate-pulse">
          Analyzing case requirements and generating follow-up questions...
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {questions.length > 0 && (
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {questions.map((q, idx) => (
            <div key={idx} className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>{q}</span>
              </label>
              <input
                type="text"
                required
                placeholder="Type your answer here..."
                value={answers[`q_${idx}`] || ''}
                onChange={(e) => handleInputChange(`q_${idx}`, e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 hover:opacity-95 text-white text-xs font-bold shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Saving Answers...' : 'Submit Answers to Case'}</span>
          </button>
        </form>
      )}
    </div>
  );
};
