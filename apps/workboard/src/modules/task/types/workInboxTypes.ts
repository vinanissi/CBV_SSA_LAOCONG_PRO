/**
 * CBV_WORK_INBOX_V3 — frontend view-model types (014_DATA_CONTRACT.md).
 * Runtime API envelope remains `@/api/contracts` ApiEnvelope until inbox API ships.
 */

export type InboxGroup = 'need_action' | 'waiting' | 'follow_up' | 'completed';

export type InboxStatus =
  | 'overdue'
  | 'today'
  | 'waiting'
  | 'follow_up'
  | 'completed'
  | 'unknown';

export type ModuleKey = 'TASK' | 'HO_SO' | 'FINANCE' | 'DOCS' | 'INVOICE';

export type InboxPriority = 'low' | 'normal' | 'high' | 'critical';

export interface RelatedEntity {
  module: ModuleKey;
  id: string;
  label?: string;
  href?: string;
}

export interface InboxItem {
  id: string;
  code?: string;
  title: string;
  summary?: string;

  group: InboxGroup;
  status: InboxStatus;

  priority?: InboxPriority;

  assigneeId?: string;
  assigneeName?: string;
  ownerId?: string;
  ownerName?: string;

  dueDate?: string;
  dueLabel?: string;

  module: ModuleKey;
  relatedEntities?: RelatedEntity[];

  primaryActionLabel: string;
  primaryActionHref: string;

  updatedAt?: string;
  createdAt?: string;
}

export interface TaskCardModel {
  id: string;
  code?: string;
  title: string;
  status: InboxStatus;
  group: InboxGroup;
  priority?: InboxPriority;
  assigneeName?: string;
  dueLabel?: string;
  primaryActionLabel: string;
  primaryActionHref: string;
}

/** Focus Mode V3 view model — not the dashboard FocusStrip chip type. */
export interface WorkInboxFocusItem extends TaskCardModel {
  progressIndex: number;
  progressTotal: number;
  detailHref: string;
  canComplete: boolean;
  canForward: boolean;
  canPause: boolean;
}

export interface SearchResult {
  id: string;
  type: ModuleKey | 'PERSON' | 'VEHICLE';
  title: string;
  subtitle?: string;
  statusLabel?: string;
  href: string;
}

/** Target inbox API envelope per 014_DATA_CONTRACT (migration shape). */
export interface InboxDataApiEnvelope<T> {
  ok: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    detail?: unknown;
  };
  traceId?: string;
  checkedAt?: string;
}
