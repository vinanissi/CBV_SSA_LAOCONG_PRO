import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { api } from '@/api/client';
import type { UserContext } from '@/api/contracts';
import type { WorkInboxAttachmentItem } from '@/modules/task/inbox/attachments/workInboxAttachmentsTypes';
import { adaptChecklistItems } from './adaptToSmartChecklistItem';
import { applyChecklistTemplateAppend } from './checklistTemplateApply';
import { ChecklistListToolbar } from './ChecklistListToolbar';
import { ChecklistMigrationPanel } from './ChecklistMigrationPanel';
import { canShowChecklistMigrationTools } from '@/shared/utils/checklistMigrationToolAccess';
import { useChecklistSyncFooterPublisher } from '@/runtime/ChecklistSyncFooterContext';
import { ChecklistTemplatePanel } from './ChecklistTemplatePanel';
import { legacyItemsById, sortChecklistItems } from './checklistSortUtils';
import { enrichSmartChecklistListRuntime } from './enrichSmartChecklistRuntime';
import { SmartChecklistItemRow } from './SmartChecklistItemRow';
import { useChecklistAttachmentRuntime } from './useChecklistAttachmentRuntime';
import { useChecklistCrudOverlayRuntime } from './useChecklistCrudOverlayRuntime';
import { useChecklistFeedbackRuntime } from './useChecklistFeedbackRuntime';
import { useChecklistHistoryRuntime } from './useChecklistHistoryRuntime';
import { useChecklistLayoutRuntime } from './useChecklistLayoutRuntime';
import { useChecklistLinkRuntime } from './useChecklistLinkRuntime';
import { useChecklistMultiUserSyncRuntime } from './useChecklistMultiUserSyncRuntime';
import { useChecklistTemplateRuntime } from './useChecklistTemplateRuntime';
import { useWorkInboxChecklistRuntime } from './useWorkInboxChecklistRuntime';
import { checklistItemDomId } from '@/modules/task/inbox/dossier/dossierCrossFocusNavigation';
import { useChecklistCrossFocusListener } from '@/modules/task/inbox/dossier/useChecklistCrossFocusListener';
import { copyChecklistStepLinkToClipboard } from '@/modules/task/inbox/link/copyChecklistStepLink';
import { useChecklistStepDeepLinkConsumer } from '@/modules/task/inbox/link/useChecklistStepDeepLinkConsumer';
import { showChecklistToast } from './checklistToastFeedback';
import { useChecklistDualPaneFocusOptional } from './ChecklistDualPaneFocusContext';
import { isChecklistDualPaneRuntimeEnabled } from './checklistDualPaneRuntimeConfig';

interface WorkInboxChecklistSectionProps {
  taskId: string;
  operator: UserContext;
  canMutate?: boolean;
  dense?: boolean;
}

type EditField = 'title' | 'note' | null;
type InteractionState = 'idle' | 'pending' | 'saved' | 'failed' | 'disabled';
type CopyLinkState = 'idle' | 'copying' | 'copied' | 'failed';

export function WorkInboxChecklistSection({
  taskId,
  operator,
  canMutate = true,
  dense = false,
}: WorkInboxChecklistSectionProps) {
  const {
    items,
    loading,
    error,
    mutatingId,
    canMutate: allowMutate,
    createItem,
    updateItem,
    reorderItem,
    toggleItem,
    reload,
    replaceItemsFromRemote,
  } = useWorkInboxChecklistRuntime({ taskId, operator, canMutate });

  const sortedItems = useMemo(() => sortChecklistItems(items), [items]);
  const legacyById = useMemo(() => legacyItemsById(sortedItems), [sortedItems]);

  const { feedbackByItemId, addFeedback, replaceFromRemote: replaceFeedbackFromRemote } =
    useChecklistFeedbackRuntime({
    taskId,
    operator,
    canMutate: allowMutate,
  });

  const {
    attachmentsByItemId,
    registerAttachment,
    registerFromTaskAttachment,
    uploadFile,
    uploadingItemId,
    removeAttachment,
    replaceFromRemote: replaceAttachmentsFromRemote,
  } = useChecklistAttachmentRuntime({ taskId, operator, canMutate: allowMutate });

  const {
    linksByItemId,
    registerLink,
    registerFromTaskAttachment: registerLinkFromTaskAttachment,
    removeLink,
    replaceFromRemote: replaceLinksFromRemote,
  } = useChecklistLinkRuntime({ taskId, operator, canMutate: allowMutate });

  const {
    historyByItemId,
    recordEvent,
    addManualNote,
    replaceFromRemote: replaceHistoryFromRemote,
  } = useChecklistHistoryRuntime({
    taskId,
    operator,
    canMutate: allowMutate,
  });

  const { overlayByItemId, setNote, setArchived } = useChecklistCrudOverlayRuntime({ taskId });

  const {
    layout,
    archivedVisible,
    isExpanded,
    setItemExpanded,
    expandAll,
    collapseAll,
    toggleArchivedVisible,
    replaceExpandedFromRemote,
  } = useChecklistLayoutRuntime({ taskId });

  const {
    templates,
    selectedTemplate,
    applying: templateApplying,
    setApplying: setTemplateApplying,
    selectTemplate,
    clearSelection,
  } = useChecklistTemplateRuntime();

  const [templatePanelOpen, setTemplatePanelOpen] = useState(false);
  const [syncRefreshing, setSyncRefreshing] = useState(false);

  const syncApplyHandlers = useMemo(
    () => ({
      replaceItems: replaceItemsFromRemote,
      replaceFeedback: replaceFeedbackFromRemote,
      replaceAttachments: replaceAttachmentsFromRemote,
      replaceLinks: replaceLinksFromRemote,
      replaceHistory: replaceHistoryFromRemote,
      replaceLayoutExpanded: replaceExpandedFromRemote,
    }),
    [
      replaceItemsFromRemote,
      replaceFeedbackFromRemote,
      replaceAttachmentsFromRemote,
      replaceLinksFromRemote,
      replaceHistoryFromRemote,
      replaceExpandedFromRemote,
    ],
  );

  const {
    bridgeOn: syncBridgeOn,
    syncState,
    syncMessage,
    refreshFromRemote,
    checkWriteGuard,
    markLocalMutation,
  } = useChecklistMultiUserSyncRuntime({
    taskId,
    operator,
    items: sortedItems,
    feedbackByItemId,
    attachmentsByItemId,
    linksByItemId,
    historyByItemId,
    layoutExpandedCount: layout.expandedItemIds.length,
    applyHandlers: syncApplyHandlers,
  });

  const handleManualSync = useCallback(async () => {
    setSyncRefreshing(true);
    const res = await refreshFromRemote();
    setSyncRefreshing(false);
    if (res.ok) {
      recordEvent({
        checklistItemId: sortedItems[0]?.checklistId ?? taskId,
        type: 'manual_refresh_performed',
        message: 'Đồng bộ thủ công từ Sheet',
        source: 'checklist_sync',
        refType: 'checklist',
      });
    }
  }, [refreshFromRemote, recordEvent, sortedItems, taskId]);

  const publishChecklistSyncFooter = useChecklistSyncFooterPublisher();

  useEffect(() => {
    if (!taskId?.trim()) {
      publishChecklistSyncFooter(null);
      return;
    }
    publishChecklistSyncFooter({
      taskId,
      syncState,
      bridgeOn: syncBridgeOn,
      busy: syncRefreshing,
      message: syncMessage,
      onRefresh: () => void handleManualSync(),
    });
    return () => publishChecklistSyncFooter(null);
  }, [
    taskId,
    syncState,
    syncBridgeOn,
    syncRefreshing,
    syncMessage,
    handleManualSync,
    publishChecklistSyncFooter,
  ]);

  const guardWrite = useCallback(
    async (operation: import('./checklistMultiUserSyncTypes').ChecklistWriteOperation) => {
      const guard = await checkWriteGuard(operation);
      if (!guard.canWrite) {
        const itemId = sortedItems[0]?.checklistId ?? taskId;
        recordEvent({
          checklistItemId: itemId,
          type: guard.conflictDetected ? 'conflict_detected' : 'write_blocked_due_to_stale_state',
          message: guard.message ?? 'Ghi bị chặn — cần làm mới từ Sheet',
          source: 'checklist_sync',
          refType: 'checklist',
        });
      }
      return guard.canWrite;
    },
    [checkWriteGuard, recordEvent, sortedItems, taskId],
  );

  const [taskAttachments, setTaskAttachments] = useState<WorkInboxAttachmentItem[]>([]);

  useEffect(() => {
    const id = taskId?.trim();
    if (!id) {
      setTaskAttachments([]);
      return;
    }
    let cancelled = false;
    void api.listWorkInboxAttachments(id).then((res) => {
      if (cancelled) return;
      if (res.ok && res.data?.items) setTaskAttachments(res.data.items);
    });
    return () => {
      cancelled = true;
    };
  }, [taskId]);

  const smartItems = useMemo(
    () =>
      enrichSmartChecklistListRuntime(adaptChecklistItems(sortedItems), {
        feedbackByItemId,
        attachmentsByItemId,
        linksByItemId,
        historyByItemId,
        legacyById,
        overlayByItemId,
        layout,
        allowMutate,
      }),
    [
      sortedItems,
      feedbackByItemId,
      attachmentsByItemId,
      linksByItemId,
      historyByItemId,
      legacyById,
      overlayByItemId,
      layout,
      allowMutate,
    ],
  );

  const visibleItems = useMemo(
    () => smartItems.filter((item) => archivedVisible || !item.isArchived),
    [smartItems, archivedVisible],
  );

  const activeItemIds = useMemo(
    () => smartItems.filter((i) => !i.isArchived).map((i) => i.id),
    [smartItems],
  );
  const checklistProgress = useMemo(() => {
    const totalSteps = smartItems.length;
    const completedSteps = smartItems.filter((item) => item.status === 'done').length;
    const remainingSteps = Math.max(0, totalSteps - completedSteps);
    const percentComplete = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
    return { totalSteps, completedSteps, remainingSteps, percentComplete };
  }, [smartItems]);

  const checklistItemIds = useMemo(() => sortedItems.map((i) => i.checklistId), [sortedItems]);

  const archivedItemIds = useMemo(
    () => smartItems.filter((i) => i.isArchived).map((i) => i.id),
    [smartItems],
  );

  const ensureArchivedVisible = useCallback(() => {
    if (!archivedVisible) toggleArchivedVisible();
  }, [archivedVisible, toggleArchivedVisible]);

  const { highlightedItemId } = useChecklistCrossFocusListener({
    taskId,
    checklistItemIds,
    archivedItemIds,
    setItemExpanded,
    ensureArchivedVisible,
  });

  const [stepLinkCopyHint, setStepLinkCopyHint] = useState<string | null>(null);
  const [copyLinkStateByItemId, setCopyLinkStateByItemId] = useState<Record<string, CopyLinkState>>({});
  const copyTimersRef = useRef<Map<string, number>>(new Map());
  const [deepLinkHint, setDeepLinkHint] = useState<string | null>(null);

  const checklistReady = !loading;
  useChecklistStepDeepLinkConsumer({
    taskId,
    checklistItemIds,
    taskReady: Boolean(taskId.trim()),
    checklistLoading: loading,
    checklistReady,
    onResolutionMessage: setDeepLinkHint,
  });

  const handleCopyStepLink = useCallback(
    (checklistItemId: string) => {
      if (copyLinkStateByItemId[checklistItemId] === 'copying') return;
      setCopyLinkStateByItemId((prev) => ({ ...prev, [checklistItemId]: 'copying' }));
      void copyChecklistStepLinkToClipboard(taskId, checklistItemId).then((res) => {
        const nextState: CopyLinkState = res.status === 'GO' ? 'copied' : 'failed';
        setCopyLinkStateByItemId((prev) => ({ ...prev, [checklistItemId]: nextState }));
        if (res.message) setStepLinkCopyHint(res.message);
        showChecklistToast(
          res.status === 'GO' ? 'Đã sao chép link' : 'Không thể sao chép link',
          res.status === 'GO' ? 'success' : 'error',
        );
        const existing = copyTimersRef.current.get(checklistItemId);
        if (existing) window.clearTimeout(existing);
        const timer = window.setTimeout(() => {
          setCopyLinkStateByItemId((prev) => ({ ...prev, [checklistItemId]: 'idle' }));
          setStepLinkCopyHint(null);
          copyTimersRef.current.delete(checklistItemId);
        }, 1600);
        copyTimersRef.current.set(checklistItemId, timer);
      });
    },
    [copyLinkStateByItemId, taskId],
  );

  const [newTitle, setNewTitle] = useState('');
  const [interactionStateByItemId, setInteractionStateByItemId] = useState<Record<string, InteractionState>>(
    {},
  );
  const [interactionMessageByItemId, setInteractionMessageByItemId] = useState<Record<string, string | null>>(
    {},
  );
  const interactionTimersRef = useRef<Map<string, number>>(new Map());
  const [editItemId, setEditItemId] = useState<string | null>(null);
  const [editField, setEditField] = useState<EditField>(null);
  const [titleDraft, setTitleDraft] = useState('');
  const [noteDraft, setNoteDraft] = useState('');
  const dualPaneCtx = useChecklistDualPaneFocusOptional();
  const dualPaneOn =
    isChecklistDualPaneRuntimeEnabled() && Boolean(dualPaneCtx?.dualPaneEnabled);
  const [localFocusedChecklistItemId, setLocalFocusedChecklistItemId] = useState<string | null>(
    null,
  );
  const focusedChecklistItemId = dualPaneOn
    ? dualPaneCtx!.focusedChecklistItemId
    : localFocusedChecklistItemId;
  const setFocusedChecklistItemId = dualPaneOn
    ? dualPaneCtx!.setFocusedChecklistItemId
    : setLocalFocusedChecklistItemId;
  const [focusWorkspaceEnabled, setFocusWorkspaceEnabled] = useState(false);
  const [focusBarInlineIntent, setFocusBarInlineIntent] = useState<
    'feedback' | 'attachments' | 'links' | 'history' | null
  >(null);

  useEffect(
    () => () => {
      interactionTimersRef.current.forEach((timer) => window.clearTimeout(timer));
      interactionTimersRef.current.clear();
      copyTimersRef.current.forEach((timer) => window.clearTimeout(timer));
      copyTimersRef.current.clear();
    },
    [],
  );

  useEffect(() => {
    setFocusedChecklistItemId(null);
  }, [taskId, setFocusedChecklistItemId]);

  useEffect(() => {
    if (!highlightedItemId) return;
    setFocusedChecklistItemId(highlightedItemId);
  }, [highlightedItemId, setFocusedChecklistItemId]);

  useEffect(() => {
    if (!dualPaneOn || !dualPaneCtx) return;
    const item = smartItems.find((i) => i.id === focusedChecklistItemId) ?? null;
    dualPaneCtx.setFocusedItem(item);
  }, [dualPaneOn, dualPaneCtx, focusedChecklistItemId, smartItems]);

  useEffect(() => {
    if (!dualPaneOn || !dualPaneCtx) return;
    dualPaneCtx.registerRowActions({
      onAddFeedback: (itemId, message) => {
        const res = addFeedback(itemId, message);
        if (res.ok) {
          recordEvent({
            checklistItemId: itemId,
            type: 'feedback_added',
            message: `Thêm phản hồi: ${message.trim()}`,
            source: 'feedback_runtime',
            refId: res.feedback.id,
            refType: 'feedback',
          });
        }
      },
      onRegisterAttachment: (itemId, input) => {
        const res = registerAttachment(itemId, input);
        if (res.ok) {
          recordEvent({
            checklistItemId: itemId,
            type: 'attachment_added',
            message: `Thêm tài liệu: ${res.attachment.name}`,
            source: 'attachment_runtime',
            refId: res.attachment.id,
            refType: 'attachment',
          });
        }
      },
      onRegisterAttachmentFromTask: (itemId, ref) => {
        const res = registerFromTaskAttachment(itemId, ref);
        if (res.ok) {
          recordEvent({
            checklistItemId: itemId,
            type: 'attachment_added',
            message: `Thêm tài liệu: ${res.attachment.name}`,
            source: 'attachment_runtime',
            refId: res.attachment.id,
            refType: 'attachment',
          });
        }
      },
      onUploadAttachmentFile: async (itemId, file) => {
        await uploadFile(itemId, file);
      },
      onRemoveAttachment: (itemId, attachmentId) => {
        const name =
          (attachmentsByItemId[itemId] ?? []).find((a) => a.id === attachmentId)?.name ??
          attachmentId;
        const res = removeAttachment(itemId, attachmentId);
        if (res.ok) {
          recordEvent({
            checklistItemId: itemId,
            type: 'attachment_removed',
            message: `Gỡ tài liệu: ${name}`,
            source: 'attachment_runtime',
            refId: attachmentId,
            refType: 'attachment',
          });
        }
      },
      onRegisterLink: (itemId, input) => {
        const res = registerLink(itemId, input);
        if (res.ok) {
          recordEvent({
            checklistItemId: itemId,
            type: 'link_added',
            message: `Thêm liên kết: ${res.link.label}`,
            source: 'link_runtime',
            refId: res.link.id,
            refType: 'link',
          });
        }
      },
      onRegisterLinkFromTask: (itemId, ref) => {
        const res = registerLinkFromTaskAttachment(itemId, ref);
        if (res.ok) {
          recordEvent({
            checklistItemId: itemId,
            type: 'link_added',
            message: `Thêm liên kết: ${res.link.label}`,
            source: 'link_runtime',
            refId: res.link.id,
            refType: 'link',
          });
        }
      },
      onRemoveLink: (itemId, linkId) => {
        const label = (linksByItemId[itemId] ?? []).find((l) => l.id === linkId)?.label ?? linkId;
        const res = removeLink(itemId, linkId);
        if (res.ok) {
          recordEvent({
            checklistItemId: itemId,
            type: 'link_removed',
            message: `Gỡ liên kết: ${label}`,
            source: 'link_runtime',
            refId: linkId,
            refType: 'link',
          });
        }
      },
      onAddManualHistoryNote: (itemId, message) => {
        addManualNote(itemId, message);
      },
    });
    return () => dualPaneCtx.registerRowActions(null);
  }, [
    dualPaneOn,
    dualPaneCtx,
    addFeedback,
    registerAttachment,
    registerFromTaskAttachment,
    uploadFile,
    removeAttachment,
    attachmentsByItemId,
    registerLink,
    registerLinkFromTaskAttachment,
    removeLink,
    linksByItemId,
    addManualNote,
    recordEvent,
  ]);

  useEffect(() => {
    if (!focusWorkspaceEnabled) return;
    if (visibleItems.length === 0) {
      setFocusedChecklistItemId(null);
      return;
    }
    if (!focusedChecklistItemId || !visibleItems.some((i) => i.id === focusedChecklistItemId)) {
      setFocusedChecklistItemId(visibleItems[0].id);
    }
  }, [focusWorkspaceEnabled, focusedChecklistItemId, visibleItems]);

  const resetEdit = () => {
    setEditItemId(null);
    setEditField(null);
    setTitleDraft('');
    setNoteDraft('');
  };

  const setInteractionFeedback = useCallback(
    (itemId: string, state: InteractionState, message?: string | null, clearAfterMs?: number) => {
      setInteractionStateByItemId((prev) => ({ ...prev, [itemId]: state }));
      setInteractionMessageByItemId((prev) => ({ ...prev, [itemId]: message ?? null }));
      const existing = interactionTimersRef.current.get(itemId);
      if (existing) window.clearTimeout(existing);
      if (clearAfterMs && clearAfterMs > 0) {
        const timer = window.setTimeout(() => {
          setInteractionStateByItemId((prev) => ({ ...prev, [itemId]: 'idle' }));
          setInteractionMessageByItemId((prev) => ({ ...prev, [itemId]: null }));
          interactionTimersRef.current.delete(itemId);
        }, clearAfterMs);
        interactionTimersRef.current.set(itemId, timer);
      }
    },
    [],
  );

  const startEditTitle = (id: string, title: string) => {
    setEditItemId(id);
    setEditField('title');
    setTitleDraft(title);
  };

  const startEditNote = (id: string, note: string) => {
    setEditItemId(id);
    setEditField('note');
    setNoteDraft(note);
    setItemExpanded(id, true);
  };

  const handleAdd = async () => {
    const title = newTitle.trim();
    if (!title) return;
    const res = await createItem(title);
    if (res.ok) {
      setNewTitle('');
      recordEvent({
        checklistItemId: res.item.checklistId,
        type: 'manual_history_note_added',
        message: `Tạo bước: ${title}`,
        source: 'checklist_runtime',
        refType: 'checklist',
      });
    }
  };

  const handleSaveTitle = async (id: string) => {
    const trimmed = titleDraft.trim();
    if (!trimmed) {
      resetEdit();
      return;
    }
    if (!(await guardWrite('update'))) return;
    const prev = smartItems.find((i) => i.id === id)?.title ?? '';
    setInteractionFeedback(id, 'pending', 'Đang lưu...');
    const res = await updateItem(id, trimmed);
    if (res.ok && trimmed !== prev) {
      showChecklistToast('Đã cập nhật checklist', 'success');
      setInteractionFeedback(id, 'saved', 'Đã lưu', 1400);
      markLocalMutation();
      recordEvent({
        checklistItemId: id,
        type: 'manual_history_note_added',
        message: `Sửa tên bước: ${trimmed}`,
        source: 'checklist_runtime',
        refType: 'checklist',
      });
    }
    if (!res.ok) {
      setInteractionFeedback(id, 'failed', 'Lưu thất bại', 2600);
      showChecklistToast('Lưu thất bại', 'error');
    }
    resetEdit();
  };

  const handleSaveNote = async (id: string) => {
    if (!(await guardWrite('update'))) return;
    const prev = smartItems.find((i) => i.id === id)?.note ?? '';
    const trimmed = noteDraft.trim();
    setInteractionFeedback(id, 'pending', 'Đang lưu...');
    setNote(id, trimmed);
    if (trimmed !== prev) {
      markLocalMutation();
      setInteractionFeedback(id, 'saved', 'Đã lưu', 1400);
      showChecklistToast('Đã lưu', 'success');
      recordEvent({
        checklistItemId: id,
        type: 'manual_history_note_added',
        message: trimmed ? `Cập nhật ghi chú: ${trimmed}` : 'Xóa ghi chú bước.',
        source: 'checklist_runtime',
        refType: 'checklist',
      });
    }
    if (trimmed === prev) setInteractionFeedback(id, 'saved', 'Đã lưu', 1100);
    resetEdit();
  };

  const handleArchive = async (id: string, title: string) => {
    if (!(await guardWrite('update'))) return;
    setInteractionFeedback(id, 'pending', 'Đang lưu...');
    setArchived(id, true);
    setItemExpanded(id, false);
    markLocalMutation();
    recordEvent({
      checklistItemId: id,
      type: 'manual_history_note_added',
      message: `Lưu trữ bước: ${title}`,
      source: 'checklist_runtime',
      refType: 'checklist',
    });
    setInteractionFeedback(id, 'saved', 'Đã lưu', 1400);
    showChecklistToast('Đã cập nhật checklist', 'success');
  };

  const handleRestore = async (id: string, title: string) => {
    if (!(await guardWrite('update'))) return;
    setInteractionFeedback(id, 'pending', 'Đang lưu...');
    setArchived(id, false);
    markLocalMutation();
    recordEvent({
      checklistItemId: id,
      type: 'manual_history_note_added',
      message: `Khôi phục bước: ${title}`,
      source: 'checklist_runtime',
      refType: 'checklist',
    });
    setInteractionFeedback(id, 'saved', 'Đã lưu', 1400);
    showChecklistToast('Đã cập nhật checklist', 'success');
  };

  const currentMaxSortOrder = useMemo(
    () =>
      sortedItems.reduce(
        (max, row) => (Number.isFinite(row.sortOrder) ? Math.max(max, row.sortOrder) : max),
        0,
      ),
    [sortedItems],
  );

  const handleApplyTemplate = async () => {
    if (!selectedTemplate || !allowMutate) return;
    setTemplateApplying(true);
    const result = await applyChecklistTemplateAppend({
      template: selectedTemplate,
      taskId,
      actor: operator.displayName ?? operator.userId ?? null,
      currentMaxSortOrder,
      createItem,
      setNote,
      markDone: (checklistId) => toggleItem(checklistId, true),
      mode: 'append',
    });
    setTemplateApplying(false);
    if (!result.ok) return;

    const tplName = selectedTemplate.name;
    const firstId = result.createdIds[0];
    if (firstId) {
      recordEvent({
        checklistItemId: firstId,
        type: 'manual_history_note_added',
        message: `Áp dụng mẫu "${tplName}" (${result.createdIds.length} bước)`,
        source: 'checklist_runtime',
        refType: 'checklist',
        metadata: {
          templateId: selectedTemplate.id,
          templateName: tplName,
          createdChecklistItemIds: result.createdIds,
        },
      });
    }
    for (const checklistId of result.createdIds) {
      recordEvent({
        checklistItemId: checklistId,
        type: 'manual_history_note_added',
        message: `Tạo bước từ mẫu "${tplName}"`,
        source: 'checklist_runtime',
        refType: 'checklist',
        metadata: { templateId: selectedTemplate.id, templateName: tplName },
      });
    }
    setTemplatePanelOpen(false);
    clearSelection();
  };

  const indexInSorted = (id: string) => sortedItems.findIndex((i) => i.checklistId === id);
  const workspaceFocusedId =
    focusWorkspaceEnabled && focusedChecklistItemId && visibleItems.some((i) => i.id === focusedChecklistItemId)
      ? focusedChecklistItemId
      : null;
  const focusedWorkspaceIndex = workspaceFocusedId
    ? visibleItems.findIndex((i) => i.id === workspaceFocusedId)
    : -1;
  const workspaceMainItems =
    focusWorkspaceEnabled && workspaceFocusedId
      ? visibleItems.filter((i) => i.id === workspaceFocusedId)
      : visibleItems;
  const workspaceNavigatorItems =
    focusWorkspaceEnabled && workspaceFocusedId
      ? visibleItems.filter((i) => i.id !== workspaceFocusedId)
      : [];

  const focusedStepDisplayTitle = useMemo(() => {
    if (!focusedChecklistItemId) return null;
    const item =
      visibleItems.find((i) => i.id === focusedChecklistItemId) ??
      smartItems.find((i) => i.id === focusedChecklistItemId);
    const title = item?.title?.trim();
    return title || 'bước đang chọn';
  }, [focusedChecklistItemId, visibleItems, smartItems]);

  const focusedStepItem = useMemo(() => {
    if (!focusedChecklistItemId) return null;
    return (
      visibleItems.find((i) => i.id === focusedChecklistItemId) ??
      smartItems.find((i) => i.id === focusedChecklistItemId) ??
      null
    );
  }, [focusedChecklistItemId, visibleItems, smartItems]);

  const handleCompleteFocusedStep = useCallback(() => {
    if (!focusedStepItem || focusedStepItem.status === 'done') return;
    setInteractionFeedback(focusedStepItem.id, 'pending', 'Đang lưu...');
    void toggleItem(focusedStepItem.id).then((res) => {
      if (!res.ok) {
        setInteractionFeedback(focusedStepItem.id, 'failed', 'Lưu thất bại', 2600);
        showChecklistToast('Lưu thất bại', 'error');
        return;
      }
      setInteractionFeedback(focusedStepItem.id, 'saved', 'Đã lưu', 1400);
      recordEvent({
        checklistItemId: focusedStepItem.id,
        type: 'checklist_status_changed',
        message: 'Đánh dấu bước hoàn thành.',
        source: 'checklist_runtime',
        refType: 'checklist',
      });
    });
  }, [focusedStepItem, toggleItem, recordEvent, setInteractionFeedback]);

  const handleFocusStepNote = useCallback(() => {
    if (!focusedStepItem || !allowMutate) return;
    setFocusBarInlineIntent(null);
    setFocusedChecklistItemId(focusedStepItem.id);
    startEditNote(focusedStepItem.id, focusedStepItem.note ?? '');
  }, [focusedStepItem, allowMutate, setFocusedChecklistItemId, startEditNote]);

  const handleFocusStepAttachment = useCallback(() => {
    if (!focusedStepItem) return;
    setFocusedChecklistItemId(focusedStepItem.id);
    setItemExpanded(focusedStepItem.id, true);
    setFocusBarInlineIntent('attachments');
  }, [focusedStepItem, setFocusedChecklistItemId, setItemExpanded]);

  return (
    <section
      className={
        dense
          ? 'work-inbox-focus-card work-inbox-focus-card--checklist work-inbox-focus-card--checklist-dense work-inbox-smart-checklist work-inbox-smart-checklist--operator-density'
          : 'work-inbox-focus-card work-inbox-focus-card--checklist work-inbox-smart-checklist'
      }
      aria-label="Checklist việc"
      data-checklist-dual-pane={dualPaneOn ? 'true' : 'false'}
    >
      <h3 className="work-inbox-focus-card__title">CHECKLIST</h3>
      <div
        className="work-inbox-checklist-progress"
        data-checklist-progress-total={checklistProgress.totalSteps}
        data-checklist-progress-completed={checklistProgress.completedSteps}
        data-checklist-progress-percent={checklistProgress.percentComplete}
        aria-label={`Tiến độ checklist ${checklistProgress.completedSteps}/${checklistProgress.totalSteps}, ${checklistProgress.percentComplete}%`}
      >
        <div className="work-inbox-checklist-progress__meta">
          <strong>
            {checklistProgress.completedSteps} / {checklistProgress.totalSteps} bước
          </strong>
          <span>{checklistProgress.percentComplete}%</span>
          <span>Còn lại {checklistProgress.remainingSteps}</span>
        </div>
        <div className="work-inbox-checklist-progress__bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={checklistProgress.percentComplete}>
          <div
            className="work-inbox-checklist-progress__fill"
            style={{ width: `${checklistProgress.percentComplete}%` }}
          />
        </div>
      </div>
      <div
        className="work-inbox-checklist-focus-bar"
        data-focus-workspace-enabled={focusWorkspaceEnabled ? 'true' : 'false'}
        data-cbv-checklist-focus-bar="single-row"
      >
        <div className="work-inbox-checklist-focus-bar__row">
          {!focusWorkspaceEnabled ? (
            <button
              type="button"
              className="work-inbox-checklist-focus-workspace__btn work-inbox-checklist-focus-bar__action shrink-0"
              disabled={visibleItems.length === 0}
              onClick={() => {
                if (!focusedChecklistItemId && visibleItems[0]) setFocusedChecklistItemId(visibleItems[0].id);
                setFocusWorkspaceEnabled(true);
              }}
            >
              Tập trung bước
            </button>
          ) : (
            <div className="work-inbox-checklist-focus-workspace__controls shrink-0">
              <button
                type="button"
                className="work-inbox-checklist-focus-workspace__btn"
                onClick={() => setFocusWorkspaceEnabled(false)}
              >
                Thoát tập trung
              </button>
              <button
                type="button"
                className="work-inbox-checklist-focus-workspace__btn"
                disabled={focusedWorkspaceIndex <= 0}
                onClick={() => {
                  if (focusedWorkspaceIndex > 0) setFocusedChecklistItemId(visibleItems[focusedWorkspaceIndex - 1].id);
                }}
              >
                Bước trước
              </button>
              <button
                type="button"
                className="work-inbox-checklist-focus-workspace__btn"
                disabled={focusedWorkspaceIndex < 0 || focusedWorkspaceIndex >= visibleItems.length - 1}
                onClick={() => {
                  if (focusedWorkspaceIndex >= 0 && focusedWorkspaceIndex < visibleItems.length - 1) {
                    setFocusedChecklistItemId(visibleItems[focusedWorkspaceIndex + 1].id);
                  }
                }}
              >
                Bước sau
              </button>
              <button
                type="button"
                className="work-inbox-checklist-focus-workspace__btn"
                onClick={() => setFocusedChecklistItemId(null)}
              >
                Bỏ focus
              </button>
            </div>
          )}
          {focusedChecklistItemId && focusedStepDisplayTitle ? (
            <div
              className="work-inbox-checklist-focus-status"
              role="status"
              data-checklist-focus-status="active"
            >
              <p className="work-inbox-checklist-focus-status__label m-0 min-w-0">
                <span className="work-inbox-checklist-focus-status__icon" aria-hidden>
                  ▶{' '}
                </span>
                ĐANG LÀM:{' '}
                <strong className="work-inbox-checklist-focus-status__title" title={focusedStepDisplayTitle}>
                  {focusedStepDisplayTitle}
                </strong>
              </p>
              {!focusWorkspaceEnabled ? (
                <div className="work-inbox-checklist-focus-status__actions shrink-0">
                  <button
                    type="button"
                    className="work-inbox-checklist-focus-bar__complete"
                    disabled={
                      !focusedStepItem ||
                      focusedStepItem.status === 'done' ||
                      mutatingId === focusedStepItem.id
                    }
                    title={
                      focusedStepItem?.status === 'done'
                        ? 'Bước đã hoàn thành'
                        : 'Đánh dấu bước đang focus là hoàn thành'
                    }
                    onClick={() => handleCompleteFocusedStep()}
                  >
                    Hoàn thành bước
                  </button>
                  <button
                    type="button"
                    className="work-inbox-checklist-focus-bar__secondary"
                    disabled={!focusedStepItem || !allowMutate}
                    title={allowMutate ? 'Ghi chú cho bước đang làm' : 'Không có quyền chỉnh sửa'}
                    onClick={() => handleFocusStepNote()}
                  >
                    Ghi chú
                  </button>
                  <button
                    type="button"
                    className="work-inbox-checklist-focus-bar__secondary"
                    disabled={!focusedStepItem || !allowMutate}
                    title={allowMutate ? 'Mở tài liệu đính kèm bước' : 'Không có quyền chỉnh sửa'}
                    onClick={() => handleFocusStepAttachment()}
                  >
                    Thêm tài liệu
                  </button>
                  <button
                    type="button"
                    className="work-inbox-checklist__retry work-inbox-checklist-focus-status__clear"
                    onClick={() => {
                      setFocusBarInlineIntent(null);
                      setFocusedChecklistItemId(null);
                    }}
                  >
                    Bỏ focus
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
        {focusWorkspaceEnabled && workspaceNavigatorItems.length > 0 ? (
          <div className="work-inbox-checklist-focus-workspace__navigator">
            {workspaceNavigatorItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className="work-inbox-checklist-focus-workspace__step"
                onClick={() => setFocusedChecklistItemId(item.id)}
              >
                {item.title}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {deepLinkHint ? (
        <p className="work-inbox-checklist__hint" role="status">
          {deepLinkHint}
        </p>
      ) : null}

      {stepLinkCopyHint ? (
        <p className="work-inbox-checklist__hint" role="status">
          {stepLinkCopyHint}
        </p>
      ) : null}

      <ChecklistListToolbar
        allowMutate={allowMutate}
        archivedVisible={archivedVisible}
        busy={mutatingId === '__create__' || templateApplying}
        addTitle={newTitle}
        onAddTitleChange={setNewTitle}
        onAddStep={() => void handleAdd()}
        onExpandAll={() => expandAll(activeItemIds)}
        onCollapseAll={() => collapseAll()}
        onToggleArchivedVisible={toggleArchivedVisible}
        templatesOpen={templatePanelOpen}
        onOpenTemplates={() => {
          setTemplatePanelOpen((open) => {
            const next = !open;
            if (!next) clearSelection();
            return next;
          });
        }}
      />

      {allowMutate && canShowChecklistMigrationTools() ? (
        <ChecklistMigrationPanel taskId={taskId} operator={operator} />
      ) : null}

      <ChecklistTemplatePanel
        open={templatePanelOpen && allowMutate}
        templates={templates}
        selectedTemplate={selectedTemplate}
        busy={mutatingId === '__create__'}
        applying={templateApplying}
        onSelectTemplate={selectTemplate}
        onApply={() => void handleApplyTemplate()}
        onClose={() => {
          setTemplatePanelOpen(false);
          clearSelection();
        }}
      />

      {loading && items.length === 0 ? (
        <p className="work-inbox-focus-card__body work-inbox-checklist__hint">Đang tải checklist…</p>
      ) : null}

      {error ? (
        <p className="work-inbox-checklist__error" role="alert">
          {error}{' '}
          <button type="button" className="work-inbox-checklist__retry" onClick={() => void reload()}>
            Thử lại
          </button>
        </p>
      ) : null}

      <ul className="work-inbox-focus-card__checklist work-inbox-smart-checklist__list">
        {workspaceMainItems.map((item) => {
          const done = item.status === 'done';
          const busy = mutatingId === item.id;
          const idx = indexInSorted(item.id);
          const canMoveUp = idx > 0;
          const canMoveDown = idx >= 0 && idx < sortedItems.length - 1;
          const layoutExpanded = item.layoutExpanded ?? isExpanded(item.id);

          return (
            <SmartChecklistItemRow
              key={item.id}
              item={item}
              checklistDomId={checklistItemDomId(item.id)}
              crossFocusHighlighted={highlightedItemId === item.id}
              done={done}
              busy={busy}
              allowMutate={allowMutate}
              layoutExpanded={layoutExpanded}
              isArchived={Boolean(item.isArchived)}
              canMoveUp={canMoveUp}
              canMoveDown={canMoveDown}
              editingTitle={editItemId === item.id && editField === 'title'}
              editingNote={editItemId === item.id && editField === 'note'}
              titleDraft={editItemId === item.id ? titleDraft : ''}
              noteDraft={editItemId === item.id ? noteDraft : ''}
              taskAttachments={taskAttachments}
              onToggle={() => {
                setInteractionFeedback(item.id, 'pending', 'Đang lưu...');
                const wasDone = item.status === 'done';
                void toggleItem(item.id).then((res) => {
                  if (!res.ok) {
                    setInteractionFeedback(item.id, 'failed', 'Lưu thất bại', 2600);
                    showChecklistToast('Lưu thất bại', 'error');
                    return;
                  }
                  setInteractionFeedback(item.id, 'saved', 'Đã lưu', 1400);
                  recordEvent({
                    checklistItemId: item.id,
                    type: 'checklist_status_changed',
                    message: wasDone
                      ? 'Đánh dấu chưa hoàn thành.'
                      : 'Đánh dấu bước hoàn thành.',
                    source: 'checklist_runtime',
                    refType: 'checklist',
                  });
                });
              }}
              onTitleDraftChange={setTitleDraft}
              onNoteDraftChange={setNoteDraft}
              onSaveTitle={() => void handleSaveTitle(item.id)}
              onSaveNote={() => void handleSaveNote(item.id)}
              onCancelEdit={resetEdit}
              onStartEditTitle={() => {
                setFocusedChecklistItemId(item.id);
                setItemExpanded(item.id, true);
                startEditTitle(item.id, item.title);
              }}
              onStartEditNote={() => {
                setFocusedChecklistItemId(item.id);
                startEditNote(item.id, item.note ?? '');
              }}
              onToggleLayout={(expanded) => {
                setFocusedChecklistItemId(item.id);
                setItemExpanded(item.id, expanded);
              }}
              onMoveUp={() => {
                setInteractionFeedback(item.id, 'pending', 'Đang lưu...');
                void reorderItem(item.id, 'up').then((res) => {
                  if (res.ok) {
                    setInteractionFeedback(item.id, 'saved', 'Đã lưu', 1400);
                    recordEvent({
                      checklistItemId: item.id,
                      type: 'manual_history_note_added',
                      message: `Di chuyển lên: ${item.title}`,
                      source: 'checklist_runtime',
                      refType: 'checklist',
                    });
                  }
                  if (!res.ok) setInteractionFeedback(item.id, 'failed', 'Lưu thất bại', 2600);
                });
              }}
              onMoveDown={() => {
                setInteractionFeedback(item.id, 'pending', 'Đang lưu...');
                void reorderItem(item.id, 'down').then((res) => {
                  if (res.ok) {
                    setInteractionFeedback(item.id, 'saved', 'Đã lưu', 1400);
                    recordEvent({
                      checklistItemId: item.id,
                      type: 'manual_history_note_added',
                      message: `Di chuyển xuống: ${item.title}`,
                      source: 'checklist_runtime',
                      refType: 'checklist',
                    });
                  }
                  if (!res.ok) setInteractionFeedback(item.id, 'failed', 'Lưu thất bại', 2600);
                });
              }}
              onArchive={() => void handleArchive(item.id, item.title)}
              onRestore={() => void handleRestore(item.id, item.title)}
              onAddFeedback={(message) => {
                const res = addFeedback(item.id, message);
                if (res.ok) {
                  recordEvent({
                    checklistItemId: item.id,
                    type: 'feedback_added',
                    message: `Thêm phản hồi: ${message.trim()}`,
                    source: 'feedback_runtime',
                    refId: res.feedback.id,
                    refType: 'feedback',
                  });
                }
              }}
              onRegisterAttachment={(input) => {
                const res = registerAttachment(item.id, input);
                if (res.ok) {
                  recordEvent({
                    checklistItemId: item.id,
                    type: 'attachment_added',
                    message: `Thêm tài liệu: ${res.attachment.name}`,
                    source: 'attachment_runtime',
                    refId: res.attachment.id,
                    refType: 'attachment',
                  });
                }
              }}
              onRegisterAttachmentFromTask={(ref) => {
                const res = registerFromTaskAttachment(item.id, ref);
                if (res.ok) {
                  recordEvent({
                    checklistItemId: item.id,
                    type: 'attachment_added',
                    message: `Thêm tài liệu: ${res.attachment.name}`,
                    source: 'attachment_runtime',
                    refId: res.attachment.id,
                    refType: 'attachment',
                  });
                }
              }}
              onUploadAttachmentFile={async (file) => {
                const res = await uploadFile(item.id, file);
                if (res.ok) {
                  recordEvent({
                    checklistItemId: item.id,
                    type: 'file_uploaded',
                    message: `Tải lên Drive: ${file.name}`,
                    source: 'attachment_runtime',
                    refId: res.attachmentId ?? undefined,
                    refType: 'attachment',
                    metadata: {
                      driveFileId: res.driveFileId,
                      driveUrl: res.driveUrl,
                    },
                  });
                }
              }}
              uploadAttachmentBusy={uploadingItemId === item.id}
              onRemoveAttachment={(attachmentId) => {
                const name =
                  (attachmentsByItemId[item.id] ?? []).find((a) => a.id === attachmentId)?.name ??
                  attachmentId;
                const res = removeAttachment(item.id, attachmentId);
                if (res.ok) {
                  recordEvent({
                    checklistItemId: item.id,
                    type: 'attachment_removed',
                    message: `Gỡ tài liệu: ${name}`,
                    source: 'attachment_runtime',
                    refId: attachmentId,
                    refType: 'attachment',
                  });
                }
              }}
              onRegisterLink={(input) => {
                const res = registerLink(item.id, input);
                if (res.ok) {
                  recordEvent({
                    checklistItemId: item.id,
                    type: 'link_added',
                    message: `Thêm liên kết: ${res.link.label}`,
                    source: 'link_runtime',
                    refId: res.link.id,
                    refType: 'link',
                  });
                }
              }}
              onRegisterLinkFromTask={(ref) => {
                const res = registerLinkFromTaskAttachment(item.id, ref);
                if (res.ok) {
                  recordEvent({
                    checklistItemId: item.id,
                    type: 'link_added',
                    message: `Thêm liên kết: ${res.link.label}`,
                    source: 'link_runtime',
                    refId: res.link.id,
                    refType: 'link',
                  });
                }
              }}
              onRemoveLink={(linkId) => {
                const label =
                  (linksByItemId[item.id] ?? []).find((l) => l.id === linkId)?.label ?? linkId;
                const res = removeLink(item.id, linkId);
                if (res.ok) {
                  recordEvent({
                    checklistItemId: item.id,
                    type: 'link_removed',
                    message: `Gỡ liên kết: ${label}`,
                    source: 'link_runtime',
                    refId: linkId,
                    refType: 'link',
                  });
                }
              }}
              onAddManualHistoryNote={(message) => {
                setFocusedChecklistItemId(item.id);
                addManualNote(item.id, message);
              }}
              onCopyStepLink={() => handleCopyStepLink(item.id)}
              copyStepLinkTitle={
                copyLinkStateByItemId[item.id] === 'copying'
                  ? 'Đang sao chép...'
                  : copyLinkStateByItemId[item.id] === 'copied'
                    ? 'Đã sao chép link'
                    : copyLinkStateByItemId[item.id] === 'failed'
                      ? 'Không thể sao chép link'
                      : stepLinkCopyHint ?? '📋 Sao chép link'
              }
              interactionState={busy ? 'pending' : interactionStateByItemId[item.id] ?? 'idle'}
              interactionMessage={busy ? 'Đang lưu...' : interactionMessageByItemId[item.id] ?? null}
              navigatorOnly={dualPaneOn}
              densityMode={dense}
              focusInlineIntent={
                focusedChecklistItemId === item.id ? focusBarInlineIntent : null
              }
              onFocusInlineIntentConsumed={() => setFocusBarInlineIntent(null)}
              onActivateStep={() => {
                if (focusedChecklistItemId === item.id) setFocusedChecklistItemId(null);
                else setFocusedChecklistItemId(item.id);
              }}
              focusState={
                focusWorkspaceEnabled
                  ? workspaceFocusedId === item.id
                    ? 'focused'
                    : 'dimmed'
                  : !focusedChecklistItemId
                    ? 'none'
                    : focusedChecklistItemId === item.id
                      ? 'focused'
                      : 'dimmed'
              }
            />
          );
        })}
      </ul>

      {visibleItems.length === 0 && !loading ? (
        <p className="work-inbox-checklist__hint">
          {archivedVisible
            ? 'Chưa có mục checklist — thêm bước đầu tiên ở thanh công cụ.'
            : 'Chưa có mục đang mở — thêm bước hoặc bật hiện bước lưu trữ.'}
        </p>
      ) : null}

      {archivedVisible && smartItems.some((i) => i.isArchived) ? (
        <p className="work-inbox-checklist__hint work-inbox-checklist__hint--archived">
          Các bước lưu trữ vẫn giữ phản hồi/tài liệu/liên kết trong bộ nhớ cục bộ.
        </p>
      ) : null}
    </section>
  );
}
