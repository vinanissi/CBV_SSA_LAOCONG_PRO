/**
 * PHASE_DOSSIER_01 — load existing sources and build dossier aggregate (read-only).
 */

import { useEffect, useMemo, useState } from 'react';
import { api } from '@/api/client';
import type { UserContext } from '@/api/contracts';
import { loadChecklistAttachmentsForTask } from '@/modules/task/inbox/checklist/checklistAttachmentLocalStore';
import type { ChecklistAttachmentByItemId } from '@/modules/task/inbox/checklist/checklistAttachmentTypes';
import { isChecklistSheetBridgeEnabled } from '@/modules/task/inbox/checklist/checklistBridgeConfig';
import {
  loadChecklistAttachmentsFromBridge,
  loadChecklistFeedbackFromBridge,
  loadChecklistLinksFromBridge,
} from '@/modules/task/inbox/checklist/checklistBridgeSatelliteLoaders';
import { loadChecklistFeedbackForTask } from '@/modules/task/inbox/checklist/checklistFeedbackLocalStore';
import type { ChecklistFeedbackByItemId } from '@/modules/task/inbox/checklist/checklistFeedbackTypes';
import { loadChecklistLinksForTask } from '@/modules/task/inbox/checklist/checklistLinkLocalStore';
import type { ChecklistLinkByItemId } from '@/modules/task/inbox/checklist/checklistLinkTypes';
import type { WorkInboxChecklistItem } from '@/modules/task/inbox/checklist/workInboxChecklistTypes';
import type { WorkInboxAttachmentItem } from '@/modules/task/inbox/attachments/workInboxAttachmentsTypes';
import { buildDossierAggregate } from './buildDossierAggregate';
import type { DossierAggregate } from './dossierAggregateTypes';

export interface UseDossierAggregateRuntimeOptions {
  taskId: string;
  operator: UserContext;
}

export function useDossierAggregateRuntime(options: UseDossierAggregateRuntimeOptions) {
  const taskId = options.taskId?.trim() || '';
  const [checklistItems, setChecklistItems] = useState<WorkInboxChecklistItem[]>([]);
  const [taskAttachments, setTaskAttachments] = useState<WorkInboxAttachmentItem[]>([]);
  const [feedbackByItemId, setFeedbackByItemId] = useState<ChecklistFeedbackByItemId>({});
  const [attachmentsByItemId, setAttachmentsByItemId] = useState<ChecklistAttachmentByItemId>({});
  const [linksByItemId, setLinksByItemId] = useState<ChecklistLinkByItemId>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sourceWarnings, setSourceWarnings] = useState<string[]>([]);

  useEffect(() => {
    if (!taskId) {
      setChecklistItems([]);
      setTaskAttachments([]);
      setFeedbackByItemId({});
      setAttachmentsByItemId({});
      setLinksByItemId({});
      return;
    }

    let cancelled = false;
    const warnings: string[] = [];

    async function load() {
      setLoading(true);
      setError(null);
      setSourceWarnings([]);

      const [clRes, attRes] = await Promise.all([
        api.listWorkInboxChecklist(taskId),
        api.listWorkInboxAttachments(taskId),
      ]);

      if (cancelled) return;

      if (!clRes.ok) warnings.push(clRes.errors[0] ?? 'Checklist load partial');
      if (!attRes.ok) warnings.push(attRes.errors[0] ?? 'Task attachments load partial');

      setChecklistItems(clRes.ok && clRes.data?.items ? clRes.data.items : []);
      setTaskAttachments(attRes.ok && attRes.data?.items ? attRes.data.items : []);

      if (isChecklistSheetBridgeEnabled()) {
        const [fb, att, links] = await Promise.all([
          loadChecklistFeedbackFromBridge(taskId),
          loadChecklistAttachmentsFromBridge(taskId),
          loadChecklistLinksFromBridge(taskId),
        ]);
        if (cancelled) return;
        setFeedbackByItemId(fb ?? loadChecklistFeedbackForTask(taskId));
        setAttachmentsByItemId(att ?? loadChecklistAttachmentsForTask(taskId));
        setLinksByItemId(links ?? loadChecklistLinksForTask(taskId));
        if (!fb) warnings.push('Feedback bridge unavailable — using local');
        if (!att) warnings.push('Checklist attachments bridge unavailable — using local');
        if (!links) warnings.push('Links bridge unavailable — using local');
      } else {
        setFeedbackByItemId(loadChecklistFeedbackForTask(taskId));
        setAttachmentsByItemId(loadChecklistAttachmentsForTask(taskId));
        setLinksByItemId(loadChecklistLinksForTask(taskId));
      }

      setSourceWarnings(warnings);
      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [taskId]);

  const { aggregate, warnings } = useMemo(() => {
    if (!taskId) {
      const empty: DossierAggregate = {
        taskId: '',
        counts: {
          taskAttachments: 0,
          checklistAttachments: 0,
          checklistLinks: 0,
          checklistFeedback: 0,
          totalDossierItems: 0,
        },
        groups: [],
      };
      return { aggregate: empty, warnings: sourceWarnings };
    }
    const built = buildDossierAggregate({
      taskId,
      checklistItems,
      taskAttachments,
      feedbackByItemId,
      attachmentsByItemId,
      linksByItemId,
    });
    return {
      aggregate: built.aggregate,
      warnings: [...sourceWarnings, ...built.warnings],
    };
  }, [
    taskId,
    checklistItems,
    taskAttachments,
    feedbackByItemId,
    attachmentsByItemId,
    linksByItemId,
    sourceWarnings,
  ]);

  const checklistItemIds = useMemo(
    () => checklistItems.map((row) => row.checklistId).filter(Boolean),
    [checklistItems],
  );

  return {
    aggregate,
    checklistItemIds,
    loading,
    error,
    warnings,
  };
}
