export type Role = 'admin' | 'qa_manager' | 'qa' | 'scrum';
export type GroupName = string;
export type ReviewStatus = 'pending' | 'in_review' | 'approved' | 'non_conforming';
export type TestResult = 'success' | 'non_conforming';
export type EnvVersion = 'dev' | 'qa' | 'production';
export type WorkflowStatus = 'creation' | 'review' | 'correction' | 'finished';
export type Criticality = 'high' | 'medium' | 'low';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  signature: string;
  avatar: string;
  groupId?: string;
}

export interface Group {
  id: string;
  name: GroupName;
  color: string;
  dimColor: string;
  bgColor: string;
  projects: Project[];
}

export interface Project {
  id: string;
  name: string;
  groupId: string;
  shortCode: string;
}

export interface EvidenceItem {
  id: string;
  type: 'text' | 'image' | 'video_link';
  content: string;
  filename?: string;
}

export interface TestCase {
  id: string;
  caseNumber: string;
  focusDate?: string;
  result?: TestResult;
  criticality: Criticality;
  assignedTo: string;
  requirements: string;
  acceptanceCriteria?: string;
  expectedResult: string;
  evidence: EvidenceItem[];
  evidenceText: string;
  observations: string;
  recommendations: string;
  reviewObservations?: string;
  scrumDecision?: 'accepted' | 'rejected';
  scrumJustification?: string;
  active: boolean;
  deletionReason?: string;
  timeSpent: number;
  status: 'draft' | 'open' | 'closed';
}

export interface ParticipantSig {
  userId: string;
  name: string;
  signature: string;
  timestamp: string;
}

export interface Approval {
  participants: ParticipantSig[];
  managerSignature?: ParticipantSig;
  authorizedAt?: string;
}

export interface Review {
  id: string;
  projectId: string;
  month: number;
  year: number;
  version: EnvVersion;
  startDate: string;
  endDate: string;
  status: ReviewStatus;
  workflowStatus: WorkflowStatus;
  testCases: TestCase[];
  approval: Approval;
}

export interface AuditEntry {
  id: string;
  userName: string;
  role: Role;
  action: string;
  detail: string;
  timestamp: string;
}

export type AppView =
  | 'login'
  | 'dashboard'
  | 'month-grid'
  | 'review-list'
  | 'testcase-form'
  | 'admin-groups'
  | 'profile'
  | 'audit-log';
