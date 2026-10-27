import { useMemo, useRef, useState } from 'react';
import type { Group, Project, Review, TestCase, User } from '../types/types';
import { USERS } from '../data/mockdata';



type Section = 'dashboard' | 'projects' | 'tests' | 'reports';
type EditorTab = 'design' | 'execution' | 'approval';

const ENVIRONMENT_LABELS = { dev: 'DEV', qa: 'QA', production: 'PROD' };
const CRITICALITY_LABELS = { high: 'Alta', medium: 'Media', low: 'Baja' };

function id() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function resultLabel(testCase: TestCase) {
  if (testCase.result === 'success') return 'Exitoso';
  if (testCase.result === 'non_conforming') return 'No conforme';
  return 'Pendiente';
}

function formatMinutes(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return hours ? `${hours} h ${minutes} min` : `${minutes} min`;
}

function GroupMark({ group, large = false }: { group: Group; large?: boolean }) {
  return (
    <div className={`${large ? 'w-12 h-12' : 'w-8 h-8'} rounded-xl flex items-center justify-center`}
      style={{ background: group.dimColor, color: group.color, border: `1px solid ${group.color}40` }}>
      <svg width={large ? 24 : 16} height={large ? 24 : 16} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L3 7.5 6.5 18 12 22l5.5-4L21 7.5 12 2zm0 3.2 5.7 3.5-2.2 6.7L12 18l-3.5-2.6-2.2-6.7L12 5.2z" />
      </svg>
    </div>
  );
}

function StatusPill({ testCase }: { testCase: TestCase }) {
  const color = testCase.result === 'success' ? '#34D399' : testCase.result === 'non_conforming' ? '#F87171' : '#F59E0B';
  const bg = testCase.result === 'success' ? 'rgba(52,211,153,0.12)' : testCase.result === 'non_conforming' ? 'rgba(248,113,113,0.12)' : 'rgba(245,158,11,0.12)';
  return <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ color, background: bg }}>{resultLabel(testCase)}</span>;
}

function WorkspaceSidebar({
  groups, selectedGroup, section, onSelectGroup, onSection, currentUser, onLogout,
}: {
  groups: Group[];
  selectedGroup: Group | null;
  section: Section;
  onSelectGroup: (group: Group | null) => void;
  onSection: (section: Section) => void;
  currentUser: User;
  onLogout: () => void;
}) {
  const menu: { id: Section; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <path d="M4 13h6V4H4v9zm0 7h6v-5H4v5zm10 0h6v-9h-6v9zm0-16v5h6V4h-6z" /> },
    { id: 'projects', label: 'Proyectos', icon: <path d="M3 6h7l2 2h9v11H3V6z" /> },
    { id: 'tests', label: 'Pruebas', icon: <path d="M9 11l2 2 4-4m4-4v14H5V5h14z" /> },
    { id: 'reports', label: 'Informes', icon: <path d="M5 20V10h3v10H5zm6 0V4h3v16h-3zm6 0v-7h3v7h-3z" /> },
  ];

  return (
    <aside className="w-64 min-w-64 h-full flex flex-col" style={{ background: '#0E1019', borderRight: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="px-5 py-5 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(79,142,247,0.16)', color: '#4F8EF7' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M4 3h16v18H4V3zm4 4v2h8V7H8zm0 4v2h8v-2H8zm0 4v2h5v-2H8z" /></svg>
        </div>
        <div>
          <p className="text-sm font-bold text-white">Quality App</p>
          <p className="text-xs" style={{ color: '#6B7494' }}>Gestión de calidad</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        {!selectedGroup ? (
          <>
            <p className="px-3 mb-3 text-xs font-semibold uppercase tracking-widest" style={{ color: '#3A3F55' }}>Grupos</p>
            <div className="space-y-2">
              {groups.map(group => (
                <button key={group.id} onClick={() => onSelectGroup(group)}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all hover:opacity-80"
                  style={{ background: '#12151E', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <GroupMark group={group} />
                  <span className="text-sm font-semibold" style={{ color: '#DDE1EE' }}>{group.name}</span>
                  <svg className="ml-auto" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7494" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <button onClick={() => onSelectGroup(null)} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left mb-5 hover:opacity-80"
              style={{ background: selectedGroup.dimColor, border: `1px solid ${selectedGroup.color}35` }}>
              <GroupMark group={selectedGroup} />
              <div className="flex-1">
                <p className="text-xs" style={{ color: '#6B7494' }}>Equipo seleccionado</p>
                <p className="text-sm font-bold" style={{ color: selectedGroup.color }}>{selectedGroup.name}</p>
              </div>
              <span className="text-xs" style={{ color: '#6B7494' }}>Cambiar</span>
            </button>
            <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-widest" style={{ color: '#3A3F55' }}>Menú</p>
            <div className="space-y-1">
              {menu.map(item => (
                <button key={item.id} onClick={() => onSection(item.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{ background: section === item.id ? selectedGroup.dimColor : 'transparent', color: section === item.id ? selectedGroup.color : '#7B849E' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">{item.icon}</svg>
                  {item.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl" style={{ background: '#12151E' }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: '#4F8EF7', color: '#fff' }}>{currentUser.avatar}</div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{currentUser.name}</p>
            <p className="text-xs" style={{ color: '#6B7494' }}>{currentUser.role === 'qa_manager' ? 'QA Manager' : currentUser.role === 'scrum' ? 'Scrum / Director' : 'QA Analista'}</p>
          </div>
          <button onClick={onLogout} title="Cerrar sesión" style={{ color: '#6B7494' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 17l5-5-5-5M15 12H3m10-9h8v18h-8" /></svg>
          </button>
        </div>
      </div>
    </aside>
  );
}

function GroupLanding({ groups, currentUser, onSelect }: { groups: Group[]; currentUser: User; onSelect: (group: Group) => void }) {
  return (
    <main className="h-full overflow-y-auto px-10 py-10">
      <div className="max-w-6xl mx-auto">
        <p className="text-sm font-semibold mb-2" style={{ color: '#4F8EF7' }}>Panel de equipos</p>
        <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'DM Sans, sans-serif' }}>Bienvenido, {currentUser.name.split(' ')[0]}</h1>
        <p className="text-sm mt-2 mb-9" style={{ color: '#6B7494' }}>Selecciona un grupo para consultar sus desarrollos y comenzar un ciclo de pruebas.</p>
        <div className="grid grid-cols-3 gap-5">
          {groups.map(group => (
            <button key={group.id} onClick={() => onSelect(group)}
              className="group text-left p-6 rounded-2xl transition-all hover:-translate-y-1"
              style={{ background: '#12151E', border: `1px solid ${group.color}30`, boxShadow: `0 16px 40px ${group.color}0D` }}>
              <div className="flex items-start justify-between mb-8">
                <GroupMark group={group} large />
                <svg className="opacity-50 group-hover:opacity-100" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={group.color} strokeWidth="2"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>
              </div>
              <p className="text-sm font-semibold mb-1" style={{ color: '#6B7494' }}>Grupo</p>
              <p className="text-xl font-bold text-white mb-5" style={{ fontFamily: 'DM Sans, sans-serif' }}>{group.name}</p>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold" style={{ color: group.color }}>{group.projects.length}</p>
                  <p className="text-xs mt-1" style={{ color: '#6B7494' }}>desarrollos activos</p>
                </div>
                <span className="text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: group.dimColor, color: group.color }}>Ver equipo</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}

function ProjectOverview({
  group, projects, reviews, section, onOpen, onOpenReport, canCreate,
}: {
  group: Group;
  projects: Project[];
  reviews: Review[];
  section: Section;
  onOpen: (project: Project) => void;
  onOpenReport: (project: Project) => void;
  canCreate: boolean;
}) {
  const allCases = reviews.flatMap(review => review.testCases);
  const completed = allCases.filter(testCase => testCase.result).length;
  const success = allCases.filter(testCase => testCase.result === 'success').length;
  const failed = allCases.filter(testCase => testCase.result === 'non_conforming').length;
  const pending = allCases.length - completed;
  const observations = allCases.filter(testCase => testCase.observations.trim()).length;
  const recommendations = allCases.filter(testCase => testCase.recommendations.trim()).length;

  if (section === 'dashboard') {
    const metrics = [
      { label: 'Revisiones creadas', value: reviews.length, detail: `${reviews.filter(review => review.workflowStatus !== 'finished').length} en ejecución`, color: group.color },
      { label: 'Casos registrados', value: allCases.length, detail: `${completed} ejecutados`, color: '#4F8EF7' },
      { label: 'Exitosos', value: success, detail: completed ? `${Math.round((success / completed) * 100)}% de efectividad` : 'Sin ejecución', color: '#34D399' },
      { label: 'No conformes', value: failed, detail: `${observations} con observaciones`, color: '#F87171' },
      { label: 'Pendientes', value: pending, detail: 'Por ejecutar', color: '#F59E0B' },
      { label: 'Recomendaciones', value: recommendations, detail: 'Hallazgos no bloqueantes', color: '#A78BFA' },
    ];
    return (
      <main className="h-full overflow-y-auto px-9 py-8">
        <p className="text-sm font-semibold mb-1" style={{ color: group.color }}>Dashboard del equipo</p>
        <h1 className="text-2xl font-bold text-white">Resumen general de {group.name}</h1>
        <p className="text-sm mt-2 mb-7" style={{ color: '#6B7494' }}>Indicadores consolidados de todos los proyectos y ciclos de prueba.</p>
        <div className="grid grid-cols-3 gap-4 mb-7">
          {metrics.map(metric => (
            <div key={metric.label} className="p-5 rounded-2xl" style={{ background: '#12151E', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-center justify-between"><p className="text-sm" style={{ color: '#6B7494' }}>{metric.label}</p><span className="w-2 h-2 rounded-full" style={{ background: metric.color }} /></div>
              <p className="text-3xl font-bold mt-4" style={{ color: metric.color }}>{metric.value}</p>
              <p className="text-xs mt-2" style={{ color: '#6B7494' }}>{metric.detail}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-[1fr_320px] gap-4">
          <div className="p-5 rounded-2xl" style={{ background: '#12151E', border: '1px solid rgba(255,255,255,0.07)' }}>
            <h2 className="text-sm font-bold text-white mb-4">Estado por proyecto</h2>
            <div className="space-y-4">
              {projects.map(project => {
                const projectCases = reviews.filter(review => review.projectId === project.id).flatMap(review => review.testCases);
                const done = projectCases.filter(testCase => testCase.result).length;
                const progress = projectCases.length ? Math.round((done / projectCases.length) * 100) : 0;
                return <div key={project.id}><div className="flex justify-between mb-2"><span className="text-xs font-semibold" style={{ color: '#A0A8C0' }}>{project.name}</span><span className="text-xs font-mono" style={{ color: group.color }}>{progress}%</span></div><div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#0C0E15' }}><div className="h-full rounded-full" style={{ width: `${progress}%`, background: group.color }} /></div></div>;
              })}
            </div>
          </div>
          <div className="p-5 rounded-2xl" style={{ background: group.dimColor, border: `1px solid ${group.color}30` }}>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: group.color }}>Resultado global</p>
            <p className="text-4xl font-bold mt-5 text-white">{completed ? Math.round((success / completed) * 100) : 0}%</p>
            <p className="text-sm mt-2" style={{ color: '#A0A8C0' }}>de casos ejecutados son certificables</p>
            <div className="mt-6 pt-5" style={{ borderTop: `1px solid ${group.color}25` }}><p className="text-xs" style={{ color: '#6B7494' }}>Hallazgos documentados</p><p className="text-xl font-bold mt-1" style={{ color: group.color }}>{observations + recommendations}</p></div>
          </div>
        </div>
      </main>
    );
  }

  if (section === 'tests') {
    return (
      <main className="h-full overflow-y-auto px-9 py-8">
        <h1 className="text-2xl font-bold text-white">Pruebas del equipo {group.name}</h1>
        <p className="text-sm mt-2 mb-6" style={{ color: '#6B7494' }}>{allCases.length} casos registrados en todos los proyectos.</p>
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
          {allCases.slice(0, 12).map(testCase => (
            <div key={testCase.id} className="grid grid-cols-[180px_1fr_130px] gap-4 px-5 py-4" style={{ background: '#12151E', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span className="text-xs font-mono" style={{ color: group.color }}>{testCase.caseNumber}</span>
              <span className="text-sm truncate" style={{ color: '#A0A8C0' }}>{testCase.requirements}</span>
              <StatusPill testCase={testCase} />
            </div>
          ))}
        </div>
      </main>
    );
  }

  if (section === 'reports') {
    return (
      <main className="h-full overflow-y-auto px-9 py-8">
        <h1 className="text-2xl font-bold text-white">Informes de {group.name}</h1>
        <p className="text-sm mt-2 mb-7" style={{ color: '#6B7494' }}>Selecciona un proyecto para consultar su calendario anual, revisiones y hallazgos.</p>
        <div className="grid grid-cols-2 gap-4">
          {projects.map(project => {
            const projectReviews = reviews.filter(review => review.projectId === project.id);
            const projectCases = projectReviews.flatMap(review => review.testCases);
            const projectObservations = projectCases.filter(testCase => testCase.observations.trim()).length;
            const projectRecommendations = projectCases.filter(testCase => testCase.recommendations.trim()).length;
            return (
              <button key={project.id} onClick={() => onOpenReport(project)} className="text-left p-5 rounded-2xl hover:opacity-85"
                style={{ background: '#12151E', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex items-start justify-between"><div><p className="text-lg font-bold text-white">{project.name}</p><p className="text-xs font-mono mt-1" style={{ color: group.color }}>{project.shortCode}</p></div><span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: group.dimColor, color: group.color }}>{projectReviews.length} revisiones</span></div>
                <div className="grid grid-cols-3 gap-3 mt-5">
                  <div><p className="text-xs" style={{ color: '#6B7494' }}>Casos</p><p className="text-lg font-bold text-white mt-1">{projectCases.length}</p></div>
                  <div><p className="text-xs" style={{ color: '#6B7494' }}>Observaciones</p><p className="text-lg font-bold mt-1" style={{ color: '#F87171' }}>{projectObservations}</p></div>
                  <div><p className="text-xs" style={{ color: '#6B7494' }}>Recomendaciones</p><p className="text-lg font-bold mt-1" style={{ color: '#A78BFA' }}>{projectRecommendations}</p></div>
                </div>
                <p className="text-xs font-semibold mt-5" style={{ color: group.color }}>Abrir informe anual →</p>
              </button>
            );
          })}
        </div>
      </main>
    );
  }

  return (
    <main className="h-full overflow-y-auto px-9 py-8">
      <div className="flex items-end justify-between mb-7">
        <div>
          <p className="text-sm font-semibold mb-1" style={{ color: group.color }}>{section === 'dashboard' ? 'Dashboard del equipo' : 'Portafolio de proyectos'}</p>
          <h1 className="text-2xl font-bold text-white">Desarrollos de {group.name}</h1>
          <p className="text-sm mt-2" style={{ color: '#6B7494' }}>Consulta el estado de calidad y abre un proyecto para gestionar su ciclo de pruebas.</p>
        </div>
        <div className="flex gap-3">
          <div className="px-4 py-3 rounded-xl" style={{ background: '#12151E' }}><p className="text-xs" style={{ color: '#6B7494' }}>Proyectos</p><p className="text-lg font-bold text-white">{projects.length}</p></div>
          <div className="px-4 py-3 rounded-xl" style={{ background: '#12151E' }}><p className="text-xs" style={{ color: '#6B7494' }}>En ejecución</p><p className="text-lg font-bold" style={{ color: '#F59E0B' }}>{reviews.filter(review => review.workflowStatus !== 'finished').length}</p></div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {projects.map(project => {
          const projectReviews = reviews.filter(review => review.projectId === project.id).sort((a, b) => b.startDate.localeCompare(a.startDate));
          const lastReview = projectReviews[0];
          const testCases = lastReview?.testCases ?? [];
          const finished = testCases.filter(testCase => testCase.result).length;
          const progress = testCases.length ? Math.round((finished / testCases.length) * 100) : 0;
          const running = lastReview && lastReview.workflowStatus !== 'finished';
          return (
            <article key={project.id} className="p-5 rounded-2xl" style={{ background: '#12151E', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-start justify-between mb-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-mono text-xs font-bold" style={{ background: group.dimColor, color: group.color }}>{project.shortCode.slice(0, 3)}</div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: running ? 'rgba(245,158,11,0.12)' : 'rgba(107,116,148,0.12)', color: running ? '#F59E0B' : '#6B7494' }}>{running ? 'En ejecución' : 'Sin ciclo activo'}</span>
              </div>
              <h2 className="text-lg font-bold text-white">{project.name}</h2>
              <p className="text-xs font-mono mt-1" style={{ color: '#6B7494' }}>{project.shortCode}</p>
              <div className="grid grid-cols-3 gap-3 my-5">
                <div><p className="text-xs" style={{ color: '#6B7494' }}>Última revisión</p><p className="text-sm font-semibold mt-1 text-white">{lastReview ? lastReview.startDate : 'Sin registros'}</p></div>
                <div><p className="text-xs" style={{ color: '#6B7494' }}>Avance</p><p className="text-sm font-semibold mt-1" style={{ color: '#4F8EF7' }}>{progress}%</p></div>
                <div><p className="text-xs" style={{ color: '#6B7494' }}>Casos</p><p className="text-sm font-semibold mt-1 text-white">{testCases.length}</p></div>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden mb-5" style={{ background: '#0C0E15' }}><div className="h-full rounded-full" style={{ width: `${progress}%`, background: group.color }} /></div>
              <button onClick={() => onOpen(project)} disabled={!lastReview && !canCreate} className="w-full py-2.5 rounded-xl text-sm font-semibold hover:opacity-85 disabled:opacity-30"
                style={{ background: group.color, color: '#fff' }}>{running ? 'Abrir ciclo de pruebas' : lastReview ? 'Consultar última revisión' : canCreate ? 'Crear ciclo de pruebas' : 'Sin revisiones disponibles'}</button>
            </article>
          );
        })}
      </div>
    </main>
  );
}

function ReportCalendar({
  group, project, reviews, onBack,
}: {
  group: Group;
  project: Project;
  reviews: Review[];
  onBack: () => void;
}) {
  const reportYears = reviews.filter(review => review.projectId === project.id).map(review => review.year);
  const latestYear = reportYears.length ? Math.max(...reportYears) : new Date().getFullYear();
  const [year, setYear] = useState(latestYear);
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const projectReviews = reviews.filter(review => review.projectId === project.id && review.year === year);
  const cases = projectReviews.flatMap(review => review.testCases);
  const observations = cases.filter(testCase => testCase.observations.trim()).length;
  const recommendations = cases.filter(testCase => testCase.recommendations.trim()).length;

  return (
    <main className="h-full overflow-y-auto px-9 py-8">
      <button onClick={onBack} className="text-xs font-semibold mb-5 hover:opacity-70" style={{ color: '#6B7494' }}>← Volver a informes</button>
      <div className="flex items-start justify-between mb-7">
        <div><p className="text-sm font-semibold" style={{ color: group.color }}>Informe anual</p><h1 className="text-2xl font-bold text-white mt-1">{project.name}</h1><p className="text-sm mt-2" style={{ color: '#6B7494' }}>Histórico de revisiones, observaciones y recomendaciones por mes.</p></div>
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: '#12151E' }}>{[2024, 2025, 2026].map(value => <button key={value} onClick={() => setYear(value)} className="px-3 py-2 rounded-lg text-xs font-semibold" style={{ background: year === value ? group.color : 'transparent', color: year === value ? '#fff' : '#6B7494' }}>{value}</button>)}</div>
      </div>
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Revisiones realizadas', value: projectReviews.length, color: group.color },
          { label: 'Casos registrados', value: cases.length, color: '#4F8EF7' },
          { label: 'Con observaciones', value: observations, color: '#F87171' },
          { label: 'Con recomendaciones', value: recommendations, color: '#A78BFA' },
        ].map(metric => <div key={metric.label} className="p-4 rounded-2xl" style={{ background: '#12151E', border: '1px solid rgba(255,255,255,0.07)' }}><p className="text-xs" style={{ color: '#6B7494' }}>{metric.label}</p><p className="text-2xl font-bold mt-3" style={{ color: metric.color }}>{metric.value}</p></div>)}
      </div>
      <div className="grid grid-cols-4 gap-3">
        {months.map((month, index) => {
          const monthReviews = projectReviews.filter(review => review.month === index + 1);
          const monthCases = monthReviews.flatMap(review => review.testCases);
          const monthObservations = monthCases.filter(testCase => testCase.observations.trim()).length;
          const monthRecommendations = monthCases.filter(testCase => testCase.recommendations.trim()).length;
          return (
            <div key={month} className="p-4 rounded-2xl min-h-40" style={{ background: '#12151E', border: `1px solid ${monthReviews.length ? `${group.color}40` : 'rgba(255,255,255,0.06)'}` }}>
              <div className="flex justify-between items-center"><p className="text-sm font-bold" style={{ color: monthReviews.length ? group.color : '#6B7494' }}>{month}</p><span className="text-xs font-mono" style={{ color: '#6B7494' }}>{monthReviews.length}</span></div>
              {monthReviews.length ? <div className="mt-5 space-y-3"><div><p className="text-xs" style={{ color: '#6B7494' }}>Casos</p><p className="text-lg font-bold text-white">{monthCases.length}</p></div><div className="flex gap-3"><span className="text-xs" style={{ color: '#F87171' }}>{monthObservations} obs.</span><span className="text-xs" style={{ color: '#A78BFA' }}>{monthRecommendations} rec.</span></div><p className="text-xs" style={{ color: monthReviews.some(review => review.workflowStatus !== 'finished') ? '#F59E0B' : '#34D399' }}>{monthReviews.some(review => review.workflowStatus !== 'finished') ? 'En ejecución' : 'Finalizado'}</p></div> : <p className="text-xs mt-8 text-center" style={{ color: '#3A3F55' }}>Sin revisiones</p>}
            </div>
          );
        })}
      </div>
    </main>
  );
}

function CycleView({
  group, project, review, currentUser, onBack, onChange, onEditCase, readOnly,
}: {
  group: Group;
  project: Project;
  review: Review;
  currentUser: User;
  onBack: () => void;
  onChange: (review: Review) => void;
  onEditCase: (testCase: TestCase | null) => void;
  readOnly: boolean;
}) {
  const [query, setQuery] = useState('');
  const [title, setTitle] = useState(`Ciclo de certificación · ${project.name}`);
  const total = review.testCases.length;
  const finished = review.testCases.filter(testCase => testCase.result).length;
  const success = review.testCases.filter(testCase => testCase.result === 'success').length;
  const failed = review.testCases.filter(testCase => testCase.result === 'non_conforming').length;
  const blocking = review.testCases.filter(testCase => testCase.result === 'non_conforming' && testCase.criticality === 'high').length;
  const progress = total ? Math.round((finished / total) * 100) : 0;
  const time = review.testCases.reduce((sum, testCase) => sum + testCase.timeSpent, 0);
  const filtered = review.testCases.filter(testCase => `${testCase.caseNumber} ${testCase.requirements}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <main className="h-full overflow-y-auto">
      <div className="px-8 py-6" style={{ background: '#10131C', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={onBack} className="text-xs font-semibold mb-5 hover:opacity-70" style={{ color: '#6B7494' }}>← Volver a proyectos</button>
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: group.dimColor, color: group.color }}>{project.name}</span>
              <span className="text-xs" style={{ color: '#6B7494' }}>{new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
            <input value={title} readOnly={readOnly} onChange={event => setTitle(event.target.value)}
              className="w-full bg-transparent text-2xl font-bold text-white outline-none" style={{ fontFamily: 'DM Sans, sans-serif' }} />
          </div>
          <div className="flex items-center gap-3">
            <select value={review.version} disabled={readOnly} onChange={event => onChange({ ...review, version: event.target.value as Review['version'] })}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold outline-none" style={{ background: '#181C28', border: '1px solid rgba(255,255,255,0.08)', color: '#DDE1EE' }}>
              <option value="qa">QA</option><option value="dev">DEV</option><option value="production">PROD</option>
            </select>
            <div className="px-4 py-2.5 rounded-xl" style={{ background: '#181C28' }}>
              <p className="text-xs" style={{ color: '#6B7494' }}>Actualizado hace menos de 1 min</p>
              <p className="text-xs font-semibold mt-0.5" style={{ color: '#A0A8C0' }}>por {currentUser.name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        <div className="grid grid-cols-[280px_1fr] gap-5 mb-6">
          <div className="rounded-2xl p-5 flex items-center gap-5" style={{ background: '#12151E', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="w-28 h-28 rounded-full flex items-center justify-center" style={{ background: `conic-gradient(${group.color} ${progress * 3.6}deg, #202535 0)` }}>
              <div className="w-20 h-20 rounded-full flex flex-col items-center justify-center" style={{ background: '#12151E' }}>
                <span className="text-2xl font-bold text-white">{progress}%</span><span className="text-xs" style={{ color: '#6B7494' }}>avance</span>
              </div>
            </div>
            <div><p className="text-xs" style={{ color: '#6B7494' }}>Avance general</p><p className="text-lg font-bold text-white mt-1">{finished} de {total} casos</p><p className="text-xs mt-2" style={{ color: '#6B7494' }}>finalizados</p></div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Exitosos', value: success, color: '#34D399' },
              { label: 'No conformes', value: failed, color: '#F87171' },
              { label: 'Tiempo invertido', value: formatMinutes(time), color: '#4F8EF7' },
              { label: 'Resultado preliminar', value: blocking ? 'No certificable' : 'Certificable', color: blocking ? '#F87171' : '#34D399' },
            ].map(metric => (
              <div key={metric.label} className="rounded-2xl p-4" style={{ background: '#12151E', border: '1px solid rgba(255,255,255,0.07)' }}>
                <p className="text-xs leading-5" style={{ color: '#6B7494' }}>{metric.label}</p>
                <p className="text-lg font-bold mt-3" style={{ color: metric.color }}>{metric.value}</p>
                {metric.label === 'Resultado preliminar' && <p className="text-xs mt-2" style={{ color: '#6B7494' }}>{blocking ? `${blocking} hallazgo bloqueante` : 'Sin bloqueantes'}</p>}
              </div>
            ))}
          </div>
        </div>

        <section className="rounded-2xl overflow-hidden" style={{ background: '#12151E', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="p-5 flex items-center justify-between gap-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div><h2 className="text-lg font-bold text-white">Casos de prueba</h2><p className="text-xs mt-1" style={{ color: '#6B7494' }}>Diseña, ejecuta y prepara los casos para aprobación.</p></div>
            <div className="flex gap-2">
              <div className="flex items-center gap-2 px-3 rounded-xl" style={{ background: '#0E1019', border: '1px solid rgba(255,255,255,0.08)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7494" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
                <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Buscar caso..." className="w-48 py-2.5 bg-transparent text-xs outline-none" style={{ color: '#DDE1EE' }} />
              </div>
              {!readOnly && <button onClick={() => onEditCase(null)} className="px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-85" style={{ background: group.color, color: '#fff' }}>+ Crear caso</button>}
            </div>
          </div>
          <div className="grid grid-cols-[190px_1fr_190px_130px_90px] gap-4 px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: '#3A3F55', background: '#0E1019' }}>
            <span>Caso</span><span>Descripción</span><span>Responsable</span><span>Estado</span><span></span>
          </div>
          {filtered.map(testCase => {
            const owner = USERS.find(user => user.id === testCase.assignedTo);
            return (
              <div key={testCase.id} className="grid grid-cols-[190px_1fr_190px_130px_90px] gap-4 items-center px-5 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <span className="text-xs font-mono font-semibold" style={{ color: group.color }}>{testCase.caseNumber}</span>
                <span className="text-sm truncate" style={{ color: '#A0A8C0' }}>{testCase.requirements || 'Caso pendiente de documentar'}</span>
                <div className="flex items-center gap-2"><span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: '#202535', color: '#A0A8C0' }}>{owner?.avatar ?? 'QA'}</span><span className="text-xs" style={{ color: '#A0A8C0' }}>{owner?.name ?? 'Sin asignar'}</span></div>
                <StatusPill testCase={testCase} />
                <button onClick={() => onEditCase(testCase)} className="text-xs font-semibold hover:opacity-70" style={{ color: group.color }}>Abrir →</button>
              </div>
            );
          })}
          {!filtered.length && <div className="py-14 text-center"><p className="text-sm" style={{ color: '#6B7494' }}>Aún no hay casos de prueba en este ciclo.</p></div>}
        </section>
      </div>
    </main>
  );
}

function CaseEditor({
  group, project, review, testCase, currentUser, onBack, onSave, onSendReview, onRequestCorrection,
}: {
  group: Group;
  project: Project;
  review: Review;
  testCase: TestCase | null;
  currentUser: User;
  onBack: () => void;
  onSave: (testCase: TestCase) => void;
  onSendReview: () => void;
  onRequestCorrection: () => void;
}) {
  const [tab, setTab] = useState<EditorTab>('design');
  const [designSaved, setDesignSaved] = useState(Boolean(testCase));
  const [attachments, setAttachments] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const nextNumber = String(review.testCases.length + 1).padStart(3, '0');
  const [form, setForm] = useState<TestCase>(testCase ?? {
    id: id(),
    caseNumber: `CP_${project.shortCode}_${nextNumber}`,
    focusDate: new Date().toLocaleString('es-CO'),
    result: undefined,
    criticality: 'medium',
    assignedTo: currentUser.id,
    requirements: '',
    acceptanceCriteria: '',
    expectedResult: '',
    evidence: [],
    evidenceText: '',
    observations: '',
    recommendations: '',
    active: true,
    timeSpent: 0,
    status: 'draft',
  });

  const fieldClass = 'w-full px-4 py-3 rounded-xl text-sm outline-none';
  const fieldStyle = { background: '#0E1019', border: '1px solid rgba(255,255,255,0.08)', color: '#DDE1EE' };
  const completed = review.testCases.filter(item => item.result);
  const allComplete = review.testCases.length > 0 && review.testCases.every(item => item.result);
  const readOnly = currentUser.role === 'scrum';

  function saveAndGo(next: EditorTab) {
    onSave({ ...form, status: form.result ? 'closed' : 'open' });
    if (next === 'execution') setDesignSaved(true);
    setTab(next);
  }

  return (
    <main className="h-full overflow-y-auto">
      <div className="sticky top-0 z-10 px-8 pt-6" style={{ background: '#0C0E15', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={onBack} className="text-xs font-semibold mb-4 hover:opacity-70" style={{ color: '#6B7494' }}>← Volver al ciclo</button>
        <div className="flex items-center justify-between mb-5">
          <div><p className="text-xs font-mono font-semibold mb-1" style={{ color: group.color }}>{form.caseNumber}</p><h1 className="text-2xl font-bold text-white">{testCase ? 'Editar caso de prueba' : 'Nuevo caso de prueba'}</h1></div>
          <span className="text-xs px-3 py-1.5 rounded-full" style={{ background: group.dimColor, color: group.color }}>{ENVIRONMENT_LABELS[review.version]}</span>
        </div>
        <div className="flex gap-7">
          {([
            ['design', '01', 'Diseño'],
            ['execution', '02', 'Ejecución'],
            ['approval', '03', 'Aprobación'],
          ] as [EditorTab, string, string][]).map(([value, number, label]) => (
            <button key={value} disabled={value !== 'design' && !designSaved} onClick={() => setTab(value)} className="pb-3 flex items-center gap-2 text-sm font-semibold disabled:opacity-30"
              style={{ color: tab === value ? group.color : '#6B7494', borderBottom: tab === value ? `2px solid ${group.color}` : '2px solid transparent' }}>
              <span className="text-xs font-mono">{number}</span>{label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl px-8 py-7">
        {tab === 'design' && (
          <div className="space-y-6">
            <section className="rounded-2xl p-6" style={{ background: '#12151E', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="mb-6"><p className="text-xs font-mono mb-1" style={{ color: group.color }}>01</p><h2 className="text-lg font-bold text-white">Datos generales</h2><p className="text-sm mt-1" style={{ color: '#6B7494' }}>Información de identificación y asignación del caso.</p></div>
              <div className="grid grid-cols-2 gap-4">
                <label className="space-y-2"><span className="text-xs font-semibold" style={{ color: '#A0A8C0' }}>Proyecto</span><div className={fieldClass} style={fieldStyle}>{project.name}</div></label>
                <label className="space-y-2"><span className="text-xs font-semibold" style={{ color: '#A0A8C0' }}>Código del caso</span><div className={`${fieldClass} font-mono`} style={{ ...fieldStyle, color: group.color }}>{form.caseNumber}</div></label>
                <label className="space-y-2"><span className="text-xs font-semibold" style={{ color: '#A0A8C0' }}>Fecha inicio</span><div className={fieldClass} style={fieldStyle}>{form.focusDate}</div></label>
                <label className="space-y-2"><span className="text-xs font-semibold" style={{ color: '#A0A8C0' }}>Ambiente</span><div className={fieldClass} style={fieldStyle}>{ENVIRONMENT_LABELS[review.version]}</div></label>
                <label className="space-y-2"><span className="text-xs font-semibold" style={{ color: '#A0A8C0' }}>Criticidad</span><select value={form.criticality} disabled={readOnly} onChange={event => setForm(previous => ({ ...previous, criticality: event.target.value as TestCase['criticality'] }))} className={fieldClass} style={fieldStyle}><option value="high">Alta</option><option value="medium">Media</option><option value="low">Baja</option></select></label>
                <label className="space-y-2"><span className="text-xs font-semibold" style={{ color: '#A0A8C0' }}>QA asignado</span><select value={form.assignedTo} disabled={readOnly} onChange={event => setForm(previous => ({ ...previous, assignedTo: event.target.value }))} className={fieldClass} style={fieldStyle}>{USERS.filter(user => user.role === 'qa' || user.role === 'qa_manager').map(user => <option key={user.id} value={user.id}>{user.name}</option>)}</select></label>
              </div>
            </section>
            <section className="rounded-2xl p-6" style={{ background: '#12151E', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="mb-6"><p className="text-xs font-mono mb-1" style={{ color: group.color }}>02</p><h2 className="text-lg font-bold text-white">Definición funcional</h2><p className="text-sm mt-1" style={{ color: '#6B7494' }}>Documenta el alcance y los criterios que validará este caso.</p></div>
              <div className="space-y-4">
                <label className="block space-y-2"><span className="text-xs font-semibold" style={{ color: '#A0A8C0' }}>Requerimiento</span><textarea rows={3} readOnly={readOnly} value={form.requirements} onChange={event => setForm(previous => ({ ...previous, requirements: event.target.value }))} className={`${fieldClass} resize-none`} style={fieldStyle} /></label>
                <label className="block space-y-2"><span className="text-xs font-semibold" style={{ color: '#A0A8C0' }}>Criterios de aceptación</span><textarea rows={3} readOnly={readOnly} value={form.acceptanceCriteria ?? ''} onChange={event => setForm(previous => ({ ...previous, acceptanceCriteria: event.target.value }))} className={`${fieldClass} resize-none`} style={fieldStyle} /></label>
                <label className="block space-y-2"><span className="text-xs font-semibold" style={{ color: '#A0A8C0' }}>Resultado esperado</span><textarea rows={3} readOnly={readOnly} value={form.expectedResult} onChange={event => setForm(previous => ({ ...previous, expectedResult: event.target.value }))} className={`${fieldClass} resize-none`} style={fieldStyle} /></label>
              </div>
            </section>
            <div className="flex items-center justify-between"><p className="text-xs" style={{ color: '#6B7494' }}>{designSaved ? 'Diseño guardado. Ya puedes continuar a ejecución.' : 'Guarda este caso antes de habilitar la siguiente pestaña.'}</p>{!readOnly && <button onClick={() => saveAndGo('execution')} disabled={!form.requirements.trim() || !form.expectedResult.trim()} className="px-6 py-3 rounded-xl text-sm font-semibold disabled:opacity-30" style={{ background: group.color, color: '#fff' }}>Guardar diseño y continuar →</button>}</div>
          </div>
        )}

        {tab === 'execution' && (
          <div className="space-y-6">
            <section className="rounded-2xl p-6" style={{ background: '#12151E', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="mb-6"><p className="text-xs font-mono mb-1" style={{ color: group.color }}>03</p><h2 className="text-lg font-bold text-white">Evidencias y resultado</h2><p className="text-sm mt-1" style={{ color: '#6B7494' }}>Registra el comportamiento observado durante la ejecución.</p></div>
              <div className="rounded-xl overflow-hidden" style={{ background: '#0E1019', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex gap-1 px-3 py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['B', 'I', '• Lista', 'Enlace'].map(action => <button key={action} className="px-2 py-1 rounded text-xs font-semibold" style={{ color: '#A0A8C0', background: '#181C28' }}>{action}</button>)}
                  <button onClick={() => fileRef.current?.click()} className="ml-auto px-3 py-1 rounded text-xs font-semibold" style={{ color: group.color, background: group.dimColor }}>+ Imagen</button>
                </div>
                <textarea rows={8} readOnly={readOnly} value={form.evidenceText} onFocus={() => !form.focusDate && setForm(previous => ({ ...previous, focusDate: new Date().toLocaleString('es-CO') }))} onChange={event => setForm(previous => ({ ...previous, evidenceText: event.target.value }))} placeholder="Describe los pasos ejecutados y pega aquí la evidencia del resultado..." className="w-full p-4 bg-transparent text-sm outline-none resize-none" style={{ color: '#DDE1EE' }} />
                <input ref={fileRef} type="file" accept=".png,.jpg,.jpeg" multiple className="hidden" onChange={event => setAttachments(previous => [...previous, ...Array.from(event.target.files ?? []).map(file => file.name)])} />
                {!!attachments.length && <div className="flex flex-wrap gap-2 px-4 pb-4">{attachments.map(file => <span key={file} className="text-xs px-2.5 py-1.5 rounded-lg" style={{ background: '#181C28', color: '#A0A8C0' }}>Imagen · {file}</span>)}</div>}
              </div>
            </section>
            <section className="rounded-2xl p-6" style={{ background: '#12151E', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="mb-6"><p className="text-xs font-mono mb-1" style={{ color: group.color }}>04</p><h2 className="text-lg font-bold text-white">Conclusión</h2><p className="text-sm mt-1" style={{ color: '#6B7494' }}>Define el resultado final y documenta los hallazgos.</p></div>
              <div className="grid grid-cols-2 gap-3 mb-5">
                <button disabled={readOnly} onClick={() => setForm(previous => ({ ...previous, result: 'success' }))} className="py-3 rounded-xl text-sm font-semibold disabled:opacity-60" style={{ background: form.result === 'success' ? '#34D399' : 'rgba(52,211,153,0.1)', color: form.result === 'success' ? '#fff' : '#34D399', border: '1px solid rgba(52,211,153,0.25)' }}>✓ Exitoso</button>
                <button disabled={readOnly} onClick={() => setForm(previous => ({ ...previous, result: 'non_conforming' }))} className="py-3 rounded-xl text-sm font-semibold disabled:opacity-60" style={{ background: form.result === 'non_conforming' ? '#F87171' : 'rgba(248,113,113,0.1)', color: form.result === 'non_conforming' ? '#fff' : '#F87171', border: '1px solid rgba(248,113,113,0.25)' }}>× No conforme</button>
              </div>
              <div className="space-y-4">
                <label className="block space-y-2"><span className="text-xs font-semibold" style={{ color: '#A0A8C0' }}>Observaciones</span><textarea rows={3} readOnly={readOnly} value={form.observations} onChange={event => setForm(previous => ({ ...previous, observations: event.target.value }))} className={`${fieldClass} resize-none`} style={fieldStyle} /></label>
                <label className="block space-y-2"><span className="text-xs font-semibold" style={{ color: '#A0A8C0' }}>Recomendaciones</span><textarea rows={3} readOnly={readOnly} value={form.recommendations} onChange={event => setForm(previous => ({ ...previous, recommendations: event.target.value }))} className={`${fieldClass} resize-none`} style={fieldStyle} /></label>
              </div>
              {currentUser.role === 'scrum' && form.recommendations && <div className="mt-5 p-4 rounded-xl" style={{ background: group.dimColor }}><p className="text-xs font-semibold mb-3" style={{ color: group.color }}>Decisión de implementación</p><div className="flex gap-2"><button onClick={() => onSave({ ...form, scrumDecision: 'accepted', scrumJustification: '' })} className="px-4 py-2 rounded-xl text-xs font-semibold" style={{ background: '#34D399', color: '#fff' }}>Se implementará</button><button onClick={() => { const reason = window.prompt('Justificación para no implementar:'); if (reason?.trim()) onSave({ ...form, scrumDecision: 'rejected', scrumJustification: reason }); }} className="px-4 py-2 rounded-xl text-xs font-semibold" style={{ background: '#F87171', color: '#fff' }}>No se implementará</button></div></div>}
            </section>
            <div className="flex justify-between"><button onClick={() => setTab('design')} className="px-5 py-3 rounded-xl text-sm font-semibold" style={{ background: '#181C28', color: '#A0A8C0' }}>← Anterior</button>{!readOnly && <button onClick={() => saveAndGo('approval')} disabled={!form.result || (form.result === 'non_conforming' && !form.observations.trim())} className="px-6 py-3 rounded-xl text-sm font-semibold disabled:opacity-30" style={{ background: group.color, color: '#fff' }}>Guardar y continuar →</button>}</div>
          </div>
        )}

        {tab === 'approval' && (
          <div className="space-y-6">
            <section className="rounded-2xl p-6" style={{ background: '#12151E', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-start justify-between mb-6"><div><p className="text-xs font-mono mb-1" style={{ color: group.color }}>05</p><h2 className="text-lg font-bold text-white">Aprobación del ciclo</h2><p className="text-sm mt-1" style={{ color: '#6B7494' }}>Casos finalizados por los participantes y resultado registrado.</p></div><span className="text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: allComplete ? 'rgba(52,211,153,0.12)' : 'rgba(245,158,11,0.12)', color: allComplete ? '#34D399' : '#F59E0B' }}>{completed.length} de {review.testCases.length} completos</span></div>
              <div className="space-y-2">
                {review.testCases.map(item => {
                  const owner = USERS.find(user => user.id === item.assignedTo);
                  return <div key={item.id} className="flex items-center gap-4 px-4 py-3 rounded-xl" style={{ background: '#0E1019' }}><span className="text-xs font-mono w-44" style={{ color: group.color }}>{item.caseNumber}</span><div className="flex-1 flex items-center gap-2"><span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: '#202535', color: '#A0A8C0' }}>{owner?.avatar ?? 'QA'}</span><span className="text-xs" style={{ color: '#A0A8C0' }}>{owner?.name}</span></div><StatusPill testCase={item} /></div>;
                })}
              </div>
            </section>
            <section className="rounded-2xl p-6" style={{ background: '#12151E', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: '#6B7494' }}>Firma de participantes</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-24 rounded-xl flex flex-col items-center justify-center" style={{ background: 'rgba(52,211,153,0.06)', border: '1px dashed rgba(52,211,153,0.25)' }}><p className="text-lg italic" style={{ color: '#34D399' }}>{currentUser.signature || 'Firma pendiente'}</p><p className="text-xs mt-2" style={{ color: '#6B7494' }}>{currentUser.name} · QA Analista</p></div>
                <div className="h-24 rounded-xl flex flex-col items-center justify-center" style={{ background: '#0E1019', border: '1px dashed rgba(255,255,255,0.1)' }}><p className="text-sm" style={{ color: '#3A3F55' }}>Pendiente QA Manager</p></div>
              </div>
            </section>
            <div className="flex items-center justify-between"><p className="text-xs max-w-lg" style={{ color: allComplete ? '#34D399' : '#6B7494' }}>{allComplete ? 'Todos los casos están completos. El ciclo está listo para la siguiente decisión.' : 'Completa todos los casos y registra su resultado para habilitar el envío.'}</p>{currentUser.role === 'qa' && <button onClick={onSendReview} disabled={!allComplete || !currentUser.signature} className="px-6 py-3 rounded-xl text-sm font-semibold disabled:opacity-30" style={{ background: '#34D399', color: '#fff' }}>Enviar a revisión de QA Manager</button>}{currentUser.role === 'qa_manager' && <div className="flex gap-2"><button onClick={onRequestCorrection} className="px-5 py-3 rounded-xl text-sm font-semibold" style={{ background: 'rgba(248,113,113,0.12)', color: '#F87171' }}>Solicitar corrección</button><button onClick={onSendReview} disabled={!allComplete || !currentUser.signature} className="px-5 py-3 rounded-xl text-sm font-semibold disabled:opacity-30" style={{ background: '#34D399', color: '#fff' }}>Finalizar revisión</button></div>}</div>
          </div>
        )}
      </div>
    </main>
  );
}

export function QAWorkspace({
  currentUser, groups, reviews, onUpdateReview, onLogout,
}: {
  currentUser: User;
  groups: Group[];
  reviews: Review[];
  onUpdateReview: (review: Review) => void;
  onLogout: () => void;
}) {
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [section, setSection] = useState<Section>('dashboard');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [reportProject, setReportProject] = useState<Project | null>(null);
  const [activeReviewId, setActiveReviewId] = useState<string | null>(null);
  const [editingCase, setEditingCase] = useState<TestCase | null | undefined>(undefined);

  const groupReviews = useMemo(() => {
    if (!selectedGroup) return [];
    const ids = new Set(selectedGroup.projects.map(project => project.id));
    return reviews.filter(review => ids.has(review.projectId));
  }, [reviews, selectedGroup]);

  const activeReview = reviews.find(review => review.id === activeReviewId) ?? null;

  function selectGroup(group: Group | null) {
    setSelectedGroup(group);
    setSelectedProject(null);
    setReportProject(null);
    setActiveReviewId(null);
    setEditingCase(undefined);
    setSection('dashboard');
  }

  function openProject(project: Project) {
    const projectReviews = reviews.filter(review => review.projectId === project.id);
    const existing = projectReviews
      .filter(review => currentUser.role === 'scrum' || review.workflowStatus !== 'finished')
      .sort((a, b) => b.startDate.localeCompare(a.startDate))[0];
    if (!existing && currentUser.role === 'scrum') return;
    const review = existing ?? {
      id: id(),
      projectId: project.id,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      version: 'qa' as const,
      startDate: new Date().toISOString().slice(0, 10),
      endDate: '',
      status: 'pending' as const,
      workflowStatus: 'creation' as const,
      testCases: [],
      approval: { participants: [] },
    };
    if (!existing) onUpdateReview(review);
    setSelectedProject(project);
    setActiveReviewId(review.id);
  }

  function updateReview(review: Review) {
    onUpdateReview(review);
    setActiveReviewId(review.id);
  }

  function saveCase(testCase: TestCase) {
    if (!activeReview) return;
    const exists = activeReview.testCases.some(item => item.id === testCase.id);
    updateReview({
      ...activeReview,
      testCases: exists ? activeReview.testCases.map(item => item.id === testCase.id ? testCase : item) : [...activeReview.testCases, testCase],
    });
    setEditingCase(testCase);
  }

  function sendReview() {
    if (!activeReview) return;
    if (currentUser.role === 'qa_manager') {
      updateReview({
        ...activeReview,
        workflowStatus: 'finished',
        status: activeReview.testCases.some(item => item.result === 'non_conforming') ? 'non_conforming' : 'approved',
        endDate: new Date().toISOString().slice(0, 10),
        approval: {
          ...activeReview.approval,
          managerSignature: { userId: currentUser.id, name: currentUser.name, signature: currentUser.signature, timestamp: new Date().toLocaleString('es-CO') },
          authorizedAt: new Date().toLocaleString('es-CO'),
        },
      });
      setEditingCase(undefined);
      return;
    }
    updateReview({
      ...activeReview,
      workflowStatus: 'review',
      status: 'in_review',
      endDate: new Date().toISOString().slice(0, 10),
      approval: {
        ...activeReview.approval,
        participants: [{ userId: currentUser.id, name: currentUser.name, signature: currentUser.signature, timestamp: new Date().toLocaleString('es-CO') }],
      },
    });
    setEditingCase(undefined);
  }

  function requestCorrection() {
    if (!activeReview) return;
    const reason = window.prompt('Observaciones generales para solicitar la corrección:');
    if (!reason?.trim()) return;
    updateReview({
      ...activeReview,
      workflowStatus: 'correction',
      status: 'non_conforming',
      testCases: activeReview.testCases.map(item => ({ ...item, reviewObservations: reason })),
    });
    setEditingCase(undefined);
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0C0E15' }}>
      <WorkspaceSidebar groups={groups} selectedGroup={selectedGroup} section={section} onSelectGroup={selectGroup}
        onSection={value => { setSection(value); setSelectedProject(null); setReportProject(null); setActiveReviewId(null); setEditingCase(undefined); }}
        currentUser={currentUser} onLogout={onLogout} />
      <div className="flex-1 min-w-0 overflow-hidden">
        {!selectedGroup && <GroupLanding groups={groups} currentUser={currentUser} onSelect={selectGroup} />}
        {selectedGroup && !selectedProject && !reportProject && (
          <ProjectOverview group={selectedGroup} projects={selectedGroup.projects} reviews={groupReviews} section={section}
            onOpen={openProject} onOpenReport={setReportProject} canCreate={currentUser.role !== 'scrum'} />
        )}
        {selectedGroup && reportProject && (
          <ReportCalendar group={selectedGroup} project={reportProject} reviews={groupReviews} onBack={() => setReportProject(null)} />
        )}
        {selectedGroup && selectedProject && activeReview && editingCase === undefined && (
          <CycleView group={selectedGroup} project={selectedProject} review={activeReview} currentUser={currentUser}
            onBack={() => { setSelectedProject(null); setActiveReviewId(null); }}
            onChange={updateReview} onEditCase={setEditingCase} readOnly={currentUser.role === 'scrum'} />
        )}
        {selectedGroup && selectedProject && activeReview && editingCase !== undefined && (
          <CaseEditor group={selectedGroup} project={selectedProject} review={activeReview} testCase={editingCase}
            currentUser={currentUser} onBack={() => setEditingCase(undefined)} onSave={saveCase}
            onSendReview={sendReview} onRequestCorrection={requestCorrection} />
        )}
      </div>
    </div>
  );
}
