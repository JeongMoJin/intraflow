import { translateRole, translateStatus, useLanguage } from '../hooks/useLanguage';

export function StatusBadge({ value }: { value?: string | boolean }) {
  const { language } = useLanguage();
  const raw = typeof value === 'boolean' ? (value ? 'Active' : 'Inactive') : value ?? '-';
  const normalized = raw.toLowerCase();
  const tone = normalized.includes('fail') || normalized.includes('reject') || normalized.includes('inactive')
    ? 'danger'
    : normalized.includes('pending') || normalized.includes('planned') || normalized.includes('hold')
      ? 'warning'
      : 'success';

  return <span className={`status-badge ${tone}`}>{translateStatus(value, language)}</span>;
}

export function RoleBadge({ role }: { role?: string }) {
  const { language } = useLanguage();

  return <span className={`role-badge ${(role ?? 'employee').toLowerCase()}`}>{translateRole(role, language)}</span>;
}

export function DataChip({ value }: { value?: string | number }) {
  return <span className="data-chip">{value ?? '-'}</span>;
}
