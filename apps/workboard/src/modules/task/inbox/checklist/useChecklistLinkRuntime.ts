import { useCallback, useEffect, useState } from 'react';
import type { UserContext } from '@/api/contracts';
import {
  appendChecklistLink,
  loadChecklistLinksForTask,
  makeChecklistLinkId,
  removeChecklistLink,
  removeChecklistLinksForItem,
  saveChecklistLinksForTask,
} from './checklistLinkLocalStore';
import type {
  ChecklistLink,
  ChecklistLinkByItemId,
  RegisterChecklistLinkInput,
} from './checklistLinkTypes';
import { inferChecklistLinkType } from './checklistLinkUtils';
import { isChecklistSheetBridgeEnabled } from './checklistBridgeConfig';
import { bridgeAppendLink } from './checklistBridgePersist';
import { loadChecklistLinksFromBridge } from './checklistBridgeSatelliteLoaders';

export interface UseChecklistLinkRuntimeOptions {
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

export function useChecklistLinkRuntime(options: UseChecklistLinkRuntimeOptions) {
  const taskId = options.taskId?.trim() || '';
  const canMutate = options.canMutate !== false;
  const [linksByItemId, setLinksByItemId] = useState<ChecklistLinkByItemId>({});

  useEffect(() => {
    if (!taskId) {
      setLinksByItemId({});
      return;
    }
    if (!isChecklistSheetBridgeEnabled()) {
      setLinksByItemId(loadChecklistLinksForTask(taskId));
      return;
    }
    let cancelled = false;
    loadChecklistLinksFromBridge(taskId).then((fromBridge) => {
      if (cancelled) return;
      setLinksByItemId(fromBridge ?? loadChecklistLinksForTask(taskId));
    });
    return () => {
      cancelled = true;
    };
  }, [taskId]);

  const persist = useCallback(
    (next: ChecklistLinkByItemId) => {
      setLinksByItemId(next);
      if (taskId && !isChecklistSheetBridgeEnabled()) {
        saveChecklistLinksForTask(taskId, next);
      }
    },
    [taskId],
  );

  const registerLink = useCallback(
    (checklistItemId: string, input: RegisterChecklistLinkInput) => {
      const label = input.label?.trim();
      const url = input.url?.trim() || '';
      if (!label || !canMutate || !checklistItemId.trim()) {
        return { ok: false as const, error: 'Nhãn liên kết không hợp lệ' };
      }
      const entry: ChecklistLink = {
        id: makeChecklistLinkId(),
        checklistItemId: checklistItemId.trim(),
        label,
        url,
        type: input.type?.trim() || (url ? inferChecklistLinkType(url) : 'external'),
        description: input.description?.trim() || null,
        source: input.source?.trim() || 'manual',
        createdBy: operatorLabel(options.operator),
        createdAt: new Date().toISOString(),
      };
      const next = appendChecklistLink(linksByItemId, entry);
      persist(next);
      if (isChecklistSheetBridgeEnabled() && taskId) {
        void bridgeAppendLink(taskId, entry, options.operator).catch(() => {
          saveChecklistLinksForTask(taskId, next);
        });
      }
      return { ok: true as const, link: entry };
    },
    [canMutate, linksByItemId, options.operator, persist, taskId],
  );

  const registerFromTaskAttachment = useCallback(
    (checklistItemId: string, ref: { title: string; url?: string }) => {
      const url = ref.url?.trim() || '';
      if (!url) return { ok: false as const, error: 'URL không hợp lệ' };
      return registerLink(checklistItemId, {
        label: ref.title?.trim() || 'Liên kết',
        url,
        source: 'existing_document',
      });
    },
    [registerLink],
  );

  const removeLink = useCallback(
    (checklistItemId: string, linkId: string) => {
      if (!canMutate) return { ok: false as const };
      persist(removeChecklistLink(linksByItemId, checklistItemId, linkId));
      return { ok: true as const };
    },
    [canMutate, linksByItemId, persist],
  );

  const clearLinksForItem = useCallback(
    (checklistItemId: string) => {
      persist(removeChecklistLinksForItem(linksByItemId, checklistItemId));
    },
    [linksByItemId, persist],
  );

  const replaceFromRemote = useCallback(
    (map: ChecklistLinkByItemId) => {
      setLinksByItemId(map);
      if (taskId) saveChecklistLinksForTask(taskId, map);
    },
    [taskId],
  );

  return {
    linksByItemId,
    registerLink,
    registerFromTaskAttachment,
    removeLink,
    clearLinksForItem,
    replaceFromRemote,
    canMutate,
  };
}
