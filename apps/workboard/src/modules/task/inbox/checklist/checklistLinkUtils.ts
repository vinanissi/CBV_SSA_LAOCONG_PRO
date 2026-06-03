/**
 * PHASE_CHECKLIST_04_LINKS — URL helpers (no network fetch).
 */

import type { ChecklistLinkType } from './checklistLinkTypes';

export function isValidChecklistLinkUrl(url: string | null | undefined): boolean {
  const trimmed = url?.trim() || '';
  if (!trimmed) return false;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function inferChecklistLinkType(url: string): ChecklistLinkType {
  const u = url.trim().toLowerCase();
  if (u.includes('zalo.me') || u.includes('zalo')) return 'zalo';
  if (u.includes('/spreadsheets/') || u.includes('sheets.google')) return 'sheet';
  if (u.includes('/forms/') || u.includes('forms.gle')) return 'form';
  if (u.includes('drive.google.com') || u.includes('docs.google.com')) return 'drive';
  if (u.startsWith('/') || u.includes('localhost')) return 'internal';
  return 'external';
}

export function shortChecklistLinkTypeLabel(type: string | undefined): string {
  const t = (type || 'external').toLowerCase();
  if (t === 'zalo') return 'Zalo';
  if (t === 'drive') return 'Drive';
  if (t === 'sheet') return 'Sheet';
  if (t === 'form') return 'Form';
  if (t === 'internal') return 'Nội bộ';
  return 'Liên kết';
}

export function openChecklistLinkUrl(url: string | null | undefined): boolean {
  if (!isValidChecklistLinkUrl(url)) return false;
  if (typeof window === 'undefined') return false;
  window.open(url!.trim(), '_blank', 'noopener,noreferrer');
  return true;
}
