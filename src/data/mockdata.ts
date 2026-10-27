import type { User, Group, Review } from '../types/types';

export const CORPORATE_DOMAIN = 'holdingvml.net';

export const USERS: User[] = [
  { id: 'u1', name: 'Jeisson Sindicue', email: 'jeisson.sindicue@holdingvml.net', role: 'qa', signature: 'Jeisson Sindicue', avatar: 'JS' },
  { id: 'u2', name: 'Sebastian Pereira', email: 'sebastian.pereira@holdingvml.net', role: 'qa', signature: 'Sebastian Pereira', avatar: 'SP' },
  { id: 'u3', name: 'German Ramirez', email: 'german.ramirez@holdingvml.net', role: 'qa', signature: 'German Ramirez', avatar: 'GR' },
  { id: 'u4', name: 'Jairo Rodriguez', email: 'jairo.rodriguez@holdingvml.net', role: 'qa', signature: 'airo Rodriguez', avatar: 'JR' },
  { id: 'u5', name: 'Omar Benavidez', email: 'omar.benavidez@holdingvml.net', role: 'qa_manager', signature: 'Omar Benavidez', avatar: 'OB' },
  { id: 'u6', name: 'Omar Admin', email: 'omar.admin@holdingvml.net', role: 'admin', signature: 'Omar Admin', avatar: 'OA' },
  { id: 'u7', name: 'David Rengifo', email: 'david.rengifo@holdingvml.net', role: 'scrum', signature: 'David Rengifo', avatar: 'DR', groupId: 'g1' },
  { id: 'u7', name: 'Carlos Mayorga', email: 'carlos.mayorga@holdingvml.net', role: 'scrum', signature: 'Carlos Mayorga', avatar: 'CM', groupId: 'g3' },
  { id: 'u7', name: 'Leandro Ruiz', email: 'leandro.ruiz@holdingvml.net', role: 'scrum', signature: 'Leandro Ruiz', avatar: 'LR', groupId: 'g2' },
];

export const INITIAL_GROUPS: Group[] = [
  {
    id: 'g1', name: 'Zafiro',
    color: '#4F8EF7', dimColor: 'rgba(79,142,247,0.15)', bgColor: 'rgba(79,142,247,0.1)',
    projects: [
      { id: 'p1', name: 'Portal Clientes', groupId: 'g1', shortCode: 'PORTCLI' },
      { id: 'p2', name: 'API Gateway', groupId: 'g1', shortCode: 'APIGW' },
      { id: 'p3', name: 'Dashboard BI', groupId: 'g1', shortCode: 'DASHBI' },
    ],
  },
  {
    id: 'g2', name: 'Esmeralda',
    color: '#34D399', dimColor: 'rgba(52,211,153,0.15)', bgColor: 'rgba(52,211,153,0.1)',
    projects: [
      { id: 'p4', name: 'Módulo Pagos', groupId: 'g2', shortCode: 'PAGOS' },
      { id: 'p5', name: 'App Móvil', groupId: 'g2', shortCode: 'APPMOV' },
    ],
  },
  {
    id: 'g3', name: 'Rubí',
    color: '#F87171', dimColor: 'rgba(248,113,113,0.15)', bgColor: 'rgba(248,113,113,0.1)',
    projects: [
      { id: 'p6', name: 'CRM Interno', groupId: 'g3', shortCode: 'CRMIN' },
      { id: 'p7', name: 'Reportes Financieros', groupId: 'g3', shortCode: 'REPFIN' },
    ],
  },
];

const makeReview = (
  id: string, projectId: string, month: number, year: number,
  version: 'qa' | 'production', status: 'pending' | 'in_review' | 'approved' | 'non_conforming',
  caseCount: number, shortCode: string
): Review => ({
  id, projectId, month, year, version,
  startDate: `${year}-${String(month).padStart(2,'0')}-01`,
  endDate: `${year}-${String(month).padStart(2,'0')}-28`,
  status,
  workflowStatus: status === 'approved' || status === 'non_conforming' ? 'finished' : status === 'in_review' ? 'review' : 'creation',
  testCases: Array.from({ length: caseCount }, (_, i) => ({
    id: `${id}-tc${i+1}`,
    caseNumber: `CP_${shortCode}_${String(i+1).padStart(3,'0')}`,
    focusDate: i < caseCount - 1 ? `${year}-${String(month).padStart(2,'0')}-${String(i+2).padStart(2,'0')} 09:${String(15+i*5).padStart(2,'0')}:00` : undefined,
    result: i < caseCount - 1 ? (i % 3 === 2 ? 'non_conforming' : 'success') : undefined,
    criticality: i % 3 === 0 ? 'high' : i % 3 === 1 ? 'medium' : 'low',
    assignedTo: i % 2 === 0 ? 'u1' : 'u2',
    requirements: `El sistema debe permitir al usuario ${['autenticarse con credenciales corporativas','visualizar el historial de transacciones','exportar reportes en formato PDF','recibir notificaciones en tiempo real'][i%4]}.`,
    expectedResult: `El sistema responde correctamente y muestra ${['mensaje de bienvenida','listado paginado','archivo descargado','alerta en pantalla'][i%4]} en menos de 3 segundos.`,
    evidence: [],
    evidenceText: i < caseCount - 1 ? 'Se realizó la prueba con usuario de prueba. El sistema respondió conforme a lo esperado. Capturas adjuntas.' : '',
    observations: i % 3 === 2 && i < caseCount - 1 ? 'El botón de confirmación no responde al primer clic en Safari 16.x.' : '',
    recommendations: i % 4 === 1 && i < caseCount - 1 ? 'Se recomienda agregar mensaje de carga mientras se procesan los datos.' : '',
    active: true,
    timeSpent: i < caseCount - 1 ? 600 + i * 180 : 0,
    status: i < caseCount - 1 ? 'closed' : 'draft',
  })),
  approval: {
    participants: status === 'approved' ? [{ userId: 'u1', name: 'Jeisson Sindicue', signature: 'Jeisson Sindicue', timestamp: `${year}-${String(month).padStart(2,'0')}-28 16:00:00` }] : [],
    managerSignature: status === 'approved' ? { userId: 'u2', name: 'Omar Benavidez', signature: 'Omar Benavidez', timestamp: `${year}-${String(month).padStart(2,'0')}-29 10:00:00` } : undefined,
    authorizedAt: status === 'approved' ? `${year}-${String(month).padStart(2,'0')}-29 10:05:00` : undefined,
  },
});

export const INITIAL_REVIEWS: Review[] = [
  makeReview('r1', 'p1', 1, 2025, 'qa', 'approved', 5, 'PORTCLI'),
  makeReview('r2', 'p1', 2, 2025, 'qa', 'approved', 4, 'PORTCLI'),
  makeReview('r3', 'p1', 3, 2025, 'production', 'approved', 6, 'PORTCLI'),
  makeReview('r4', 'p1', 3, 2025, 'qa', 'non_conforming', 3, 'PORTCLI'),
  makeReview('r5', 'p1', 4, 2025, 'qa', 'approved', 4, 'PORTCLI'),
  makeReview('r6', 'p1', 5, 2025, 'qa', 'in_review', 5, 'PORTCLI'),
  makeReview('r7', 'p1', 6, 2025, 'qa', 'pending', 0, 'PORTCLI'),
  makeReview('r8', 'p2', 1, 2025, 'qa', 'approved', 3, 'APIGW'),
  makeReview('r9', 'p2', 2, 2025, 'production', 'in_review', 4, 'APIGW'),
  makeReview('r10', 'p4', 3, 2025, 'qa', 'approved', 5, 'PAGOS'),
  makeReview('r11', 'p4', 4, 2025, 'qa', 'pending', 0, 'PAGOS'),
  makeReview('r12', 'p6', 2, 2025, 'qa', 'approved', 4, 'CRMIN'),
  makeReview('r13', 'p6', 3, 2025, 'production', 'non_conforming', 3, 'CRMIN'),
];
