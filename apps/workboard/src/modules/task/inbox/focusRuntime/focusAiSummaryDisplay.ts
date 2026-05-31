/** Display-only: when to use inline compact AI summary vs card. */
const COMPACT_MAX_CHARS = 140;

export function isCompactAiSummary(text: string): boolean {
  const t = text.trim();
  if (!t) return true;
  if (t.includes('\n')) return false;
  return t.length <= COMPACT_MAX_CHARS;
}
