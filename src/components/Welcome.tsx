

import type { User } from "../types/types";

export function Welcome({ currentUser }: { currentUser: User }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8">
      <div className="w-16 h-16 rounded-2xl mb-6 flex items-center justify-center" style={{ background: 'rgba(79,142,247,0.1)', border: '1px solid rgba(79,142,247,0.2)' }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4F8EF7" strokeWidth="1.5"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
      </div>
      <h2 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'DM Sans, sans-serif' }}>Bienvenido, {currentUser.name.split(' ')[0]}</h2>
      <p className="text-sm max-w-sm" style={{ color: '#6B7494' }}>
        Selecciona un grupo y luego un proyecto en el panel derecho para ver el historial de revisiones.
      </p>
      <div className="mt-8 grid grid-cols-4 gap-3 max-w-lg w-full">
        {[
          { label: 'Pendientes', value: 2, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
          { label: 'En Revisión', value: 3, color: '#4F8EF7', bg: 'rgba(79,142,247,0.1)' },
          { label: 'Aprobados', value: 8, color: '#34D399', bg: 'rgba(52,211,153,0.1)' },
          { label: 'No conformes', value: 2, color: '#F87171', bg: 'rgba(248,113,113,0.1)' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-4 text-center" style={{ background: s.bg, border: `1px solid ${s.color}30` }}>
            <p className="text-2xl font-bold" style={{ color: s.color, fontFamily: 'DM Sans, sans-serif' }}>{s.value}</p>
            <p className="text-xs mt-1" style={{ color: s.color, opacity: 0.7 }}>{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
