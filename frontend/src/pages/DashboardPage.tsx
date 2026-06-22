import { useEffect, useMemo, useState } from 'react';
import Chart, { ArgumentAxis, Legend, Series, Tooltip, ValueAxis } from 'devextreme-react/chart';
import DataGrid, { Column, Paging } from 'devextreme-react/data-grid';
import { Activity, DatabaseZap, FileText, ListChecks, Users } from 'lucide-react';
import { endpoints } from '../api/client';
import { MetricCard } from '../components/MetricCard';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import { translateStatus, useLanguage } from '../hooks/useLanguage';
import type { Language } from '../hooks/useLanguage';
import type { DashboardSummary } from '../types/api';

const copy: Record<Language, {
  heroEyebrow: string;
  heroTitle: string;
  heroDescription: string;
  heroMode: string;
  title: string;
  description: string;
  metrics: {
    employees: [string, string];
    projects: [string, string];
    approvals: [string, string];
    erp: [string, string];
    audit: [string, string];
  };
  noData: string;
  waitingSync: string;
  projectDistribution: string;
  projectsByDepartment: string;
  approvalFlow: string;
  approvalsByStatus: string;
  erpHealth: string;
  recentErpSync: string;
  auditReady: string;
  recentActivity: string;
  columns: Record<string, string>;
}> = {
  ko: {
    heroEyebrow: '운영 시뮬레이션',
    heroTitle: '운영 현황',
    heroDescription: '아트테크 비즈니스 운영을 가정한 사내 인트라넷 대시보드입니다.',
    heroMode: '운영 시뮬레이션 모드',
    title: '운영 대시보드',
    description: '직원, 프로젝트, 전자결재, ERP 동기화, 감사 로그를 하나의 내부 콘솔에서 확인합니다.',
    metrics: {
      employees: ['전체 직원', '활성 직원 레코드'],
      projects: ['진행 프로젝트', '진행 중 상태'],
      approvals: ['대기 결재', '승인 대기 건'],
      erp: ['최근 ERP 동기화', '첫 동기화를 기다리는 중'],
      audit: ['감사 이벤트', '최근 보안 추적'],
    },
    noData: '데이터 없음',
    waitingSync: '첫 동기화를 기다리는 중',
    projectDistribution: '프로젝트 분포',
    projectsByDepartment: '부서별 프로젝트',
    approvalFlow: '결재 흐름',
    approvalsByStatus: '상태별 결재',
    erpHealth: 'ERP 연계 상태',
    recentErpSync: '최근 ERP 동기화',
    auditReady: '감사 준비',
    recentActivity: '최근 활동',
    columns: {
      status: '상태',
      imported: '성공',
      failed: '실패',
      message: '메시지',
      action: '작업',
      entity: '대상',
      user: '사용자',
      created: '생성일',
    },
  },
  en: {
    heroEyebrow: 'Production Simulation',
    heroTitle: 'Operations Overview',
    heroDescription: 'Live intranet simulation for art-tech business operations.',
    heroMode: 'Live Operations Mode',
    title: 'Operations Dashboard',
    description: 'Monitor people, projects, approvals, ERP sync, and audit readiness from one internal console.',
    metrics: {
      employees: ['Total Employees', 'Active directory records'],
      projects: ['Active Projects', 'In execution status'],
      approvals: ['Pending Approvals', 'Waiting for decision'],
      erp: ['Last ERP Sync', 'Waiting for first sync'],
      audit: ['Audit Events', 'Recent security trace'],
    },
    noData: 'No Data',
    waitingSync: 'Waiting for first sync',
    projectDistribution: 'Project Distribution',
    projectsByDepartment: 'Projects by Department',
    approvalFlow: 'Approval Flow',
    approvalsByStatus: 'Approvals by Status',
    erpHealth: 'ERP Integration Health',
    recentErpSync: 'Recent ERP Sync',
    auditReady: 'Audit Ready',
    recentActivity: 'Recent Activity',
    columns: {
      status: 'Status',
      imported: 'Imported',
      failed: 'Failed',
      message: 'Message',
      action: 'Action',
      entity: 'Entity',
      user: 'User',
      created: 'Created',
    },
  },
};

export function DashboardPage() {
  const { language } = useLanguage();
  const t = copy[language];
  const [summary, setSummary] = useState<DashboardSummary>();

  useEffect(() => {
    void endpoints.dashboard().then(setSummary).catch(() => setSummary(undefined));
  }, []);

  const lastSync = summary?.recentErpSyncs[0];
  const auditEvents = summary?.recentAuditLogs.length ?? 0;
  const today = useMemo(() => new Intl.DateTimeFormat(language === 'ko' ? 'ko-KR' : 'en', { dateStyle: 'medium' }).format(new Date()), [language]);
  const approvalChart = useMemo(
    () => (summary?.approvalsByStatus ?? []).map((item) => ({ ...item, label: translateStatus(item.label, language) })),
    [language, summary?.approvalsByStatus],
  );

  return (
    <>
      <section className="hero-panel">
        <div>
          <span className="eyebrow">{t.heroEyebrow}</span>
          <h1>{t.heroTitle}</h1>
          <p>{t.heroDescription}</p>
        </div>
        <div className="hero-meta">
          <span>{today}</span>
          <strong>{t.heroMode}</strong>
        </div>
      </section>

      <PageHeader title={t.title} description={t.description} />

      <div className="metrics five">
        <MetricCard label={t.metrics.employees[0]} value={summary?.totalEmployees ?? 0} detail={t.metrics.employees[1]} tone="cyan" icon={<Users size={18} />} />
        <MetricCard label={t.metrics.projects[0]} value={summary?.inProgressProjects ?? 0} detail={t.metrics.projects[1]} tone="violet" icon={<Activity size={18} />} />
        <MetricCard label={t.metrics.approvals[0]} value={summary?.pendingApprovals ?? 0} detail={t.metrics.approvals[1]} tone="amber" icon={<ListChecks size={18} />} />
        <MetricCard label={t.metrics.erp[0]} value={translateStatus(lastSync?.status ?? t.noData, language)} detail={lastSync?.message ?? t.waitingSync} tone={lastSync?.status === 'Failed' ? 'red' : 'green'} icon={<DatabaseZap size={18} />} />
        <MetricCard label={t.metrics.audit[0]} value={auditEvents} detail={t.metrics.audit[1]} tone="neutral" icon={<FileText size={18} />} />
      </div>

      <div className="grid two">
        <section className="panel chart-panel">
          <div className="section-title">
            <span className="eyebrow">{t.projectDistribution}</span>
            <h2>{t.projectsByDepartment}</h2>
          </div>
          <Chart dataSource={summary?.projectsByDepartment ?? []} height={280} palette={['#4bd3ff']}>
            <ArgumentAxis argumentType="string" />
            <ValueAxis />
            <Series argumentField="label" valueField="count" type="bar" />
            <Tooltip enabled />
            <Legend visible={false} />
          </Chart>
        </section>
        <section className="panel chart-panel">
          <div className="section-title">
            <span className="eyebrow">{t.approvalFlow}</span>
            <h2>{t.approvalsByStatus}</h2>
          </div>
          <Chart dataSource={approvalChart} height={280} palette={['#8f7cff']}>
            <ArgumentAxis argumentType="string" />
            <ValueAxis />
            <Series argumentField="label" valueField="count" type="bar" />
            <Tooltip enabled />
            <Legend visible={false} />
          </Chart>
        </section>
      </div>

      <div className="grid two">
        <section className="panel table-panel">
          <div className="section-title">
            <span className="eyebrow">{t.erpHealth}</span>
            <h2>{t.recentErpSync}</h2>
          </div>
          <DataGrid dataSource={summary?.recentErpSyncs ?? []} showBorders columnAutoWidth>
            <Paging defaultPageSize={5} />
            <Column dataField="status" caption={t.columns.status} cellRender={({ value }) => <StatusBadge value={value} />} />
            <Column dataField="importedCount" caption={t.columns.imported} />
            <Column dataField="failedCount" caption={t.columns.failed} />
            <Column dataField="message" caption={t.columns.message} />
          </DataGrid>
        </section>
        <section className="panel table-panel">
          <div className="section-title">
            <span className="eyebrow">{t.auditReady}</span>
            <h2>{t.recentActivity}</h2>
          </div>
          <DataGrid dataSource={summary?.recentAuditLogs ?? []} showBorders columnAutoWidth>
            <Paging defaultPageSize={5} />
            <Column dataField="action" caption={t.columns.action} />
            <Column dataField="entityName" caption={t.columns.entity} />
            <Column dataField="userName" caption={t.columns.user} />
            <Column dataField="createdAt" caption={t.columns.created} dataType="datetime" />
          </DataGrid>
        </section>
      </div>
    </>
  );
}
