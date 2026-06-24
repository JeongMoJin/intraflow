import type { Language } from '../hooks/useLanguage';

export function formatDateTime(value: string | undefined, language: Language) {
  if (!value) {
    return '-';
  }

  return new Intl.DateTimeFormat(language === 'ko' ? 'ko-KR' : 'en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function formatMoney(value: number, language: Language) {
  return new Intl.NumberFormat(language === 'ko' ? 'ko-KR' : 'en', {
    maximumFractionDigits: 0,
  }).format(value);
}
