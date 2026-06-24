import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import DataGrid, { Column, Paging } from 'devextreme-react/data-grid';
import { Shield, ShieldCheck, UserCheck } from 'lucide-react';
import { endpoints } from '../api/client';
import { MobileRecordList } from '../components/MobileViews';
import { PageHeader } from '../components/PageHeader';
import { RoleBadge } from '../components/StatusBadge';
import { translateMenuName, useLanguage } from '../hooks/useLanguage';
import type { Language } from '../hooks/useLanguage';
import type { GraphUser, Role, RoleGuide } from '../types/api';

const roleIcons: Record<Role, ReactNode> = {
  Admin: <ShieldCheck size={20} />,
  Manager: <Shield size={20} />,
  Employee: <UserCheck size={20} />,
};

const copy: Record<Language, {
  title: string;
  description: string;
  eyebrow: string;
  allowedMenus: string;
  restrictedAreas: string;
  noRestriction: string;
  graphEyebrow: string;
  graphTitle: string;
  graphDescription: string;
  graphRestricted: string;
  columns: Record<string, string>;
  workspace: Record<Role, string>;
  notes: Record<Role, string>;
}> = {
  ko: {
    title: '권한 모델',
    description: '운영 인트라넷을 위한 역할 기반 접근 제어 모델입니다.',
    eyebrow: '면접 설명용 권한 맵',
    allowedMenus: '허용 메뉴',
    restrictedAreas: '제한 영역',
    noRestriction: '데모 제한 없음',
    graphEyebrow: 'Microsoft Graph Mock',
    graphTitle: '조직 사용자',
    graphDescription: '실제 시크릿 없이 Entra ID와 Microsoft Graph 확장 지점을 보여주는 Mock 데이터입니다.',
    graphRestricted: '현재 권한에서는 Graph Users API 접근이 제한됩니다.',
    columns: {
      displayName: '표시 이름',
      mail: '메일',
      department: '부서',
      jobTitle: '직책',
    },
    workspace: {
      Admin: '관리자 워크스페이스',
      Manager: '매니저 워크스페이스',
      Employee: '직원 워크스페이스',
    },
    notes: {
      Admin: '전체 운영 기능과 보안 로그를 관리합니다. ERP 동기화, 레거시 이관, 감사 로그 조회 권한을 포함합니다.',
      Manager: '프로젝트와 결재 중심의 운영 기능을 사용합니다. 민감한 연계/감사 영역은 제한됩니다.',
      Employee: '프로젝트 조회와 본인 결재 요청에 집중합니다. 인사/ERP/감사 로그 접근은 제한됩니다.',
    },
  },
  en: {
    title: 'Access Model',
    description: 'Role-based access model for production intranet operations.',
    eyebrow: 'Interview-ready authorization map',
    allowedMenus: 'Allowed menus',
    restrictedAreas: 'Restricted areas',
    noRestriction: 'No demo restriction',
    graphEyebrow: 'Microsoft Graph Mock',
    graphTitle: 'Organization Users',
    graphDescription: 'Mock data shows the extension point for Entra ID and Microsoft Graph without real secrets.',
    graphRestricted: 'Graph Users API is restricted for this role.',
    columns: {
      displayName: 'Display Name',
      mail: 'Mail',
      department: 'Department',
      jobTitle: 'Job Title',
    },
    workspace: {
      Admin: 'Admin Workspace',
      Manager: 'Manager Workspace',
      Employee: 'Employee Workspace',
    },
    notes: {
      Admin: 'Full operations access including ERP sync, legacy migration, audit logs, and security-sensitive administration.',
      Manager: 'Project and approval-oriented access with restricted integration and audit areas.',
      Employee: 'Focused access for project visibility and personal approval requests, with HR, ERP, and audit areas restricted.',
    },
  },
};

export function RoleGuidePage() {
  const { language } = useLanguage();
  const t = copy[language];
  const [roles, setRoles] = useState<RoleGuide[]>([]);
  const [graphUsers, setGraphUsers] = useState<GraphUser[]>([]);

  useEffect(() => {
    void endpoints.roleGuide().then(setRoles).catch(() => setRoles([]));
    void endpoints.graphUsers().then(setGraphUsers).catch(() => setGraphUsers([]));
  }, []);

  return (
    <>
      <PageHeader title={t.title} description={t.description} eyebrow={t.eyebrow} />
      <div className="role-card-grid">
        {roles.map((role) => (
          <section className="role-card" key={role.role}>
            <div className="role-card-head">
              <div className="metric-icon">{roleIcons[role.role]}</div>
              <RoleBadge role={role.role} />
            </div>
            <h2>{t.workspace[role.role]}</h2>
            <p>{t.notes[role.role]}</p>
            <div className="role-section">
              <span className="eyebrow">{t.allowedMenus}</span>
              <div className="chip-list">{role.allowedMenus.map((menu) => <span key={menu}>{translateMenuName(menu, language)}</span>)}</div>
            </div>
            <div className="role-section">
              <span className="eyebrow">{t.restrictedAreas}</span>
              <div className="chip-list muted-list">{role.restrictedAreas.length ? role.restrictedAreas.map((area) => <span key={area}>{translateMenuName(area, language)}</span>) : <span>{t.noRestriction}</span>}</div>
            </div>
          </section>
        ))}
      </div>
      <section className="panel table-panel">
        <div className="section-title">
          <span className="eyebrow">{t.graphEyebrow}</span>
          <h2>{t.graphTitle}</h2>
          <p>{t.graphDescription}</p>
        </div>
        <div className="desktop-data-grid">
          <DataGrid dataSource={graphUsers} showBorders columnAutoWidth noDataText={t.graphRestricted}>
            <Paging defaultPageSize={5} />
            <Column dataField="displayName" caption={t.columns.displayName} />
            <Column dataField="mail" caption={t.columns.mail} />
            <Column dataField="department" caption={t.columns.department} />
            <Column dataField="jobTitle" caption={t.columns.jobTitle} />
          </DataGrid>
        </div>
        <div className="mobile-data-list">
          <MobileRecordList
            emptyText={t.graphRestricted}
            items={graphUsers.map((user) => ({
              id: user.id,
              eyebrow: user.department,
              title: user.displayName,
              description: user.mail,
              meta: [
                { label: t.columns.jobTitle, value: user.jobTitle },
                { label: t.columns.department, value: user.department },
              ],
            }))}
          />
        </div>
      </section>
    </>
  );
}
