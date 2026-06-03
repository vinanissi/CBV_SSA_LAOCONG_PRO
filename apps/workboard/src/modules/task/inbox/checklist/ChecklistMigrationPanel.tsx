import { useCallback, useMemo, useState } from 'react';
import type { UserContext } from '@/api/contracts';
import { isChecklistSheetBridgeEnabled, setChecklistSheetBridgeEnabled } from './checklistBridgeConfig';
import {
  commitLocalToSheetDriveMigration,
  downloadMigrationExport,
  dryRunLocalToSheetDriveMigration,
  inspectLocalRuntime,
} from './checklistLocalRuntimeMigration';
import type { MigrationInput, MigrationResult } from './checklistLocalRuntimeMigrationTypes';
import { canShowChecklistMigrationTools } from '@/shared/utils/checklistMigrationToolAccess';

export interface ChecklistMigrationPanelProps {
  taskId: string;
  operator: UserContext;
}

const DEFAULT_INPUT: Omit<MigrationInput, 'dryRun' | 'commitConfirmed'> = {
  includeFeedback: true,
  includeAttachments: true,
  includeLinks: true,
  includeHistory: true,
  includeTemplates: false,
  includeLayoutState: true,
  includeCrudOverlay: true,
};

export function ChecklistMigrationPanel({ taskId, operator }: ChecklistMigrationPanelProps) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [commitChecked, setCommitChecked] = useState(false);
  const [result, setResult] = useState<MigrationResult | null>(null);
  const [bridgeOn, setBridgeOn] = useState(isChecklistSheetBridgeEnabled());

  const inspection = useMemo(() => inspectLocalRuntime(taskId), [taskId, open, result]);

  const runDryRun = useCallback(async () => {
    setBusy(true);
    try {
      const res = await dryRunLocalToSheetDriveMigration(
        { ...DEFAULT_INPUT, taskId, dryRun: true },
        operator,
      );
      setResult(res);
    } finally {
      setBusy(false);
    }
  }, [operator, taskId]);

  const runCommit = useCallback(async () => {
    if (!commitChecked) return;
    setBusy(true);
    try {
      const res = await commitLocalToSheetDriveMigration(
        { ...DEFAULT_INPUT, taskId, dryRun: false, commitConfirmed: true },
        operator,
      );
      setResult(res);
    } finally {
      setBusy(false);
    }
  }, [commitChecked, operator, taskId]);

  const toggleBridge = () => {
    const next = !bridgeOn;
    setChecklistSheetBridgeEnabled(next);
    setBridgeOn(next);
  };

  if (!canShowChecklistMigrationTools()) {
    return null;
  }

  if (!open) {
    return (
      <div className="work-inbox-checklist-migration-collapsed">
        <button
          type="button"
          className="work-inbox-checklist-toolbar__btn"
          onClick={() => setOpen(true)}
        >
          Di chuyển dữ liệu local → Sheet
        </button>
      </div>
    );
  }

  return (
    <section className="work-inbox-checklist-migration" aria-label="Checklist local migration">
      <header className="work-inbox-checklist-migration__header">
        <h4>Di chuyển checklist (local → Sheet)</h4>
        <button type="button" className="work-inbox-checklist-toolbar__btn" onClick={() => setOpen(false)}>
          Đóng
        </button>
      </header>

      <p className="work-inbox-checklist-migration__hint">
        Dry-run trước khi commit. Dữ liệu localStorage <strong>không bị xóa</strong> tự động.
      </p>

      <div className="work-inbox-checklist-migration__stats">
        <span>Bridge: {bridgeOn ? 'BẬT' : 'TẮT'}</span>
        <button type="button" className="work-inbox-checklist-toolbar__btn" onClick={toggleBridge}>
          {bridgeOn ? 'Tắt bridge' : 'Bật bridge'}
        </button>
        <span>
          Local: {inspection.tasks[taskId]?.feedbackKeys ?? 0} FB,{' '}
          {inspection.tasks[taskId]?.attachmentKeys ?? 0} đính kèm,{' '}
          {inspection.tasks[taskId]?.historyKeys ?? 0} lịch sử
        </span>
      </div>

      <div className="work-inbox-checklist-migration__actions">
        <button
          type="button"
          className="work-inbox-checklist-toolbar__btn"
          disabled={busy}
          onClick={() => downloadMigrationExport(taskId)}
        >
          Export JSON
        </button>
        <button
          type="button"
          className="work-inbox-checklist-toolbar__btn"
          disabled={busy}
          onClick={runDryRun}
        >
          Dry-run
        </button>
        <label className="work-inbox-checklist-migration__confirm">
          <input
            type="checkbox"
            checked={commitChecked}
            onChange={(e) => setCommitChecked(e.target.checked)}
          />
          Tôi đã xem dry-run và muốn commit
        </label>
        <button
          type="button"
          className="work-inbox-checklist-toolbar__btn work-inbox-checklist-toolbar__btn--primary"
          disabled={busy || !commitChecked}
          onClick={runCommit}
        >
          Commit migration
        </button>
      </div>

      {result ? (
        <pre className="work-inbox-checklist-migration__report" role="status">
          {JSON.stringify(
            {
              status: result.status,
              dryRun: result.dryRun,
              migrated: result.migratedCount,
              skipped: result.skippedCount,
              failed: result.failedCount,
              warnings: result.warnings,
              errors: result.errors,
              sample: result.records.slice(0, 12),
            },
            null,
            2,
          )}
        </pre>
      ) : null}
    </section>
  );
}
