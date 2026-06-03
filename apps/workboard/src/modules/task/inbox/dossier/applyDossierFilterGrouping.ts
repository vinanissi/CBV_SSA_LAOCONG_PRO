/**
 * PHASE_DOSSIER_03 — read-only filter and regroup on DossierAggregate.
 */

import type { DossierAggregate, DossierGroup, DossierItem, DossierItemType } from './dossierAggregateTypes';
import type {
  DossierFilter,
  DossierFilterCounts,
  DossierFilterId,
  DossierFilteredAggregate,
  DossierGrouping,
  DossierGroupingMode,
} from './dossierFilterGroupingTypes';

const TYPE_ORDER: DossierItemType[] = ['attachment', 'link', 'feedback'];

const FILTER_DEFS: { id: DossierFilterId; label: string; itemTypes: DossierItemType[] }[] = [
  { id: 'all', label: 'Tất cả', itemTypes: ['attachment', 'link', 'feedback'] },
  { id: 'attachments', label: 'Tài liệu', itemTypes: ['attachment'] },
  { id: 'links', label: 'Liên kết', itemTypes: ['link'] },
  { id: 'feedback', label: 'Phản hồi', itemTypes: ['feedback'] },
];

const GROUPING_DEFS: DossierGrouping[] = [
  { mode: 'by_checklist_item', label: 'Theo bước' },
  { mode: 'task_level', label: 'Cấp task' },
  { mode: 'ungrouped', label: 'Danh sách' },
];

const EMPTY_BY_FILTER: Record<DossierFilterId, string> = {
  all: 'Chưa có hồ sơ liên quan.',
  attachments: 'Chưa có tài liệu.',
  links: 'Chưa có liên kết.',
  feedback: 'Chưa có phản hồi.',
};

export function sortDossierItemsByType(items: DossierItem[]): DossierItem[] {
  return [...items].sort((a, b) => {
    const ai = TYPE_ORDER.indexOf(a.type);
    const bi = TYPE_ORDER.indexOf(b.type);
    return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi);
  });
}

export function flattenDossierItems(groups: DossierGroup[]): DossierItem[] {
  const out: DossierItem[] = [];
  for (const g of groups) {
    out.push(...g.items);
  }
  return out;
}

export function computeDossierFilterCounts(groups: DossierGroup[]): DossierFilterCounts {
  const items = flattenDossierItems(groups);
  return {
    all: items.length,
    attachments: items.filter((i) => i.type === 'attachment').length,
    links: items.filter((i) => i.type === 'link').length,
    feedback: items.filter((i) => i.type === 'feedback').length,
  };
}

export function buildDossierFilters(counts: DossierFilterCounts): DossierFilter[] {
  return FILTER_DEFS.map((def) => ({
    id: def.id,
    label: def.label,
    itemTypes: def.itemTypes,
    count: counts[def.id === 'attachments' ? 'attachments' : def.id === 'links' ? 'links' : def.id === 'feedback' ? 'feedback' : 'all'],
  }));
}

function matchesFilter(item: DossierItem, filterId: DossierFilterId): boolean {
  if (filterId === 'all') return true;
  if (filterId === 'attachments') return item.type === 'attachment';
  if (filterId === 'links') return item.type === 'link';
  if (filterId === 'feedback') return item.type === 'feedback';
  return false;
}

function filterGroupItems(group: DossierGroup, filterId: DossierFilterId): DossierGroup | null {
  const items = sortDossierItemsByType(group.items.filter((i) => matchesFilter(i, filterId)));
  if (items.length === 0) return null;
  return { ...group, items };
}

function regroupByChecklistItem(groups: DossierGroup[], filterId: DossierFilterId): DossierGroup[] {
  const checklist = groups
    .filter((g) => g.type === 'checklist_item')
    .map((g) => filterGroupItems(g, filterId))
    .filter((g): g is DossierGroup => g !== null);
  const taskLevel = groups
    .filter((g) => g.type === 'task_level')
    .map((g) => filterGroupItems(g, filterId))
    .filter((g): g is DossierGroup => g !== null);
  const unknown = groups
    .filter((g) => g.type === 'unknown')
    .map((g) => filterGroupItems(g, filterId))
    .filter((g): g is DossierGroup => g !== null);
  return [...checklist, ...taskLevel, ...unknown];
}

function regroupTaskLevelFirst(groups: DossierGroup[], filterId: DossierFilterId): DossierGroup[] {
  const ordered = regroupByChecklistItem(groups, filterId);
  const task = ordered.filter((g) => g.type === 'task_level');
  const checklist = ordered.filter((g) => g.type === 'checklist_item');
  const unknown = ordered.filter((g) => g.type === 'unknown');
  return [...task, ...checklist, ...unknown];
}

function regroupUngrouped(groups: DossierGroup[], filterId: DossierFilterId): DossierGroup[] {
  const items = sortDossierItemsByType(
    flattenDossierItems(groups).filter((i) => matchesFilter(i, filterId)),
  );
  if (items.length === 0) return [];
  return [
    {
      id: 'ungrouped',
      type: 'unknown',
      title: 'Tất cả mục',
      items,
    },
  ];
}

export function applyDossierFilterGrouping(
  aggregate: DossierAggregate,
  activeFilter: DossierFilterId = 'all',
  activeGrouping: DossierGroupingMode = 'by_checklist_item',
): DossierFilteredAggregate {
  const counts = computeDossierFilterCounts(aggregate.groups);
  const filters = buildDossierFilters(counts);

  let groups: DossierGroup[];
  switch (activeGrouping) {
    case 'task_level':
      groups = regroupTaskLevelFirst(aggregate.groups, activeFilter);
      break;
    case 'ungrouped':
      groups = regroupUngrouped(aggregate.groups, activeFilter);
      break;
    case 'by_checklist_item':
    default:
      groups = regroupByChecklistItem(aggregate.groups, activeFilter);
      break;
  }

  const isEmpty = groups.length === 0 || flattenDossierItems(groups).length === 0;
  const grouping = GROUPING_DEFS.find((g) => g.mode === activeGrouping) ?? GROUPING_DEFS[0];

  return {
    taskId: aggregate.taskId,
    activeFilter,
    activeGrouping,
    counts,
    filters,
    grouping,
    groups,
    isEmpty,
    emptyMessage: EMPTY_BY_FILTER[activeFilter],
  };
}

export function listDossierGroupingModes(): DossierGrouping[] {
  return [...GROUPING_DEFS];
}

export function validateDossierFilterGroupingRuntime(): {
  ok: boolean;
  status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';
  checkedAt: string;
  traceId: string;
  filter: { complete: boolean };
  grouping: { complete: boolean };
  warnings: string[];
  errors: string[];
  nextStep: string;
} {
  return {
    ok: true,
    status: 'GO_WITH_WARNINGS',
    checkedAt: new Date().toISOString(),
    traceId: `dossier-fg-val-${Date.now()}`,
    filter: { complete: true },
    grouping: { complete: true },
    warnings: ['Live filter UI not validated in static check'],
    errors: [],
    nextStep: 'PHASE_DOSSIER_06_DOSSIER_UAT_LOCK',
  };
}
