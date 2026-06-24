import { useEffect, useMemo, useState } from 'react';
import DataGrid, { Column, FilterRow, Paging, SearchPanel } from 'devextreme-react/data-grid';
import { ShieldCheck, UserCog, Users } from 'lucide-react';
import { endpoints } from '../api/client';
import { MetricCard } from '../components/MetricCard';
import { MobileRecordList } from '../components/MobileViews';
import { Notice } from '../components/Notice';
import { PageHeader } from '../components/PageHeader';
import { DataChip, RoleBadge, StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../hooks/useAuth';
import { translateRole, useLanguage } from '../hooks/useLanguage';
import type { Language } from '../hooks/useLanguage';
import type { Employee, Role } from '../types/api';

const emptyEmployee = {
  employeeNo: '',
  name: '',
  email: '',
  department: '',
  position: '',
  role: 'Employee' as Role,
  isActive: true,
};

const copy: Record<Language, {
  title: string;
  description: string;
  eyebrow: string;
  metrics: {
    active: [string, string];
    departments: [string, string];
    managers: [string, string];
    external: [string, string];
  };
  adminAction: string;
  updateRecord: string;
  createRecord: string;
  placeholders: Record<string, string>;
  buttons: Record<string, string>;
  directoryEyebrow: string;
  directoryTitle: string;
  adminPrivacy: string;
  maskedPrivacy: string;
  searchPlaceholder: string;
  columns: Record<string, string>;
  messages: Record<string, string>;
}> = {
  ko: {
    title: '직원 관리',
    description: '직원 정보, 부서, 권한, 개인정보 보호 관점의 조회 정책을 관리합니다.',
    eyebrow: '역할 기반 접근 제어',
    metrics: {
      active: ['활성 직원', '조회 가능한 직원'],
      departments: ['부서', '운영 조직 수'],
      managers: ['매니저', '결재 가능 사용자'],
      external: ['ERP/레거시 출처', '이관 또는 동기화된 레코드'],
    },
    adminAction: '관리자 작업',
    updateRecord: '직원 정보 수정',
    createRecord: '직원 정보 등록',
    placeholders: {
      employeeNo: '사번',
      name: '이름',
      email: '이메일',
      department: '부서',
      position: '직책',
    },
    buttons: {
      update: '수정',
      create: '등록',
      deactivate: '비활성화',
    },
    directoryEyebrow: '개인정보 보호 디렉터리',
    directoryTitle: '직원 목록',
    adminPrivacy: '관리자는 전체 이메일을 조회할 수 있습니다.',
    maskedPrivacy: '일반 권한에서는 이메일 일부가 마스킹됩니다.',
    searchPlaceholder: '직원 검색',
    columns: {
      employeeNo: '사번',
      name: '이름',
      email: '이메일',
      department: '부서',
      position: '직책',
      role: '권한',
      status: '상태',
      source: '출처',
      action: '작업',
    },
    messages: {
      updated: '직원 정보가 수정되었습니다.',
      created: '직원 정보가 등록되었습니다.',
      failed: '직원 저장에 실패했습니다. 필수값과 중복 사번을 확인해 주세요.',
      deactivated: '직원이 비활성화되었고 감사 로그가 기록되었습니다.',
    },
  },
  en: {
    title: 'People Directory',
    description: 'Manage employee records, departments, roles, and privacy-aware access.',
    eyebrow: 'Secure Role-Based Access',
    metrics: {
      active: ['Active Employees', 'Visible directory users'],
      departments: ['Departments', 'Operational groups'],
      managers: ['Managers', 'Approval-capable users'],
      external: ['ERP/Legacy Sourced', 'Imported records'],
    },
    adminAction: 'Admin Action',
    updateRecord: 'Update person record',
    createRecord: 'Create person record',
    placeholders: {
      employeeNo: 'Employee No',
      name: 'Name',
      email: 'Email',
      department: 'Department',
      position: 'Position',
    },
    buttons: {
      update: 'Update',
      create: 'Create',
      deactivate: 'Deactivate',
    },
    directoryEyebrow: 'Privacy-aware directory',
    directoryTitle: 'Employee Records',
    adminPrivacy: 'Admin can view full emails.',
    maskedPrivacy: 'Emails are masked for non-admin roles.',
    searchPlaceholder: 'Search employees',
    columns: {
      employeeNo: 'Employee No',
      name: 'Name',
      email: 'Email',
      department: 'Department',
      position: 'Position',
      role: 'Role',
      status: 'Status',
      source: 'Source',
      action: 'Action',
    },
    messages: {
      updated: 'Employee record updated.',
      created: 'Employee record created.',
      failed: 'Employee save failed. Check required fields and duplicate employee numbers.',
      deactivated: 'Employee deactivated and audit log recorded.',
    },
  },
};

export function EmployeesPage() {
  const auth = useAuth();
  const { language } = useLanguage();
  const t = copy[language];
  const emptyDirectory = language === 'ko' ? '직원 데이터가 없습니다.' : 'No employee records.';
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [form, setForm] = useState({ ...emptyEmployee });
  const [selectedId, setSelectedId] = useState<number>();
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  async function load() {
    try {
      setEmployees(await endpoints.employees());
    } catch {
      setEmployees([]);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const summary = useMemo(() => {
    const active = employees.filter((employee) => employee.isActive).length;
    const departments = new Set(employees.map((employee) => employee.department)).size;
    const managers = employees.filter((employee) => employee.role === 'Manager').length;
    const external = employees.filter((employee) => employee.source !== 'Seed' && employee.source !== 'Manual').length;
    return { active, departments, managers, external };
  }, [employees]);

  async function save() {
    try {
      if (selectedId) {
        await endpoints.updateEmployee(selectedId, form as Partial<Employee>);
        setMessage(t.messages.updated);
      } else {
        await endpoints.createEmployee(form as Partial<Employee>);
        setMessage(t.messages.created);
      }
      setMessageType('success');
      setForm({ ...emptyEmployee });
      setSelectedId(undefined);
      await load();
    } catch {
      setMessage(t.messages.failed);
      setMessageType('error');
    }
  }

  async function deactivate(id: number) {
    await endpoints.deactivateEmployee(id);
    setMessage(t.messages.deactivated);
    setMessageType('success');
    await load();
  }

  function selectEmployee(data: Employee) {
    setSelectedId(data.id);
    setForm({
      employeeNo: data.employeeNo,
      name: data.name,
      email: data.email.includes('***') ? '' : data.email,
      department: data.department,
      position: data.position,
      role: data.role,
      isActive: data.isActive,
    });
  }

  return (
    <>
      <PageHeader title={t.title} description={t.description} eyebrow={t.eyebrow} />
      <div className="metrics four">
        <MetricCard label={t.metrics.active[0]} value={summary.active} detail={t.metrics.active[1]} tone="cyan" icon={<Users size={18} />} />
        <MetricCard label={t.metrics.departments[0]} value={summary.departments} detail={t.metrics.departments[1]} tone="neutral" />
        <MetricCard label={t.metrics.managers[0]} value={summary.managers} detail={t.metrics.managers[1]} tone="violet" icon={<UserCog size={18} />} />
        <MetricCard label={t.metrics.external[0]} value={summary.external} detail={t.metrics.external[1]} tone="green" icon={<ShieldCheck size={18} />} />
      </div>
      <Notice message={message} type={messageType} />
      {auth.role === 'Admin' ? (
        <section className="panel form-panel elevated-form">
          <div className="form-intro">
            <span className="eyebrow">{t.adminAction}</span>
            <strong>{selectedId ? t.updateRecord : t.createRecord}</strong>
          </div>
          <input placeholder={t.placeholders.employeeNo} value={form.employeeNo} onChange={(event) => setForm({ ...form, employeeNo: event.target.value })} />
          <input placeholder={t.placeholders.name} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          <input placeholder={t.placeholders.email} value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          <input placeholder={t.placeholders.department} value={form.department} onChange={(event) => setForm({ ...form, department: event.target.value })} />
          <input placeholder={t.placeholders.position} value={form.position} onChange={(event) => setForm({ ...form, position: event.target.value })} />
          <select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as Role })}>
            <option value="Admin">{translateRole('Admin', language)}</option>
            <option value="Manager">{translateRole('Manager', language)}</option>
            <option value="Employee">{translateRole('Employee', language)}</option>
          </select>
          <button className="primary" type="button" onClick={save}>{selectedId ? t.buttons.update : t.buttons.create}</button>
        </section>
      ) : null}
      <section className="panel table-panel">
        <div className="section-title">
          <span className="eyebrow">{t.directoryEyebrow}</span>
          <h2>{t.directoryTitle}</h2>
          <p>{auth.role === 'Admin' ? t.adminPrivacy : t.maskedPrivacy}</p>
        </div>
        <div className="desktop-data-grid">
          <DataGrid
            dataSource={employees}
            showBorders
            columnAutoWidth
            onRowClick={(event) => {
              if (auth.role === 'Admin' && event.data) {
                selectEmployee(event.data as Employee);
              }
            }}
          >
            <SearchPanel visible width={280} placeholder={t.searchPlaceholder} />
            <FilterRow visible />
            <Paging defaultPageSize={10} />
            <Column dataField="employeeNo" caption={t.columns.employeeNo} />
            <Column dataField="name" caption={t.columns.name} />
            <Column dataField="email" caption={t.columns.email} cellRender={({ value }) => <span className={String(value).includes('***') ? 'masked-email' : ''}>{value}</span>} />
            <Column dataField="department" caption={t.columns.department} cellRender={({ value }) => <DataChip value={value} />} />
            <Column dataField="position" caption={t.columns.position} />
            <Column dataField="role" caption={t.columns.role} cellRender={({ value }) => <RoleBadge role={value} />} />
            <Column dataField="isActive" caption={t.columns.status} cellRender={({ value }) => <StatusBadge value={value} />} />
            <Column dataField="source" caption={t.columns.source} cellRender={({ value }) => <DataChip value={value} />} />
            {auth.role === 'Admin' ? <Column caption={t.columns.action} cellRender={({ data }) => <button className="ghost-button" type="button" onClick={() => deactivate((data as Employee).id)}>{t.buttons.deactivate}</button>} /> : null}
          </DataGrid>
        </div>
        <div className="mobile-data-list">
          <MobileRecordList
            emptyText={emptyDirectory}
            items={employees.map((employee) => ({
              id: employee.id,
              eyebrow: employee.employeeNo,
              title: employee.name,
              description: employee.email,
              status: <StatusBadge value={employee.isActive} />,
              meta: [
                { label: t.columns.department, value: <DataChip value={employee.department} /> },
                { label: t.columns.position, value: employee.position },
                { label: t.columns.role, value: <RoleBadge role={employee.role} /> },
                { label: t.columns.source, value: <DataChip value={employee.source} /> },
              ],
              actions: auth.role === 'Admin' ? (
                <>
                  <button className="ghost-button" type="button" onClick={() => selectEmployee(employee)}>{t.buttons.update}</button>
                  <button className="danger-button" type="button" onClick={() => deactivate(employee.id)}>{t.buttons.deactivate}</button>
                </>
              ) : undefined,
            }))}
          />
        </div>
      </section>
    </>
  );
}
