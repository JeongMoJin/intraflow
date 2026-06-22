import type { ReactNode } from 'react';
import { useLanguage } from '../hooks/useLanguage';

export function PageHeader({ title, description, actions, eyebrow }: { title: string; description: string; actions?: ReactNode; eyebrow?: string }) {
  const { language } = useLanguage();
  const fallbackEyebrow = language === 'ko' ? '내부 운영 콘솔' : 'Internal Operations Console';

  return (
    <div className="page-header">
      <div>
        <span className="eyebrow">{eyebrow ?? fallbackEyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {actions ? <div className="page-actions">{actions}</div> : null}
    </div>
  );
}
