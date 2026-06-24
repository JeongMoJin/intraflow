import { BarChart3, DatabaseZap, FileClock, FileText, LayoutDashboard, ListChecks, LogOut, Settings, ShieldCheck, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { LanguageSwitch } from './components/LanguageSwitch';
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

const pages: Array<{ key: PageKey; label: LocalizedText; category: LocalizedText; description: LocalizedText; icon: ReactNode }> = [
  {
    key: 'dashboard',
    label: { ko: '운영 개요', en: 'Overview' },
    category: { ko: '전체보기', en: 'ALL' },
    description: { ko: '인트라넷 운영 상태를 한 화면에서 확인합니다.', en: 'Live intranet simulation overview' },
    icon: <LayoutDashboard size={17} />,
  },
  {
    key: 'employees',
    label: { ko: '직원 관리', en: 'People Directory' },
    category: { ko: '인사', en: 'PEOPLE' },
    description: { ko: '개인정보 마스킹과 권한별 조회를 포함한 직원 디렉터리입니다.', en: 'Directory and privacy-aware access' },
    icon: <Users size={17} />,
  },
  {
    key: 'projects',
    label: { ko: '프로젝트 운영', en: 'Project Operations' },
    category: { ko: '프로젝트', en: 'PROJECT' },
    description: { ko: '담당자, 예산, 진행 상태를 관리합니다.', en: 'Ownership, budget, and execution status' },
    icon: <BarChart3 size={17} />,
  },
  {
    key: 'approvals',
    label: { ko: '전자결재', en: 'Approval Flow' },
    category: { ko: '결재', en: 'APPROVAL' },
    description: { ko: '휴가, 지출, 예산 승인 흐름을 처리합니다.', en: 'Leave, expense, and budget decisions' },
    icon: <ListChecks size={17} />,
  },
  {
    key: 'erp',
    label: { ko: 'ERP 연계', en: 'ERP Integration' },
    category: { ko: 'ERP', en: 'ERP' },
    description: { ko: 'Mock ERP 동기화와 연계 로그를 확인합니다.', en: 'Mock ERP synchronization health' },
    icon: <DatabaseZap size={17} />,
  },
  {
    key: 'legacy',
    label: { ko: '레거시 이관', en: 'Legacy Migration' },
    category: { ko: '레거시', en: 'LEGACY' },
    description: { ko: 'CSV 이관 검증과 실패 사유를 추적합니다.', en: 'CSV migration and validation status' },
    icon: <FileClock size={17} />,
  },
  {
    key: 'audit',
    label: { ko: '감사 로그', en: 'Audit Trail' },
    category: { ko: '보안', en: 'SECURITY' },
    description: { ko: '민감한 작업과 접근 시도를 추적합니다.', en: 'Sensitive operation trace' },
    icon: <FileText size={17} />,
  },
  {
    key: 'roles',
    label: { ko: '권한 모델', en: 'Access Model' },
    category: { ko: '권한', en: 'ROLE' },
    description: { ko: '역할 기반 접근 제어 구조를 확인합니다.', en: 'Role-based authorization map' },
    icon: <Settings size={17} />,
  },
];

const shellCopy: Record<Language, {
  navigationAria: string;
  logout: string;
  heroLine: string;
  mainTitle: string;
  conceptNote: string;
  boardMeta: string;
  systemSecure: string;
  systemMode: string;
  systemAudit: string;
}> = {
  ko: {
    navigationAria: '주요 업무 메뉴',
    logout: '로그아웃',
    heroLine: '아트테크 운영을 IntraFlow에서 시작합니다',
    mainTitle: '내부 운영 시스템',
    conceptNote: "d'strict CAREER 페이지를 참고한 인트라넷 콘셉트이며 공식 브랜드 에셋은 사용하지 않았습니다.",
    boardMeta: '운영 시뮬레이션',
    systemSecure: '역할 기반 접근 제어',
    systemMode: '운영 시뮬레이션 모드',
    systemAudit: '감사 로그 준비',
  },
  en: {
    navigationAria: 'Main workspace navigation',
    logout: 'LOGOUT',
    heroLine: "LET'S OPERATE ART-TECH BUSINESS AT",
    mainTitle: 'INTERNAL OPERATIONS',
    conceptNote: "d'strict career-page inspired intranet concept without using official brand assets.",
    boardMeta: 'Production Simulation',
    systemSecure: 'Secure Role-Based Access',
    systemMode: 'Live Operations Mode',
    systemAudit: 'Audit Ready',
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
  const currentPage = pages.find((page) => page.key === safeActivePage) ?? pages[0];

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

      <section className="career-hero">
        <div className="career-hero-copy">
          <span>{t.heroLine}</span>
          <strong>IntraFlow</strong>
        </div>
      </section>

      <main className="career-main">
        <div className="job-title-block">
          <h1>{t.mainTitle}</h1>
          <p>{t.conceptNote}</p>
        </div>

        <div className="career-layout">
          <aside className="category-rail" aria-label={language === 'ko' ? '업무 카테고리' : 'Workspace categories'}>
            {availablePages.map((page) => (
              <button
                key={page.key}
                className={safeActivePage === page.key ? 'active' : ''}
                type="button"
                onClick={() => setActivePage(page.key)}
              >
                {page.category[language]}
              </button>
            ))}
          </aside>

          <section className="operations-board">
            <div className="board-heading">
              <div>
                <div className="board-title-row">
                  {currentPage.icon}
                  <h2>{currentPage.label[language]}</h2>
                </div>
                <p>{currentPage.description[language]}</p>
              </div>
              <div className="board-meta">
                <span>{t.boardMeta}</span>
                <strong>{auth.session.email}</strong>
              </div>
            </div>
            <div className="system-strip">
              <span>
                <ShieldCheck size={14} />
                {t.systemSecure}
              </span>
              <span>{t.systemMode}</span>
              <span>{t.systemAudit}</span>
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
