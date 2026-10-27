import { useState } from "react";
import { useRef, useEffect } from "react";
import type { Review,TestCase, Project, Group, User, TestResult } from "../types/types";
import { uid,now, fmt, ROLE_LABELS } from "../utils/helpers";
import { Badge } from "./Badge";
import { USERS } from "../data/mockdata";

export function TestCaseForm({
  review, testCase, project, group, currentUser,
  onBack, onSave,
}: {
  review: Review; testCase: TestCase | null; project: Project; group: Group;
  currentUser: User;
  onBack: () => void;
  onSave: (tc: TestCase) => void;
}) {
  const isReadOnly = currentUser.role === 'scrum' || currentUser.role === 'admin' ||
    (currentUser.role === 'qa' && !['creation', 'correction'].includes(review.workflowStatus));
  const isNew = !testCase;

  const nextNum = String(review.testCases.length + 1).padStart(3, '0');
  const defaultCase: TestCase = {
    id: uid(), caseNumber: `CP_${project.shortCode}_${nextNum}`,
    focusDate: undefined, result: undefined,
    criticality: 'medium', assignedTo: currentUser.id,
    requirements: '', expectedResult: '', evidence: [],
    evidenceText: '', observations: '', recommendations: '',
    active: true, timeSpent: 0, status: 'draft',
  };

  const [form, setForm] = useState<TestCase>(testCase ?? defaultCase);
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [uploadFiles, setUploadFiles] = useState<{ name: string; size: string; type: string }[]>([]);
  const [videoLink, setVideoLink] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (timerActive) {
      timerRef.current = setInterval(() => {
        setForm(prev => ({ ...prev, timeSpent: prev.timeSpent + 1 }));
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerActive]);

  function handleEvidenceFocus() {
    if (!form.focusDate) setForm(prev => ({ ...prev, focusDate: now(), status: 'open' }));
    if (!timerActive) setTimerActive(true);
  }

  function handleEvidenceBlur() { setTimerActive(false); }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const allowed = ['image/png','image/jpeg','application/pdf','video/mp4'];
    const maxMB = 20;
    files.forEach(f => {
      if (!allowed.includes(f.type)) return;
      if (f.size > maxMB * 1024 * 1024) return;
      setUploadFiles(prev => [...prev, { name: f.name, size: (f.size/1024/1024).toFixed(1)+'MB', type: f.type.split('/')[1].toUpperCase() }]);
    });
  }

  function handleSave() {
    if (form.result === 'non_conforming' && !form.observations.trim()) {
      window.alert('Debes registrar observaciones para un resultado no certificable.');
      return;
    }
    const saved = { ...form, status: form.result ? 'closed' as const : 'open' as const };
    onSave(saved);
  }

  const field = (label: string, child: React.ReactNode, hint?: string) => (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#6B7494' }}>{label}</label>
      {child}
      {hint && <p className="mt-1 text-xs" style={{ color: '#3A3F55' }}>{hint}</p>}
    </div>
  );

  const textarea = (key: keyof TestCase, rows = 3, onFocus?: () => void, onBlur?: () => void) => (
    <textarea rows={rows} value={form[key] as string}
      readOnly={isReadOnly}
      onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
      onFocus={onFocus} onBlur={onBlur}
      className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none transition-all"
      style={{ background: '#0E1019', border: '1px solid rgba(255,255,255,0.08)', color: '#DDE1EE', fontFamily: key === 'evidenceText' ? 'Outfit, sans-serif' : undefined }}
    />
  );

  return (
    <div className="fade-in h-full overflow-y-auto">
      <div className="px-8 pt-8 pb-6 sticky top-0 z-10" style={{ background: '#0C0E15', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm mb-4 hover:opacity-70 transition-opacity" style={{ color: '#6B7494' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Volver a revisiones
        </button>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-sm font-semibold" style={{ color: group.color }}>{form.caseNumber}</span>
              {form.status !== 'draft' && <Badge label={form.status === 'open' ? 'En revisión' : 'Cerrado'} color={form.status === 'open' ? '#F59E0B' : '#34D399'} bg={form.status === 'open' ? 'rgba(245,158,11,0.12)' : 'rgba(52,211,153,0.12)'} />}
            </div>
            <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              {isNew ? 'Nuevo caso de prueba' : 'Caso de prueba'}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {/* timer */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: '#12151E', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className={`w-2 h-2 rounded-full ${timerActive ? 'pulse-dot' : ''}`} style={{ background: timerActive ? '#34D399' : '#3A3F55' }} />
              <span className="text-sm font-mono font-semibold" style={{ color: timerActive ? '#34D399' : '#6B7494' }}>{fmt(form.timeSpent)}</span>
            </div>
            {!isReadOnly && (
              <button onClick={handleSave}
                className="px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
                style={{ background: group.color, color: '#fff' }}>
                {isNew ? 'Guardar caso' : 'Actualizar'}
              </button>
            )}
            {!isNew && currentUser.role === 'qa_manager' && form.active && (
              <button onClick={() => {
                const reason = window.prompt('Justificación para inactivar este caso (requerida):');
                if (reason?.trim()) onSave({ ...form, active: false, deletionReason: reason });
              }} className="px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-80"
                style={{ background: 'rgba(248,113,113,0.12)', color: '#F87171' }}>Inactivar</button>
            )}
          </div>
        </div>
      </div>

      <div className="px-8 py-6 space-y-6 max-w-4xl">

        {/* caso number + fecha foco */}
        <div className="grid grid-cols-2 gap-4">
          {field('Número de caso',
            <div className="px-4 py-3 rounded-xl text-sm font-mono font-semibold" style={{ background: '#0E1019', border: '1px solid rgba(255,255,255,0.08)', color: group.color }}>
              {form.caseNumber}
            </div>
          )}
          {field('Fecha de apertura',
            <div className="px-4 py-3 rounded-xl text-sm font-mono" style={{ background: '#0E1019', border: '1px solid rgba(255,255,255,0.08)', color: form.focusDate ? '#DDE1EE' : '#3A3F55' }}>
              {form.focusDate ?? 'Se registra al abrir el caso'}
            </div>,
            'Se registra automáticamente al hacer foco en Evidencias'
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {field('Nivel de criticidad',
            <select value={form.criticality} disabled={isReadOnly}
              onChange={e => setForm(prev => ({ ...prev, criticality: e.target.value as TestCase['criticality'] }))}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none"
              style={{ background: '#0E1019', border: '1px solid rgba(255,255,255,0.08)', color: '#DDE1EE' }}>
              <option value="high">Alto</option>
              <option value="medium">Medio</option>
              <option value="low">Bajo</option>
            </select>
          )}
          {field('QA asignado',
            <select value={form.assignedTo} disabled={isReadOnly}
              onChange={e => setForm(prev => ({ ...prev, assignedTo: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none"
              style={{ background: '#0E1019', border: '1px solid rgba(255,255,255,0.08)', color: '#DDE1EE' }}>
              {USERS.filter(user => user.role === 'qa' || user.role === 'qa_manager').map(user => (
                <option key={user.id} value={user.id}>{user.name} · {ROLE_LABELS[user.role]}</option>
              ))}
            </select>
          )}
        </div>

        {/* resultado */}
        {field('Resultado',
          <select value={form.result ?? ''} disabled={isReadOnly}
            onChange={e => setForm(prev => ({ ...prev, result: e.target.value as TestResult || undefined }))}
            className="w-full px-4 py-3 rounded-xl text-sm outline-none"
            style={{ background: '#0E1019', border: `1px solid ${form.result === 'success' ? 'rgba(52,211,153,0.4)' : form.result === 'non_conforming' ? 'rgba(248,113,113,0.4)' : 'rgba(255,255,255,0.08)'}`, color: '#DDE1EE' }}>
            <option value="">-- Seleccionar resultado --</option>
            <option value="success">✓ Exitoso (certificable)</option>
            <option value="non_conforming">✗ No conforme (no certificable)</option>
          </select>
        )}

        {/* requerimientos */}
        {field('Requerimientos', textarea('requirements', 3))}

        {/* resultado esperado */}
        {field('Resultado esperado', textarea('expectedResult', 3))}

        {/* evidencias (with timer trigger) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: '#6B7494' }}>
              Evidencias y Resultado
            </label>
            <div className="flex items-center gap-2">
              {timerActive && <span className="text-xs font-mono" style={{ color: '#34D399' }}>● Cronómetro activo: {fmt(form.timeSpent)}</span>}
              <span className="text-xs" style={{ color: '#3A3F55' }}>El cronómetro inicia al hacer foco aquí</span>
            </div>
          </div>
          <textarea rows={4} value={form.evidenceText} readOnly={isReadOnly}
            onChange={e => setForm(prev => ({ ...prev, evidenceText: e.target.value }))}
            onFocus={handleEvidenceFocus}
            onBlur={handleEvidenceBlur}
            placeholder="Describe el resultado observado, pasos ejecutados, y cualquier evidencia textual..."
            className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none transition-all"
            style={{ background: '#0E1019', border: `1px solid ${timerActive ? 'rgba(52,211,153,0.4)' : 'rgba(255,255,255,0.08)'}`, color: '#DDE1EE', boxShadow: timerActive ? '0 0 0 2px rgba(52,211,153,0.1)' : 'none' }}
          />
          {/* file upload */}
          {!isReadOnly && (
            <div className="mt-3 space-y-2">
              <div
                className="flex flex-col items-center justify-center p-6 rounded-xl cursor-pointer hover:opacity-80 transition-all"
                style={{ border: '1px dashed rgba(255,255,255,0.12)', background: '#0E1019' }}
                onClick={() => fileInputRef.current?.click()}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3A3F55" strokeWidth="1.5" className="mb-2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
                <p className="text-xs font-semibold" style={{ color: '#6B7494' }}>Adjuntar archivos</p>
                <p className="text-xs mt-0.5" style={{ color: '#3A3F55' }}>PNG, JPG, PDF, MP4 · máx 20MB</p>
              </div>
              <input ref={fileInputRef} type="file" multiple accept=".png,.jpg,.jpeg,.pdf,.mp4" className="hidden" onChange={handleFile} />
              {uploadFiles.map((f, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: '#12151E', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded" style={{ background: '#1A1F2E', color: '#4F8EF7' }}>{f.type}</span>
                  <span className="flex-1 text-xs truncate" style={{ color: '#A0A8C0' }}>{f.name}</span>
                  <span className="text-xs font-mono" style={{ color: '#6B7494' }}>{f.size}</span>
                  <button onClick={() => setUploadFiles(prev => prev.filter((_,j) => j !== i))} style={{ color: '#F87171' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  </button>
                </div>
              ))}
              {/* video link */}
              <div className="flex gap-2">
                <input value={videoLink} onChange={e => setVideoLink(e.target.value)}
                  placeholder="Link de video (YouTube, Loom, etc.)"
                  className="flex-1 px-4 py-2.5 rounded-xl text-xs outline-none"
                  style={{ background: '#0E1019', border: '1px solid rgba(255,255,255,0.08)', color: '#DDE1EE' }} />
                <button className="px-4 py-2.5 rounded-xl text-xs font-semibold hover:opacity-80"
                  style={{ background: '#12151E', border: '1px solid rgba(255,255,255,0.08)', color: '#A0A8C0' }}>
                  Agregar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* observaciones (solo si no conforme) */}
        <div>
          <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: form.result === 'non_conforming' ? '#F87171' : '#6B7494' }}>
            Observaciones
            {form.result === 'non_conforming' && <span className="text-xs font-normal normal-case tracking-normal" style={{ color: '#F87171' }}>* Requerido para resultado No Conforme</span>}
          </label>
          {textarea('observations', 3)}
        </div>

        {/* recomendaciones */}
        {field('Recomendaciones',
          textarea('recommendations', 2),
          'Hallazgos no bloqueantes que no afectan el flujo principal'
        )}

        {form.reviewObservations && field('Observaciones generales de la revisión',
          <div className="px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', color: '#F87171' }}>{form.reviewObservations}</div>
        )}

        {currentUser.role === 'scrum' && form.recommendations && (
          <div className="p-4 rounded-xl" style={{ background: '#12151E', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-sm font-semibold text-white mb-1">Decisión sobre la recomendación</p>
            <p className="text-xs mb-3" style={{ color: '#6B7494' }}>Indica si el equipo implementará este hallazgo no bloqueante.</p>
            <div className="flex gap-2">
              <button onClick={() => onSave({ ...form, scrumDecision: 'accepted', scrumJustification: '' })}
                className="px-4 py-2 rounded-xl text-xs font-semibold hover:opacity-80"
                style={{ background: 'rgba(52,211,153,0.12)', color: '#34D399' }}>Se implementará</button>
              <button onClick={() => {
                const reason = window.prompt('Justificación para no implementar (requerida):');
                if (reason?.trim()) onSave({ ...form, scrumDecision: 'rejected', scrumJustification: reason });
              }} className="px-4 py-2 rounded-xl text-xs font-semibold hover:opacity-80"
                style={{ background: 'rgba(248,113,113,0.12)', color: '#F87171' }}>No se implementará</button>
            </div>
            {form.scrumDecision && <p className="text-xs mt-3" style={{ color: '#A0A8C0' }}>Decisión registrada: {form.scrumDecision === 'accepted' ? 'Se implementará' : `No se implementará — ${form.scrumJustification}`}</p>}
          </div>
        )}

      </div>
    </div>
  );
}
