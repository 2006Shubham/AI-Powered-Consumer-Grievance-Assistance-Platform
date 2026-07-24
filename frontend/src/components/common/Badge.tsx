import type { CaseCategory, CaseStatus, CaseUrgency } from '../../types/case';

interface CategoryBadgeProps {
  category: CaseCategory;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category }) => {
  const styles: Record<CaseCategory, string> = {
    Electronics: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    'E-commerce': 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    Banking: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    Utilities: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    Telecommunications: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[category] || 'bg-slate-700 text-slate-300'}`}>
      {category}
    </span>
  );
};

interface StatusBadgeProps {
  status: CaseStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const styles: Record<CaseStatus, { color: string; dot: string }> = {
    Draft: { color: 'bg-slate-500/10 text-slate-400 border-slate-500/30', dot: 'bg-slate-400' },
    'AI Analyzing': { color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30 animate-pulse', dot: 'bg-indigo-400 animate-ping' },
    'Pending Info': { color: 'bg-amber-500/10 text-amber-400 border-amber-500/30', dot: 'bg-amber-400' },
    'In Progress': { color: 'bg-blue-500/10 text-blue-400 border-blue-500/30', dot: 'bg-blue-400' },
    Escalated: { color: 'bg-rose-500/10 text-rose-400 border-rose-500/30', dot: 'bg-rose-500' },
    Resolved: { color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', dot: 'bg-emerald-400' },
  };

  const style = styles[status] || styles['Draft'];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${style.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {status}
    </span>
  );
};

interface UrgencyBadgeProps {
  urgency: CaseUrgency;
}

export const UrgencyBadge: React.FC<UrgencyBadgeProps> = ({ urgency }) => {
  const styles: Record<CaseUrgency, string> = {
    Low: 'bg-slate-800 text-slate-300 border-slate-700',
    Medium: 'bg-blue-950 text-blue-300 border-blue-800',
    High: 'bg-amber-950 text-amber-300 border-amber-800',
    Critical: 'bg-rose-950 text-rose-300 border-rose-800 animate-pulse',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold border uppercase tracking-wider ${styles[urgency]}`}>
      {urgency} Priority
    </span>
  );
};
