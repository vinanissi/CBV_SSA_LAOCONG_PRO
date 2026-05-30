import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api/client';
import { getCachedModulesStatus } from '@/modules/task/inbox/network/workInboxStaticRuntimeCache';
import type { UserContext } from '@/api/contracts';
import { QUICK_BAR_ACTIONS, SESSION_LABEL } from '@/shared/constants';
import { executionLabel } from '@/shared/utils';
import { useTaskWrite } from '@/modules/task/TaskWriteContext';
import { canRoleCreateWorkInboxTask } from '@/modules/task/inbox/create/workInboxCreateTaskTypes';
import { INBOX_ROUTE } from '@/shared/routes/inboxRoutes';
import { useTaskRuntimeTelemetryState } from '@/runtime/TaskRuntimeTelemetryContext';
import { RuntimeTelemetryInline } from '@/components/runtime/RuntimeTelemetryInline';
import { getCompactConnectionLabel } from '@/shared/utils/runtimeTelemetry';
import { formatRuntimeSyncLabel, pickRuntimeSyncTimestamp } from '@/shared/utils/runtimeClock';

const RuntimeFooterDrawer = lazy(() =>
  import('@/components/runtime/RuntimeFooterDrawer').then((m) => ({ default: m.RuntimeFooterDrawer })),
);

const RUNTIME_SHORTCUT_HINTS = 'J/K queue · Enter open · R resume';
const CREATE_DENIED_TITLE = 'Bạn không có quyền tạo việc';

interface RuntimeStatusBarProps {
  user: UserContext;
}

export function RuntimeStatusBar({ user }: RuntimeStatusBarProps) {
  const navigate = useNavigate();
  const { openWorkInboxCreate, capability } = useTaskWrite();
  const taskTelemetry = useTaskRuntimeTelemetryState();
  const [workerConnected, setWorkerConnected] = useState(!api.isMockMode());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [warningFocus, setWarningFocus] = useState(false);
  const [, clockTick] = useState(0);

  const canCreateTask = canRoleCreateWorkInboxTask(user.role) && (capability?.canCreate ?? true);

  useEffect(() => {
    getCachedModulesStatus().then((res) => {
      if (res.ok && res.data?.statuses?.length) {
        setWorkerConnected(res.data.statuses.every((s) => s.connected && !s.degraded));
      }
    });
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => clockTick((t) => t + 1), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const syncClockLabel = useMemo(() => {
    const ts = pickRuntimeSyncTimestamp(taskTelemetry?.runtime ?? null);
    return formatRuntimeSyncLabel(ts);
  }, [taskTelemetry?.runtime, clockTick]);

  function openDrawer(options?: { warningFocus?: boolean }) {
    setWarningFocus(Boolean(options?.warningFocus));
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setWarningFocus(false);
  }

  function handleAddTaskClick() {
    if (!canCreateTask) return;
    openWorkInboxCreate();
    if (!window.location.pathname.startsWith(INBOX_ROUTE)) {
      navigate(`${INBOX_ROUTE}?create=1`);
    }
  }

  return (
    <>
      <footer
        className="operational-status-bar runtime-footer-console runtime-light-console"
        aria-label="Runtime footer console"
      >
        <div className="operational-status-zone operational-status-zone-actions">
          {QUICK_BAR_ACTIONS.map((action) => {
            const isCreate = action.id === 'add-task';
            const locked = isCreate ? !canCreateTask : action.mode === 'EXECUTION_LOCKED';
            const label = isCreate ? '+ Tạo việc' : action.label;

            return (
              <button
                key={action.id}
                type="button"
                disabled={locked}
                onClick={() => {
                  if (locked) return;
                  if (isCreate) {
                    handleAddTaskClick();
                    return;
                  }
                  if (action.href) navigate(action.href);
                }}
                className={locked ? 'operational-status-action locked' : 'operational-status-action'}
                title={
                  isCreate && locked
                    ? CREATE_DENIED_TITLE
                    : locked
                      ? executionLabel(action.mode)
                      : isCreate
                        ? 'Tạo việc mới'
                        : undefined
                }
              >
                {label}
                {locked && !isCreate && (
                  <span className="operational-status-action-lock">· Sắp mở</span>
                )}
              </button>
            );
          })}
        </div>

        <div className="operational-status-zone-sep" aria-hidden />

        <div className="operational-status-zone operational-status-zone-telemetry">
          {taskTelemetry ? (
            <RuntimeTelemetryInline telemetry={taskTelemetry} onOpenDrawer={openDrawer} />
          ) : (
            <div className="runtime-status-metrics" role="status">
              <span className="runtime-status-metric runtime-status-connected">
                <span className="runtime-status-dot runtime-dot-healthy runtime-dot-live" />
                <span className="runtime-status-metric-value">
                  {getCompactConnectionLabel(workerConnected, null, false)}
                </span>
              </span>
            </div>
          )}
        </div>

        <div className="operational-status-zone-sep" aria-hidden />

        <div className="operational-status-zone operational-status-zone-session">
          <span className="runtime-console-clock" title="Last runtime sync">
            {syncClockLabel}
          </span>
          <span className="runtime-status-session-label">
            <span className="runtime-status-metric-icon" aria-hidden>🖥</span>
            <span>{SESSION_LABEL}</span>
          </span>
          <span className="runtime-console-shortcuts" aria-label="Keyboard shortcuts">
            {RUNTIME_SHORTCUT_HINTS}
          </span>
          {taskTelemetry && (
            <button
              type="button"
              className={`runtime-status-details-btn ${drawerOpen ? 'runtime-status-details-btn-active' : ''}`}
              onClick={() => (drawerOpen ? closeDrawer() : openDrawer())}
              aria-expanded={drawerOpen}
              aria-label={drawerOpen ? 'Thu gọn runtime console' : 'Mở runtime console'}
            >
              {drawerOpen ? 'Thu gọn' : 'Console'}
            </button>
          )}
          {taskTelemetry?.staleMessage && (
            <span className="runtime-status-stale-hint" role="status" title={taskTelemetry.staleMessage}>
              ⚠ Cũ
            </span>
          )}
        </div>
      </footer>

      {taskTelemetry && drawerOpen && (
        <Suspense fallback={null}>
          <RuntimeFooterDrawer
            open={drawerOpen}
            onClose={closeDrawer}
            telemetry={taskTelemetry}
            warningFocus={warningFocus}
          />
        </Suspense>
      )}
    </>
  );
}
