import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Clock, CheckCircle, FileUp, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

interface TimelineEvent {
  id: string;
  case_id: string;
  event_type: str;
  description: string;
  created_at: string;
}

interface CaseTimelineViewProps {
  caseId: string;
}

export const CaseTimelineView: React.FC<CaseTimelineViewProps> = ({ caseId }) => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadTimeline = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await api.getTimeline(caseId);
      setEvents(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load case timeline');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTimeline();
  }, [caseId]);

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'case_created':
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'evidence_uploaded':
        return <FileUp className="w-4 h-4 text-indigo-400" />;
      case 'analysis_completed':
        return <Sparkles className="w-4 h-4 text-amber-400" />;
      default:
        return <Clock className="w-4 h-4 text-sky-400" />;
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-400" />
          <span>Case Timeline & Activity Audit</span>
        </h3>
        <button
          type="button"
          onClick={loadTimeline}
          className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
          title="Refresh timeline"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="py-6 text-center text-xs text-slate-400 animate-pulse">
          Loading case activity timeline...
        </div>
      ) : events.length === 0 ? (
        <p className="text-xs text-slate-500 text-center py-4">No events logged yet for this case.</p>
      ) : (
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
          {events.map((evt) => (
            <div key={evt.id} className="relative flex items-start gap-3">
              <div className="absolute -left-6 top-0.5 p-1 rounded-full bg-slate-950 border border-slate-800 shadow-sm">
                {getEventIcon(evt.event_type)}
              </div>
              <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3.5 w-full space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200 capitalize">{evt.event_type.replace('_', ' ')}</span>
                  <span className="text-[10px] text-slate-500">{new Date(evt.created_at).toLocaleString()}</span>
                </div>
                <p className="text-xs text-slate-400">{evt.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
