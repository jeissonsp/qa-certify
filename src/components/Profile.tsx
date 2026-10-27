
import { useRef } from "react";
import { ROLE_LABELS } from "../utils/helpers";
import type { User } from "../types/types";


export  function Profile({ user, onBack, onUpdate }: { user: User; onBack: () => void; onUpdate: (user: User) => void }) {
  const canSign = user.role === 'qa' || user.role === 'qa_manager';
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="fade-in h-full overflow-y-auto px-8 py-8">
      <button onClick={onBack} className="text-sm mb-6 hover:opacity-70" style={{ color: '#6B7494' }}>← Volver</button>
      <div className="max-w-2xl rounded-2xl p-6" style={{ background: '#12151E', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-4 mb-7">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold" style={{ background: '#4F8EF7', color: '#fff' }}>{user.avatar}</div>
          <div>
            <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'DM Sans, sans-serif' }}>{user.name}</h2>
            <p className="text-sm" style={{ color: '#6B7494' }}>{user.email} · {ROLE_LABELS[user.role]}</p>
          </div>
        </div>
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#6B7494' }}>Firma registrada</p>
        <div className="h-28 rounded-xl flex items-center justify-center mb-4" style={{ background: '#0E1019', border: '1px dashed rgba(255,255,255,0.12)' }}>
          {user.signature ? <p className="text-2xl italic" style={{ color: '#34D399', fontFamily: 'DM Sans, sans-serif' }}>{user.signature}</p> : <p className="text-sm" style={{ color: '#3A3F55' }}>Sin firma cargada</p>}
        </div>
        {canSign && (
          <>
            <input ref={inputRef} type="file" accept=".png,.jpg,.jpeg" className="hidden" onChange={e => {
              if (e.target.files?.[0]) onUpdate({ ...user, signature: user.name });
            }} />
            <button onClick={() => inputRef.current?.click()} className="px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-80"
              style={{ background: '#4F8EF7', color: '#fff' }}>{user.signature ? 'Actualizar firma' : 'Cargar firma'}</button>
            <p className="text-xs mt-2" style={{ color: '#6B7494' }}>Formatos permitidos: PNG o JPG. La firma es obligatoria para finalizar pruebas.</p>
          </>
        )}
      </div>
    </div>
  );
}
