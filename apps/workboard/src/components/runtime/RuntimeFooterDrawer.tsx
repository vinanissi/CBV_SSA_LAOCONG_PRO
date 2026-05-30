import type { TaskRuntimeTelemetryPayload } from '@/runtime/TaskRuntimeTelemetryContext';
import {
  buildRuntimeDiagnostics,
  getExpandedCountsDetail,
  getRuntimeHealthLevel,
  getRuntimeLatencyMs,
} from '@/shared/utils/runtimeTelemetry';
import { getFrontendPerfDiagnostics } from '@/shared/utils/renderPerf';
import { formatRuntimeSyncLabel, pickRuntimeSyncTimestamp } from '@/shared/utils/runtimeClock';

interface RuntimeFooterDrawerProps {
  open: boolean;
  onClose: () => void;
  telemetry: TaskRuntimeTelemetryPayload;
  warningFocus?: boolean;
}

export function RuntimeFooterDrawer({
  open,
  onClose,
  telemetry,
  warningFocus = false,
}: RuntimeFooterDrawerProps) {
  if (!open) return null;

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

  const health = getRuntimeHealthLevel({ connected, degraded, runtime, warnings, error, staleMessage });
  const syncLabel = formatRuntimeSyncLabel(pickRuntimeSyncTimestamp(runtime));
  const latency = getRuntimeLatencyMs(runtime);
  const fePerfRows = getFrontendPerfDiagnostics();

  return (
    <>
      <button
        type="button"
        className="runtime-footer-drawer-backdrop"
        aria-label="Đóng runtime console"
        onClick={onClose}
      />
      <aside
        className="runtime-footer-drawer"
        role="dialog"
        aria-label="Runtime console detail"
        aria-modal="true"
      >
        <header className="runtime-footer-drawer-header">
          <span className="runtime-footer-drawer-title">Runtime Console</span>
          <span className="runtime-footer-drawer-meta">{syncLabel}</span>
          <button type="button" className="runtime-footer-drawer-close" onClick={onClose}>
            Thu gọn
          </button>
        </header>

        <div className="runtime-footer-drawer-body">
          <section className="runtime-footer-drawer-section runtime-footer-drawer-section-card">
            <h3 className="runtime-footer-drawer-section-title">Health</h3>
            <dl className="runtime-footer-drawer-grid">
              <div className="runtime-footer-drawer-row">
                <dt>State</dt>
                <dd>{health}</dd>
              </div>
              <div className="runtime-footer-drawer-row">
                <dt>Connected</dt>
                <dd>{connected ? 'yes' : 'no'}</dd>
              </div>
              {latency != null && (
                <div className="runtime-footer-drawer-row">
                  <dt>Latency</dt>
                  <dd>{latency}ms</dd>
                </div>
              )}
              {refreshing && (
                <div className="runtime-footer-drawer-row">
                  <dt>Refresh</dt>
                  <dd>in progress</dd>
                </div>
              )}
            </dl>
          </section>

          {counts && (
            <section className="runtime-footer-drawer-section runtime-footer-drawer-section-card">
              <h3 className="runtime-footer-drawer-section-title">Queue metrics</h3>
              <dl className="runtime-footer-drawer-grid">
                {getExpandedCountsDetail(counts).map((row) => (
                  <div key={row.label} className="runtime-footer-drawer-row">
                    <dt>{row.label}</dt>
                    <dd>{row.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          <section className="runtime-footer-drawer-section runtime-footer-drawer-section-card">
            <h3 className="runtime-footer-drawer-section-title">Worker / sync</h3>
            <dl className="runtime-footer-drawer-grid">
              {buildRuntimeDiagnostics(runtime, connected, refreshing).map((row) => (
                <div key={row.label} className="runtime-footer-drawer-row">
                  <dt>{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          {fePerfRows.length > 0 && (
            <section className="runtime-footer-drawer-section runtime-footer-drawer-section-card">
              <h3 className="runtime-footer-drawer-section-title">Frontend render</h3>
              <dl className="runtime-footer-drawer-grid">
                {fePerfRows.map((row) => (
                  <div key={row.label} className="runtime-footer-drawer-row">
                    <dt>{row.label}</dt>
                    <dd>{row.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {warnings.length > 0 && (
            <section
              className={`runtime-footer-drawer-section runtime-footer-drawer-section-card runtime-footer-drawer-warnings-section ${warningFocus ? 'runtime-footer-drawer-warnings-focus' : ''}`}
            >
              <h3 className="runtime-footer-drawer-section-title runtime-footer-drawer-warnings-title">Warnings</h3>
              <ul className="runtime-footer-drawer-warnings">
                {warnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            </section>
          )}

          {/* TODO(GS_09P+): SLA pressure panel when SLA runtime feed is wired */}
          <section className="runtime-footer-drawer-section runtime-footer-drawer-section-card runtime-footer-drawer-todo">
            <h3 className="runtime-footer-drawer-section-title">SLA pressure</h3>
            <p className="runtime-footer-drawer-placeholder">TODO — SLA runtime feed not wired</p>
          </section>

          {/* TODO(GS_09P+): execution memory / runtime state when memory bridge is ready */}
          <section className="runtime-footer-drawer-section runtime-footer-drawer-section-card runtime-footer-drawer-todo">
            <h3 className="runtime-footer-drawer-section-title">Memory / runtime state</h3>
            <p className="runtime-footer-drawer-placeholder">TODO — memory runtime bridge not wired</p>
          </section>
        </div>
      </aside>
    </>
  );
}
