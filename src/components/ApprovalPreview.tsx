
import { Badge } from "./Badge";
import { SignatureBlock } from "./SignatureBlock";

import type {Review,User} from "../types/types";


export function ApprovalPreview({ review, currentUser, onAuthorize }: { review: Review; currentUser: User; onAuthorize: () => void }) {
  const isManager = currentUser.role === 'qa_manager';
  const canAuthorize = isManager && !review.approval.authorizedAt && review.testCases.length > 0;
  const allHaveResult = review.testCases.length > 0 && review.testCases.every(tc => !!tc.result);

  return (
    <div className="mt-6 rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)', background: '#0E1019' }}>
      <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#12151E' }}>
        <p className="text-sm font-bold text-white" style={{ fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.05em' }}>APROBACIÓN</p>
        <div className="flex items-center gap-3">
          {review.approval.authorizedAt && (
            <Badge label="Autorizado" color="#34D399" bg="rgba(52,211,153,0.12)" />
          )}
          {allHaveResult && (
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
              style={{ background: '#4F8EF7', color: '#fff' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              Generar PDF
            </button>
          )}
        </div>
      </div>
      <div className="p-5 grid grid-cols-2 gap-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#6B7494' }}>Firma(s) Analista QA</p>
          {review.approval.participants.length ? (
            review.approval.participants.map((p, i) => (
              <SignatureBlock key={i} name={p.name} timestamp={p.timestamp} />
            ))
          ) : (
            <div className="h-14 rounded-xl flex items-center justify-center" style={{ border: '1px dashed rgba(255,255,255,0.08)' }}>
              <span className="text-xs" style={{ color: '#3A3F55' }}>Sin firma</span>
            </div>
          )}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#6B7494' }}>Firma QA Manager</p>
          {review.approval.managerSignature ? (
            <SignatureBlock name={review.approval.managerSignature.name} timestamp={review.approval.managerSignature.timestamp} />
          ) : (
            <div className="h-14 rounded-xl flex flex-col items-center justify-center gap-2" style={{ border: '1px dashed rgba(255,255,255,0.08)' }}>
              {canAuthorize ? (
                <button onClick={onAuthorize}
                  className="text-xs font-semibold px-4 py-2 rounded-lg transition-all hover:opacity-80"
                  style={{ background: '#34D399', color: '#fff' }}>
                  Autorizar
                </button>
              ) : (
                <span className="text-xs" style={{ color: '#3A3F55' }}>Pendiente QA Manager</span>
              )}
            </div>
          )}
        </div>
      </div>
      {review.approval.authorizedAt && (
        <p className="px-5 pb-4 text-xs font-mono text-center" style={{ color: '#34D399' }}>
          ✓ Autorizado: {review.approval.authorizedAt}
        </p>
      )}
      {!allHaveResult && review.testCases.length > 0 && (
        <p className="px-5 pb-4 text-xs text-center" style={{ color: '#3A3F55' }}>
          El PDF estará disponible cuando todos los casos de prueba tengan resultado registrado.
        </p>
      )}
    </div>
  );
}
