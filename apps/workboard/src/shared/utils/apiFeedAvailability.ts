/** Classify optional API feed errors — permission deny is not runtime degraded. */

export function isPermissionDeniedMessage(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes('quyền') ||
    m.includes('permission') ||
    m.includes('forbidden') ||
    m.includes('403')
  );
}

/** Coordination/today secondary feeds that may be unavailable by role. */
export function isOptionalFeedUnavailable(errors: string[]): boolean {
  const msg = errors[0] ?? '';
  return isPermissionDeniedMessage(msg);
}
