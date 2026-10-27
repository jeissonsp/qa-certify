import type { ReviewStatus, WorkflowStatus } from '../types/types';

export const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
export const MONTH_FULL = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
export const ROLE_LABELS: Record<string,string> = { admin:'Admin', qa_manager:'QA Manager', qa:'QA Analyst', scrum:'Scrum' };
export const STATUS_LABEL: Record<ReviewStatus,string> = { pending:'Pendiente', in_review:'En Revisión', approved:'Aprobado', non_conforming:'No Conforme' };
export const STATUS_COLOR: Record<ReviewStatus,string> = {
  pending:'#F59E0B', in_review:'#4F8EF7', approved:'#34D399', non_conforming:'#F87171'
};
export const STATUS_BG: Record<ReviewStatus,string> = {
  pending:'rgba(245,158,11,0.12)', in_review:'rgba(79,142,247,0.12)', approved:'rgba(52,211,153,0.12)', non_conforming:'rgba(248,113,113,0.12)'
};
export const WORKFLOW_LABEL: Record<WorkflowStatus,string> = {
  creation: 'Creación', review: 'Revisión', correction: 'Corrección', finished: 'Terminado'
};
export function fmt(secs: number) {
  const h = Math.floor(secs/3600), m = Math.floor((secs%3600)/60), s = secs%60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}
export function now() { return new Date().toLocaleString('es-CO'); }
let uidCounter = 1000;
export function uid() { return String(++uidCounter); }