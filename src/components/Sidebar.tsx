import { useState } from "react";
import type { Group, Project, User } from "../types/types";
import {ROLE_LABELS} from '../utils/helpers'



export function Sidebar({
  groups, selectedProject, onSelectProject, currentUser, onAdminGroups, onProfile, onAudit, onLogout,
}: {
  groups: Group[];
  selectedProject: Project | null;
  onSelectProject: (p: Project, g: Group) => void;
  currentUser: User;
  onAdminGroups: () => void;
  onProfile: () => void;
  onAudit: () => void;
  onLogout: () => void;
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ g1: true });

  function toggle(id: string) { setExpanded(p => ({ ...p, [id]: !p[id] })); }

  const gemIcon: Record<string, React.ReactNode> = {
    Zafiro: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 8l10 14L22 8z"/></svg>,
    Esmeralda: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 2h12l4 6-10 14L2 8z"/></svg>,
    Rubí: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.5 7h7.5l-6 5.5 2.5 8L12 18l-7.5 4.5 2.5-8L1 9h7.5z"/></svg>,
  };

  return (
    <aside className="flex flex-col h-full" style={{ width: 260, minWidth: 260, background: '#0E1019', borderRight: '1px solid rgba(255,255,255,0.07)' }}>
      {/* header */}
      <div className="px-4 py-4 flex items-center gap-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(79,142,247,0.2)' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4F8EF7" strokeWidth="2.2"><path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/></svg>
        </div>
        <span className="font-bold text-white text-sm tracking-tight" style={{ fontFamily: 'DM Sans, sans-serif' }}>Quality App</span>
      </div>

      {/* groups */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        <p className="px-2 mb-2 text-xs font-semibold uppercase tracking-widest" style={{ color: '#3A3F55' }}>Grupos de Proyectos</p>
        {groups.filter(g => currentUser.role !== 'scrum' || g.id === currentUser.groupId).map(g => (
          <div key={g.id}>
            <button onClick={() => toggle(g.id)}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all hover:opacity-80"
              style={{ background: expanded[g.id] ? g.dimColor : 'transparent' }}>
              <span style={{ color: g.color }}>{gemIcon[g.name]}</span>
              <span className="flex-1 text-left text-sm font-semibold" style={{ color: expanded[g.id] ? g.color : '#A0A8C0' }}>{g.name}</span>
              <span className="text-xs px-1.5 py-0.5 rounded-full font-mono" style={{ background: g.dimColor, color: g.color }}>{g.projects.length}</span>
              <svg className="transition-transform" style={{ transform: expanded[g.id] ? 'rotate(90deg)' : 'rotate(0deg)', color: g.color, opacity: 0.6 }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
            </button>
            {expanded[g.id] && (
              <div className="mt-1 ml-2 space-y-0.5 pl-3" style={{ borderLeft: `1px solid ${g.color}30` }}>
                {g.projects.map(p => {
                  const sel = selectedProject?.id === p.id;
                  return (
                    <button key={p.id} onClick={() => onSelectProject(p, g)}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm transition-all"
                      style={{ background: sel ? g.bgColor : 'transparent', color: sel ? g.color : '#7B849E', borderLeft: sel ? `2px solid ${g.color}` : '2px solid transparent' }}>
                      <span className="font-medium">{p.name}</span>
                      <span className="block text-xs font-mono opacity-60">{p.shortCode}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* bottom */}
      <div className="px-2 py-3 space-y-1" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="grid grid-cols-2 gap-1">
          <button onClick={onProfile} className="px-2 py-2 rounded-xl text-xs font-semibold hover:opacity-80"
            style={{ background: '#12151E', color: '#A0A8C0' }}>Mi perfil</button>
          <button onClick={onAudit} className="px-2 py-2 rounded-xl text-xs font-semibold hover:opacity-80"
            style={{ background: '#12151E', color: '#A0A8C0' }}>Auditoría</button>
        </div>
        {currentUser.role === 'admin' && (
          <button onClick={onAdminGroups}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all hover:opacity-80"
            style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93A10 10 0 005 19.07"/><path d="M4.93 4.93A10 10 0 0019 19.07"/></svg>
            Gestionar Grupos
          </button>
        )}
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl" style={{ background: '#12151E' }}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: '#4F8EF7', color: '#fff' }}>{currentUser.avatar}</div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate" style={{ color: '#DDE1EE' }}>{currentUser.name}</p>
            <p className="text-xs" style={{ color: '#6B7494' }}>{ROLE_LABELS[currentUser.role]}</p>
          </div>
          <button onClick={onLogout} title="Cerrar sesión" style={{ color: '#6B7494' }} className="hover:opacity-80">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
