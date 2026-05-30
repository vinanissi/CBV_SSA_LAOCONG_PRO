import { useLocation, useNavigate } from 'react-router-dom';
import type { TaskRuntimeTelemetryPayload } from '@/runtime/TaskRuntimeTelemetryContext';
import { isWorkInboxRoute } from '@/shared/routes/inboxRoutes';
import {
  getCompactConnectionLabel,
  getRuntimeCacheLabel,
  getRuntimeHealthLevel,
  getStatusDotClass,
} from '@/shared/utils/runtimeTelemetry';

interface RuntimeTelemetryInlineProps {
  telemetry: TaskRuntimeTelemetryPayload;
  onOpenDrawer: (options?: { warningFocus?: boolean }) => void;
}

export function RuntimeTelemetryInline({ telemetry, onOpenDrawer }: RuntimeTelemetryInlineProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    runtime,
    counts,
    connected,
    refreshing,
    degraded,
    warnings = [],
    error,
    staleMessage,
  } = telemetry;

  const healthInput = { connected, degraded, runtime, warnings, error, staleMessage };
  const health = getRuntimeHealthLevel(healthInput);
  const connectionLabel = getCompactConnectionLabel(connected, runtime, degraded);
  const warningCount = warnings.length;
  const onTasksRoute = isWorkInboxRoute(location.pathname);
  const showLivePulse = connected && health === 'healthy' && !refreshing;

  function handleOverdueClick() {
    if (!onTasksRoute || !counts?.overdue) return;
    const params = new URLSearchParams(location.search);
    params.set('filter', 'overdue');
    if (!params.get('group')) params.set('group', 'cognition');
    navigate(`${location.pathname}?${params.toString()}`);
  }

  function handleConnectionClick() {
    // TODO(GS_09O+): dedicated runtime detail panel when infrastructure ready
    onOpenDrawer();
  }

  function handleWorkerClick() {
    // TODO(GS_09O+): dedicated worker detail panel when infrastructure ready
    onOpenDrawer();
  }

  function handleWarningClick() {
    if (warningCount === 0) return;
    onOpenDrawer({ warningFocus: true });
  }

  return (
    <div className="runtime-status-telemetry" role="status" aria-label="Runtime telemetry">
      <div className="runtime-status-metrics">
        <button
          type="button"
          className="runtime-status-metric runtime-status-metric-interactive runtime-status-connected"
          onClick={handleConnectionClick}
          title="Runtime connection — mở console"
        >
          <span
            className={`runtime-status-dot ${getStatusDotClass(health)} ${showLivePulse ? 'runtime-dot-live' : ''} ${refreshing ? 'runtime-dot-busy' : ''}`}
          />
          <span className="runtime-status-metric-value">{connectionLabel}</span>
        </button>

        {counts && (
          <span className="runtime-status-metric runtime-status-total">
            <span className="runtime-status-metric-icon" aria-hidden>📦</span>
            <span className="runtime-status-metric-value runtime-status-count-neutral">
              <span className="runtime-status-count-num">{counts.total}</span>
              <span className="runtime-status-count-label"> việc</span>
            </span>
          </span>
        )}

        {counts && counts.overdue > 0 && (
          <button
            type="button"
            className="runtime-status-metric runtime-status-metric-interactive runtime-status-overdue"
            onClick={handleOverdueClick}
            disabled={!onTasksRoute}
            title={onTasksRoute ? 'Lọc việc quá hạn' : 'Chỉ khả dụng trên trang Việc'}
          >
            <span className="runtime-status-metric-icon" aria-hidden>❗</span>
            <span className="runtime-status-metric-value">{counts.overdue} quá hạn</span>
          </button>
        )}

        {warningCount > 0 && (
          <button
            type="button"
            className="runtime-status-metric runtime-status-metric-interactive runtime-status-warning"
            onClick={handleWarningClick}
            title="Xem cảnh báo runtime"
          >
            <span className="runtime-status-metric-icon" aria-hidden>⚠</span>
            <span className="runtime-status-metric-value">{warningCount} cảnh báo</span>
          </button>
        )}

        <button
          type="button"
          className="runtime-status-metric runtime-status-metric-interactive runtime-status-worker"
          onClick={handleWorkerClick}
          title="Worker runtime — mở console"
        >
          <span
            className={`runtime-status-metric-icon runtime-status-worker-icon ${connected ? 'runtime-worker-active' : ''} ${refreshing ? 'runtime-worker-busy' : ''}`}
            aria-hidden
          >
            ↻
          </span>
          <span className="runtime-status-metric-value">Worker {connected ? 'OK' : '—'}</span>
          {runtime && (
            <span className="runtime-status-cache-sub">{getRuntimeCacheLabel(runtime, refreshing)}</span>
          )}
        </button>

        {refreshing && (
          <span className="runtime-status-metric runtime-status-refresh" aria-live="polite">
            …
          </span>
        )}
      </div>
    </div>
  );
}
