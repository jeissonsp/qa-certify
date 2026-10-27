import { useState } from "react";
import type {Review, User, Project, TestCase,ReviewStatus, Group} from "../types/types"
import {MONTH_FULL, STATUS_COLOR, STATUS_BG, STATUS_LABEL, WORKFLOW_LABEL, now} from "../utils/helpers"
import { Badge } from "./Badge";
import { ApprovalPreview } from "./ApprovalPreview";
import { TestCaseRow } from "./TestCaseRow";

export function ReviewList({
  month, year, project, group, reviews, currentUser,
  onBack, onCreateReview, onOpenTestCase, onUpdateReviews
}: {
  month: number; year: number; project: Project; group: Group;
  reviews: Review[]; currentUser: User;
  onBack: () => void;
  onCreateReview: () => void;
  onOpenTestCase: (review: Review, tc: TestCase | null) => void;
  onUpdateReviews: (updated: Review[]) => void;
}) {
  const [expandedReview, setExpandedReview] = useState<string | null>(reviews[0]?.id ?? null);

  const monthReviews = reviews.filter(r => r.projectId === project.id && r.month === month && r.year === year);

  return (
    <div className="fade-in h-full overflow-y-auto">
      <div className="px-8 pt-8 pb-4">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm mb-6 hover:opacity-70 transition-opacity" style={{ color: '#6B7494' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Volver al historial
        </button>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: group.dimColor, color: group.color }}>{group.name}</span>
              <span className="text-xs" style={{ color: '#3A3F55' }}>·</span>
              <span className="text-xs" style={{ color: '#6B7494' }}>{project.name}</span>
            </div>
            <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              {MONTH_FULL[month-1]} {year}
            </h2>
          </div>
          {(currentUser.role === 'qa' || currentUser.role === 'qa_manager') && (
            <button onClick={onCreateReview}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
              style={{ background: group.color, color: '#fff' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
              Nueva revisión
            </button>
          )}
        </div>
      </div>

      <div className="px-8 pb-8 space-y-4">
        {monthReviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl" style={{ border: '1px dashed rgba(255,255,255,0.1)' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#3A3F55" strokeWidth="1.5" className="mb-4"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
            <p className="text-base font-semibold mb-1" style={{ color: '#3A3F55' }}>No existe casos de prueba para este periodo</p>
            <p className="text-sm mb-6" style={{ color: '#2A2F45' }}>Crea una nueva revisión para comenzar a agregar casos de prueba.</p>
            {(currentUser.role === 'qa' || currentUser.role === 'qa_manager') && (
              <button onClick={onCreateReview}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
                style={{ background: group.color, color: '#fff' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
                Crear nuevos casos de prueba
              </button>
            )}
          </div>
        ) : (
          monthReviews.map((rev, ri) => (
            <div key={rev.id} className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${STATUS_COLOR[rev.status]}30`, background: '#12151E' }}>
              {/* revision header */}
              <button onClick={() => setExpandedReview(expandedReview === rev.id ? null : rev.id)}
                className="w-full flex items-center gap-4 px-5 py-4 transition-all hover:opacity-80">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{ background: STATUS_BG[rev.status], color: STATUS_COLOR[rev.status] }}>
                  {ri + 1}
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-white">Revisión #{ri+1}</span>
                    <Badge label={rev.version === 'qa' ? 'QA' : 'Producción'} color={rev.version === 'qa' ? '#4F8EF7' : '#F59E0B'} bg={rev.version === 'qa' ? 'rgba(79,142,247,0.12)' : 'rgba(245,158,11,0.12)'} />
                    <Badge label={STATUS_LABEL[rev.status]} color={STATUS_COLOR[rev.status]} bg={STATUS_BG[rev.status]} />
                    <Badge label={WORKFLOW_LABEL[rev.workflowStatus]} color="#A0A8C0" bg="rgba(160,168,192,0.1)" />
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: '#6B7494' }}>
                    {rev.startDate} → {rev.endDate} · {rev.testCases.length} caso{rev.testCases.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <svg className="transition-transform flex-shrink-0" style={{ transform: expandedReview === rev.id ? 'rotate(90deg)' : 'rotate(0)', color: '#6B7494' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
              </button>

              {expandedReview === rev.id && (
                <div className="px-5 pb-5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  {/* review info panel */}
                  <div className="mt-4 grid grid-cols-4 gap-3 p-4 rounded-xl mb-4" style={{ background: '#181C28', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#3A3F55' }}>Proyecto</p>
                      <p className="text-sm font-medium" style={{ color: '#DDE1EE' }}>{project.name}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#3A3F55' }}>Versión / Ambiente</p>
                      <Badge label={rev.version === 'qa' ? 'QA' : 'Producción'} color={rev.version === 'qa' ? '#4F8EF7' : '#F59E0B'} bg={rev.version === 'qa' ? 'rgba(79,142,247,0.12)' : 'rgba(245,158,11,0.12)'} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#3A3F55' }}>Fecha inicio</p>
                      <p className="text-sm font-mono" style={{ color: '#A0A8C0' }}>{rev.startDate}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#3A3F55' }}>Fecha fin</p>
                      <p className="text-sm font-mono" style={{ color: '#A0A8C0' }}>{rev.endDate}</p>
                    </div>
                  </div>

                  {/* test cases */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#3A3F55' }}>Casos de prueba</p>
                      {((currentUser.role === 'qa' && ['creation', 'correction'].includes(rev.workflowStatus)) || currentUser.role === 'qa_manager') && (
                        <button onClick={() => onOpenTestCase(rev, null)}
                          className="flex items-center gap-1 text-xs font-medium transition-all hover:opacity-70" style={{ color: group.color }}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
                          Agregar caso
                        </button>
                      )}
                    </div>

                    {rev.testCases.map((tc) => (
                      <TestCaseRow key={tc.id} tc={tc} group={group} currentUser={currentUser}
                        onClick={() => onOpenTestCase(rev, tc)} />
                    ))}

                    {rev.testCases.length === 0 && (
                      <div className="py-8 text-center rounded-xl" style={{ border: '1px dashed rgba(255,255,255,0.07)' }}>
                        <p className="text-sm" style={{ color: '#3A3F55' }}>Sin casos de prueba aún.</p>
                      </div>
                    )}
                  </div>

                  {/* role-specific workflow actions */}
                  {currentUser.role === 'qa' && ['creation', 'correction'].includes(rev.workflowStatus) && (
                    <div className="mt-5 flex items-center justify-between gap-4 p-4 rounded-xl" style={{ background: 'rgba(79,142,247,0.07)', border: '1px solid rgba(79,142,247,0.2)' }}>
                      <div>
                        <p className="text-sm font-semibold text-white">Enviar pruebas a revisión</p>
                        <p className="text-xs mt-1" style={{ color: '#6B7494' }}>Requiere firma cargada y resultado en todos los casos.</p>
                      </div>
                      <button disabled={!currentUser.signature || !rev.testCases.length || rev.testCases.some(tc => !tc.result)}
                        onClick={() => onUpdateReviews([{ ...rev, workflowStatus: 'review', status: 'in_review', endDate: new Date().toISOString().slice(0, 10), approval: { ...rev.approval, participants: [{ userId: currentUser.id, name: currentUser.name, signature: currentUser.signature, timestamp: now() }] } }])}
                        className="px-4 py-2 rounded-xl text-xs font-semibold disabled:opacity-30 hover:opacity-80"
                        style={{ background: '#4F8EF7', color: '#fff' }}>Enviar a QA Manager</button>
                    </div>
                  )}
                  {currentUser.role === 'qa_manager' && rev.workflowStatus === 'review' && (
                    <div className="mt-5 p-4 rounded-xl" style={{ background: '#181C28', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#6B7494' }}>Decisión de revisión</p>
                      <div className="flex gap-2">
                        <button onClick={() => {
                          const observation = window.prompt('Observaciones generales de la revisión (requerido):');
                          if (observation?.trim()) onUpdateReviews([{ ...rev, workflowStatus: 'correction', status: 'non_conforming', testCases: rev.testCases.map(tc => ({ ...tc, reviewObservations: observation })) }]);
                        }} className="px-4 py-2 rounded-xl text-xs font-semibold hover:opacity-80"
                          style={{ background: 'rgba(248,113,113,0.12)', color: '#F87171' }}>Corregir</button>
                        <button disabled={!currentUser.signature} onClick={() => onUpdateReviews([{ ...rev, workflowStatus: 'finished', status: rev.testCases.some(tc => tc.result === 'non_conforming') ? 'non_conforming' : 'approved', approval: { ...rev.approval, managerSignature: { userId: currentUser.id, name: currentUser.name, signature: currentUser.signature, timestamp: now() }, authorizedAt: now() } }])}
                          className="px-4 py-2 rounded-xl text-xs font-semibold disabled:opacity-30 hover:opacity-80"
                          style={{ background: '#34D399', color: '#fff' }}>Enviar y notificar equipo</button>
                      </div>
                    </div>
                  )}

                  {/* approval section — at the bottom of the review */}
                  <ApprovalPreview review={rev} currentUser={currentUser} onAuthorize={() => {
                    const updated = rev.testCases.length > 0 ? {
                      ...rev, status: 'approved' as ReviewStatus,
                      approval: {
                        ...rev.approval,
                        participants: rev.approval.participants.length ? rev.approval.participants : [{ userId: currentUser.id, name: currentUser.name, signature: currentUser.signature, timestamp: now() }],
                        managerSignature: { userId: currentUser.id, name: currentUser.name, signature: currentUser.signature, timestamp: now() },
                        authorizedAt: now(),
                      }
                    } : rev;
                    onUpdateReviews([updated]);
                  }} />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
