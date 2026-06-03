import type { TaskItem } from '@/api/contracts';
import type { CaseReadSource, DiscoveryCandidate, DiscoveryOutcome } from './caseReadModelTypes';
import { hintCaseKey, resolveCaseKey } from './caseKeyResolver';

export interface AnchorScanResult {
  manualCaseKey?: string;
  hoSoId?: string;
  financeId?: string;
  alertId?: string;
  taskId?: string;
}

export interface DiscoveryWinner {
  source: CaseReadSource;
  sourceId: string;
  anchorField: string;
  isMixed: boolean;
  candidates: DiscoveryCandidate[];
  outcome: DiscoveryOutcome;
}

function trimId(value: string | undefined): string | undefined {
  const t = value?.trim();
  return t || undefined;
}

export function scanTaskAnchors(task: TaskItem, manualCaseKey?: string): AnchorScanResult {
  const manual = trimId(manualCaseKey);
  const hoSoId = trimId(task.relatedHoSoId);
  const entityType = task.relatedEntityType?.trim().toUpperCase();
  const entityId = trimId(task.relatedEntityId);

  let financeId: string | undefined;
  let alertId: string | undefined;

  if (entityType === 'FINANCE' || entityType === 'FINANCE_TRANSACTION') {
    financeId = entityId;
  } else if (entityType === 'ALERT' || entityType === 'HOME_ALERT') {
    alertId = entityId;
  }

  return {
    manualCaseKey: manual,
    hoSoId,
    financeId,
    alertId,
    taskId: trimId(task.taskId),
  };
}

type RankedAnchor = {
  rank: number;
  source: CaseReadSource;
  anchorField: string;
  anchorId: string | null;
};

function buildRankedAnchors(scan: AnchorScanResult): RankedAnchor[] {
  const anchors: RankedAnchor[] = [];
  if (scan.manualCaseKey) {
    anchors.push({ rank: 1, source: 'MANUAL_CASE_KEY', anchorField: 'MANUAL_CASE_KEY', anchorId: scan.manualCaseKey });
  }
  if (scan.hoSoId) {
    anchors.push({ rank: 2, source: 'HO_SO_ANCHORED', anchorField: 'HO_SO_ID', anchorId: scan.hoSoId });
  }
  if (scan.financeId) {
    anchors.push({ rank: 3, source: 'FINANCE_ANCHORED', anchorField: 'FINANCE_REF', anchorId: scan.financeId });
  }
  if (scan.alertId) {
    anchors.push({ rank: 4, source: 'ALERT_ANCHORED', anchorField: 'ALERT_ID', anchorId: scan.alertId });
  }
  if (scan.taskId) {
    anchors.push({ rank: 5, source: 'TASK_ANCHORED', anchorField: 'TASK_ID', anchorId: scan.taskId });
  }
  return anchors;
}

export function runCaseDiscovery(
  task: TaskItem | undefined,
  manualCaseKey?: string,
): DiscoveryWinner | null {
  if (!task?.taskId?.trim()) return null;

  const scan = scanTaskAnchors(task, manualCaseKey);
  const ranked = buildRankedAnchors(scan);
  if (ranked.length === 0) return null;

  const populatedCount = ranked.filter((a) => a.anchorId).length;
  const isMixed = populatedCount >= 2;

  let manualRejected = false;
  let winner: RankedAnchor | null = null;

  for (const anchor of ranked) {
    if (!anchor.anchorId) continue;
    if (anchor.source === 'MANUAL_CASE_KEY') {
      const key = resolveCaseKey(anchor.source, anchor.anchorId, anchor.anchorId);
      if (key) {
        winner = anchor;
        break;
      }
      manualRejected = true;
      continue;
    }
    winner = anchor;
    break;
  }

  if (!winner?.anchorId) {
    return {
      source: 'TASK_ANCHORED',
      sourceId: '',
      anchorField: 'TASK_ID',
      isMixed,
      candidates: ranked.map((a, i) => ({
        rank: i + 1,
        source: a.source,
        anchorField: a.anchorField,
        anchorId: a.anchorId,
        caseKeyHint: hintCaseKey(a.source, a.anchorId),
        selected: false,
        excludedReason: 'READ_FAILED',
      })),
      outcome: 'NONE',
    };
  }

  const candidates: DiscoveryCandidate[] = ranked.map((a, i) => ({
    rank: i + 1,
    source: a.source,
    anchorField: a.anchorField,
    anchorId: a.anchorId,
    caseKeyHint: hintCaseKey(a.source, a.anchorId),
    selected: a.source === winner!.source && a.anchorId === winner!.anchorId,
    excludedReason:
      a.source === winner!.source && a.anchorId === winner!.anchorId
        ? undefined
        : a.rank < winner!.rank
          ? 'LOWER_PRECEDENCE'
          : 'NOT_SELECTED',
  }));

  let outcome: DiscoveryOutcome = 'RESOLVED';
  if (winner.source === 'TASK_ANCHORED' && (scan.hoSoId || scan.financeId) && manualRejected) {
    outcome = 'PARTIAL';
  } else if (winner.source === 'ALERT_ANCHORED' && !scan.taskId) {
    outcome = 'PARTIAL';
  }

  return {
    source: isMixed ? 'MIXED' : winner.source,
    sourceId: winner.anchorId,
    anchorField: winner.anchorField,
    isMixed,
    candidates,
    outcome,
  };
}

export function winnerAnchorSource(discovery: DiscoveryWinner): CaseReadSource {
  if (discovery.source === 'MIXED') {
    const selected = discovery.candidates.find((c) => c.selected);
    return selected?.source ?? 'TASK_ANCHORED';
  }
  return discovery.source;
}
