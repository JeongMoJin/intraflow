import type {
  Approval,
  AuditLog,
  DashboardSummary,
  Employee,
  ErpSyncLog,
  ExternalErpRecord,
  GraphUser,
  LegacyImportLog,
  LegacyImportResult,
  LoginResponse,
  Project,
  Role,
  RoleGuide,
} from '../types/api';

const devAccounts: Record<Role, { email: string; password: string; userId: number; employeeId: number }> = {
  Admin: { email: 'admin@intraflow.local', password: 'Admin123!', userId: 1, employeeId: 1 },
  Manager: { email: 'manager@intraflow.local', password: 'Manager123!', userId: 2, employeeId: 2 },
  Employee: { email: 'employee@intraflow.local', password: 'Employee123!', userId: 3, employeeId: 3 },
};

let employees: Employee[] = [
  { id: 1, employeeNo: 'IF-001', name: '김관리', email: 'admin@intraflow.local', department: 'IT Platform', position: 'System Administrator', role: 'Admin', isActive: true, source: 'Seed', createdAt: now(), updatedAt: now() },
  { id: 2, employeeNo: 'IF-002', name: '박매니저', email: 'manager@intraflow.local', department: 'Business Operations', position: 'Project Manager', role: 'Manager', isActive: true, source: 'Seed', createdAt: now(), updatedAt: now() },
  { id: 3, employeeNo: 'IF-003', name: '이사원', email: 'employee@intraflow.local', department: 'Creative Tech', position: 'Developer', role: 'Employee', isActive: true, source: 'Seed', createdAt: now(), updatedAt: now() },
  { id: 4, employeeNo: 'IF-104', name: '최디자인', email: 'design@intraflow.local', department: 'Experience Design', position: 'Designer', role: 'Employee', isActive: true, source: 'MockERP', createdAt: now(), updatedAt: now() },
  { id: 5, employeeNo: 'IF-205', name: '정운영', email: 'ops@intraflow.local', department: 'Project Management', position: 'Producer', role: 'Manager', isActive: true, source: 'LegacyCSV', createdAt: now(), updatedAt: now() },
];

let projects: Project[] = [
  { id: 1, projectCode: 'ART-SEA-001', name: 'Media Wall Operations', description: 'Public media art operations dashboard', department: 'Experience Design', ownerEmployeeId: 2, ownerName: '박매니저', status: 'InProgress', startDate: '2026-06-01', endDate: '2026-08-31', budget: 78000000, source: 'Manual', createdAt: now(), updatedAt: now() },
  { id: 2, projectCode: 'ERP-SYNC-010', name: 'ERP Budget Sync', description: 'Budget data synchronization pilot', department: 'IT Platform', ownerEmployeeId: 1, ownerName: '김관리', status: 'Planned', startDate: '2026-06-15', endDate: '2026-07-30', budget: 32000000, source: 'MockERP', createdAt: now(), updatedAt: now() },
  { id: 3, projectCode: 'LEGACY-HR-2026', name: 'Legacy HR Migration', description: 'CSV-based HR data migration', department: 'Business Operations', ownerEmployeeId: 5, ownerName: '정운영', status: 'OnHold', startDate: '2026-05-20', endDate: '2026-07-10', budget: 18000000, source: 'LegacyCSV', createdAt: now(), updatedAt: now() },
];

let approvals: Approval[] = [
  { id: 1, approvalNo: 'AP-2026-001', title: '프로젝트 예산 승인 요청', type: 'ProjectBudget', requesterId: 2, requesterName: '박매니저', approverId: 1, approverName: '김관리', amount: 12000000, status: 'Pending', content: 'ERP 연계 PoC 예산 승인 요청', requestedAt: now() },
  { id: 2, approvalNo: 'AP-2026-002', title: '전시 운영 출장비', type: 'Expense', requesterId: 3, requesterName: '이사원', approverId: 2, approverName: '박매니저', amount: 450000, status: 'Approved', content: '현장 점검 교통비 및 식대', requestedAt: now(), approvedAt: now() },
];

let erpLogs: ErpSyncLog[] = [
  { id: 1, syncType: 'MockERP', status: 'Succeeded', importedCount: 3, failedCount: 0, message: 'Mock ERP employees and projects synchronized.', triggeredBy: 'admin@intraflow.local', startedAt: now(), finishedAt: now() },
];

let erpRecords: ExternalErpRecord[] = [
  { id: 1, externalSystem: 'MockERP', externalId: 'ERP-EMP-104', entityName: 'Employee', payloadJson: '{"department":"Experience Design"}', syncedAt: now() },
  { id: 2, externalSystem: 'MockERP', externalId: 'ERP-PRJ-010', entityName: 'Project', payloadJson: '{"budget":32000000}', syncedAt: now() },
];

let legacyLogs: LegacyImportLog[] = [
  { id: 1, fileName: 'legacy_employees.csv', rowNumber: 5, employeeNo: 'IF-002', status: 'Failed', message: 'Duplicate EmployeeNo', rawValue: 'IF-002,Duplicate User', createdAt: now() },
  { id: 2, fileName: 'legacy_employees.csv', rowNumber: 8, employeeNo: 'IF-999', status: 'Failed', message: 'Invalid email format', rawValue: 'IF-999,wrong-mail', createdAt: now() },
];

let auditLogs: AuditLog[] = [
  { id: 1, userName: 'system', action: 'SeedDataCreated', entityName: 'System', entityId: 'demo', afterValue: '{"message":"Static Vercel demo fallback initialized"}', ipAddress: 'browser', createdAt: now() },
];

const graphUsers: GraphUser[] = [
  { id: 'mock-graph-001', displayName: '김관리', mail: 'admin@intraflow.local', department: 'IT Platform', jobTitle: 'System Administrator' },
  { id: 'mock-graph-002', displayName: '박매니저', mail: 'manager@intraflow.local', department: 'Business Operations', jobTitle: 'Project Manager' },
  { id: 'mock-graph-003', displayName: '이사원', mail: 'employee@intraflow.local', department: 'Creative Tech', jobTitle: 'Developer' },
];

const roleGuide: RoleGuide[] = [
  { role: 'Admin', allowedMenus: ['Dashboard', 'Employees', 'Projects', 'Approvals', 'ERP Sync', 'Legacy Import', 'Audit Logs', 'Role Guide'], restrictedAreas: [], notes: 'Full demo operations are available.' },
  { role: 'Manager', allowedMenus: ['Dashboard', 'Employees', 'Projects', 'Approvals', 'Role Guide'], restrictedAreas: ['ERP Sync', 'Legacy Import', 'Audit Logs'], notes: 'Project and approval operations are available.' },
  { role: 'Employee', allowedMenus: ['Projects', 'Approvals', 'Role Guide'], restrictedAreas: ['Employees', 'ERP Sync', 'Legacy Import', 'Audit Logs'], notes: 'Employee access is limited to personal workflows.' },
];

function now() {
  return new Date().toISOString();
}

function nextId<T extends { id: number }>(items: T[]) {
  return Math.max(0, ...items.map((item) => item.id)) + 1;
}

function addAudit(action: string, entityName: string, entityId?: string, userName = 'vercel-demo') {
  auditLogs = [
    { id: nextId(auditLogs), userName, action, entityName, entityId, ipAddress: 'browser', createdAt: now() },
    ...auditLogs,
  ].slice(0, 50);
}

function getRoleByEmail(email: string): Role | undefined {
  const account = Object.entries(devAccounts).find(([, value]) => value.email.toLowerCase() === email.toLowerCase());
  return account?.[0] as Role | undefined;
}

function groupCount(items: string[]) {
  return Object.values(items.reduce<Record<string, { label: string; count: number }>>((acc, label) => {
    acc[label] = acc[label] ?? { label, count: 0 };
    acc[label].count += 1;
    return acc;
  }, {}));
}

function maskEmail(email: string) {
  const [name, domain] = email.split('@');
  if (!domain) {
    return email;
  }

  return `${name.slice(0, 2)}***@${domain}`;
}

function asEmployee(payload: Partial<Employee>) {
  return {
    id: nextId(employees),
    employeeNo: payload.employeeNo ?? `IF-${Date.now().toString().slice(-4)}`,
    name: payload.name ?? '신규 직원',
    email: payload.email ?? 'new@intraflow.local',
    department: payload.department ?? 'Business Operations',
    position: payload.position ?? 'Staff',
    role: payload.role ?? 'Employee',
    isActive: payload.isActive ?? true,
    source: payload.source ?? 'Manual',
    createdAt: now(),
    updatedAt: now(),
  };
}

function asProject(payload: Partial<Project>) {
  const owner = employees.find((employee) => employee.id === payload.ownerEmployeeId);
  return {
    id: nextId(projects),
    projectCode: payload.projectCode ?? `PRJ-${Date.now().toString().slice(-4)}`,
    name: payload.name ?? '신규 프로젝트',
    description: payload.description ?? '',
    department: payload.department ?? 'Project Management',
    ownerEmployeeId: payload.ownerEmployeeId,
    ownerName: owner?.name,
    status: payload.status ?? 'Planned',
    startDate: payload.startDate,
    endDate: payload.endDate,
    budget: payload.budget ?? 0,
    source: payload.source ?? 'Manual',
    createdAt: now(),
    updatedAt: now(),
  };
}

export const mockApi = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const role = getRoleByEmail(email);
    if (!role || devAccounts[role].password !== password) {
      throw new Error('Invalid demo credentials');
    }

    addAudit('LoginSucceeded', 'Auth', role, email);
    return {
      token: `mock-token-${role.toLowerCase()}`,
      email,
      role,
      userId: devAccounts[role].userId,
      employeeId: devAccounts[role].employeeId,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 8).toISOString(),
    };
  },
  async dashboard(): Promise<DashboardSummary> {
    return {
      totalEmployees: employees.filter((employee) => employee.isActive).length,
      inProgressProjects: projects.filter((project) => project.status === 'InProgress').length,
      pendingApprovals: approvals.filter((approval) => approval.status === 'Pending').length,
      recentErpSyncs: erpLogs.slice(0, 5),
      recentAuditLogs: auditLogs.slice(0, 8),
      projectsByDepartment: groupCount(projects.map((project) => project.department)),
      approvalsByStatus: groupCount(approvals.map((approval) => approval.status)),
    };
  },
  async employees(role?: Role): Promise<Employee[]> {
    return employees.map((employee) => ({
      ...employee,
      email: role === 'Admin' ? employee.email : maskEmail(employee.email),
    }));
  },
  async createEmployee(payload: Partial<Employee>): Promise<Employee> {
    const employee = asEmployee(payload);
    employees = [employee, ...employees];
    addAudit('EmployeeCreated', 'Employee', String(employee.id));
    return employee;
  },
  async updateEmployee(id: number, payload: Partial<Employee>): Promise<Employee> {
    let updated = employees.find((employee) => employee.id === id);
    employees = employees.map((employee) => {
      if (employee.id !== id) {
        return employee;
      }

      updated = { ...employee, ...payload, id, updatedAt: now() };
      return updated;
    });
    addAudit('EmployeeUpdated', 'Employee', String(id));
    return updated ?? asEmployee(payload);
  },
  async deactivateEmployee(id: number): Promise<void> {
    employees = employees.map((employee) => employee.id === id ? { ...employee, isActive: false, updatedAt: now() } : employee);
    addAudit('EmployeeDeactivated', 'Employee', String(id));
  },
  async projects(): Promise<Project[]> {
    return projects;
  },
  async createProject(payload: Partial<Project>): Promise<Project> {
    const project = asProject(payload);
    projects = [project, ...projects];
    addAudit('ProjectCreated', 'Project', String(project.id));
    return project;
  },
  async updateProject(id: number, payload: Partial<Project>): Promise<Project> {
    let updated = projects.find((project) => project.id === id);
    projects = projects.map((project) => {
      if (project.id !== id) {
        return project;
      }

      const owner = employees.find((employee) => employee.id === payload.ownerEmployeeId);
      updated = { ...project, ...payload, id, ownerName: owner?.name ?? project.ownerName, updatedAt: now() };
      return updated;
    });
    addAudit('ProjectUpdated', 'Project', String(id));
    return updated ?? asProject(payload);
  },
  async approvals(): Promise<Approval[]> {
    return approvals;
  },
  async createApproval(payload: Partial<Approval>): Promise<Approval> {
    const requester = employees.find((employee) => employee.role === 'Employee') ?? employees[0];
    const approver = employees.find((employee) => employee.role === 'Manager') ?? employees[0];
    const approval: Approval = {
      id: nextId(approvals),
      approvalNo: `AP-2026-${String(nextId(approvals)).padStart(3, '0')}`,
      title: payload.title ?? '신규 결재 요청',
      type: payload.type ?? 'Vacation',
      requesterId: requester.id,
      requesterName: requester.name,
      approverId: approver.id,
      approverName: approver.name,
      amount: payload.amount ?? 0,
      status: 'Pending',
      content: payload.content ?? '',
      requestedAt: now(),
    };
    approvals = [approval, ...approvals];
    addAudit('ApprovalRequested', 'Approval', String(approval.id));
    return approval;
  },
  async approve(id: number): Promise<void> {
    approvals = approvals.map((approval) => approval.id === id ? { ...approval, status: 'Approved', approvedAt: now() } : approval);
    addAudit('ApprovalApproved', 'Approval', String(id));
  },
  async reject(id: number, rejectReason: string): Promise<void> {
    approvals = approvals.map((approval) => approval.id === id ? { ...approval, status: 'Rejected', rejectedAt: now(), rejectReason } : approval);
    addAudit('ApprovalRejected', 'Approval', String(id));
  },
  async erpLogs(): Promise<ErpSyncLog[]> {
    return erpLogs;
  },
  async erpRecords(): Promise<ExternalErpRecord[]> {
    return erpRecords;
  },
  async runErpSync(forceFailure = false): Promise<{ status: string; importedCount: number; failedCount: number; message: string }> {
    const log: ErpSyncLog = {
      id: nextId(erpLogs),
      syncType: 'MockERP',
      status: forceFailure ? 'Failed' : 'Succeeded',
      importedCount: forceFailure ? 0 : 2,
      failedCount: forceFailure ? 2 : 0,
      message: forceFailure ? 'Mock ERP timeout simulated.' : 'Mock ERP synchronization completed in static demo mode.',
      triggeredBy: 'vercel-demo',
      startedAt: now(),
      finishedAt: now(),
    };
    erpLogs = [log, ...erpLogs];
    addAudit('ErpSyncExecuted', 'ErpSyncLog', String(log.id));
    return { status: log.status, importedCount: log.importedCount, failedCount: log.failedCount, message: log.message };
  },
  async importSampleCsv(): Promise<LegacyImportResult> {
    addAudit('LegacyImportExecuted', 'LegacyImport', 'sample');
    return { fileName: 'legacy_employees.csv', totalRows: 6, successCount: 4, failedCount: 2 };
  },
  async uploadCsv(file: File): Promise<LegacyImportResult> {
    addAudit('LegacyImportUploaded', 'LegacyImport', file.name);
    return { fileName: file.name, totalRows: 1, successCount: 1, failedCount: 0 };
  },
  async legacyLogs(): Promise<LegacyImportLog[]> {
    return legacyLogs;
  },
  async auditLogs(): Promise<AuditLog[]> {
    return auditLogs;
  },
  async graphUsers(): Promise<GraphUser[]> {
    return graphUsers;
  },
  async roleGuide(): Promise<RoleGuide[]> {
    return roleGuide;
  },
};
