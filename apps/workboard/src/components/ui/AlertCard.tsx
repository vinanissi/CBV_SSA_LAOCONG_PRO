import type { AlertItem } from '@/api/contracts';
import { useNavigate } from 'react-router-dom';

const SEVERITY_BORDER = {
  info: 'border-status-info/40',
  warn: 'border-status-warn/40',
  error: 'border-status-error/40',
};

function resolveAlertHref(alert: AlertItem): string | null {
  if (alert.taskId?.trim()) return `/inbox/${encodeURIComponent(alert.taskId.trim())}`;
  const href = alert.href?.trim();
  if (href?.startsWith('/')) return href;
  const type = String(alert.relatedEntityType ?? alert.module ?? '').toUpperCase();
  const id = alert.relatedEntityId?.trim();
  if (type.includes('HO_SO') || type === 'HOSO') return id ? `/hoso` : '/hoso';
  if (type.includes('FINANCE')) return '/finance';
  if (id && (type.includes('TASK') || alert.module === 'TASK')) {
    return `/inbox/${encodeURIComponent(id)}`;
  }
  return href?.startsWith('/') ? href : null;
}

export function AlertCard({ alert }: { alert: AlertItem }) {
  const navigate = useNavigate();
  const targetHref = resolveAlertHref(alert);

  return (
    <div className={`panel border-l-4 ${SEVERITY_BORDER[alert.severity]} p-4`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <h4 className="font-medium text-slate-100">{alert.title}</h4>
          <p className="mt-1 text-sm text-slate-400">{alert.message}</p>
          {alert.status && (
            <p className="mt-1 text-[11px] text-slate-500">
              {alert.status}
              {alert.assignedTo ? ` · ${alert.assignedTo}` : ''}
            </p>
          )}
          {alert.nextStep && <p className="mt-2 text-xs text-slate-500">{alert.nextStep}</p>}
        </div>
        {targetHref ? (
          <button
            type="button"
            className="btn-ghost shrink-0 text-xs"
            onClick={() => navigate(targetHref)}
          >
            {alert.taskId ? 'Mở việc' : 'Xem'}
          </button>
        ) : (
          <span className="shrink-0 text-[11px] text-slate-600" title="Chưa có liên kết">
            —
          </span>
        )}
      </div>
    </div>
  );
}
