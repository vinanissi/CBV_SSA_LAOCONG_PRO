/**
 * PHASE_CHECKLIST_12 — inspect / export / dry-run / commit local checklist runtime → Sheet bridge.
 */

import type { UserContext } from '@/api/contracts';
import { callChecklistBridge } from './checklistBridgeApi';
import { isChecklistSheetBridgeEnabled } from './checklistBridgeConfig';
import { loadChecklistAttachmentsForTask } from './checklistAttachmentLocalStore';
import { loadChecklistCrudOverlayForTask } from './checklistCrudOverlayLocalStore';
import { loadChecklistFeedbackForTask } from './checklistFeedbackLocalStore';
import { loadChecklistHistoryForTask } from './checklistHistoryLocalStore';
import type { ChecklistHistoryEntry } from './checklistHistoryTypes';
import { loadChecklistLayoutForTask } from './checklistLayoutLocalStore';
import { loadChecklistLinksForTask } from './checklistLinkLocalStore';
import type {
  MigrationExportPayload,
  MigrationExportResult,
  MigrationExportTaskData,
  MigrationInput,
  MigrationInspectionResult,
  MigrationRecord,
  MigrationResult,
  MigrationValidationResult,
} from './checklistLocalRuntimeMigrationTypes';
import {
  loadChecklistFeedbackFromBridge,
  loadChecklistAttachmentsFromBridge,
  loadChecklistLinksFromBridge,
  loadChecklistHistoryFromBridge,
} from './checklistBridgeSatelliteLoaders';
import {
  bridgeAppendAttachment,
  bridgeAppendFeedback,
  bridgeAppendHistory,
  bridgeAppendLink,
  bridgeEnsureItemDriveFolder,
} from './checklistBridgePersist';

const EXPORT_VERSION = 1;

const LOCAL_PREFIXES = [
  'cbv-checklist-feedback:v1:',
  'cbv-checklist-attachment:v1:',
  'cbv-checklist-link:v1:',
  'cbv-checklist-history:v1:',
  'cbv-checklist-crud-overlay:v1:',
  'cbv-checklist-layout:v1:',
] as const;

export function listLocalRuntimeTaskIds(): string[] {
  if (typeof localStorage === 'undefined') return [];
  const ids = new Set<string>();
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    for (const prefix of LOCAL_PREFIXES) {
      if (key.startsWith(prefix)) {
        const tid = key.slice(prefix.length).trim();
        if (tid) ids.add(tid);
      }
    }
  }
  return [...ids].sort();
}

function loadTaskBundle(taskId: string): MigrationExportTaskData {
  return {
    feedback: loadChecklistFeedbackForTask(taskId),
    attachments: loadChecklistAttachmentsForTask(taskId),
    links: loadChecklistLinksForTask(taskId),
    history: loadChecklistHistoryForTask(taskId),
    crudOverlay: loadChecklistCrudOverlayForTask(taskId),
    layout: loadChecklistLayoutForTask(taskId),
  };
}

function countMapKeys(map: Record<string, unknown[]>): number {
  return Object.values(map).reduce((n, rows) => n + (Array.isArray(rows) ? rows.length : 0), 0);
}

export function inspectLocalRuntime(taskId?: string | null): MigrationInspectionResult {
  const taskIds = taskId?.trim() ? [taskId.trim()] : listLocalRuntimeTaskIds();
  const tasks: MigrationInspectionResult['tasks'] = {};
  for (const tid of taskIds) {
    const bundle = loadTaskBundle(tid);
    tasks[tid] = {
      taskId: tid,
      feedbackKeys: countMapKeys(bundle.feedback),
      attachmentKeys: countMapKeys(bundle.attachments),
      linkKeys: countMapKeys(bundle.links),
      historyKeys: countMapKeys(bundle.history),
      crudOverlayKeys: Object.keys(bundle.crudOverlay).length,
      hasLayout: Boolean(bundle.layout?.expandedItemIds?.length || bundle.layout?.archivedVisible),
    };
  }
  return {
    ok: true,
    taskIds,
    tasks,
    warnings: taskIds.length === 0 ? ['No local checklist runtime keys found'] : [],
  };
}

export function exportLocalRuntime(taskId?: string | null): MigrationExportResult {
  const exportedAt = new Date().toISOString();
  const taskIds = taskId?.trim() ? [taskId.trim()] : listLocalRuntimeTaskIds();
  const tasks: MigrationExportPayload['tasks'] = {};
  for (const tid of taskIds) {
    tasks[tid] = loadTaskBundle(tid);
  }
  const payload: MigrationExportPayload = { version: EXPORT_VERSION, exportedAt, tasks };
  return {
    ok: true,
    version: EXPORT_VERSION,
    exportedAt,
    taskIds,
    payload,
  };
}

function makeTraceId(input: MigrationInput): string {
  return String(input.traceId || '').trim() || `mig-${Date.now()}`;
}

function record(
  partial: Omit<MigrationRecord, 'status'> & { status?: MigrationRecord['status'] },
): MigrationRecord {
  return {
    status: partial.status ?? 'PENDING',
    warnings: partial.warnings ?? [],
    errors: partial.errors ?? [],
    ...partial,
  };
}

type ExistingIds = {
  feedback: Set<string>;
  attachments: Set<string>;
  links: Set<string>;
  history: Set<string>;
  historyHashes: Set<string>;
};

async function loadExistingIds(taskId: string): Promise<ExistingIds> {
  const out: ExistingIds = {
    feedback: new Set(),
    attachments: new Set(),
    links: new Set(),
    history: new Set(),
    historyHashes: new Set(),
  };
  const [fb, att, ln, hist] = await Promise.all([
    loadChecklistFeedbackFromBridge(taskId),
    loadChecklistAttachmentsFromBridge(taskId),
    loadChecklistLinksFromBridge(taskId),
    loadChecklistHistoryFromBridge(taskId),
  ]);
  if (fb) {
    for (const rows of Object.values(fb)) {
      for (const r of rows) out.feedback.add(r.id);
    }
  }
  if (att) {
    for (const rows of Object.values(att)) {
      for (const r of rows) out.attachments.add(r.id);
    }
  }
  if (ln) {
    for (const rows of Object.values(ln)) {
      for (const r of rows) out.links.add(r.id);
    }
  }
  if (hist) {
    for (const rows of Object.values(hist)) {
      for (const r of rows) {
        out.history.add(r.id);
        const hash = `${r.checklistItemId}|${r.createdAt}|${r.message}`;
        out.historyHashes.add(hash);
      }
    }
  }
  return out;
}

function historyHash(entry: ChecklistHistoryEntry): string {
  return `${entry.checklistItemId}|${entry.createdAt}|${entry.message}`;
}

async function migrateOneTask(
  taskId: string,
  bundle: MigrationExportTaskData,
  input: MigrationInput,
  operator: UserContext,
  existing: ExistingIds,
): Promise<MigrationRecord[]> {
  const records: MigrationRecord[] = [];
  const dryRun = input.dryRun === true;
  const itemFilter = input.checklistItemIds?.length
    ? new Set(input.checklistItemIds.map((x) => x.trim()))
    : null;

  const shouldItem = (itemId: string) => !itemFilter || itemFilter.has(itemId);

  if (input.includeFeedback) {
    for (const [itemId, rows] of Object.entries(bundle.feedback)) {
      if (!shouldItem(itemId)) continue;
      for (const fb of rows) {
        const srcKey = `cbv-checklist-feedback:v1:${taskId}`;
        if (existing.feedback.has(fb.id)) {
          records.push(
            record({
              source: 'localStorage',
              sourceKey: srcKey,
              sourceId: fb.id,
              targetTabOrRole: 'CHECKLIST_FEEDBACK',
              targetId: fb.id,
              operation: 'skip_duplicate',
              status: 'SKIPPED',
            }),
          );
          continue;
        }
        if (dryRun) {
          records.push(
            record({
              source: 'localStorage',
              sourceKey: srcKey,
              sourceId: fb.id,
              targetTabOrRole: 'CHECKLIST_FEEDBACK',
              targetId: fb.id,
              operation: 'dry_run',
              status: 'PENDING',
            }),
          );
          continue;
        }
        const ok = await bridgeAppendFeedback(taskId, fb, operator);
        records.push(
          record({
            source: 'localStorage',
            sourceKey: srcKey,
            sourceId: fb.id,
            targetTabOrRole: 'CHECKLIST_FEEDBACK',
            targetId: fb.id,
            operation: 'append',
            status: ok ? 'MIGRATED' : 'FAILED',
            errors: ok ? [] : ['appendFeedback failed'],
          }),
        );
        if (ok) existing.feedback.add(fb.id);
      }
    }
  }

  if (input.includeAttachments) {
    for (const [itemId, rows] of Object.entries(bundle.attachments)) {
      if (!shouldItem(itemId)) continue;
      for (const att of rows) {
        const srcKey = `cbv-checklist-attachment:v1:${taskId}`;
        if (existing.attachments.has(att.id)) {
          records.push(
            record({
              source: 'localStorage',
              sourceKey: srcKey,
              sourceId: att.id,
              targetTabOrRole: 'CHECKLIST_ATTACHMENTS',
              targetId: att.id,
              operation: 'skip_duplicate',
              status: 'SKIPPED',
            }),
          );
          continue;
        }
        if (dryRun) {
          records.push(
            record({
              source: 'localStorage',
              sourceKey: srcKey,
              sourceId: att.id,
              targetTabOrRole: 'CHECKLIST_ATTACHMENTS',
              targetId: att.id,
              operation: 'dry_run',
              status: 'PENDING',
            }),
          );
          continue;
        }
        await bridgeEnsureItemDriveFolder(taskId, att.checklistItemId).catch(() => false);
        const ok = await bridgeAppendAttachment(taskId, att, operator);
        records.push(
          record({
            source: 'localStorage',
            sourceKey: srcKey,
            sourceId: att.id,
            targetTabOrRole: 'CHECKLIST_ATTACHMENTS',
            targetId: att.id,
            operation: 'upsert',
            status: ok ? 'MIGRATED' : 'FAILED',
            errors: ok ? [] : ['appendAttachmentMetadata failed'],
          }),
        );
        if (ok) existing.attachments.add(att.id);
      }
    }
  }

  if (input.includeLinks) {
    for (const [itemId, rows] of Object.entries(bundle.links)) {
      if (!shouldItem(itemId)) continue;
      for (const ln of rows) {
        const srcKey = `cbv-checklist-link:v1:${taskId}`;
        if (existing.links.has(ln.id)) {
          records.push(
            record({
              source: 'localStorage',
              sourceKey: srcKey,
              sourceId: ln.id,
              targetTabOrRole: 'CHECKLIST_LINKS',
              targetId: ln.id,
              operation: 'skip_duplicate',
              status: 'SKIPPED',
            }),
          );
          continue;
        }
        if (dryRun) {
          records.push(
            record({
              source: 'localStorage',
              sourceKey: srcKey,
              sourceId: ln.id,
              targetTabOrRole: 'CHECKLIST_LINKS',
              targetId: ln.id,
              operation: 'dry_run',
              status: 'PENDING',
            }),
          );
          continue;
        }
        const ok = await bridgeAppendLink(taskId, ln, operator);
        records.push(
          record({
            source: 'localStorage',
            sourceKey: srcKey,
            sourceId: ln.id,
            targetTabOrRole: 'CHECKLIST_LINKS',
            targetId: ln.id,
            operation: 'upsert',
            status: ok ? 'MIGRATED' : 'FAILED',
          }),
        );
        if (ok) existing.links.add(ln.id);
      }
    }
  }

  if (input.includeHistory) {
    for (const [itemId, rows] of Object.entries(bundle.history)) {
      if (!shouldItem(itemId)) continue;
      for (const h of rows) {
        const srcKey = `cbv-checklist-history:v1:${taskId}`;
        const hash = historyHash(h);
        if (existing.history.has(h.id) || existing.historyHashes.has(hash)) {
          records.push(
            record({
              source: 'localStorage',
              sourceKey: srcKey,
              sourceId: h.id,
              targetTabOrRole: 'CHECKLIST_HISTORY',
              targetId: h.id,
              operation: 'skip_duplicate',
              status: 'SKIPPED',
            }),
          );
          continue;
        }
        if (dryRun) {
          records.push(
            record({
              source: 'localStorage',
              sourceKey: srcKey,
              sourceId: h.id,
              targetTabOrRole: 'CHECKLIST_HISTORY',
              targetId: h.id,
              operation: 'dry_run',
              status: 'PENDING',
            }),
          );
          continue;
        }
        const ok = await bridgeAppendHistory(taskId, h, operator);
        records.push(
          record({
            source: 'localStorage',
            sourceKey: srcKey,
            sourceId: h.id,
            targetTabOrRole: 'CHECKLIST_HISTORY',
            targetId: h.id,
            operation: 'append',
            status: ok ? 'MIGRATED' : 'FAILED',
          }),
        );
        if (ok) {
          existing.history.add(h.id);
          existing.historyHashes.add(hash);
        }
      }
    }
  }

  if (input.includeCrudOverlay) {
    for (const [itemId, ov] of Object.entries(bundle.crudOverlay)) {
      if (!shouldItem(itemId)) continue;
      const srcKey = `cbv-checklist-crud-overlay:v1:${taskId}`;
      if (ov.note?.trim()) {
        if (dryRun) {
          records.push(
            record({
              source: 'localStorage',
              sourceKey: srcKey,
              sourceId: itemId,
              targetTabOrRole: 'TASK_CHECKLIST',
              targetId: itemId,
              operation: 'dry_run',
              status: 'PENDING',
              warnings: ['note overlay → upsertChecklistItem'],
            }),
          );
        } else {
          const res = await callChecklistBridge(taskId, 'upsertChecklistItem', {
            taskId,
            checklistId: itemId,
            note: ov.note,
          });
          records.push(
            record({
              source: 'localStorage',
              sourceKey: srcKey,
              sourceId: itemId,
              targetTabOrRole: 'TASK_CHECKLIST',
              targetId: itemId,
              operation: 'upsert',
              status: res.ok ? 'MIGRATED' : 'FAILED',
              errors: res.ok ? [] : ['upsert note failed'],
            }),
          );
        }
      }
      if (ov.isArchived) {
        records.push(
          record({
            source: 'localStorage',
            sourceKey: srcKey,
            sourceId: itemId,
            targetTabOrRole: 'TASK_CHECKLIST',
            targetId: itemId,
            operation: 'skip_invalid',
            status: 'SKIPPED',
            warnings: ['IS_ARCHIVED column migration deferred — overlay preserved locally'],
          }),
        );
      }
    }
  }

  if (input.includeLayoutState && bundle.layout?.expandedItemIds?.length) {
    for (const itemId of bundle.layout.expandedItemIds) {
      if (!shouldItem(itemId)) continue;
      const srcKey = `cbv-checklist-layout:v1:${taskId}`;
      if (dryRun) {
        records.push(
          record({
            source: 'localStorage',
            sourceKey: srcKey,
            sourceId: itemId,
            targetTabOrRole: 'CHECKLIST_LAYOUT_STATE',
            targetId: itemId,
            operation: 'dry_run',
            status: 'PENDING',
          }),
        );
      } else {
        const res = await callChecklistBridge(taskId, 'upsertLayoutState', {
          taskId,
          checklistItemId: itemId,
          expanded: true,
        });
        records.push(
          record({
            source: 'localStorage',
            sourceKey: srcKey,
            sourceId: itemId,
            targetTabOrRole: 'CHECKLIST_LAYOUT_STATE',
            targetId: itemId,
            operation: 'upsert',
            status: res.ok ? 'MIGRATED' : 'FAILED',
          }),
        );
      }
    }
  }

  if (input.includeTemplates) {
    records.push(
      record({
        source: 'local_runtime',
        sourceKey: 'static-templates',
        sourceId: taskId,
        targetTabOrRole: 'CHECKLIST_TEMPLATES',
        targetId: '',
        operation: 'skip_invalid',
        status: 'SKIPPED',
        warnings: ['Static template seed not migrated from localStorage in v1'],
      }),
    );
  }

  return records;
}

function summarizeRecords(records: MigrationRecord[]): Pick<
  MigrationResult,
  'migratedCount' | 'skippedCount' | 'failedCount'
> {
  let migratedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;
  for (const r of records) {
    if (r.status === 'MIGRATED') migratedCount++;
    else if (r.status === 'SKIPPED') skippedCount++;
    else if (r.status === 'FAILED') failedCount++;
  }
  return { migratedCount, skippedCount, failedCount };
}

async function runMigration(
  input: MigrationInput,
  operator: UserContext,
): Promise<MigrationResult> {
  const traceId = makeTraceId(input);
  const checkedAt = new Date().toISOString();
  const dryRun = input.dryRun === true;
  const warnings: string[] = [];
  const errors: string[] = [];

  if (!dryRun && input.commitConfirmed !== true) {
    return {
      ok: false,
      status: 'FAIL',
      traceId,
      dryRun: false,
      checkedAt,
      migratedCount: 0,
      skippedCount: 0,
      failedCount: 0,
      records: [],
      warnings: [],
      errors: ['commitConfirmed must be true for commit migration'],
      rollbackNotes: [
        'Local source data is never deleted automatically.',
        'Disable bridge flag to fall back to localStorage.',
      ],
    };
  }

  if (!dryRun && !isChecklistSheetBridgeEnabled()) {
    warnings.push('Bridge flag off — enable before commit or migration writes may fail');
  }

  const exportData = exportLocalRuntime(input.taskId);
  const taskIds = exportData.taskIds;
  if (!taskIds.length) {
    return {
      ok: true,
      status: 'GO_WITH_WARNINGS',
      traceId,
      dryRun,
      checkedAt,
      migratedCount: 0,
      skippedCount: 0,
      failedCount: 0,
      records: [],
      warnings: ['No local data to migrate'],
      errors: [],
      rollbackNotes: defaultRollbackNotes(),
    };
  }

  const allRecords: MigrationRecord[] = [];

  for (const taskId of taskIds) {
    const bundle = exportData.payload.tasks[taskId];
    if (!bundle) continue;
    let existing: ExistingIds = {
      feedback: new Set(),
      attachments: new Set(),
      links: new Set(),
      history: new Set(),
      historyHashes: new Set(),
    };
    if (!dryRun || isChecklistSheetBridgeEnabled()) {
      try {
        existing = await loadExistingIds(taskId);
      } catch {
        warnings.push(`Could not load existing Sheet rows for ${taskId} — duplicate check limited`);
      }
    }
    const taskRecords = await migrateOneTask(taskId, bundle, input, operator, existing);
    allRecords.push(...taskRecords);
  }

  const { migratedCount, skippedCount, failedCount } = summarizeRecords(allRecords);
  const status: MigrationResult['status'] =
    failedCount > 0 ? 'FAIL' : warnings.length ? 'GO_WITH_WARNINGS' : 'GO';

  return {
    ok: failedCount === 0,
    status,
    traceId,
    dryRun,
    checkedAt,
    migratedCount,
    skippedCount,
    failedCount,
    records: allRecords,
    warnings,
    errors,
    exportPathOrKey: `cbv-checklist-migration-export:${traceId}`,
    rollbackNotes: defaultRollbackNotes(),
  };
}

function defaultRollbackNotes(): string[] {
  return [
    'Local localStorage keys are preserved (not cleared).',
    'To rollback: set cbv-checklist-sheet-bridge:v1 off or VITE_CHECKLIST_SHEET_BRIDGE_ENABLED=false.',
    'Re-run migration is idempotent — duplicates are skipped.',
    'Clear local keys manually only after operator UAT confirms Sheet data.',
  ];
}

export async function dryRunLocalToSheetDriveMigration(
  input: MigrationInput,
  operator: UserContext,
): Promise<MigrationResult> {
  return runMigration({ ...input, dryRun: true, commitConfirmed: false }, operator);
}

export async function commitLocalToSheetDriveMigration(
  input: MigrationInput,
  operator: UserContext,
): Promise<MigrationResult> {
  return runMigration({ ...input, dryRun: false, commitConfirmed: true }, operator);
}

export function validateChecklistLocalRuntimeMigration(): MigrationValidationResult {
  const traceId = `mig-val-${Date.now()}`;
  const taskIds = listLocalRuntimeTaskIds();
  const errors: string[] = [];
  const warnings: string[] = [];

  if (typeof localStorage === 'undefined') {
    errors.push('localStorage not available');
  }

  const bridgeEnabled = isChecklistSheetBridgeEnabled();
  if (!bridgeEnabled) {
    warnings.push('Sheet bridge flag is off — commit requires bridge + Worker');
  }

  return {
    ok: errors.length === 0,
    status: errors.length ? 'FAIL' : warnings.length ? 'GO_WITH_WARNINGS' : 'GO',
    checkedAt: new Date().toISOString(),
    traceId,
    localRuntime: { readable: typeof localStorage !== 'undefined', taskCount: taskIds.length },
    bridge: { available: true, enabled: bridgeEnabled },
    migration: { dryRunAvailable: true, commitGuarded: true },
    warnings,
    errors,
    nextStep: 'PHASE_CHECKLIST_13_FILE_UPLOAD_RUNTIME',
  };
}

export function downloadMigrationExport(taskId?: string): void {
  const exp = exportLocalRuntime(taskId);
  const blob = new Blob([JSON.stringify(exp.payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `checklist-local-export-${exp.exportedAt.replace(/[:.]/g, '-')}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
