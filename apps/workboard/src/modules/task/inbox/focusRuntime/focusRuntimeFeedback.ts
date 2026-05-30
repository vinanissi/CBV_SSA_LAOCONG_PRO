/** Ephemeral operator feedback for Focus Runtime secondary actions (no silent fail). */

const PREP_MESSAGE = 'Chức năng đang chuẩn bị';

let feedbackTimer: number | null = null;

export function showFocusRuntimeFeedback(message: string = PREP_MESSAGE): void {
  if (typeof document === 'undefined') return;

  let el = document.getElementById('cbv-focus-runtime-toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'cbv-focus-runtime-toast';
    el.setAttribute('role', 'status');
    el.className = 'cbv-focus-runtime-toast';
    document.body.appendChild(el);
  }

  el.textContent = message;
  el.dataset.visible = 'true';

  if (feedbackTimer) window.clearTimeout(feedbackTimer);
  feedbackTimer = window.setTimeout(() => {
    if (el) el.dataset.visible = 'false';
  }, 4000);
}

export const FOCUS_RUNTIME_PREP_MESSAGE = PREP_MESSAGE;
