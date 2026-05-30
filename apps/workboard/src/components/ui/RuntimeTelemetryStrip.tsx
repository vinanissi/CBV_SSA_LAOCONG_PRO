import { useState } from 'react';
import type { TaskWorkspaceCounts, TaskWorkspaceRuntime } from '@/api/contracts';
import {
  buildRuntimeDiagnostics,
  getCompactConnectionLabel,
  getCompactCountsLine,
  getExpandedCountsDetail,
  getPrimaryRuntimeNotice,
  getRuntimeHealthLevel,
  getStatusDotClass,
  type RuntimeHealthLevel,
} from '@/shared/utils/runtimeTelemetry';

interface RuntimeTelemetryStripProps {
  runtime: TaskWorkspaceRuntime | null;
  counts?: TaskWorkspaceCounts | null;
  connected: boolean;
  refreshing?: boolean;
  degraded?: boolean;
  warnings?: string[];
  error?: string | null;
  staleMessage?: string | null;
}

function stripShellClass(health: RuntimeHealthLevel): string {
  switch (health) {
    case 'critical':
      return 'runtime-telemetry-strip runtime-telemetry-critical';
    case 'warning':
      return 'runtime-telemetry-strip runtime-telemetry-warning';
    default:
      return 'runtime-telemetry-strip runtime-telemetry-healthy';
  }
}

export function RuntimeTelemetryStrip({
  runtime,
  counts,
  connected,
  refreshing,
  degraded,
  warnings = [],
  error,
  staleMessage,
}: RuntimeTelemetryStripProps) {
  const [expanded, setExpanded] = useState(false);

  const healthInput = { connected, degraded, runtime, warnings, error, staleMessage };
  const health = getRuntimeHealthLevel(healthInput);
  const connectionLabel = getCompactConnectionLabel(connected, runtime, degraded);
  const notice = getPrimaryRuntimeNotice(healthInput);
  const showNotice = health !== 'healthy' && notice;

  const diagnostics = buildRuntimeDiagnostics(runtime, connected, refreshing);
  const countDetails = counts ? getExpandedCountsDetail(counts) : [];

  return (
    <div className={stripShellClass(health)} role="status" aria-label="Runtime telemetry">
      <div className="runtime-telemetry-compact">
        <span className="runtime-telemetry-status">
          <span className={`runtime-status-dot ${getStatusDotClass(health)} ${refreshing ? 'runtime-dot-pulse' : ''}`} />
          <span className="runtime-connection-label">{connectionLabel}</span>
        </span>

        {counts && (
          <span className="runtime-telemetry-counts">{getCompactCountsLine(counts)}</span>
        )}

        {refreshing && (
          <span className="runtime-telemetry-refresh" aria-live="polite">
            …
          </span>
        )}

        <button
          type="button"
          className="runtime-telemetry-details-btn"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
        >
          {expanded ? 'Thu gọn' : 'Chi tiết'}
        </button>
      </div>

      {showNotice && (
        <p className={`runtime-telemetry-notice runtime-notice-${health}`}>{notice}</p>
      )}

      {health === 'warning' && warnings.length > 1 && !expanded && (
        <p className="runtime-telemetry-notice runtime-notice-warning-subtle">
          +{warnings.length - 1} cảnh báo — mở Chi tiết
        </p>
      )}

      {expanded && (
        <div className="runtime-telemetry-expanded">
          {counts && (
            <div className="runtime-telemetry-section">
              <p className="runtime-telemetry-section-title">Thống kê</p>
              <dl className="runtime-telemetry-grid">
                {countDetails.map((row) => (
                  <div key={row.label} className="runtime-telemetry-row">
                    <dt>{row.label}</dt>
                    <dd>{row.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          <div className="runtime-telemetry-section">
            <p className="runtime-telemetry-section-title">Diagnostics</p>
            <dl className="runtime-telemetry-grid">
              {diagnostics.map((row) => (
                <div key={row.label} className="runtime-telemetry-row">
                  <dt>{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {warnings.length > 0 && (
            <div className="runtime-telemetry-section">
              <p className="runtime-telemetry-section-title">Warnings</p>
              <ul className="runtime-telemetry-warnings">
                {warnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
