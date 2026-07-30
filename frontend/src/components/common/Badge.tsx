import type { CaseCategory, CaseStatus, CaseUrgency } from '../../types/case';

interface CategoryBadgeProps {
  category: CaseCategory;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category }) => {
  const styles: Record<CaseCategory, string> = {
    Electronics: 'bg-slate-100 text-slate-700 border-slate-200',
    'E-commerce': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    Banking: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Utilities: 'bg-amber-50 text-amber-700 border-amber-200',
    Telecommunications: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${styles[category] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
      {category}
    </span>
  );
};

interface StatusBadgeProps {
  status: CaseStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const styles: Record<CaseStatus, { color: string; dot: string }> = {
    Draft: { color: 'bg-slate-100 text-slate-600 border-slate-200', dot: 'bg-slate-400' },
    'AI Analyzing': { color: 'bg-indigo-50 text-indigo-700 border-indigo-200', dot: 'bg-indigo-600 animate-pulse' },
    'Pending Info': { color: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
    'In Progress': { color: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-600' },
    Escalated: { color: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-600' },
    Resolved: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-600' },
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
    Low: 'bg-slate-100 text-slate-600 border-slate-200',
    Medium: 'bg-blue-50 text-blue-700 border-blue-200',
    High: 'bg-amber-50 text-amber-700 border-amber-200',
    Critical: 'bg-rose-50 text-rose-700 border-rose-200 font-bold',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border tracking-wide uppercase ${styles[urgency]}`}>
      {urgency} Priority
    </span>
  );
};
