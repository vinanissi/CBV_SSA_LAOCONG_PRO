import type { WorkInboxSearchIndexEntry } from './workInboxSearchIndex';
import { normalizeSearchQuery } from './workInboxSearchIndex';
import type { WorkInboxSearchMatchType, WorkInboxSearchResult } from './workInboxSearchTypes';

function scoreEntry(entry: WorkInboxSearchIndexEntry, q: string): { score: number; matchType: WorkInboxSearchMatchType } | null {
  const idNorm = entry.taskId.toLowerCase();
  const titleNorm = normalizeSearchQuery(entry.title);

  if (idNorm.includes(q) || idNorm.startsWith(q)) {
    const score = idNorm === q ? 100 : idNorm.startsWith(q) ? 95 : 88;
    return { score, matchType: 'TASK_ID' };
  }

  if (entry.phone && entry.phone.includes(q.replace(/\s/g, ''))) {
    return { score: 90, matchType: 'PHONE' };
  }
  if (/^0?\d{6,}$/.test(q.replace(/\s/g, '')) && entry.haystack.includes(q.replace(/\s/g, ''))) {
    return { score: 88, matchType: 'PHONE' };
  }

  if (entry.licensePlate && entry.licensePlate.toLowerCase().includes(q)) {
    return { score: 85, matchType: 'LICENSE' };
  }
  if (/^\d{2}[a-z]{1,2}/i.test(q) && entry.haystack.includes(q)) {
    return { score: 82, matchType: 'LICENSE' };
  }

  if (entry.assignee && normalizeSearchQuery(entry.assignee).includes(q)) {
    return { score: 80, matchType: 'PERSON' };
  }

  if (titleNorm.includes(q)) {
    return { score: 70, matchType: 'TITLE' };
  }

  if (entry.haystack.includes(q)) {
    return { score: 60, matchType: 'CONTENT' };
  }

  return null;
}

/** Local queue search — no API per keystroke. */
export function searchWorkInboxLocalQueue(
  index: WorkInboxSearchIndexEntry[],
  rawQuery: string,
  limit = 20,
): WorkInboxSearchResult[] {
  const q = normalizeSearchQuery(rawQuery);
  if (!q || q.length < 1) return [];

  const results: WorkInboxSearchResult[] = [];
  for (const entry of index) {
    const hit = scoreEntry(entry, q);
    if (!hit) continue;
    results.push({
      taskId: entry.taskId,
      title: entry.title,
      assignee: entry.assignee,
      phone: entry.phone,
      licensePlate: entry.licensePlate,
      status: entry.status,
      position: entry.position,
      matchType: hit.matchType,
      score: hit.score,
    });
  }

  results.sort((a, b) => b.score - a.score || a.position - b.position);
  return results.slice(0, limit);
}
