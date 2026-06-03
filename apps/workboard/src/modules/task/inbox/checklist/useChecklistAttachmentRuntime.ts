import { useCallback, useEffect, useState } from 'react';
import type { UserContext } from '@/api/contracts';
import {
  appendChecklistAttachment,
  loadChecklistAttachmentsForTask,
  makeChecklistAttachmentId,
  removeChecklistAttachment,
  removeChecklistAttachmentsForItem,
  saveChecklistAttachmentsForTask,
} from './checklistAttachmentLocalStore';
import type {
  ChecklistAttachment,
  ChecklistAttachmentByItemId,
  RegisterChecklistAttachmentInput,
} from './checklistAttachmentTypes';
import { isChecklistSheetBridgeEnabled } from './checklistBridgeConfig';
import { bridgeAppendAttachment, bridgeEnsureItemDriveFolder } from './checklistBridgePersist';
import { loadChecklistAttachmentsFromBridge } from './checklistBridgeSatelliteLoaders';
import { uploadChecklistFile } from './checklistFileUploadRuntime';
import type { ChecklistUploadResult } from './checklistFileUploadTypes';

export interface UseChecklistAttachmentRuntimeOptions {
  taskId: string;
  operator: UserContext;
  canMutate?: boolean;
}

function operatorLabel(operator: UserContext): string {
  return (
    operator.displayName?.trim() ||
    operator.userId?.trim() ||
    operator.email?.trim() ||
    'OPERATOR'
  );
}

function inferMimeFromName(name: string): string | null {
  const lower = name.toLowerCase();
  if (lower.endsWith('.pdf')) return 'application/pdf';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.doc') || lower.endsWith('.docx')) return 'application/msword';
  return null;
}

function normalizeUrl(url: string | null | undefined): string | null {
  const trimmed = url?.trim() || '';
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return null;
}

export function useChecklistAttachmentRuntime(options: UseChecklistAttachmentRuntimeOptions) {
  const taskId = options.taskId?.trim() || '';
  const canMutate = options.canMutate !== false;
  const [attachmentsByItemId, setAttachmentsByItemId] = useState<ChecklistAttachmentByItemId>({});
  const [uploadingItemId, setUploadingItemId] = useState<string | null>(null);

  useEffect(() => {
    if (!taskId) {
      setAttachmentsByItemId({});
      return;
    }
    if (!isChecklistSheetBridgeEnabled()) {
      setAttachmentsByItemId(loadChecklistAttachmentsForTask(taskId));
      return;
    }
    let cancelled = false;
    loadChecklistAttachmentsFromBridge(taskId).then((fromBridge) => {
      if (cancelled) return;
      setAttachmentsByItemId(fromBridge ?? loadChecklistAttachmentsForTask(taskId));
    });
    return () => {
      cancelled = true;
    };
  }, [taskId]);

  const persist = useCallback(
    (next: ChecklistAttachmentByItemId) => {
      setAttachmentsByItemId(next);
      if (taskId && !isChecklistSheetBridgeEnabled()) {
        saveChecklistAttachmentsForTask(taskId, next);
      }
    },
    [taskId],
  );

  const registerAttachment = useCallback(
    (checklistItemId: string, input: RegisterChecklistAttachmentInput) => {
      const name = input.name?.trim();
      if (!name || !canMutate || !checklistItemId.trim()) {
        return { ok: false as const, error: 'Tên tài liệu không hợp lệ' };
      }
      const url = normalizeUrl(input.url);
      const source = input.source?.trim() || (url ? 'url' : 'local');
      const entry: ChecklistAttachment = {
        id: makeChecklistAttachmentId(),
        checklistItemId: checklistItemId.trim(),
        name,
        url,
        mimeType: input.mimeType?.trim() || inferMimeFromName(name),
        size: input.size ?? null,
        source,
        createdBy: operatorLabel(options.operator),
        createdAt: new Date().toISOString(),
      };
      const next = appendChecklistAttachment(attachmentsByItemId, entry);
      persist(next);
      if (isChecklistSheetBridgeEnabled() && taskId) {
        void bridgeEnsureItemDriveFolder(taskId, checklistItemId.trim()).catch(() => undefined);
        void bridgeAppendAttachment(taskId, entry, options.operator).catch(() => {
          saveChecklistAttachmentsForTask(taskId, next);
        });
      }
      return { ok: true as const, attachment: entry };
    },
    [attachmentsByItemId, canMutate, options.operator, persist, taskId],
  );

  const registerFromTaskAttachment = useCallback(
    (
      checklistItemId: string,
      ref: { title: string; url?: string; attachmentId?: string },
    ) => {
      return registerAttachment(checklistItemId, {
        name: ref.title?.trim() || 'Tài liệu',
        url: ref.url ?? null,
        source: 'existing_document',
      });
    },
    [registerAttachment],
  );

  const removeAttachment = useCallback(
    (checklistItemId: string, attachmentId: string) => {
      if (!canMutate) return { ok: false as const };
      persist(removeChecklistAttachment(attachmentsByItemId, checklistItemId, attachmentId));
      return { ok: true as const };
    },
    [attachmentsByItemId, canMutate, persist],
  );

  const clearAttachmentsForItem = useCallback(
    (checklistItemId: string) => {
      persist(removeChecklistAttachmentsForItem(attachmentsByItemId, checklistItemId));
    },
    [attachmentsByItemId, persist],
  );

  const uploadFile = useCallback(
    async (checklistItemId: string, file: File): Promise<ChecklistUploadResult | { ok: false; error: string }> => {
      if (!canMutate || !checklistItemId.trim() || !taskId) {
        return { ok: false, error: 'Không thể tải lên' };
      }
      if (!isChecklistSheetBridgeEnabled()) {
        return { ok: false, error: 'Bật Sheet bridge trước khi tải tệp lên Drive' };
      }
      setUploadingItemId(checklistItemId.trim());
      try {
        const result = await uploadChecklistFile({
          taskId,
          checklistItemId: checklistItemId.trim(),
          file,
        });
        if (result.ok) {
          const att = result.attachment;
          const entry: ChecklistAttachment = {
            id: result.attachmentId ?? att?.id ?? makeChecklistAttachmentId(),
            checklistItemId: checklistItemId.trim(),
            name: result.fileName ?? file.name,
            url: result.driveUrl ?? att?.url ?? null,
            mimeType: file.type || att?.mimeType || inferMimeFromName(file.name),
            size: file.size,
            source: 'drive',
            createdBy: operatorLabel(options.operator),
            createdAt: new Date().toISOString(),
          };
          persist(appendChecklistAttachment(attachmentsByItemId, entry));
        }
        return result;
      } finally {
        setUploadingItemId(null);
      }
    },
    [attachmentsByItemId, canMutate, options.operator, persist, taskId],
  );

  const replaceFromRemote = useCallback(
    (map: ChecklistAttachmentByItemId) => {
      setAttachmentsByItemId(map);
      if (taskId) saveChecklistAttachmentsForTask(taskId, map);
    },
    [taskId],
  );

  return {
    attachmentsByItemId,
    registerAttachment,
    registerFromTaskAttachment,
    uploadFile,
    uploadingItemId,
    removeAttachment,
    clearAttachmentsForItem,
    replaceFromRemote,
    canMutate,
  };
}
