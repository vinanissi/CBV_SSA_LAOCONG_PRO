/**
 * PHASE_LINK_01 — copy checklist step deep link to clipboard.
 */

import { buildChecklistStepDeepLinkHref } from './stepDeepLink';

export interface CopyChecklistStepLinkResult {
  ok: boolean;
  status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';
  href: string;
  message: string | null;
  warnings: string[];
}

export async function copyChecklistStepLinkToClipboard(
  taskId: string,
  checklistItemId: string,
): Promise<CopyChecklistStepLinkResult> {
  const href = buildChecklistStepDeepLinkHref(taskId, checklistItemId);
  const base: CopyChecklistStepLinkResult = {
    ok: false,
    status: 'FAIL',
    href,
    message: null,
    warnings: [],
  };

  if (!taskId.trim() || !checklistItemId.trim()) {
    return { ...base, message: 'Không thể sao chép link' };
  }

  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(href);
      return {
        ok: true,
        status: 'GO',
        href,
        message: 'Đã sao chép link',
        warnings: [],
      };
    } catch {
      return {
        ok: false,
        status: 'FAIL',
        href,
        message: 'Không thể sao chép link',
        warnings: ['clipboard_write_failed'],
      };
    }
  }

  return {
    ok: false,
    status: 'FAIL',
    href,
    message: 'Không thể sao chép link',
    warnings: ['clipboard_unavailable'],
  };
}
