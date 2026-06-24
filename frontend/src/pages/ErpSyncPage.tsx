import { useEffect, useMemo, useState } from 'react';
import DataGrid, { Column, Paging } from 'devextreme-react/data-grid';
import { DatabaseZap, RadioTower, ShieldAlert } from 'lucide-react';
import { endpoints } from '../api/client';
import { MetricCard } from '../components/MetricCard';
import { MobileRecordList } from '../components/MobileViews';
import { Notice } from '../components/Notice';
import { PageHeader } from '../components/PageHeader';
import { DataChip, StatusBadge } from '../components/StatusBadge';
import { translateStatus, useLanguage } from '../hooks/useLanguage';
import type { Language } from '../hooks/useLanguage';
import type { ErpSyncLog, ExternalErpRecord } from '../types/api';
import { formatDateTime } from '../utils/format';

const copy: Record<Language, {
  title: string;
  description: string;
  eyebrow: string;
  runSync: string;
  simulateFailure: string;
  metrics: {
    last: [string, string];
    success: [string, string];
    failed: [string, string];
    records: [string, string];
  };
  ready: string;
  noSync: string;
  erpHealth: string;
  syncLogs: string;
  externalSource: string;
  synchronizedRecords: string;
  columns: Record<string, string>;
}> = {
  ko: {
    title: 'ERP 연계',
    description: 'Mock ERP 동기화를 실행하고 연계 상태와 로그를 확인합니다.',
    eyebrow: '외부 시스템 연계',
    runSync: '동기화 실행',
    simulateFailure: '실패 시뮬레이션',
    metrics: {
      last: ['최근 동기화 상태', '아직 동기화가 실행되지 않았습니다'],
      success: ['성공 실행', '완료된 동기화 작업'],
      failed: ['실패 실행', '재시도 전략 필요'],
      records: ['외부 레코드', 'MockERP 원천 데이터'],
    },
    ready: '준비됨',
    noSync: '아직 동기화가 실행되지 않았습니다',
    erpHealth: 'ERP 연계 상태',
    syncLogs: '동기화 로그',
    externalSource: '외부 원천: MockERP',
    synchronizedRecords: '동기화된 레코드',
    columns: {
      status: '상태',
      imported: '성공',
      failed: '실패',
      message: '메시지',
      triggeredBy: '실행자',
      started: '시작일',
      system: '시스템',
      externalId: '외부 ID',
      entity: '대상',
      payload: '페이로드',
      synced: '동기화일',
    },
  },
  en: {
    title: 'ERP Integration',
    description: 'Simulate ERP synchronization and monitor integration health.',
    eyebrow: 'External system operations',
    runSync: 'Run Sync',
    simulateFailure: 'Simulate Failure',
    metrics: {
      last: ['Last Sync Status', 'No sync executed yet'],
      success: ['Success Runs', 'Completed sync jobs'],
      failed: ['Failed Runs', 'Needs retry strategy'],
      records: ['External Records', 'MockERP source payloads'],
    },
    ready: 'Ready',
    noSync: 'No sync executed yet',
    erpHealth: 'ERP Integration Health',
    syncLogs: 'Sync Logs',
    externalSource: 'External Source: MockERP',
    synchronizedRecords: 'Synchronized Records',
    columns: {
      status: 'Status',
      imported: 'Imported',
      failed: 'Failed',
      message: 'Message',
      triggeredBy: 'Triggered By',
      started: 'Started',
      system: 'System',
      externalId: 'External Id',
      entity: 'Entity',
      payload: 'Payload',
      synced: 'Synced',
    },
  },
};

export function ErpSyncPage() {
  const { language } = useLanguage();
  const t = copy[language];
  const emptyLogs = language === 'ko' ? '동기화 로그가 없습니다.' : 'No sync logs.';
  const emptyRecords = language === 'ko' ? '동기화된 레코드가 없습니다.' : 'No synchronized records.';
  const [logs, setLogs] = useState<ErpSyncLog[]>([]);
  const [records, setRecords] = useState<ExternalErpRecord[]>([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  async function load() {
    try {
      const [nextLogs, nextRecords] = await Promise.all([endpoints.erpLogs(), endpoints.erpRecords()]);
      setLogs(nextLogs);
      setRecords(nextRecords);
    } catch {
      setLogs([]);
      setRecords([]);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const summary = useMemo(() => {
    const last = logs[0];
    const success = logs.filter((log) => log.status === 'Succeeded').length;
    const failed = logs.filter((log) => log.status === 'Failed').length;
    return { last, success, failed };
  }, [logs]);

  async function run(forceFailure: boolean) {
    const result = await endpoints.runErpSync(forceFailure);
    setMessage(`${translateStatus(result.status, language)}: ${result.message}`);
    setMessageType(result.status === 'Failed' ? 'error' : 'success');
    await load();
  }

  return (
    <>
      <PageHeader
        title={t.title}
        description={t.description}
        eyebrow={t.eyebrow}
        actions={(
          <>
            <button className="primary" type="button" onClick={() => run(false)}>{t.runSync}</button>
            <button className="ghost-button" type="button" onClick={() => run(true)}>{t.simulateFailure}</button>
          </>
        )}
      />
      <div className="metrics four">
        <MetricCard label={t.metrics.last[0]} value={translateStatus(summary.last?.status ?? t.ready, language)} detail={summary.last?.message ?? t.noSync} tone={summary.last?.status === 'Failed' ? 'red' : 'green'} icon={<DatabaseZap size={18} />} />
        <MetricCard label={t.metrics.success[0]} value={summary.success} detail={t.metrics.success[1]} tone="cyan" icon={<RadioTower size={18} />} />
        <MetricCard label={t.metrics.failed[0]} value={summary.failed} detail={t.metrics.failed[1]} tone="red" icon={<ShieldAlert size={18} />} />
        <MetricCard label={t.metrics.records[0]} value={records.length} detail={t.metrics.records[1]} tone="violet" />
      </div>
      <Notice message={message} type={messageType} />
      <section className="panel table-panel">
        <div className="section-title">
          <span className="eyebrow">{t.erpHealth}</span>
          <h2>{t.syncLogs}</h2>
        </div>
        <div className="desktop-data-grid">
          <DataGrid dataSource={logs} showBorders columnAutoWidth>
            <Paging defaultPageSize={8} />
            <Column dataField="status" caption={t.columns.status} cellRender={({ value }) => <StatusBadge value={value} />} />
            <Column dataField="importedCount" caption={t.columns.imported} />
            <Column dataField="failedCount" caption={t.columns.failed} />
            <Column dataField="message" caption={t.columns.message} />
            <Column dataField="triggeredBy" caption={t.columns.triggeredBy} />
            <Column dataField="startedAt" caption={t.columns.started} dataType="datetime" />
          </DataGrid>
        </div>
        <div className="mobile-data-list">
          <MobileRecordList
            emptyText={emptyLogs}
            items={logs.map((log) => ({
              id: log.id,
              title: log.message,
              status: <StatusBadge value={log.status} />,
              meta: [
                { label: t.columns.imported, value: log.importedCount },
                { label: t.columns.failed, value: log.failedCount },
                { label: t.columns.triggeredBy, value: log.triggeredBy },
                { label: t.columns.started, value: formatDateTime(log.startedAt, language) },
              ],
            }))}
          />
        </div>
      </section>
      <section className="panel table-panel">
        <div className="section-title">
          <span className="eyebrow">{t.externalSource}</span>
          <h2>{t.synchronizedRecords}</h2>
        </div>
        <div className="desktop-data-grid">
          <DataGrid dataSource={records} showBorders columnAutoWidth>
            <Paging defaultPageSize={8} />
            <Column dataField="externalSystem" caption={t.columns.system} cellRender={({ value }) => <DataChip value={value} />} />
            <Column dataField="externalId" caption={t.columns.externalId} />
            <Column dataField="entityName" caption={t.columns.entity} />
            <Column dataField="payloadJson" caption={t.columns.payload} />
            <Column dataField="syncedAt" caption={t.columns.synced} dataType="datetime" />
          </DataGrid>
        </div>
        <div className="mobile-data-list">
          <MobileRecordList
            emptyText={emptyRecords}
            items={records.map((record) => ({
              id: record.id,
              eyebrow: <DataChip value={record.externalSystem} />,
              title: record.entityName,
              description: record.payloadJson,
              meta: [
                { label: t.columns.externalId, value: record.externalId },
                { label: t.columns.synced, value: formatDateTime(record.syncedAt, language) },
              ],
            }))}
          />
        </div>
      </section>
    </>
  );
}
