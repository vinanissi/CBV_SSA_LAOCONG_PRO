/**
 * PHASE_DOSSIER_03 — dossier filter and grouping types.
 */

import type { DossierGroup, DossierItemType } from './dossierAggregateTypes';

export type DossierFilterId = 'all' | 'attachments' | 'links' | 'feedback';

export type DossierGroupingMode = 'by_checklist_item' | 'task_level' | 'ungrouped';

export interface DossierFilter {
  id: DossierFilterId;
  label: string;
  itemTypes: DossierItemType[];
  count: number;
}

export interface DossierGrouping {
  mode: DossierGroupingMode;
  label: string;
}

export interface DossierFilterCounts {
  all: number;
  attachments: number;
  links: number;
  feedback: number;
}

export interface DossierFilteredAggregate {
  taskId: string;
  activeFilter: DossierFilterId;
  activeGrouping: DossierGroupingMode;
  counts: DossierFilterCounts;
  filters: DossierFilter[];
  grouping: DossierGrouping;
  groups: DossierGroup[];
  isEmpty: boolean;
  emptyMessage: string;
}
