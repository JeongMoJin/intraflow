export type Role = 'Admin' | 'Manager' | 'Employee';

export interface LoginResponse {
  token: string;
  email: string;
  role: Role;
  userId: number;
  employeeId?: number;
  expiresAt: string;
}

export interface Employee {
  id: number;
  employeeNo: string;
  name: string;
  email: string;
  department: string;
  position: string;
  role: Role;
  isActive: boolean;
  source: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: number;
  projectCode: string;
  name: string;
  description: string;
  department: string;
  ownerEmployeeId?: number;
  ownerName?: string;
  status: string;
  startDate?: string;
  endDate?: string;
  budget: number;
  source: string;
  createdAt: string;
  updatedAt: string;
}

export interface Approval {
  id: number;
  approvalNo: string;
  title: string;
  type: string;
  requesterId: number;
  requesterName?: string;
  approverId: number;
  approverName?: string;
  amount: number;
  status: string;
  content: string;
  requestedAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectReason?: string;
}

export interface AuditLog {
  id: number;
  userId?: string;
  userName: string;
  action: string;
  entityName: string;
  entityId?: string;
  beforeValue?: string;
  afterValue?: string;
  ipAddress?: string;
  createdAt: string;
}

export interface ErpSyncLog {
  id: number;
  syncType: string;
  status: string;
  importedCount: number;
  failedCount: number;
  message: string;
  triggeredBy: string;
  startedAt: string;
  finishedAt: string;
}

export interface ExternalErpRecord {
  id: number;
  externalSystem: string;
  externalId: string;
  entityName: string;
  payloadJson: string;
  syncedAt: string;
}

export interface LegacyImportLog {
  id: number;
  fileName: string;
  rowNumber: number;
  employeeNo?: string;
  status: string;
  message: string;
  rawValue: string;
  createdAt: string;
}

export interface CountItem {
  label: string;
  count: number;
}

export interface DashboardSummary {
  totalEmployees: number;
  inProgressProjects: number;
  pendingApprovals: number;
  recentErpSyncs: ErpSyncLog[];
  recentAuditLogs: AuditLog[];
  projectsByDepartment: CountItem[];
  approvalsByStatus: CountItem[];
}

export interface GraphUser {
  id: string;
  displayName: string;
  mail: string;
  department: string;
  jobTitle: string;
}

export interface RoleGuide {
  role: Role;
  allowedMenus: string[];
  restrictedAreas: string[];
  notes: string;
}

export interface LegacyImportResult {
  fileName: string;
  totalRows: number;
  successCount: number;
  failedCount: number;
}
