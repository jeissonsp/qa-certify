import type {AuditEntry} from "../types/types"
import {ROLE_LABELS} from "../utils/helpers"


export function AuditLog({ entries, onBack }: { entries: AuditEntry[]; onBack: () => void }) {
  return (
    <div className="fade-in h-full overflow-y-auto px-8 py-8">
      <button onClick={onBack} className="text-sm mb-6 hover:opacity-70" style={{ color: '#6B7494' }}>← Volver</button>
      <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'DM Sans, sans-serif' }}>Registro de auditoría</h2>
      <p className="text-sm mb-6" style={{ color: '#6B7494' }}>Trazabilidad de las acciones realizadas durante esta sesión.</p>
      <div className="max-w-4xl space-y-2">
        {entries.map(entry => (
          <div key={entry.id} className="grid grid-cols-[160px_170px_1fr] gap-4 px-4 py-3 rounded-xl" style={{ background: '#12151E', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-xs font-mono" style={{ color: '#6B7494' }}>{entry.timestamp}</p>
            <div><p className="text-sm font-semibold text-white">{entry.userName}</p><p className="text-xs" style={{ color: '#6B7494' }}>{ROLE_LABELS[entry.role]}</p></div>
            <div><p className="text-sm font-semibold" style={{ color: '#4F8EF7' }}>{entry.action}</p><p className="text-xs mt-0.5" style={{ color: '#A0A8C0' }}>{entry.detail}</p></div>
          </div>
        ))}
      </div>
    </div>
  );
}
