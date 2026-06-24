import { useEffect, useMemo, useState } from 'react';
import DataGrid, { Column, FilterRow, Paging, SearchPanel } from 'devextreme-react/data-grid';
import { CheckCircle2, Clock3, XCircle } from 'lucide-react';
import { endpoints } from '../api/client';
import { MetricCard } from '../components/MetricCard';
import { MobileRecordList } from '../components/MobileViews';
import { Notice } from '../components/Notice';
import { PageHeader } from '../components/PageHeader';
import { DataChip, StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../hooks/useAuth';
import { translateApprovalType, useLanguage } from '../hooks/useLanguage';
import type { Language } from '../hooks/useLanguage';
import type { Approval } from '../types/api';
import { formatMoney } from '../utils/format';

const approvalTypes = ['Vacation', 'Expense', 'ProjectBudget'];

const copy: Record<Language, {
  title: string;
  description: string;
  eyebrow: string;
  metrics: {
    pending: [string, string];
    approved: [string, string];
    rejected: [string, string];
  };
  formEyebrow: string;
  formTitle: string;
  placeholders: Record<string, string>;
  request: string;
  sectionEyebrow: string;
  sectionTitle: string;
  searchPlaceholder: string;
  columns: Record<string, string>;
  buttons: Record<string, string>;
  closed: string;
  rejectPrompt: string;
  rejectDefault: string;
  noReason: string;
  messages: Record<string, string>;
}> = {
  ko: {
    title: '전자결재',
    description: '휴가 신청, 지출결의서, 프로젝트 예산 승인 요청을 처리합니다.',
    eyebrow: '업무 핵심 워크플로우',
    metrics: {
      pending: ['대기', '승인 필요'],
      approved: ['승인', '완료된 요청'],
      rejected: ['반려', '반려된 요청'],
    },
    formEyebrow: '결재 요청',
    formTitle: '새 결재 문서',
    placeholders: {
      title: '제목',
      amount: '금액',
      content: '내용',
    },
    request: '요청',
    sectionEyebrow: '결재 대기열',
    sectionTitle: '결재 기록',
    searchPlaceholder: '결재 검색',
    columns: {
      no: '번호',
      title: '제목',
      type: '유형',
      requester: '요청자',
      approver: '승인자',
      amount: '금액',
      status: '상태',
      decision: '처리',
    },
    buttons: {
      approve: '승인',
      reject: '반려',
    },
    closed: '종료',
    rejectPrompt: '반려 사유를 입력하세요.',
    rejectDefault: '추가 근거가 필요합니다.',
    noReason: '사유 없음',
    messages: {
      created: '결재 요청이 생성되었고 감사 로그가 기록되었습니다.',
      createFailed: '결재 요청에 실패했습니다. 요청자/승인자 seed 데이터를 확인해 주세요.',
      approved: '결재가 승인되었습니다. 결정 내역이 감사 로그에 기록되었습니다.',
      rejected: '결재가 반려되었습니다. 결정 내역이 감사 로그에 기록되었습니다.',
    },
  },
  en: {
    title: 'Approval Flow',
    description: 'Review leave requests, expense approvals, and project budget decisions.',
    eyebrow: 'Business-critical workflow',
    metrics: {
      pending: ['Pending', 'Needs decision'],
      approved: ['Approved', 'Completed requests'],
      rejected: ['Rejected', 'Returned requests'],
    },
    formEyebrow: 'Create Request',
    formTitle: 'New approval package',
    placeholders: {
      title: 'Title',
      amount: 'Amount',
      content: 'Content',
    },
    request: 'Request',
    sectionEyebrow: 'Decision queue',
    sectionTitle: 'Approval Records',
    searchPlaceholder: 'Search approvals',
    columns: {
      no: 'No',
      title: 'Title',
      type: 'Type',
      requester: 'Requester',
      approver: 'Approver',
      amount: 'Amount',
      status: 'Status',
      decision: 'Decision',
    },
    buttons: {
      approve: 'Approve',
      reject: 'Reject',
    },
    closed: 'Closed',
    rejectPrompt: 'Enter rejection reason.',
    rejectDefault: 'Needs additional evidence',
    noReason: 'No reason provided',
    messages: {
      created: 'Approval request created and audit log recorded.',
      createFailed: 'Approval request failed. Check requester/approver seed data.',
      approved: 'Approval accepted. Decision was written to Audit Trail.',
      rejected: 'Approval rejected. Decision was written to Audit Trail.',
    },
  },
};

export function ApprovalsPage() {
  const auth = useAuth();
  const { language } = useLanguage();
  const t = copy[language];
  const emptyApprovals = language === 'ko' ? '결재 데이터가 없습니다.' : 'No approval records.';
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [form, setForm] = useState({ title: '', type: 'Vacation', amount: 0, content: '' });

  async function load() {
    try {
      setApprovals(await endpoints.approvals());
    } catch {
      setApprovals([]);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const summary = useMemo(() => ({
    pending: approvals.filter((approval) => approval.status === 'Pending').length,
    approved: approvals.filter((approval) => approval.status === 'Approved').length,
    rejected: approvals.filter((approval) => approval.status === 'Rejected').length,
  }), [approvals]);

  async function create() {
    try {
      await endpoints.createApproval({ ...form, amount: Number(form.amount) });
      setForm({ title: '', type: 'Vacation', amount: 0, content: '' });
      setMessage(t.messages.created);
      setMessageType('success');
      await load();
    } catch {
      setMessage(t.messages.createFailed);
      setMessageType('error');
    }
  }

  async function approve(id: number) {
    await endpoints.approve(id);
    setMessage(t.messages.approved);
    setMessageType('success');
    await load();
  }

  async function reject(id: number) {
    const reason = window.prompt(t.rejectPrompt, t.rejectDefault) ?? t.noReason;
    await endpoints.reject(id, reason);
    setMessage(t.messages.rejected);
    setMessageType('success');
    await load();
  }

  const canApprove = auth.role === 'Admin' || auth.role === 'Manager';

  return (
    <>
      <PageHeader title={t.title} description={t.description} eyebrow={t.eyebrow} />
      <div className="metrics three">
        <MetricCard label={t.metrics.pending[0]} value={summary.pending} detail={t.metrics.pending[1]} tone="amber" icon={<Clock3 size={18} />} />
        <MetricCard label={t.metrics.approved[0]} value={summary.approved} detail={t.metrics.approved[1]} tone="green" icon={<CheckCircle2 size={18} />} />
        <MetricCard label={t.metrics.rejected[0]} value={summary.rejected} detail={t.metrics.rejected[1]} tone="red" icon={<XCircle size={18} />} />
      </div>
      <Notice message={message} type={messageType} />
      <section className="panel form-panel approval-form elevated-form">
        <div className="form-intro">
          <span className="eyebrow">{t.formEyebrow}</span>
          <strong>{t.formTitle}</strong>
        </div>
        <input placeholder={t.placeholders.title} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
        <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>
          {approvalTypes.map((type) => <option key={type} value={type}>{translateApprovalType(type, language)}</option>)}
        </select>
        <input placeholder={t.placeholders.amount} type="number" value={form.amount} onChange={(event) => setForm({ ...form, amount: Number(event.target.value) })} />
        <input placeholder={t.placeholders.content} value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} />
        <button className="primary" type="button" onClick={create}>{t.request}</button>
      </section>
      <section className="panel table-panel">
        <div className="section-title">
          <span className="eyebrow">{t.sectionEyebrow}</span>
          <h2>{t.sectionTitle}</h2>
        </div>
        <div className="desktop-data-grid">
          <DataGrid dataSource={approvals} showBorders columnAutoWidth>
            <SearchPanel visible width={280} placeholder={t.searchPlaceholder} />
            <FilterRow visible />
            <Paging defaultPageSize={10} />
            <Column dataField="approvalNo" caption={t.columns.no} />
            <Column dataField="title" caption={t.columns.title} />
            <Column dataField="type" caption={t.columns.type} cellRender={({ value }) => <DataChip value={translateApprovalType(value, language)} />} />
            <Column dataField="requesterName" caption={t.columns.requester} />
            <Column dataField="approverName" caption={t.columns.approver} />
            <Column dataField="amount" caption={t.columns.amount} dataType="number" format="#,##0" />
            <Column dataField="status" caption={t.columns.status} cellRender={({ value }) => <StatusBadge value={value} />} />
            {canApprove ? (
              <Column
                caption={t.columns.decision}
                cellRender={({ data }) => {
                  const approval = data as Approval;
                  if (approval.status !== 'Pending') {
                    return <span className="muted">{t.closed}</span>;
                  }
                  return (
                    <div className="row-actions">
                      <button className="ghost-button" type="button" onClick={() => approve(approval.id)}>{t.buttons.approve}</button>
                      <button className="danger-button" type="button" onClick={() => reject(approval.id)}>{t.buttons.reject}</button>
                    </div>
                  );
                }}
              />
            ) : null}
          </DataGrid>
        </div>
        <div className="mobile-data-list">
          <MobileRecordList
            emptyText={emptyApprovals}
            items={approvals.map((approval) => ({
              id: approval.id,
              eyebrow: approval.approvalNo,
              title: approval.title,
              status: <StatusBadge value={approval.status} />,
              meta: [
                { label: t.columns.type, value: <DataChip value={translateApprovalType(approval.type, language)} /> },
                { label: t.columns.requester, value: approval.requesterName ?? '-' },
                { label: t.columns.approver, value: approval.approverName ?? '-' },
                { label: t.columns.amount, value: formatMoney(approval.amount, language) },
              ],
              actions: canApprove && approval.status === 'Pending' ? (
                <>
                  <button className="ghost-button" type="button" onClick={() => approve(approval.id)}>{t.buttons.approve}</button>
                  <button className="danger-button" type="button" onClick={() => reject(approval.id)}>{t.buttons.reject}</button>
                </>
              ) : undefined,
            }))}
          />
        </div>
      </section>
    </>
  );
}
