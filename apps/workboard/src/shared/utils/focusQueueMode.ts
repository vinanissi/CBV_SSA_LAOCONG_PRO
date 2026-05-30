const KEY = 'cbv_focus_queue_mode';

export function loadFocusQueueMode(): boolean {
  try {
    return sessionStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

export function saveFocusQueueMode(enabled: boolean): void {
  try {
    sessionStorage.setItem(KEY, enabled ? '1' : '0');
  } catch {
    // ignore
  }
}

export function toggleFocusQueueMode(): boolean {
  const next = !loadFocusQueueMode();
  saveFocusQueueMode(next);
  return next;
}
