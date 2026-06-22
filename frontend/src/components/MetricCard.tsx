import type { ReactNode } from 'react';

export function MetricCard({ label, value, detail, tone = 'neutral', icon }: { label: string; value: string | number; detail?: string; tone?: 'neutral' | 'cyan' | 'violet' | 'green' | 'amber' | 'red'; icon?: ReactNode }) {
  return (
    <div className={`metric-card ${tone}`}>
      <div className="metric-topline">
        <span>{label}</span>
        {icon ? <div className="metric-icon">{icon}</div> : null}
      </div>
      <strong>{typeof value === 'number' ? value.toLocaleString() : value}</strong>
      {detail ? <small>{detail}</small> : null}
    </div>
  );
}
