import { LogOut, ShieldCheck } from 'lucide-react';
import { useMemo, useState } from 'react';
import { LanguageSwitch } from './components/LanguageSwitch';
import heroImage from './assets/hero.png';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { LanguageProvider, translateRole, useLanguage } from './hooks/useLanguage';
import type { Language } from './hooks/useLanguage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { EmployeesPage } from './pages/EmployeesPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ApprovalsPage } from './pages/ApprovalsPage';
import { ErpSyncPage } from './pages/ErpSyncPage';
import { LegacyImportPage } from './pages/LegacyImportPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { RoleGuidePage } from './pages/RoleGuidePage';

type PageKey = 'dashboard' | 'employees' | 'projects' | 'approvals' | 'erp' | 'legacy' | 'audit' | 'roles';
type LocalizedText = Record<Language, string>;

const pages: Array<{ key: PageKey; label: LocalizedText }> = [
  {
    key: 'dashboard',
    label: { ko: '운영 개요', en: 'Overview' },
  },
  {
    key: 'employees',
    label: { ko: '직원 관리', en: 'People Directory' },
  },
  {
    key: 'projects',
    label: { ko: '프로젝트 운영', en: 'Project Operations' },
  },
  {
    key: 'approvals',
    label: { ko: '전자결재', en: 'Approval Flow' },
  },
  {
    key: 'erp',
    label: { ko: 'ERP 연계', en: 'ERP Integration' },
  },
  {
    key: 'legacy',
    label: { ko: '레거시 이관', en: 'Legacy Migration' },
  },
  {
    key: 'audit',
    label: { ko: '감사 로그', en: 'Audit Trail' },
  },
  {
    key: 'roles',
    label: { ko: '권한 모델', en: 'Access Model' },
  },
];

const shellCopy: Record<Language, {
  navigationAria: string;
  logout: string;
  bannerEyebrow: string;
  bannerTitle: string;
  bannerDescription: string;
  systemSecure: string;
  systemMode: string;
}> = {
  ko: {
    navigationAria: '주요 업무 메뉴',
    logout: '로그아웃',
    bannerEyebrow: 'IntraFlow operations console',
    bannerTitle: '운영 흐름을 한눈에 조율합니다',
    bannerDescription: '프로젝트, 결재, ERP, 이관, 감사 로그를 하나의 관리자 콘솔로 연결합니다.',
    systemSecure: '역할 기반 접근 제어',
    systemMode: '운영 시뮬레이션 모드',
  },
  en: {
    navigationAria: 'Main workspace navigation',
    logout: 'LOGOUT',
    bannerEyebrow: 'IntraFlow operations console',
    bannerTitle: 'Coordinate every internal workflow from one view',
    bannerDescription: 'Projects, approvals, ERP sync, migration, and audit logs stay connected in a single admin console.',
    systemSecure: 'Secure Role-Based Access',
    systemMode: 'Live Operations Mode',
  },
};

function Shell() {
  const auth = useAuth();
  const { language } = useLanguage();
  const t = shellCopy[language];
  const availablePages = useMemo(() => pages.filter((page) => auth.canAccess(page.key)), [auth]);
  const [activePage, setActivePage] = useState<PageKey>('dashboard');

  if (!auth.session) {
    return <LoginPage />;
  }

  const safeActivePage = auth.canAccess(activePage) ? activePage : availablePages[0]?.key ?? 'roles';

  return (
    <div className="site-shell">
      <header className="global-header">
        <button className="wordmark" type="button" onClick={() => setActivePage(availablePages[0]?.key ?? 'roles')}>IntraFlow</button>
        <nav className="global-nav" aria-label={t.navigationAria}>
          {availablePages.map((page) => (
            <button
              key={page.key}
              className={safeActivePage === page.key ? 'active' : ''}
              type="button"
              onClick={() => setActivePage(page.key)}
            >
              {page.label[language].replace(' ', '\u00a0')}
            </button>
          ))}
        </nav>
        <div className="header-user">
          <span>{translateRole(auth.session.role, language)}</span>
          <LanguageSwitch />
          <button className="logout-link" type="button" onClick={auth.logout}>
            <LogOut size={15} />
            {t.logout}
          </button>
        </div>
      </header>

      <section className="console-banner" aria-label={t.bannerEyebrow}>
        <div className="console-banner-copy">
          <span>{t.bannerEyebrow}</span>
          <strong>{t.bannerTitle}</strong>
          <p>{t.bannerDescription}</p>
        </div>
        <div className="console-banner-visual" aria-hidden="true">
          <img src={heroImage} alt="" />
        </div>
      </section>

      <main className="career-main console-main">
        <div className="career-layout">
          <section className="operations-board">
            <div className="system-strip">
              <span>
                <ShieldCheck size={14} />
                {t.systemSecure}
              </span>
              <span>{t.systemMode}</span>
              <span>{auth.session.email}</span>
            </div>
            <div className="content">{renderPage(safeActivePage)}</div>
          </section>
        </div>
      </main>
    </div>
  );
}

function renderPage(page: PageKey) {
  switch (page) {
    case 'dashboard':
      return <DashboardPage />;
    case 'employees':
      return <EmployeesPage />;
    case 'projects':
      return <ProjectsPage />;
    case 'approvals':
      return <ApprovalsPage />;
    case 'erp':
      return <ErpSyncPage />;
    case 'legacy':
      return <LegacyImportPage />;
    case 'audit':
      return <AuditLogsPage />;
    case 'roles':
      return <RoleGuidePage />;
  }
}

export function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Shell />
      </AuthProvider>
    </LanguageProvider>
  );
}
