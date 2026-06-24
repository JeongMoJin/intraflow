import type { ReactNode } from 'react';

interface RecordMeta {
  label: string;
  value: ReactNode;
}

export interface MobileRecord {
  id: string | number;
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  status?: ReactNode;
  meta?: RecordMeta[];
  actions?: ReactNode;
}

interface MobileRecordListProps {
  emptyText: string;
  items: MobileRecord[];
}

export function MobileRecordList({ emptyText, items }: MobileRecordListProps) {
  if (!items.length) {
    return <div className="mobile-empty-state">{emptyText}</div>;
  }

  return (
    <div className="mobile-record-list">
      {items.map((item) => (
        <article className="mobile-record-item" key={item.id}>
          <div className="mobile-record-head">
            <div>
              {item.eyebrow ? <span className="mobile-record-eyebrow">{item.eyebrow}</span> : null}
              <h3>{item.title}</h3>
            </div>
            {item.status ? <div className="mobile-record-status">{item.status}</div> : null}
          </div>
          {item.description ? <p>{item.description}</p> : null}
          {item.meta?.length ? (
            <dl className="mobile-record-meta">
              {item.meta.map((entry) => (
                <div key={entry.label}>
                  <dt>{entry.label}</dt>
                  <dd>{entry.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          {item.actions ? <div className="mobile-record-actions">{item.actions}</div> : null}
        </article>
      ))}
    </div>
  );
}

export interface MobileInsight {
  id: string;
  label: string;
  value: number;
}

interface MobileInsightListProps {
  emptyText: string;
  items: MobileInsight[];
}

export function MobileInsightList({ emptyText, items }: MobileInsightListProps) {
  const max = Math.max(1, ...items.map((item) => item.value));

  if (!items.length) {
    return <div className="mobile-empty-state">{emptyText}</div>;
  }

  return (
    <div className="mobile-insight-list">
      {items.map((item) => (
        <div className="mobile-insight-row" key={item.id}>
          <div className="mobile-insight-label">
            <span>{item.label}</span>
            <strong>{item.value.toLocaleString()}</strong>
          </div>
          <div className="mobile-insight-track" aria-hidden="true">
            <span style={{ width: `${Math.max(6, (item.value / max) * 100)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
