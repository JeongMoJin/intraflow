import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Role } from '../types/api';

export type Language = 'ko' | 'en';

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);
const storageKey = 'intraflow.language';

function getInitialLanguage(): Language {
  const stored = localStorage.getItem(storageKey);
  return stored === 'en' ? 'en' : 'ko';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(getInitialLanguage);

  useEffect(() => {
    localStorage.setItem(storageKey, language);
    document.documentElement.lang = language === 'ko' ? 'ko' : 'en';
  }, [language]);

  const value = useMemo<LanguageContextValue>(() => ({ language, setLanguage }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const value = useContext(LanguageContext);
  if (!value) {
    throw new Error('useLanguage must be used inside LanguageProvider');
  }

  return value;
}

export function translateRole(role: Role | string | undefined, language: Language) {
  if (language === 'en') {
    return role ?? 'Employee';
  }

  const labels: Record<string, string> = {
    Admin: '관리자',
    Manager: '매니저',
    Employee: '직원',
  };

  return labels[role ?? 'Employee'] ?? role ?? '직원';
}

export function translateStatus(value: string | boolean | undefined, language: Language) {
  const raw = typeof value === 'boolean' ? (value ? 'Active' : 'Inactive') : value ?? '-';

  if (language === 'en') {
    return raw;
  }

  const labels: Record<string, string> = {
    Active: '활성',
    Inactive: '비활성',
    Pending: '대기',
    Approved: '승인',
    Rejected: '반려',
    Planned: '계획',
    InProgress: '진행 중',
    Completed: '완료',
    OnHold: '보류',
    Succeeded: '성공',
    Failed: '실패',
    Ready: '준비됨',
    'No Data': '데이터 없음',
  };

  return labels[raw] ?? raw;
}

export function translateApprovalType(value: string | undefined, language: Language) {
  if (language === 'en') {
    return value ?? '-';
  }

  const labels: Record<string, string> = {
    Vacation: '휴가 신청',
    Expense: '지출결의서',
    ProjectBudget: '프로젝트 예산 승인',
  };

  return labels[value ?? ''] ?? value ?? '-';
}

export function translateMenuName(value: string, language: Language) {
  if (language === 'en') {
    return value;
  }

  const labels: Record<string, string> = {
    Dashboard: '대시보드',
    Employees: '직원 관리',
    Projects: '프로젝트',
    Approvals: '전자결재',
    'ERP Sync': 'ERP 동기화',
    'Legacy Import': '레거시 이관',
    'Audit Logs': '감사 로그',
    'Role Guide': '권한 가이드',
    None: '없음',
  };

  return labels[value] ?? value;
}
