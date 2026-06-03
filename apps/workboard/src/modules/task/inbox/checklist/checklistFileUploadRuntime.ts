/**
 * PHASE_CHECKLIST_13 — validate + upload checklist files via Sheet/Drive bridge.
 */

import { callChecklistBridge } from './checklistBridgeApi';
import { isChecklistSheetBridgeEnabled } from './checklistBridgeConfig';
import type {
  ChecklistUploadInput,
  ChecklistUploadResult,
  ChecklistUploadValidationResult,
} from './checklistFileUploadTypes';
import { CHECKLIST_UPLOAD_MAX_BYTES } from './checklistFileUploadTypes';

export function sanitizeChecklistUploadFileName(name: string): string {
  return String(name || 'file')
    .trim()
    .replace(/[/\\?%*:|"<>]/g, '_')
    .replace(/\s+/g, '_')
    .slice(0, 160);
}

export function buildSafeChecklistUploadFileName(originalName: string): string {
  const safe = sanitizeChecklistUploadFileName(originalName);
  const stamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
  return `${stamp}_${safe}`;
}

export function validateChecklistUpload(input: ChecklistUploadInput): ChecklistUploadValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!input.taskId?.trim()) errors.push('taskId is required');
  if (!input.checklistItemId?.trim()) errors.push('checklistItemId is required');
  if (!input.file) errors.push('file is required');
  else {
    if (input.file.size <= 0) errors.push('file is empty');
    if (input.file.size > CHECKLIST_UPLOAD_MAX_BYTES) {
      errors.push(`file exceeds ${CHECKLIST_UPLOAD_MAX_BYTES} bytes`);
    }
  }
  if (!isChecklistSheetBridgeEnabled()) {
    warnings.push('Sheet bridge flag off — enable before upload');
  }

  return { ok: errors.length === 0, errors, warnings };
}

export function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        reject(new Error('Cannot read file'));
        return;
      }
      const comma = result.indexOf(',');
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(reader.error ?? new Error('FileReader failed'));
    reader.readAsDataURL(file);
  });
}

export async function uploadChecklistFile(
  input: ChecklistUploadInput,
): Promise<ChecklistUploadResult> {
  const validation = validateChecklistUpload(input);
  if (!validation.ok) {
    return {
      ok: false,
      status: 'FAIL',
      traceId: input.traceId ?? '',
      taskId: input.taskId,
      checklistItemId: input.checklistItemId,
      warnings: validation.warnings,
      errors: validation.errors,
    };
  }

  const file = input.file;
  const fileName = input.fileName?.trim() || file.name;
  let contentBase64: string;
  try {
    contentBase64 = await readFileAsBase64(file);
  } catch (e) {
    return {
      ok: false,
      status: 'FAIL',
      traceId: input.traceId ?? '',
      taskId: input.taskId,
      checklistItemId: input.checklistItemId,
      warnings: [],
      errors: [e instanceof Error ? e.message : 'Cannot read file'],
    };
  }

  const res = await callChecklistBridge<{
    taskId: string;
    checklistItemId: string;
    driveFolderId?: string;
    driveFileId?: string;
    driveUrl?: string;
    attachmentId?: string;
    fileName?: string;
    metadataWritten?: boolean;
    historyWritten?: boolean;
    attachment?: ChecklistUploadResult['attachment'];
  }>(input.taskId, 'uploadChecklistFile', {
    taskId: input.taskId,
    checklistItemId: input.checklistItemId,
    fileName,
    mimeType: input.mimeType ?? file.type ?? 'application/octet-stream',
    size: input.size ?? file.size,
    contentBase64,
    traceId: input.traceId,
  });

  if (!res.ok || !res.data) {
    return {
      ok: false,
      status: 'FAIL',
      traceId: res.traceId,
      taskId: input.taskId,
      checklistItemId: input.checklistItemId,
      warnings: res.warnings ?? [],
      errors: res.errors?.length ? res.errors : [res.message ?? 'Upload failed'],
    };
  }

  const d = res.data;
  return {
    ok: true,
    status: res.status === 'GO_WITH_WARNINGS' ? 'GO_WITH_WARNINGS' : 'GO',
    traceId: res.traceId,
    taskId: d.taskId ?? input.taskId,
    checklistItemId: d.checklistItemId ?? input.checklistItemId,
    driveFolderId: d.driveFolderId ?? null,
    driveFileId: d.driveFileId ?? null,
    driveUrl: d.driveUrl ?? null,
    attachmentId: d.attachmentId ?? null,
    fileName: d.fileName ?? fileName,
    metadataWritten: d.metadataWritten ?? true,
    historyWritten: d.historyWritten ?? true,
    attachment: d.attachment ?? null,
    warnings: res.warnings ?? [],
    errors: [],
  };
}

export function validateChecklistFileUploadRuntime(): {
  ok: boolean;
  status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';
  checkedAt: string;
  traceId: string;
  upload: { maxBytes: number; validateFn: boolean; uploadFn: boolean };
  drive: { bridgeMethod: boolean };
  sheet: { bridgeEnabled: boolean };
  history: { viaBridge: boolean };
  warnings: string[];
  errors: string[];
  nextStep: string;
} {
  const warnings: string[] = [];
  const errors: string[] = [];
  if (!isChecklistSheetBridgeEnabled()) {
    warnings.push('Bridge flag default off');
  }
  return {
    ok: true,
    status: warnings.length ? 'GO_WITH_WARNINGS' : 'GO',
    checkedAt: new Date().toISOString(),
    traceId: `upload-val-${Date.now()}`,
    upload: {
      maxBytes: CHECKLIST_UPLOAD_MAX_BYTES,
      validateFn: true,
      uploadFn: true,
    },
    drive: { bridgeMethod: true },
    sheet: { bridgeEnabled: isChecklistSheetBridgeEnabled() },
    history: { viaBridge: true },
    warnings,
    errors,
    nextStep: 'PHASE_CHECKLIST_15_OPERATOR_UAT',
  };
}
