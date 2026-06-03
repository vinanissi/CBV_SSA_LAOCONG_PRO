import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api/client';
import { getCachedModulesStatus } from '@/modules/task/inbox/network/workInboxStaticRuntimeCache';
import type { UserContext } from '@/api/contracts';
import {
  QUICK_BAR_ACTIONS,
  QUICK_BAR_MORE_IDS,
  QUICK_BAR_PRIMARY_IDS,
  SESSION_LABEL,
} from '@/shared/constants';
import { executionLabel } from '@/shared/utils';
import { useTaskWrite } from '@/modules/task/TaskWriteContext';
import { canRoleCreateWorkInboxTask } from '@/modules/task/inbox/create/workInboxCreateTaskTypes';
import { INBOX_ROUTE } from '@/shared/routes/inboxRoutes';
import { useTaskRuntimeTelemetryState } from '@/runtime/TaskRuntimeTelemetryContext';
import { RuntimeTelemetryInline } from '@/components/runtime/RuntimeTelemetryInline';
import { getCompactConnectionLabel } from '@/shared/utils/runtimeTelemetry';
import { formatRuntimeSyncLabel, pickRuntimeSyncTimestamp } from '@/shared/utils/runtimeClock';
import { isOperatorDevMode } from '@/shared/utils/operatorDevMode';
import { useChecklistSyncFooterState } from '@/runtime/ChecklistSyncFooterContext';
import { ChecklistSyncFooterIndicator } from '@/modules/task/inbox/checklist/ChecklistSyncFooterIndicator';

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
  const checklistSyncFooter = useChecklistSyncFooterState();
  const [workerConnected, setWorkerConnected] = useState(!api.isMockMode());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [warningFocus, setWarningFocus] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [, clockTick] = useState(0);

  const primaryActions = useMemo(
    () => QUICK_BAR_ACTIONS.filter((a) => (QUICK_BAR_PRIMARY_IDS as readonly string[]).includes(a.id)),
    [],
  );
  const moreActions = useMemo(
    () => QUICK_BAR_ACTIONS.filter((a) => (QUICK_BAR_MORE_IDS as readonly string[]).includes(a.id)),
    [],
  );

  const canCreateTask = canRoleCreateWorkInboxTask(user.role) && (capability?.canCreate ?? true);
  const showDevShortcutHints = isOperatorDevMode();

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

  function runQuickAction(action: (typeof QUICK_BAR_ACTIONS)[number]) {
    const isCreate = action.id === 'add-task';
    const locked = isCreate ? !canCreateTask : action.mode === 'EXECUTION_LOCKED';
    if (locked) return;
    if (isCreate) {
      handleAddTaskClick();
      return;
    }
    if (action.href) navigate(action.href);
  }

  useEffect(() => {
    if (!moreMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMoreMenuOpen(false);
    };
    const onPointer = (e: MouseEvent) => {
      const t = e.target;
      if (!(t instanceof Node)) return;
      if (!document.querySelector('.runtime-footer-more-menu')?.contains(t)) {
        setMoreMenuOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onPointer);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onPointer);
    };
  }, [moreMenuOpen]);

  return (
    <>
      <footer
        className="operational-status-bar runtime-footer-console runtime-light-console"
        aria-label="Runtime footer console"
      >
        <div className="operational-status-zone operational-status-zone-actions">
          {primaryActions.map((action) => {
            const isCreate = action.id === 'add-task';
            const locked = isCreate ? !canCreateTask : action.mode === 'EXECUTION_LOCKED';
            const label = isCreate ? '+ Tạo' : action.label;

            return (
              <button
                key={action.id}
                type="button"
                disabled={locked}
                onClick={() => runQuickAction(action)}
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
              </button>
            );
          })}
          <div className="runtime-footer-more-menu">
            <button
              type="button"
              className={
                moreMenuOpen
                  ? 'operational-status-action operational-status-action--active'
                  : 'operational-status-action'
              }
              aria-expanded={moreMenuOpen}
              aria-haspopup="menu"
              onClick={() => setMoreMenuOpen((v) => !v)}
            >
              Thêm
            </button>
            {moreMenuOpen ? (
              <div className="runtime-footer-more-menu__panel" role="menu">
                {moreActions.map((action) => {
                  const locked = action.mode === 'EXECUTION_LOCKED';
                  return (
                    <button
                      key={action.id}
                      type="button"
                      role="menuitem"
                      className="runtime-footer-more-menu__item"
                      disabled={locked}
                      title={locked ? executionLabel(action.mode) : undefined}
                      onClick={() => {
                        setMoreMenuOpen(false);
                        runQuickAction(action);
                      }}
                    >
                      {action.label}
                      {locked ? (
                        <span className="operational-status-action-lock"> · Sắp mở</span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
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
          {checklistSyncFooter ? (
            <ChecklistSyncFooterIndicator {...checklistSyncFooter} />
          ) : null}
          <span className="runtime-console-clock" title="Last runtime sync">
            {syncClockLabel}
          </span>
          <span className="runtime-status-session-label">
            <span className="runtime-status-metric-icon" aria-hidden>🖥</span>
            <span>{SESSION_LABEL}</span>
          </span>
          {showDevShortcutHints ? (
            <span className="runtime-console-shortcuts" aria-label="Keyboard shortcuts (dev)">
              {RUNTIME_SHORTCUT_HINTS}
            </span>
          ) : null}
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
