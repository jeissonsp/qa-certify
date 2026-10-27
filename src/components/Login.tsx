import { useState } from "react";
import { USERS, CORPORATE_DOMAIN } from "../data/mockdata"
import type { User } from "../types/types";
import {ROLE_LABELS} from "../utils/helpers"

export function Login({ onLogin }: { onLogin: (u: User) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailErr, setEmailErr] = useState('');
  const [authErr, setAuthErr] = useState('');
  const [loading, setLoading] = useState(false);

  function validateEmail(val: string) {
    if (!val) { setEmailErr(''); return; }
    const domain = val.split('@')[1];
    if (val.includes('@') && domain && domain !== CORPORATE_DOMAIN)
      setEmailErr(`Solo se permiten correos corporativos (@${CORPORATE_DOMAIN})`);
    else setEmailErr('');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (emailErr) return;
    setLoading(true);
    setTimeout(() => {
      const user = USERS.find(u => u.email === email.toLowerCase().trim());
      if (!user) { setAuthErr('Credenciales incorrectas o usuario no encontrado.'); setLoading(false); return; }
      setLoading(false);
      onLogin(user);
    }, 800);
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0C0E15' }}>
      <div className="w-full max-w-md px-4">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(79,142,247,0.2)', border: '1px solid rgba(79,142,247,0.4)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4F8EF7" strokeWidth="2.2"><path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/></svg>
            </div>
            <span className="text-white font-semibold text-lg tracking-tight" style={{ fontFamily: 'DM Sans, sans-serif' }}>Quality App</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'DM Sans, sans-serif' }}>Iniciar sesión</h1>
          <p className="text-sm" style={{ color: '#6B7494' }}>Acceso exclusivo con correo corporativo</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl p-8 space-y-5" style={{ background: '#12151E', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#A0A8C0' }}>Correo electrónico</label>
            <input
              type="email" value={email} required
              onChange={e => { setEmail(e.target.value); validateEmail(e.target.value); setAuthErr(''); }}
              placeholder={`usuario@${CORPORATE_DOMAIN}`}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
              style={{ background: '#181C28', border: `1px solid ${emailErr ? '#F87171' : 'rgba(255,255,255,0.09)'}`, color: '#DDE1EE' }}
            />
            {emailErr && <p className="mt-1.5 text-xs" style={{ color: '#F87171' }}>{emailErr}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#A0A8C0' }}>Contraseña</label>
            <input
              type="password" value={password} required
              onChange={e => { setPassword(e.target.value); setAuthErr(''); }}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
              style={{ background: '#181C28', border: '1px solid rgba(255,255,255,0.09)', color: '#DDE1EE' }}
            />
          </div>
          {authErr && <p className="text-xs px-3 py-2 rounded-lg" style={{ color: '#F87171', background: 'rgba(248,113,113,0.1)' }}>{authErr}</p>}
          <button type="submit" disabled={loading || !!emailErr}
            className="w-full py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-50"
            style={{ background: '#4F8EF7', color: '#fff' }}>
            {loading ? 'Verificando...' : 'Ingresar'}
          </button>
          <div className="pt-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <p className="text-xs text-center mb-3" style={{ color: '#6B7494' }}>Usuarios de prueba:</p>
            <div className="grid grid-cols-2 gap-2">
              {USERS.map(u => (
                <button key={u.id} type="button"
                  onClick={() => { setEmail(u.email); setPassword('demo123'); setEmailErr(''); setAuthErr(''); }}
                  className="text-left px-3 py-2 rounded-lg transition-all hover:opacity-80"
                  style={{ background: '#181C28', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <p className="text-xs font-medium" style={{ color: '#DDE1EE' }}>{u.name}</p>
                  <p className="text-xs" style={{ color: '#6B7494' }}>{ROLE_LABELS[u.role]}</p>
                </button>
              ))}
            </div>
            </div>
        </form>
      </div>
    </div>
  );
}
