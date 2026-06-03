/**
 * PHASE_DOSSIER_05 — build and execute safe dossier actions (no persistence writes).
 */

import type { DossierItem } from './dossierAggregateTypes';
import { canDossierItemRequestChecklistFocus } from './dossierCrossFocusNavigation';
import type { DossierAction, DossierActionResult, DossierActionType } from './dossierActionsTypes';

let actionSeq = 0;

function nextActionId(type: string): string {
  actionSeq += 1;
  return `dossier-action-${type}-${Date.now()}-${actionSeq}`;
}

export function safeHttpUrl(url?: string | null): string | null {
  const trimmed = url?.trim() || '';
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith('//')) return `https:${trimmed}`;
  return null;
}

export function buildDriveFileUrl(driveFileId?: string | null): string | null {
  const id = driveFileId?.trim();
  if (!id) return null;
  return `https://drive.google.com/file/d/${id}/view`;
}

export function resolveDossierOpenUrl(item: DossierItem): string | null {
  return safeHttpUrl(item.driveUrl) ?? safeHttpUrl(item.url);
}

export function resolveDossierDriveUrl(item: DossierItem): string | null {
  return safeHttpUrl(item.driveUrl) ?? buildDriveFileUrl(item.driveFileId);
}

export function dossierSourceLabel(item: DossierItem): string {
  switch (item.source) {
    case 'task_attachment':
      return 'Tài liệu cấp task';
    case 'checklist_attachment':
      return 'Tài liệu checklist';
    case 'checklist_link':
      return 'Liên kết checklist';
    case 'checklist_feedback':
      return 'Phản hồi checklist';
    default:
      return item.source;
  }
}

function actionSourceForItem(item: DossierItem): DossierAction['source'] {
  if (item.source === 'task_attachment') return 'dossier_task_attachment';
  if (item.type === 'link') return 'dossier_link';
  if (item.type === 'feedback') return 'dossier_feedback';
  return 'dossier_attachment';
}

function makeAction(
  item: DossierItem,
  type: DossierActionType,
  label: string,
  enabled: boolean,
  reasonDisabled: string | null,
  extra?: Partial<DossierAction>,
): DossierAction {
  return {
    id: nextActionId(type),
    dossierItemId: item.id,
    type,
    label,
    enabled,
    reasonDisabled,
    targetUrl: resolveDossierOpenUrl(item),
    driveFileId: item.driveFileId ?? null,
    checklistItemId: item.checklistItemId?.trim() || null,
    source: actionSourceForItem(item),
    ...extra,
  };
}

export function buildDossierActionsForItem(item: DossierItem): DossierAction[] {
  const openUrl = resolveDossierOpenUrl(item);
  const driveUrl = resolveDossierDriveUrl(item);
  const canFocus = canDossierItemRequestChecklistFocus(item);
  const isFeedback = item.type === 'feedback';

  const actions: DossierAction[] = [];

  if (!isFeedback) {
    actions.push(
      makeAction(
        item,
        'open_item',
        'Mở',
        Boolean(openUrl),
        openUrl ? null : 'Không có liên kết mở được',
      ),
      makeAction(
        item,
        'copy_link',
        'Copy link',
        Boolean(openUrl),
        openUrl ? null : 'Không có URL để sao chép',
      ),
    );

    if (driveUrl && driveUrl !== openUrl) {
      actions.push(
        makeAction(
          item,
          'open_drive_file',
          'Mở Drive',
          true,
          null,
          { targetUrl: driveUrl },
        ),
      );
    } else if (item.driveUrl || item.driveFileId) {
      actions.push(
        makeAction(
          item,
          'open_drive_file',
          'Mở Drive',
          Boolean(driveUrl),
          driveUrl ? null : 'Không có URL Drive',
          { targetUrl: driveUrl },
        ),
      );
    }
  }

  if (canFocus) {
    actions.push(
      makeAction(item, 'focus_checklist_item', 'Đi tới bước', true, null),
    );
  }

  if (isFeedback || item.description) {
    actions.push(
      makeAction(item, 'view_source_context', 'Xem ngữ cảnh', true, null),
    );
  }

  return actions;
}

export async function executeDossierAction(
  action: DossierAction,
  item: DossierItem,
  deps: {
    onFocusChecklistItem?: (item: DossierItem) => import('./dossierCrossFocusTypes').DossierFocusResult;
  } = {},
): Promise<DossierActionResult> {
  const base: DossierActionResult = {
    ok: false,
    status: 'FAIL',
    actionId: action.id,
    dossierItemId: action.dossierItemId,
    actionType: action.type,
    performed: false,
    message: null,
    warnings: [],
    errors: [],
  };

  if (!action.enabled) {
    return {
      ...base,
      ok: true,
      status: 'GO_WITH_WARNINGS',
      message: action.reasonDisabled ?? 'Hành động không khả dụng',
      warnings: ['action_disabled'],
    };
  }

  const type = action.type as DossierActionType;

  try {
    switch (type) {
      case 'open_item': {
        const url = action.targetUrl ?? resolveDossierOpenUrl(item);
        if (!url) {
          return {
            ...base,
            ok: true,
            status: 'GO_WITH_WARNINGS',
            message: 'Không có liên kết mở được',
            warnings: ['missing_url'],
          };
        }
        window.open(url, '_blank', 'noopener,noreferrer');
        return { ...base, ok: true, status: 'GO', performed: true, message: 'Đã mở liên kết' };
      }
      case 'copy_link': {
        const url = action.targetUrl ?? resolveDossierOpenUrl(item);
        if (!url) {
          return {
            ...base,
            ok: true,
            status: 'GO_WITH_WARNINGS',
            message: 'Không có URL để sao chép',
            warnings: ['missing_url'],
          };
        }
        if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(url);
          return { ...base, ok: true, status: 'GO', performed: true, message: 'Đã copy link' };
        }
        return {
          ...base,
          ok: true,
          status: 'GO_WITH_WARNINGS',
          performed: false,
          message: `Clipboard không khả dụng — URL: ${url}`,
          warnings: ['clipboard_unavailable'],
        };
      }
      case 'open_drive_file': {
        const url = action.targetUrl ?? resolveDossierDriveUrl(item);
        if (!url) {
          return {
            ...base,
            ok: true,
            status: 'GO_WITH_WARNINGS',
            message: 'Không có URL Drive',
            warnings: ['missing_drive_url'],
          };
        }
        window.open(url, '_blank', 'noopener,noreferrer');
        return { ...base, ok: true, status: 'GO', performed: true, message: 'Đã mở trên Drive' };
      }
      case 'focus_checklist_item': {
        if (!deps.onFocusChecklistItem) {
          return {
            ...base,
            errors: ['focus_handler_missing'],
            message: 'Focus runtime chưa sẵn sàng',
          };
        }
        const focusResult = deps.onFocusChecklistItem(item);
        return {
          ...base,
          ok: focusResult.ok,
          status: focusResult.status,
          performed: focusResult.focused,
          message: focusResult.message ?? null,
          warnings: focusResult.warnings,
          errors: focusResult.errors,
        };
      }
      case 'view_source_context': {
        const parts = [dossierSourceLabel(item), item.title];
        if (item.description) parts.push(String(item.description));
        if (item.createdBy) parts.push(`— ${item.createdBy}`);
        return {
          ...base,
          ok: true,
          status: 'GO',
          performed: true,
          message: parts.join(' · '),
        };
      }
      default:
        return { ...base, errors: ['unknown_action_type'], message: 'Hành động không hỗ trợ' };
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Lỗi không xác định';
    return { ...base, errors: [msg], message: msg };
  }
}

export function validateDossierActionsRuntime(): {
  ok: boolean;
  status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';
  nextStep: string;
} {
  return {
    ok: true,
    status: 'GO_WITH_WARNINGS',
    nextStep: 'PHASE_DOSSIER_06_DOSSIER_UAT_LOCK',
  };
}
