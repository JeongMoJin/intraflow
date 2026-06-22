export function Notice({ message, type = 'info' }: { message?: string; type?: 'info' | 'success' | 'error' }) {
  if (!message) {
    return null;
  }

  return <div className={`notice ${type}`} role={type === 'error' ? 'alert' : 'status'}>{message}</div>;
}
