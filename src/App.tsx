import './App.css'


import { useState } from "react"
import { CORPORATE_DOMAIN, INITIAL_GROUPS, INITIAL_REVIEWS } from "./data/mockdata"
import type { User, AppView, AuditEntry, Review, TestCase, Project, Group, ReviewStatus } from './types/types';
import { uid, now } from './utils/helpers'
import { Login  } from './components/Login';
import { Sidebar  } from './components/Sidebar';
import { Welcome } from './components/Welcome';
import { MonthGrid } from './components/MonthGrid';
import { ReviewList } from './components/ReviewList';
import { TestCaseForm } from './components/TestCaseForm';
import { AdminGroups } from './components/AdminGroups';
import { Profile } from './components/Profile';
import { AuditLog } from './components/AuditLog';
import { QAWorkspace } from './components/QAWorkspace';

import {MONTH_FULL, WORKFLOW_LABEL} from './utils/helpers'

function App() {

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [groups, setGroups] = useState<Group[]>(INITIAL_GROUPS);
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [view, setView] = useState<AppView>('login');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [editingTestCase, setEditingTestCase] = useState<TestCase | null>(null);
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  

  function logAction(action: string, detail: string, user = currentUser) {
    if (!user) return;
    setAuditEntries(prev => [{
      id: uid(), userName: user.name, role: user.role, action, detail, timestamp: now(),
    }, ...prev]);
  }

  function handleLogin(user: User) {
    setCurrentUser(user);
    setView('dashboard');
    logAction('Inicio de sesión', `Acceso autorizado desde el dominio @${CORPORATE_DOMAIN}`, user);
  }
  function handleSelectProject(p: Project, g: Group) {
    if (currentUser?.role === 'scrum' && currentUser.groupId !== g.id) return;
    setSelectedProject(p);
    setSelectedGroup(g);
    setSelectedMonth(null);
    setView('month-grid');
    logAction('Consulta de proyecto', `${p.name} · Grupo ${g.name}`);
  }

  function handleSelectMonth(month: number, revs: Review[]) {
    setSelectedMonth(month);
    setView('review-list');
  }

  function handleOpenTestCase(rev: Review, tc: TestCase | null) {
    setSelectedReview(rev);
    setEditingTestCase(tc);
    setView('testcase-form');
  }

  function handleCreateReview() {
    if (!selectedProject || !selectedMonth) return;
    const newRev: Review = {
      id: uid(), projectId: selectedProject.id,
      month: selectedMonth, year: selectedYear,
      version: 'qa', status: 'pending', workflowStatus: 'creation',
      startDate: `${selectedYear}-${String(selectedMonth).padStart(2,'0')}-01`,
      endDate: `${selectedYear}-${String(selectedMonth).padStart(2,'0')}-30`,
      testCases: [], approval: { participants: [] },
    };
    setReviews(prev => [...prev, newRev]);
    setSelectedReview(newRev);
    setEditingTestCase(null);
    setView('testcase-form');
    logAction('Creación de revisión', `${selectedProject.name} · ${MONTH_FULL[selectedMonth - 1]} ${selectedYear}`);
  }

  function handleSaveTestCase(tc: TestCase) {
    if (!selectedReview) return;
    const existingIdx = selectedReview.testCases.findIndex(c => c.id === tc.id);
    const updatedCases = existingIdx >= 0
      ? selectedReview.testCases.map((c, i) => i === existingIdx ? tc : c)
      : [...selectedReview.testCases, tc];

    const updatedReview = {
      ...selectedReview,
      testCases: updatedCases,
      status: (updatedCases.some(c => c.result === 'non_conforming') ? 'non_conforming'
        : updatedCases.every(c => c.result === 'success') && updatedCases.length > 0 ? 'in_review'
        : selectedReview.status) as ReviewStatus,
    };

    // also add QA participant sig
    if (currentUser?.role === 'qa' && updatedReview.approval.participants.length === 0) {
      updatedReview.approval = {
        ...updatedReview.approval,
        participants: [{ userId: currentUser.id, name: currentUser.name, signature: currentUser.signature, timestamp: now() }],
      };
    }

    setReviews(prev => prev.map(r => r.id === selectedReview.id ? updatedReview : r));
    setSelectedReview(updatedReview);
    setView('review-list');
    logAction(tc.active ? (existingIdx >= 0 ? 'Edición de caso' : 'Creación de caso') : 'Inactivación de caso', `${tc.caseNumber}${tc.deletionReason ? ` · ${tc.deletionReason}` : ''}`);
  }

  function handleUpdateReviews(updated: Review[]) {
    setReviews(prev => prev.map(r => {
      const u = updated.find(u => u.id === r.id);
      return u ?? r;
    }));
    const changed = updated[0];
    if (changed) logAction('Cambio de estado de revisión', `${WORKFLOW_LABEL[changed.workflowStatus]} · ${changed.testCases.length} casos`);
  }

  if (!currentUser || view === 'login') return <Login onLogin={handleLogin} />;

  if (currentUser.role !== 'admin') {
    const availableGroups = currentUser.role === 'scrum'
      ? groups.filter(group => group.id === currentUser.groupId)
      : groups;
    return (
      <QAWorkspace currentUser={currentUser} groups={availableGroups} reviews={reviews}
        onUpdateReview={review => {
          setReviews(previous => previous.some(item => item.id === review.id)
            ? previous.map(item => item.id === review.id ? review : item)
            : [...previous, review]);
          logAction('Actualización de ciclo QA', `${review.projectId} · ${WORKFLOW_LABEL[review.workflowStatus]}`);
        }}
        onLogout={() => { setCurrentUser(null); setView('login'); }} />
    );
  }

  const monthReviews = selectedProject && selectedMonth
    ? reviews.filter(r => r.projectId === selectedProject.id && r.month === selectedMonth && r.year === selectedYear)
    : [];

  return (
    
    
    <div className="flex h-screen overflow-hidden" style={{ background: '#0C0E15' }}>
      {/* left sidebar */}
      <Sidebar groups={groups} selectedProject={selectedProject}
        onSelectProject={handleSelectProject} currentUser={currentUser}
        onAdminGroups={() => setView('admin-groups')}
        onProfile={() => setView('profile')}
        onAudit={() => setView('audit-log')}
        onLogout={() => { setCurrentUser(null); setView('login'); setSelectedProject(null); }} />

      {/* main content */}
      <div className="flex-1 min-w-0 overflow-hidden">
        {view === 'dashboard' && <Welcome currentUser={currentUser} />}
        {view === 'month-grid' && selectedProject && selectedGroup && (
          <MonthGrid project={selectedProject} group={selectedGroup}
            reviews={reviews} currentYear={selectedYear}
            onSelectMonth={handleSelectMonth}
            onYearChange={setSelectedYear}
            currentUser={currentUser} />
        )}
        {view === 'review-list' && selectedProject && selectedGroup && selectedMonth && (
          <ReviewList month={selectedMonth} year={selectedYear}
            project={selectedProject} group={selectedGroup}
            reviews={monthReviews} currentUser={currentUser}
            onBack={() => setView('month-grid')}
            onCreateReview={handleCreateReview}
            onOpenTestCase={handleOpenTestCase}
            onUpdateReviews={handleUpdateReviews} />
        )}
        {view === 'testcase-form' && selectedProject && selectedGroup && selectedReview && (
          <TestCaseForm review={selectedReview}
            testCase={editingTestCase} project={selectedProject} group={selectedGroup}
            currentUser={currentUser}
            onBack={() => setView('review-list')}
            onSave={handleSaveTestCase} />
        )}
        {view === 'admin-groups' && (
          <AdminGroups groups={groups} onBack={() => setView('dashboard')}
            onUpdateGroups={updated => { setGroups(updated); logAction('Gestión administrativa', 'Se actualizó la estructura de grupos o proyectos'); }} />
        )}
        {view === 'profile' && (
          <Profile user={currentUser} onBack={() => setView('dashboard')} onUpdate={user => {
            setCurrentUser(user);
            logAction('Actualización de perfil', 'Firma digital cargada o actualizada', user);
          }} />
        )}
        {view === 'audit-log' && (
          <AuditLog entries={auditEntries} onBack={() => setView('dashboard')} />
        )}
      </div>

    </div>
  


    
  )
}

export default App
