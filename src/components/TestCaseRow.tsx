
import type {TestCase,Group,User} from "../types/types"
import { Badge } from "./Badge";
import { fmt } from "../utils/helpers";

export function TestCaseRow({ tc, group, onClick }: { tc: TestCase; group: Group; currentUser: User; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full text-left px-4 py-3 rounded-xl transition-all hover:opacity-80 group"
      style={{ background: '#181C28', border: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="flex items-center gap-3">
        <span className="text-xs font-mono font-semibold" style={{ color: group.color }}>{tc.caseNumber}</span>
        <div className="flex-1 min-w-0">
          <p className="text-xs truncate" style={{ color: '#A0A8C0' }}>{tc.requirements.slice(0,60)}...</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {!tc.active && <Badge label="Inactivo" color="#6B7494" bg="rgba(107,116,148,0.12)" />}
          {tc.result ? (
            <Badge label={tc.result === 'success' ? 'Exitoso' : 'No Conforme'}
              color={tc.result === 'success' ? '#34D399' : '#F87171'}
              bg={tc.result === 'success' ? 'rgba(52,211,153,0.12)' : 'rgba(248,113,113,0.12)'} />
          ) : (
            <Badge label="Sin resultado" color="#6B7494" bg="rgba(107,116,148,0.12)" />
          )}
          <svg className="opacity-0 group-hover:opacity-60 transition-opacity" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6B7494" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
        </div>
      </div>
      {tc.timeSpent > 0 && (
        <p className="mt-1 text-xs font-mono" style={{ color: '#3A3F55' }}>⏱ {fmt(tc.timeSpent)}</p>
      )}
    </button>
  );
}
