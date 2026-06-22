import { useEffect, useMemo, useState } from 'react';
import DataGrid, { Column, FilterRow, Paging, SearchPanel } from 'devextreme-react/data-grid';
import { LockKeyhole, ShieldAlert, ShieldCheck } from 'lucide-react';
import { endpoints } from '../api/client';
import { MetricCard } from '../components/MetricCard';
import { PageHeader } from '../components/PageHeader';
import { DataChip } from '../components/StatusBadge';
import { useLanguage } from '../hooks/useLanguage';
import type { Language } from '../hooks/useLanguage';
import type { AuditLog } from '../types/api';

const copy: Record<Language, {
  title: string;
  description: string;
  eyebrow: string;
  metrics: {
    events: [string, string];
    denials: [string, string];
    approvals: [string, string];
  };
  sectionEyebrow: string;
  sectionTitle: string;
  searchPlaceholder: string;
  columns: Record<string, string>;
}> = {
  ko: {
    title: '감사 로그',
    description: '민감 작업, 접근 시도, 업무 핵심 변경 이력을 추적합니다.',
    eyebrow: '관리자 전용 보안 콘솔',
    metrics: {
      events: ['감사 이벤트', '최근 추적 구간'],
      denials: ['접근 거부', '401/403 시도'],
      approvals: ['결재 이벤트', '워크플로우 결정'],
    },
    sectionEyebrow: '민감 작업 추적',
    sectionTitle: '감사 이벤트 스트림',
    searchPlaceholder: '감사 로그 검색',
    columns: {
      created: '생성일',
      action: '작업',
      entity: '대상',
      entityId: '대상 ID',
      user: '사용자',
      ip: 'IP',
      after: '변경 후',
    },
  },
  en: {
    title: 'Audit Trail',
    description: 'Trace sensitive operations, access attempts, and business-critical changes.',
    eyebrow: 'Admin-only security console',
    metrics: {
      events: ['Audit Events', 'Recent trace window'],
      denials: ['Access Denials', '401/403 attempts'],
      approvals: ['Approval Events', 'Workflow decisions'],
    },
    sectionEyebrow: 'Sensitive operation trace',
    sectionTitle: 'Audit Event Stream',
    searchPlaceholder: 'Search audit logs',
    columns: {
      created: 'Created',
      action: 'Action',
      entity: 'Entity',
      entityId: 'Entity Id',
      user: 'User',
      ip: 'IP',
      after: 'After',
    },
  },
};

export function AuditLogsPage() {
  const { language } = useLanguage();
  const t = copy[language];
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    void endpoints.auditLogs().then(setLogs).catch(() => setLogs([]));
  }, []);

  const summary = useMemo(() => ({
    events: logs.length,
    forbidden: logs.filter((log) => log.action.includes('Forbidden') || log.action.includes('Unauthorized')).length,
    approvalEvents: logs.filter((log) => log.entityName === 'Approval').length,
  }), [logs]);

  return (
    <>
      <PageHeader title={t.title} description={t.description} eyebrow={t.eyebrow} />
      <div className="metrics three">
        <MetricCard label={t.metrics.events[0]} value={summary.events} detail={t.metrics.events[1]} tone="cyan" icon={<ShieldCheck size={18} />} />
        <MetricCard label={t.metrics.denials[0]} value={summary.forbidden} detail={t.metrics.denials[1]} tone="red" icon={<ShieldAlert size={18} />} />
        <MetricCard label={t.metrics.approvals[0]} value={summary.approvalEvents} detail={t.metrics.approvals[1]} tone="violet" icon={<LockKeyhole size={18} />} />
      </div>
      <section className="panel table-panel">
        <div className="section-title">
          <span className="eyebrow">{t.sectionEyebrow}</span>
          <h2>{t.sectionTitle}</h2>
        </div>
        <DataGrid dataSource={logs} showBorders columnAutoWidth>
          <SearchPanel visible width={280} placeholder={t.searchPlaceholder} />
          <FilterRow visible />
          <Paging defaultPageSize={15} />
          <Column dataField="createdAt" caption={t.columns.created} dataType="datetime" />
          <Column dataField="action" caption={t.columns.action} cellRender={({ value }) => <DataChip value={value} />} />
          <Column dataField="entityName" caption={t.columns.entity} cellRender={({ value }) => <DataChip value={value} />} />
          <Column dataField="entityId" caption={t.columns.entityId} />
          <Column dataField="userName" caption={t.columns.user} />
          <Column dataField="ipAddress" caption={t.columns.ip} />
          <Column dataField="afterValue" caption={t.columns.after} />
        </DataGrid>
      </section>
    </>
  );
}
