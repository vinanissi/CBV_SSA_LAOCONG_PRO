/**
 * PHASE_DOSSIER_04 — build and validate dossier → checklist focus requests.
 */

import type { DossierGroup, DossierItem } from './dossierAggregateTypes';
import type {
  DossierFocusItemType,
  DossierFocusRequest,
  DossierFocusResult,
  DossierFocusSource,
} from './dossierCrossFocusTypes';
import {
  DOSSIER_STALE_CHECKLIST_ITEM_MESSAGE,
  DOSSIER_TASK_LEVEL_FOCUS_MESSAGE,
} from './dossierCrossFocusTypes';
import { publishDossierCrossFocus } from './dossierCrossFocusBus';

export const CHECKLIST_ITEM_DOM_ID_PREFIX = 'cbv-checklist-item-';

let focusSeq = 0;

export function checklistItemDomId(checklistItemId: string): string {
  return `${CHECKLIST_ITEM_DOM_ID_PREFIX}${checklistItemId.trim()}`;
}

function nextFocusId(): string {
  focusSeq += 1;
  return `dossier-focus-${Date.now()}-${focusSeq}`;
}

function focusSourceForItem(item: DossierItem): DossierFocusSource {
  if (item.type === 'link') return 'dossier_link';
  if (item.type === 'feedback') return 'dossier_feedback';
  return 'dossier_attachment';
}

export function buildDossierFocusRequestFromItem(
  item: DossierItem,
  taskId: string,
): DossierFocusRequest {
  return {
    id: nextFocusId(),
    taskId: taskId.trim(),
    checklistItemId: item.checklistItemId?.trim() || null,
    dossierItemId: item.id,
    dossierItemType: item.type as DossierFocusItemType,
    source: focusSourceForItem(item),
    behavior: { scroll: true, highlight: true, expand: true },
    createdAt: new Date().toISOString(),
  };
}

export function buildDossierFocusRequestFromGroup(
  group: DossierGroup,
  taskId: string,
): DossierFocusRequest | null {
  const checklistItemId = group.checklistItemId?.trim();
  if (!checklistItemId) return null;
  return {
    id: nextFocusId(),
    taskId: taskId.trim(),
    checklistItemId,
    dossierItemId: null,
    dossierItemType: undefined,
    source: 'dossier_group',
    behavior: { scroll: true, highlight: true, expand: true },
    createdAt: new Date().toISOString(),
  };
}

export function canDossierItemRequestChecklistFocus(item: DossierItem): boolean {
  return Boolean(item.checklistItemId?.trim()) && item.source !== 'task_attachment';
}

export function canDossierGroupRequestChecklistFocus(group: DossierGroup): boolean {
  return group.type === 'checklist_item' && Boolean(group.checklistItemId?.trim());
}

export function validateDossierFocusRequest(
  request: DossierFocusRequest,
  knownChecklistItemIds: string[],
): DossierFocusResult {
  const taskId = request.taskId.trim();
  const checklistItemId = request.checklistItemId?.trim() || null;
  const base: DossierFocusResult = {
    ok: false,
    status: 'FAIL',
    taskId,
    checklistItemId,
    dossierItemId: request.dossierItemId ?? null,
    focused: false,
    scrolled: false,
    highlighted: false,
    expanded: false,
    message: null,
    warnings: [],
    errors: [],
  };

  if (!checklistItemId) {
    return {
      ...base,
      ok: true,
      status: 'GO_WITH_WARNINGS',
      message: DOSSIER_TASK_LEVEL_FOCUS_MESSAGE,
      warnings: ['task_level_evidence'],
    };
  }

  const known = new Set(knownChecklistItemIds.map((id) => id.trim()).filter(Boolean));
  if (!known.has(checklistItemId)) {
    return {
      ...base,
      ok: true,
      status: 'GO_WITH_WARNINGS',
      message: DOSSIER_STALE_CHECKLIST_ITEM_MESSAGE,
      warnings: ['stale_checklist_item_id'],
    };
  }

  return {
    ...base,
    ok: true,
    status: 'GO',
    message: null,
    warnings: [],
  };
}

export function requestDossierCrossFocus(
  request: DossierFocusRequest,
  knownChecklistItemIds: string[],
): DossierFocusResult {
  const validation = validateDossierFocusRequest(request, knownChecklistItemIds);
  if (!validation.ok || validation.status === 'FAIL') return validation;
  if (!request.checklistItemId?.trim()) return validation;
  if (validation.warnings.includes('stale_checklist_item_id')) return validation;

  publishDossierCrossFocus(request);
  return {
    ...validation,
    focused: true,
    message: 'Đang chuyển tới bước checklist…',
  };
}

export function scrollToChecklistItemDom(checklistItemId: string): boolean {
  const el = document.getElementById(checklistItemDomId(checklistItemId));
  if (!el) return false;
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  return true;
}

export function validateDossierCrossFocusRuntime(): {
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
