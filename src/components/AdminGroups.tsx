import { useState } from "react";

import type {Group} from "../types/types"

import {uid} from "../utils/helpers"



export function AdminGroups({
  groups, onBack, onUpdateGroups,
}: {
  groups: Group[]; onBack: () => void;
  onUpdateGroups: (g: Group[]) => void;
}) {
  
  const [newProjectName, setNewProjectName] = useState<Record<string, string>>({});
  const [newGroupName, setNewGroupName] = useState('');
  const [moving, setMoving] = useState<{ projectId: string; fromGroupId: string } | null>(null);

  function addProject(groupId: string) {
    const name = newProjectName[groupId]?.trim();
    if (!name) return;
    
    const shortCode = name.replace(/\s+/g, '').toUpperCase().slice(0, 8);
    const updated = groups.map(g =>
      g.id === groupId ? { ...g, projects: [...g.projects, { id: uid(), name, groupId, shortCode }] } : g
    );
    onUpdateGroups(updated);
    setNewProjectName(prev => ({ ...prev, [groupId]: '' }));
  }

  function addGroup() {
    const name = newGroupName.trim();
    if (!name) return;
    const palette = [
      { color: '#4F8EF7', dimColor: 'rgba(79,142,247,0.15)', bgColor: 'rgba(79,142,247,0.1)' },
      { color: '#34D399', dimColor: 'rgba(52,211,153,0.15)', bgColor: 'rgba(52,211,153,0.1)' },
      { color: '#F59E0B', dimColor: 'rgba(245,158,11,0.15)', bgColor: 'rgba(245,158,11,0.1)' },
    ][groups.length % 3];
    onUpdateGroups([...groups, { id: uid(), name, ...palette, projects: [] }]);
    setNewGroupName('');
  }

  function deleteGroup(groupId: string) {
    const reason = window.prompt('Justificación para eliminar el grupo (requerida):');
    if (reason?.trim()) onUpdateGroups(groups.filter(group => group.id !== groupId));
  }

  function deleteProject(groupId: string, projectId: string) {
    const reason = window.prompt('Justificación para eliminar el proyecto (requerida):');
    if (reason?.trim()) onUpdateGroups(groups.map(group => group.id === groupId ? { ...group, projects: group.projects.filter(project => project.id !== projectId) } : group));
  }

  function renameGroup(groupId: string, currentName: string) {
    const name = window.prompt('Nuevo nombre del grupo:', currentName);
    if (name?.trim()) onUpdateGroups(groups.map(group => group.id === groupId ? { ...group, name: name.trim() } : group));
  }

  function renameProject(groupId: string, projectId: string, currentName: string) {
    const name = window.prompt('Nuevo nombre del proyecto:', currentName);
    if (!name?.trim()) return;
    onUpdateGroups(groups.map(group => group.id === groupId ? {
      ...group,
      projects: group.projects.map(project => project.id === projectId ? { ...project, name: name.trim() } : project),
    } : group));
  }

  function moveProject(toGroupId: string) {
    if (!moving) return;
    const proj = groups.flatMap(g => g.projects).find(p => p.id === moving.projectId)!;
    const updated = groups.map(g => {
      if (g.id === moving.fromGroupId) return { ...g, projects: g.projects.filter(p => p.id !== moving.projectId) };
      if (g.id === toGroupId) return { ...g, projects: [...g.projects, { ...proj, groupId: toGroupId }] };
      return g;
    });
    onUpdateGroups(updated);
    setMoving(null);
  }

  return (
    <div className="fade-in h-full overflow-y-auto px-8 py-8">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm mb-6 hover:opacity-70 transition-opacity" style={{ color: '#6B7494' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        Volver al dashboard
      </button>
      <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'DM Sans, sans-serif' }}>Gestión de Grupos</h2>
      <p className="text-sm mb-8" style={{ color: '#6B7494' }}>Solo el administrador puede gestionar grupos y proyectos.</p>

      <div className="flex gap-2 mb-6 max-w-md">
        <input value={newGroupName} onChange={e => setNewGroupName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addGroup()}
          placeholder="Nombre del nuevo grupo" className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
          style={{ background: '#12151E', border: '1px solid rgba(255,255,255,0.08)', color: '#DDE1EE' }} />
        <button onClick={addGroup} className="px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-80"
          style={{ background: '#F59E0B', color: '#fff' }}>Crear grupo</button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {groups.map(g => (
          <div key={g.id} className="rounded-2xl p-5" style={{ background: '#12151E', border: `1px solid ${g.color}30` }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: g.color }} />
              <h3 className="font-bold text-white" style={{ fontFamily: 'DM Sans, sans-serif' }}>{g.name}</h3>
              <span className="ml-auto text-xs font-mono px-1.5 py-0.5 rounded-full" style={{ background: g.dimColor, color: g.color }}>{g.projects.length}</span>
              <button onClick={() => renameGroup(g.id, g.name)} title="Editar grupo" className="text-xs hover:opacity-70" style={{ color: '#6B7494' }}>Editar</button>
              <button onClick={() => deleteGroup(g.id)} title="Eliminar grupo" className="text-xs hover:opacity-70" style={{ color: '#F87171' }}>×</button>
            </div>

            <div className="space-y-1.5 mb-4">
              {g.projects.map(p => (
                <div key={p.id} className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: '#181C28' }}>
                  <span className="flex-1 text-xs font-medium" style={{ color: '#A0A8C0' }}>{p.name}</span>
                  <button onClick={() => renameProject(g.id, p.id, p.name)} title="Editar proyecto" className="text-xs hover:opacity-70" style={{ color: '#6B7494' }}>Editar</button>
                  <button onClick={() => deleteProject(g.id, p.id)} title="Eliminar proyecto" className="text-xs hover:opacity-70" style={{ color: '#F87171' }}>×</button>
                  {moving?.projectId !== p.id ? (
                    <button onClick={() => setMoving({ projectId: p.id, fromGroupId: g.id })}
                      className="text-xs hover:opacity-70" style={{ color: '#6B7494' }} title="Mover a otro grupo">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 9l7-7 7 7M5 15l7 7 7-7"/></svg>
                    </button>
                  ) : (
                    <span className="text-xs" style={{ color: '#F59E0B' }}>Moviendo...</span>
                  )}
                </div>
              ))}
            </div>

            {moving && moving.fromGroupId !== g.id && (
              <button onClick={() => moveProject(g.id)}
                className="w-full py-2 rounded-xl text-xs font-semibold mb-3 transition-all hover:opacity-80"
                style={{ background: g.dimColor, color: g.color, border: `1px dashed ${g.color}60` }}>
                Mover aquí
              </button>
            )}

            <div className="flex gap-2">
              <input value={newProjectName[g.id] ?? ''} placeholder="Nombre del proyecto"
                onChange={e => setNewProjectName(prev => ({ ...prev, [g.id]: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && addProject(g.id)}
                className="flex-1 px-3 py-2 rounded-xl text-xs outline-none"
                style={{ background: '#0E1019', border: '1px solid rgba(255,255,255,0.08)', color: '#DDE1EE' }}
              />
              <button onClick={() => addProject(g.id)}
                className="px-3 py-2 rounded-xl text-xs font-bold transition-all hover:opacity-80"
                style={{ background: g.color, color: '#fff' }}>+</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
