import { useState } from 'react';
import { ArrowRight, KeyRound } from 'lucide-react';
import { LanguageSwitch } from '../components/LanguageSwitch';
import { Notice } from '../components/Notice';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import type { Language } from '../hooks/useLanguage';
import type { Role } from '../types/api';

const quickRoles: Array<{ role: Role; label: Record<Language, string>; description: Record<Language, string> }> = [
  {
    role: 'Admin',
    label: { ko: '관리자 콘솔', en: 'ADMIN CONSOLE' },
    description: { ko: 'ERP, 이관, 감사 로그, 전체 운영', en: 'ERP, migration, audit trail, and full operations' },
  },
  {
    role: 'Manager',
    label: { ko: '매니저 워크스페이스', en: 'MANAGER WORKSPACE' },
    description: { ko: '프로젝트 운영과 결재 승인', en: 'Project operations and approval decisions' },
  },
  {
    role: 'Employee',
    label: { ko: '직원 포털', en: 'EMPLOYEE PORTAL' },
    description: { ko: '프로젝트 조회와 본인 결재 요청', en: 'Project visibility and personal approvals' },
  },
];

const loginCopy: Record<Language, {
  nav: string[];
  navAria: string;
  activeNav: string;
  portfolio: string;
  heroLine: string;
  title: string;
  description: string;
  positionLabel: string;
  position: string;
  modeLabel: string;
  mode: string;
  loginLabel: string;
  emailLabel: string;
  passwordLabel: string;
  submit: string;
  secureNote: string;
  loginFailed: string;
  quickLoginFailed: (role: Role) => string;
}> = {
  ko: {
    nav: ['홈', '소개', '운영', 'ERP', '보안'],
    navAria: '포트폴리오 섹션 메뉴',
    activeNav: '접속',
    portfolio: '→ 포트폴리오',
    heroLine: '인트라넷 운영 여정을 시작합니다',
    title: '접속 포지션',
    description: '프로젝트, 전자결재, ERP 연계, 레거시 이관, 감사 로그를 포함한 사내 인트라넷 포트폴리오입니다.',
    positionLabel: '포지션',
    position: 'INTRANET SYSTEM DEVELOPER / 인트라넷 시스템 개발자',
    modeLabel: '모드',
    mode: '운영 시뮬레이션 · 역할 기반 접근 제어 · 감사 로그 준비',
    loginLabel: '로그인',
    emailLabel: '이메일',
    passwordLabel: '비밀번호',
    submit: '입장하기',
    secureNote: '개발용 JWT 로그인입니다. 실제 Entra ID SSO 확장 흐름은 문서화했으며 실제 시크릿은 사용하지 않습니다.',
    loginFailed: '로그인에 실패했습니다. 백엔드 서버와 데모 계정을 확인해 주세요.',
    quickLoginFailed: (role) => `${role} 빠른 로그인이 실패했습니다. 백엔드 API 실행 상태를 확인해 주세요.`,
  },
  en: {
    nav: ['HOME', 'ABOUT', 'OPERATIONS', 'ERP', 'SECURITY'],
    navAria: 'Portfolio section navigation',
    activeNav: 'ACCESS',
    portfolio: '→ PORTFOLIO',
    heroLine: "LET'S HAVE A GREAT JOURNEY AT",
    title: 'ACCESS POSITION',
    description: 'Production-ready intranet concept for project, approval, ERP integration, legacy migration, and audit operations.',
    positionLabel: 'POSITION',
    position: 'INTRANET SYSTEM DEVELOPER / 인트라넷 시스템 개발자',
    modeLabel: 'MODE',
    mode: 'Production Simulation · Secure Role-Based Access · Audit Ready',
    loginLabel: 'LOGIN',
    emailLabel: 'Email',
    passwordLabel: 'Password',
    submit: 'ENTER',
    secureNote: 'Demo JWT login. Real Entra ID SSO path is documented; no real secrets are used.',
    loginFailed: 'Login failed. Check the backend server and demo credentials.',
    quickLoginFailed: (role) => `${role} quick login failed. Confirm the backend API is running.`,
  },
};

export function LoginPage() {
  const auth = useAuth();
  const { language } = useLanguage();
  const t = loginCopy[language];
  const [email, setEmail] = useState('admin@intraflow.local');
  const [password, setPassword] = useState('Admin123!');
  const [message, setMessage] = useState('');

  async function submit() {
    try {
      setMessage('');
      await auth.login(email, password);
    } catch {
      setMessage(t.loginFailed);
    }
  }

  async function devLogin(role: Role) {
    try {
      setMessage('');
      await auth.devLogin(role);
    } catch {
      setMessage(t.quickLoginFailed(role));
    }
  }

  return (
    <div className="site-shell login-site">
      <header className="global-header">
        <div className="wordmark static">IntraFlow</div>
        <nav className="global-nav" aria-label={t.navAria}>
          {t.nav.map((item) => <span key={item}>{item}</span>)}
          <span className="active-text">{t.activeNav}</span>
        </nav>
        <div className="header-user">
          <LanguageSwitch />
          <span>{t.portfolio}</span>
        </div>
      </header>

      <section className="career-hero login-reference-hero">
        <div className="career-hero-copy">
          <span>{t.heroLine}</span>
          <strong>IntraFlow</strong>
        </div>
      </section>

      <main className="career-main login-main">
        <div className="job-title-block">
          <h1>{t.title}</h1>
          <p>{t.description}</p>
        </div>

        <div className="login-career-layout">
          <aside className="category-rail login-roles">
            {quickRoles.map((item) => (
              <button key={item.role} type="button" onClick={() => devLogin(item.role)}>
                <strong>{item.label[language]}</strong>
                <small>{item.description[language]}</small>
              </button>
            ))}
          </aside>

          <section className="login-position-card">
            <div className="position-row first">
              <span>{t.positionLabel}</span>
              <strong>{t.position}</strong>
            </div>
            <div className="position-row">
              <span>{t.modeLabel}</span>
              <p>{t.mode}</p>
            </div>
            <div className="position-row form-row">
              <span>{t.loginLabel}</span>
              <div className="login-form-grid">
                <input aria-label={t.emailLabel} value={email} onChange={(event) => setEmail(event.target.value)} />
                <input aria-label={t.passwordLabel} type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
                <button className="apply-button" type="button" onClick={submit}>
                  {t.submit}
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
            <div className="secure-note">
              <KeyRound size={15} />
              <span>{t.secureNote}</span>
            </div>
            <Notice message={message} type="error" />
          </section>
        </div>
      </main>
    </div>
  );
}
