import { useEffect, useMemo, useState } from 'react';
import DataGrid, { Column, Paging } from 'devextreme-react/data-grid';
import { FileClock, FileWarning, UploadCloud } from 'lucide-react';
import { endpoints } from '../api/client';
import { MetricCard } from '../components/MetricCard';
import { MobileRecordList } from '../components/MobileViews';
import { Notice } from '../components/Notice';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import { useLanguage } from '../hooks/useLanguage';
import type { Language } from '../hooks/useLanguage';
import type { LegacyImportLog, LegacyImportResult } from '../types/api';
import { formatDateTime } from '../utils/format';

const copy: Record<Language, {
  title: string;
  description: string;
  eyebrow: string;
  importSample: string;
  uploadCsv: string;
  metrics: {
    failures: [string, string];
    files: [string, string];
    duplicates: [string, string];
  };
  rulesEyebrow: string;
  rulesTitle: string;
  rulesDescription: string;
  rules: string[];
  migrationStatus: string;
  failureLog: string;
  columns: Record<string, string>;
  importCompleted: (result: LegacyImportResult) => string;
  uploadCompleted: (result: LegacyImportResult) => string;
}> = {
  ko: {
    title: '레거시 이관',
    description: '레거시 인사 CSV를 가져오고 검증 결과를 추적합니다.',
    eyebrow: '점진적 고도화 경로',
    importSample: '샘플 CSV 가져오기',
    uploadCsv: 'CSV 업로드',
    metrics: {
      failures: ['실패 행', '검증 로그 항목'],
      files: ['원천 파일', '가져온 CSV 배치'],
      duplicates: ['중복 행', 'EmployeeNo 충돌'],
    },
    rulesEyebrow: '검증 규칙',
    rulesTitle: 'CSV 이관 가드레일',
    rulesDescription: '필수값, 이메일 형식, 중복 사번, 권한 정규화를 확인한 뒤 직원 레코드를 생성합니다.',
    rules: ['필수값 검증', '이메일 형식', '중복 EmployeeNo', '실패 사유 로그'],
    migrationStatus: '이관 상태',
    failureLog: '실패 사유 로그',
    columns: {
      file: '파일',
      row: '행',
      employeeNo: '사번',
      status: '상태',
      message: '메시지',
      raw: '원본',
      created: '생성일',
    },
    importCompleted: (result) => `가져오기가 완료되었습니다. 성공 ${result.successCount}건, 실패 ${result.failedCount}건`,
    uploadCompleted: (result) => `업로드가 완료되었습니다. 성공 ${result.successCount}건, 실패 ${result.failedCount}건`,
  },
  en: {
    title: 'Legacy Migration',
    description: 'Import legacy HR records and validate migration results.',
    eyebrow: 'Gradual modernization path',
    importSample: 'Import Sample CSV',
    uploadCsv: 'Upload CSV',
    metrics: {
      failures: ['Failure Rows', 'Validation log entries'],
      files: ['Source Files', 'Imported CSV batches'],
      duplicates: ['Duplicate Rows', 'EmployeeNo conflicts'],
    },
    rulesEyebrow: 'Validation rules',
    rulesTitle: 'CSV import guardrails',
    rulesDescription: 'Required fields, email format, duplicate EmployeeNo, and role normalization are checked before creating employee records.',
    rules: ['Required fields', 'Email format', 'Duplicate EmployeeNo', 'Failure reason log'],
    migrationStatus: 'Migration Status',
    failureLog: 'Failure Reason Log',
    columns: {
      file: 'File',
      row: 'Row',
      employeeNo: 'Employee No',
      status: 'Status',
      message: 'Message',
      raw: 'Raw',
      created: 'Created',
    },
    importCompleted: (result) => `Import completed. Success ${result.successCount}, Failed ${result.failedCount}`,
    uploadCompleted: (result) => `Upload completed. Success ${result.successCount}, Failed ${result.failedCount}`,
  },
};

export function LegacyImportPage() {
  const { language } = useLanguage();
  const t = copy[language];
  const emptyLogs = language === 'ko' ? '실패 로그가 없습니다.' : 'No failure logs.';
  const [logs, setLogs] = useState<LegacyImportLog[]>([]);
  const [message, setMessage] = useState('');

  async function load() {
    try {
      setLogs(await endpoints.legacyLogs());
    } catch {
      setLogs([]);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const summary = useMemo(() => ({
    failures: logs.length,
    files: new Set(logs.map((log) => log.fileName)).size,
    duplicateRows: logs.filter((log) => log.message.includes('Duplicate')).length,
  }), [logs]);

  async function importSample() {
    const result = await endpoints.importSampleCsv();
    setMessage(t.importCompleted(result));
    await load();
  }

  async function upload(file?: File) {
    if (!file) {
      return;
    }

    const result = await endpoints.uploadCsv(file);
    setMessage(t.uploadCompleted(result));
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
            <button className="primary" type="button" onClick={importSample}>{t.importSample}</button>
            <label className="file-button">
              <UploadCloud size={16} />
              {t.uploadCsv}
              <input type="file" accept=".csv" onChange={(event) => upload(event.target.files?.[0])} />
            </label>
          </>
        )}
      />
      <div className="metrics three">
        <MetricCard label={t.metrics.failures[0]} value={summary.failures} detail={t.metrics.failures[1]} tone="red" icon={<FileWarning size={18} />} />
        <MetricCard label={t.metrics.files[0]} value={summary.files} detail={t.metrics.files[1]} tone="cyan" icon={<FileClock size={18} />} />
        <MetricCard label={t.metrics.duplicates[0]} value={summary.duplicateRows} detail={t.metrics.duplicates[1]} tone="amber" />
      </div>
      <section className="panel action-card">
        <div>
          <span className="eyebrow">{t.rulesEyebrow}</span>
          <h2>{t.rulesTitle}</h2>
          <p>{t.rulesDescription}</p>
        </div>
        <div className="rule-list">
          {t.rules.map((rule) => <span key={rule}>{rule}</span>)}
        </div>
      </section>
      <Notice message={message} type="success" />
      <section className="panel table-panel">
        <div className="section-title">
          <span className="eyebrow">{t.migrationStatus}</span>
          <h2>{t.failureLog}</h2>
        </div>
        <div className="desktop-data-grid">
          <DataGrid dataSource={logs} showBorders columnAutoWidth>
            <Paging defaultPageSize={10} />
            <Column dataField="fileName" caption={t.columns.file} />
            <Column dataField="rowNumber" caption={t.columns.row} />
            <Column dataField="employeeNo" caption={t.columns.employeeNo} />
            <Column dataField="status" caption={t.columns.status} cellRender={({ value }) => <StatusBadge value={value} />} />
            <Column dataField="message" caption={t.columns.message} />
            <Column dataField="rawValue" caption={t.columns.raw} />
            <Column dataField="createdAt" caption={t.columns.created} dataType="datetime" />
          </DataGrid>
        </div>
        <div className="mobile-data-list">
          <MobileRecordList
            emptyText={emptyLogs}
            items={logs.map((log) => ({
              id: log.id,
              eyebrow: `${t.columns.row} ${log.rowNumber}`,
              title: log.message,
              description: log.rawValue,
              status: <StatusBadge value={log.status} />,
              meta: [
                { label: t.columns.file, value: log.fileName },
                { label: t.columns.employeeNo, value: log.employeeNo ?? '-' },
                { label: t.columns.created, value: formatDateTime(log.createdAt, language) },
              ],
            }))}
          />
        </div>
      </section>
    </>
  );
}
