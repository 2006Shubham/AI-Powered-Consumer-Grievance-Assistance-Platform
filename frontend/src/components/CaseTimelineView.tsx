import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Clock, CheckCircle, FileUp, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

interface TimelineEvent {
  id: string;
  case_id: string;
  event_type: string;
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
        return <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />;
      case 'evidence_uploaded':
        return <FileUp className="w-3.5 h-3.5 text-indigo-600" />;
      case 'analysis_completed':
        return <Sparkles className="w-3.5 h-3.5 text-indigo-600" />;
      case 'complaint_generated':
        return <CheckCircle className="w-3.5 h-3.5 text-blue-600" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 shadow-2xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" />
          <span>Case Timeline</span>
        </h3>
        <button
          type="button"
          onClick={loadTimeline}
          className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
          title="Refresh timeline"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="py-4 text-center text-xs text-slate-400">
          Loading timeline...
        </div>
      ) : events.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-4">No events logged yet.</p>
      ) : (
        <div className="relative pl-5 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-slate-200">
          {events.map((evt) => (
            <div key={evt.id} className="relative flex items-start gap-2.5 text-xs">
              <div className="absolute -left-5 top-0.5 p-0.5 rounded-full bg-white border border-slate-200 shadow-2xs">
                {getEventIcon(evt.event_type)}
              </div>
              <div className="flex-1 space-y-0.5">
                <div className="flex items-center justify-between text-slate-700">
                  <span className="font-medium text-slate-900 capitalize">
                    {evt.event_type.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {evt.created_at ? new Date(evt.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
                <p className="text-slate-500 text-xs leading-relaxed">{evt.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
