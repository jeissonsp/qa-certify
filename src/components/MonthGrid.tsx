
import type {Project, Group, Review, ReviewStatus, User} from "../types/types"

import { MONTHS, STATUS_BG, STATUS_COLOR, STATUS_LABEL, MONTH_FULL } from "../utils/helpers";
import { Badge } from "./Badge";

export function MonthGrid({
  project, group, reviews, currentYear, onSelectMonth, onYearChange, 
}: {
  project: Project; group: Group; reviews: Review[]; currentYear: number;
  onSelectMonth: (month: number, revs: Review[]) => void;
  onYearChange: (y: number) => void;
  currentUser: User;
}) {
  const years = [2023, 2024, 2025, 2026];
  const projectReviews = reviews.filter(r => r.projectId === project.id && r.year === currentYear);

  function getMonthStatus(month: number): ReviewStatus | null {
    const revs = projectReviews.filter(r => r.month === month);
    if (!revs.length) return null;
    if (revs.some(r => r.status === 'pending')) return 'pending';
    if (revs.some(r => r.status === 'non_conforming')) return 'non_conforming';
    if (revs.some(r => r.status === 'in_review')) return 'in_review';
    return 'approved';
  }

  const totalReviews = projectReviews.length;
  const approved = projectReviews.filter(r => r.status === 'approved').length;
  const pending = projectReviews.filter(r => r.status === 'pending').length;
  const nonConf = projectReviews.filter(r => r.status === 'non_conforming').length;

  return (
    <div className="fade-in h-full overflow-y-auto">
      {/* header */}
      <div className="px-8 pt-8 pb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: group.dimColor, color: group.color }}>{group.name}</span>
            </div>
            <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'DM Sans, sans-serif' }}>{project.name}</h2>
            <p className="text-sm mt-1" style={{ color: '#6B7494' }}>Historial de revisiones por mes · <span className="font-mono">{project.shortCode}</span></p>
          </div>
          {/* year filter */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl" style={{ background: '#12151E', border: '1px solid rgba(255,255,255,0.07)' }}>
            {years.map(y => (
              <button key={y} onClick={() => onYearChange(y)}
                className="px-3 py-1.5 rounded-lg text-sm font-semibold transition-all"
                style={{ background: y === currentYear ? group.color : 'transparent', color: y === currentYear ? '#fff' : '#6B7494' }}>
                {y}
              </button>
            ))}
          </div>
        </div>

        {/* stats row */}
        <div className="mt-6 grid grid-cols-4 gap-3">
          {[
            { label: 'Total revisiones', value: totalReviews, color: group.color },
            { label: 'Aprobadas', value: approved, color: '#34D399' },
            { label: 'Pendientes', value: pending, color: '#F59E0B' },
            { label: 'No conformes', value: nonConf, color: '#F87171' },
          ].map(s => (
            <div key={s.label} className="rounded-xl px-4 py-3" style={{ background: '#12151E', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-2xl font-bold" style={{ color: s.color, fontFamily: 'DM Sans, sans-serif' }}>{s.value}</p>
              <p className="text-xs mt-0.5" style={{ color: '#6B7494' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* month grid */}
      <div className="px-8 pb-8">
        <div className="grid grid-cols-4 gap-3">
          {MONTHS.map((m, i) => {
            const monthNum = i + 1;
            const revs = projectReviews.filter(r => r.month === monthNum);
            const status = getMonthStatus(monthNum);
            const isPending = status === 'pending' || (revs.length === 0 && monthNum <= new Date().getMonth() + 1 && currentYear <= new Date().getFullYear());
            const noData = revs.length === 0;

            return (
              <button key={m} onClick={() => onSelectMonth(monthNum, revs)}
                className="relative text-left p-4 rounded-2xl transition-all group"
                style={{
                  background: noData ? '#12151E' : status ? STATUS_BG[status] : '#12151E',
                  border: `1px solid ${status ? STATUS_COLOR[status] + '40' : 'rgba(255,255,255,0.07)'}`,
                  boxShadow: status === 'pending' ? `0 0 0 1px ${STATUS_COLOR['pending']}40` : 'none',
                }}>
                {/* pending pulse */}
                {status === 'pending' && (
                  <span className="absolute top-3 right-3 w-2 h-2 rounded-full pulse-dot" style={{ background: '#F59E0B' }} />
                )}
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#3A3F55' }}>{m}</p>
                <p className="text-xl font-bold" style={{ color: status ? STATUS_COLOR[status] : '#3A3F55', fontFamily: 'DM Sans, sans-serif' }}>
                  {MONTH_FULL[i].slice(0,3)}
                </p>
                <div className="mt-3 space-y-1">
                  {noData ? (
                    <p className="text-xs" style={{ color: '#3A3F55' }}>Sin revisiones</p>
                  ) : (
                    <>
                      <p className="text-xs" style={{ color: '#6B7494' }}>{revs.length} revisión{revs.length > 1 ? 'es' : ''}</p>
                      {status && <Badge label={STATUS_LABEL[status]} color={STATUS_COLOR[status]} bg={STATUS_BG[status]} />}
                    </>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* legend */}
        <div className="mt-6 flex items-center gap-4 flex-wrap">
          <p className="text-xs" style={{ color: '#3A3F55' }}>Estado:</p>
          {Object.entries(STATUS_LABEL).map(([k, v]) => (
            <div key={k} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: STATUS_COLOR[k as ReviewStatus] }} />
              <span className="text-xs" style={{ color: '#6B7494' }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
