import { useEffect, useMemo, useState } from 'react';
import DataGrid, { Column, FilterRow, Paging, SearchPanel } from 'devextreme-react/data-grid';
import { Activity, CheckCircle2, PauseCircle, Wallet } from 'lucide-react';
import { endpoints } from '../api/client';
import { MetricCard } from '../components/MetricCard';
import { MobileRecordList } from '../components/MobileViews';
import { Notice } from '../components/Notice';
import { PageHeader } from '../components/PageHeader';
import { DataChip, StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../hooks/useAuth';
import { translateStatus, useLanguage } from '../hooks/useLanguage';
import type { Language } from '../hooks/useLanguage';
import type { Project } from '../types/api';
import { formatMoney } from '../utils/format';

interface ProjectForm {
  projectCode: string;
  name: string;
  description: string;
  department: string;
  ownerEmployeeId?: number;
  status: string;
  startDate: string;
  endDate: string;
  budget: number;
}

const emptyProject: ProjectForm = {
  projectCode: '',
  name: '',
  description: '',
  department: '',
  ownerEmployeeId: undefined,
  status: 'Planned',
  startDate: '',
  endDate: '',
  budget: 0,
};

const statusOptions = ['Planned', 'InProgress', 'Completed', 'OnHold'];

const copy: Record<Language, {
  title: string;
  description: string;
  eyebrow: string;
  metrics: {
    inProgress: [string, string];
    completed: [string, string];
    onHold: [string, string];
    budget: [string, string];
  };
  actionEyebrow: string;
  updateProject: string;
  createProject: string;
  placeholders: Record<string, string>;
  buttons: Record<string, string>;
  sectionEyebrow: string;
  sectionTitle: string;
  searchPlaceholder: string;
  columns: Record<string, string>;
  messages: Record<string, string>;
}> = {
  ko: {
    title: '프로젝트 운영',
    description: '사내 프로젝트의 담당자, 부서, 예산, 진행 상태를 관리합니다.',
    eyebrow: '아트테크 제작 파이프라인',
    metrics: {
      inProgress: ['진행 중', '실행 단계 프로젝트'],
      completed: ['완료', '종료된 프로젝트'],
      onHold: ['보류', '확인 필요'],
      budget: ['총 예산', '프로젝트 포트폴리오'],
    },
    actionEyebrow: '운영 작업',
    updateProject: '프로젝트 수정',
    createProject: '프로젝트 등록',
    placeholders: {
      projectCode: '프로젝트 코드',
      name: '프로젝트명',
      department: '부서',
      ownerEmployeeId: '담당 직원 ID',
      budget: '예산',
      description: '설명',
    },
    buttons: {
      update: '수정',
      create: '등록',
    },
    sectionEyebrow: '실행 현황판',
    sectionTitle: '프로젝트 포트폴리오',
    searchPlaceholder: '프로젝트 검색',
    columns: {
      code: '코드',
      project: '프로젝트',
      department: '부서',
      owner: '담당자',
      status: '상태',
      budget: '예산',
      source: '출처',
    },
    messages: {
      updated: '프로젝트 정보가 수정되었습니다.',
      created: '프로젝트가 등록되었습니다.',
      failed: '프로젝트 저장에 실패했습니다. 코드 중복과 필수값을 확인해 주세요.',
    },
  },
  en: {
    title: 'Project Operations',
    description: 'Track internal projects, ownership, departments, budgets, and execution status.',
    eyebrow: 'Art-Tech Production Pipeline',
    metrics: {
      inProgress: ['In Progress', 'Execution status'],
      completed: ['Completed', 'Closed operations'],
      onHold: ['On Hold', 'Needs attention'],
      budget: ['Total Budget', 'Project portfolio'],
    },
    actionEyebrow: 'Operations Action',
    updateProject: 'Update project',
    createProject: 'Create project',
    placeholders: {
      projectCode: 'Project Code',
      name: 'Name',
      department: 'Department',
      ownerEmployeeId: 'Owner Employee Id',
      budget: 'Budget',
      description: 'Description',
    },
    buttons: {
      update: 'Update',
      create: 'Create',
    },
    sectionEyebrow: 'Execution board',
    sectionTitle: 'Project Portfolio',
    searchPlaceholder: 'Search projects',
    columns: {
      code: 'Code',
      project: 'Project',
      department: 'Department',
      owner: 'Owner',
      status: 'Status',
      budget: 'Budget',
      source: 'Source',
    },
    messages: {
      updated: 'Project operation updated.',
      created: 'Project operation created.',
      failed: 'Project save failed. Check code uniqueness and required fields.',
    },
  },
};

export function ProjectsPage() {
  const auth = useAuth();
  const { language } = useLanguage();
  const t = copy[language];
  const emptyProjects = language === 'ko' ? '프로젝트 데이터가 없습니다.' : 'No project records.';
  const [projects, setProjects] = useState<Project[]>([]);
  const [form, setForm] = useState({ ...emptyProject });
  const [selectedId, setSelectedId] = useState<number>();
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  async function load() {
    try {
      setProjects(await endpoints.projects());
    } catch {
      setProjects([]);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const summary = useMemo(() => ({
    inProgress: projects.filter((project) => project.status === 'InProgress').length,
    completed: projects.filter((project) => project.status === 'Completed').length,
    onHold: projects.filter((project) => project.status === 'OnHold').length,
    budget: projects.reduce((sum, project) => sum + project.budget, 0),
  }), [projects]);

  async function save() {
    try {
      const payload = { ...form, budget: Number(form.budget), ownerEmployeeId: form.ownerEmployeeId ? Number(form.ownerEmployeeId) : undefined };
      if (selectedId) {
        await endpoints.updateProject(selectedId, payload);
        setMessage(t.messages.updated);
      } else {
        await endpoints.createProject(payload);
        setMessage(t.messages.created);
      }
      setMessageType('success');
      setForm({ ...emptyProject });
      setSelectedId(undefined);
      await load();
    } catch {
      setMessage(t.messages.failed);
      setMessageType('error');
    }
  }

  const canEdit = auth.role === 'Admin' || auth.role === 'Manager';

  function selectProject(data: Project) {
    setSelectedId(data.id);
    setForm({
      projectCode: data.projectCode,
      name: data.name,
      description: data.description,
      department: data.department,
      ownerEmployeeId: data.ownerEmployeeId,
      status: data.status,
      startDate: data.startDate ?? '',
      endDate: data.endDate ?? '',
      budget: data.budget,
    });
  }

  return (
    <>
      <PageHeader title={t.title} description={t.description} eyebrow={t.eyebrow} />
      <div className="metrics four">
        <MetricCard label={t.metrics.inProgress[0]} value={summary.inProgress} detail={t.metrics.inProgress[1]} tone="cyan" icon={<Activity size={18} />} />
        <MetricCard label={t.metrics.completed[0]} value={summary.completed} detail={t.metrics.completed[1]} tone="green" icon={<CheckCircle2 size={18} />} />
        <MetricCard label={t.metrics.onHold[0]} value={summary.onHold} detail={t.metrics.onHold[1]} tone="amber" icon={<PauseCircle size={18} />} />
        <MetricCard label={t.metrics.budget[0]} value={`${summary.budget.toLocaleString()} KRW`} detail={t.metrics.budget[1]} tone="violet" icon={<Wallet size={18} />} />
      </div>
      <Notice message={message} type={messageType} />
      {canEdit ? (
        <section className="panel form-panel elevated-form">
          <div className="form-intro">
            <span className="eyebrow">{t.actionEyebrow}</span>
            <strong>{selectedId ? t.updateProject : t.createProject}</strong>
          </div>
          <input placeholder={t.placeholders.projectCode} value={form.projectCode} onChange={(event) => setForm({ ...form, projectCode: event.target.value })} />
          <input placeholder={t.placeholders.name} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          <input placeholder={t.placeholders.department} value={form.department} onChange={(event) => setForm({ ...form, department: event.target.value })} />
          <input placeholder={t.placeholders.ownerEmployeeId} value={form.ownerEmployeeId ?? ''} onChange={(event) => setForm({ ...form, ownerEmployeeId: event.target.value ? Number(event.target.value) : undefined })} />
          <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
            {statusOptions.map((status) => <option key={status} value={status}>{translateStatus(status, language)}</option>)}
          </select>
          <input placeholder={t.placeholders.budget} type="number" value={form.budget} onChange={(event) => setForm({ ...form, budget: Number(event.target.value) })} />
          <input placeholder={t.placeholders.description} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          <button className="primary" type="button" onClick={save}>{selectedId ? t.buttons.update : t.buttons.create}</button>
        </section>
      ) : null}
      <section className="panel table-panel">
        <div className="section-title">
          <span className="eyebrow">{t.sectionEyebrow}</span>
          <h2>{t.sectionTitle}</h2>
        </div>
        <div className="desktop-data-grid">
          <DataGrid
            dataSource={projects}
            showBorders
            columnAutoWidth
            onRowClick={(event) => {
              if (canEdit && event.data) {
                selectProject(event.data as Project);
              }
            }}
          >
            <SearchPanel visible width={280} placeholder={t.searchPlaceholder} />
            <FilterRow visible />
            <Paging defaultPageSize={10} />
            <Column dataField="projectCode" caption={t.columns.code} />
            <Column dataField="name" caption={t.columns.project} />
            <Column dataField="department" caption={t.columns.department} cellRender={({ value }) => <DataChip value={value} />} />
            <Column dataField="ownerName" caption={t.columns.owner} />
            <Column dataField="status" caption={t.columns.status} cellRender={({ value }) => <StatusBadge value={value} />} />
            <Column dataField="budget" caption={t.columns.budget} dataType="number" format="#,##0" />
            <Column dataField="source" caption={t.columns.source} cellRender={({ value }) => <DataChip value={value} />} />
          </DataGrid>
        </div>
        <div className="mobile-data-list">
          <MobileRecordList
            emptyText={emptyProjects}
            items={projects.map((project) => ({
              id: project.id,
              eyebrow: project.projectCode,
              title: project.name,
              description: project.description,
              status: <StatusBadge value={project.status} />,
              meta: [
                { label: t.columns.department, value: <DataChip value={project.department} /> },
                { label: t.columns.owner, value: project.ownerName ?? '-' },
                { label: t.columns.budget, value: `${formatMoney(project.budget, language)} KRW` },
                { label: t.columns.source, value: <DataChip value={project.source} /> },
              ],
              actions: canEdit ? <button className="ghost-button" type="button" onClick={() => selectProject(project)}>{t.buttons.update}</button> : undefined,
            }))}
          />
        </div>
      </section>
    </>
  );
}
