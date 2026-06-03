/**
 * PHASE_CHECKLIST_02 — lightweight checklist toast feedback (non-blocking).
 */

type ChecklistToastKind = 'success' | 'error' | 'info' | 'warning';

let toastTimer: number | null = null;
let lastToastKey = '';
let lastToastAt = 0;

const TOAST_THROTTLE_MS = 900;

function toastDuration(kind: ChecklistToastKind): number {
  if (kind === 'error' || kind === 'warning') return 3800;
  return 1900;
}

export function showChecklistToast(message: string, kind: ChecklistToastKind = 'info'): void {
  if (typeof document === 'undefined') return;
  const trimmed = message.trim();
  if (!trimmed) return;

  const key = `${kind}:${trimmed}`;
  const now = Date.now();
  if (lastToastKey === key && now - lastToastAt < TOAST_THROTTLE_MS) return;
  lastToastKey = key;
  lastToastAt = now;

  let el = document.getElementById('cbv-checklist-toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'cbv-checklist-toast';
    el.setAttribute('role', 'status');
    el.className = 'cbv-checklist-toast';
    document.body.appendChild(el);
  }

  el.textContent = trimmed;
  el.dataset.visible = 'true';
  el.dataset.kind = kind;

  if (toastTimer) window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    if (el) el.dataset.visible = 'false';
  }, toastDuration(kind));
}

