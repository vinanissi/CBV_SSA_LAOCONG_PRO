import type { AlertItem } from '@/api/contracts';
import { Link } from 'react-router-dom';

const SEVERITY_BORDER = {
  info: 'border-status-info/40',
  warn: 'border-status-warn/40',
  error: 'border-status-error/40',
};

export function AlertCard({ alert }: { alert: AlertItem }) {
  return (
    <div className={`panel border-l-4 ${SEVERITY_BORDER[alert.severity]} p-4`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <h4 className="font-medium text-slate-100">{alert.title}</h4>
          <p className="mt-1 text-sm text-slate-400">{alert.message}</p>
          {alert.nextStep && <p className="mt-2 text-xs text-slate-500">{alert.nextStep}</p>}
        </div>
        {alert.href && (
          <Link to={alert.href} className="btn-ghost shrink-0 text-xs">
            Xem
          </Link>
        )}
      </div>
    </div>
  );
}
