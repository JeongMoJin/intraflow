import axios from 'axios';
import { mockApi } from './mockApi';
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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5121';
const useMockFallback = import.meta.env.VITE_DISABLE_MOCK_FALLBACK !== 'true';
export const authExpiredEvent = 'intraflow.auth-expired';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      window.dispatchEvent(new Event(authExpiredEvent));
    }

    return Promise.reject(error);
  },
);

export function setAuthToken(token?: string) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    return;
  }

  delete api.defaults.headers.common.Authorization;
}

function shouldFallback(error: unknown) {
  return useMockFallback && axios.isAxiosError(error) && !error.response;
}

async function withFallback<T>(request: () => Promise<T>, fallback: () => Promise<T>) {
  try {
    return await request();
  } catch (error) {
    if (shouldFallback(error)) {
      return fallback();
    }

    throw error;
  }
}

function getStoredRole(): Role | undefined {
  try {
    const raw = localStorage.getItem('intraflow.session');
    if (!raw) {
      return undefined;
    }

    return (JSON.parse(raw) as LoginResponse).role;
  } catch {
    return undefined;
  }
}

export const endpoints = {
  async login(email: string, password: string) {
    return withFallback(
      async () => {
        const { data } = await api.post<LoginResponse>('/api/auth/login', { email, password });
        return data;
      },
      () => mockApi.login(email, password),
    );
  },
  async dashboard() {
    return withFallback(
      async () => {
        const { data } = await api.get<DashboardSummary>('/api/dashboard');
        return data;
      },
      () => mockApi.dashboard(),
    );
  },
  async employees(params?: { search?: string; department?: string; role?: string }) {
    return withFallback(
      async () => {
        const { data } = await api.get<Employee[]>('/api/employees', { params });
        return data;
      },
      () => mockApi.employees(getStoredRole()),
    );
  },
  async createEmployee(payload: Partial<Employee>) {
    return withFallback(
      async () => {
        const { data } = await api.post<Employee>('/api/employees', payload);
        return data;
      },
      () => mockApi.createEmployee(payload),
    );
  },
  async updateEmployee(id: number, payload: Partial<Employee>) {
    return withFallback(
      async () => {
        const { data } = await api.put<Employee>(`/api/employees/${id}`, payload);
        return data;
      },
      () => mockApi.updateEmployee(id, payload),
    );
  },
  async deactivateEmployee(id: number) {
    return withFallback(
      async () => {
        await api.patch(`/api/employees/${id}/deactivate`);
      },
      () => mockApi.deactivateEmployee(id),
    );
  },
  async projects(params?: { search?: string; department?: string; status?: string }) {
    return withFallback(
      async () => {
        const { data } = await api.get<Project[]>('/api/projects', { params });
        return data;
      },
      () => mockApi.projects(),
    );
  },
  async createProject(payload: Partial<Project>) {
    return withFallback(
      async () => {
        const { data } = await api.post<Project>('/api/projects', payload);
        return data;
      },
      () => mockApi.createProject(payload),
    );
  },
  async updateProject(id: number, payload: Partial<Project>) {
    return withFallback(
      async () => {
        const { data } = await api.put<Project>(`/api/projects/${id}`, payload);
        return data;
      },
      () => mockApi.updateProject(id, payload),
    );
  },
  async approvals(params?: { status?: string }) {
    return withFallback(
      async () => {
        const { data } = await api.get<Approval[]>('/api/approvals', { params });
        return data;
      },
      () => mockApi.approvals(),
    );
  },
  async createApproval(payload: Partial<Approval>) {
    return withFallback(
      async () => {
        const { data } = await api.post<Approval>('/api/approvals', payload);
        return data;
      },
      () => mockApi.createApproval(payload),
    );
  },
  async approve(id: number) {
    return withFallback(
      async () => {
        await api.post(`/api/approvals/${id}/approve`);
      },
      () => mockApi.approve(id),
    );
  },
  async reject(id: number, rejectReason: string) {
    return withFallback(
      async () => {
        await api.post(`/api/approvals/${id}/reject`, { rejectReason });
      },
      () => mockApi.reject(id, rejectReason),
    );
  },
  async erpLogs() {
    return withFallback(
      async () => {
        const { data } = await api.get<ErpSyncLog[]>('/api/erp-sync/logs');
        return data;
      },
      () => mockApi.erpLogs(),
    );
  },
  async erpRecords() {
    return withFallback(
      async () => {
        const { data } = await api.get<ExternalErpRecord[]>('/api/erp-sync/records');
        return data;
      },
      () => mockApi.erpRecords(),
    );
  },
  async runErpSync(forceFailure = false) {
    return withFallback(
      async () => {
        const { data } = await api.post('/api/erp-sync/run', null, { params: { forceFailure } });
        return data as { status: string; importedCount: number; failedCount: number; message: string };
      },
      () => mockApi.runErpSync(forceFailure),
    );
  },
  async importSampleCsv() {
    return withFallback(
      async () => {
        const { data } = await api.post<LegacyImportResult>('/api/legacy-import/sample');
        return data;
      },
      () => mockApi.importSampleCsv(),
    );
  },
  async uploadCsv(file: File) {
    const form = new FormData();
    form.append('file', file);
    return withFallback(
      async () => {
        const { data } = await api.post<LegacyImportResult>('/api/legacy-import/upload', form);
        return data;
      },
      () => mockApi.uploadCsv(file),
    );
  },
  async legacyLogs() {
    return withFallback(
      async () => {
        const { data } = await api.get<LegacyImportLog[]>('/api/legacy-import/logs');
        return data;
      },
      () => mockApi.legacyLogs(),
    );
  },
  async auditLogs() {
    return withFallback(
      async () => {
        const { data } = await api.get<AuditLog[]>('/api/audit-logs');
        return data;
      },
      () => mockApi.auditLogs(),
    );
  },
  async graphUsers() {
    return withFallback(
      async () => {
        const { data } = await api.get<GraphUser[]>('/api/graph-users');
        return data;
      },
      () => mockApi.graphUsers(),
    );
  },
  async roleGuide() {
    return withFallback(
      async () => {
        const { data } = await api.get<RoleGuide[]>('/api/role-guide');
        return data;
      },
      () => mockApi.roleGuide(),
    );
  },
};
