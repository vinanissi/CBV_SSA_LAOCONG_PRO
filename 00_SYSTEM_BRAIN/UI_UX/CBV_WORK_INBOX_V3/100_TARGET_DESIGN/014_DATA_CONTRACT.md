# CBV_WORK_INBOX_V3 — Data Contract

## Purpose

Stable data boundary between:

```text
GAS / Google Sheet
        ↓
Worker / API Adapter
        ↓
React Frontend
```

Frontend must render from this contract and must **not** depend on raw Sheet columns directly.

---

## InboxGroup

```ts
export type InboxGroup =
  | 'need_action'
  | 'waiting'
  | 'follow_up'
  | 'completed';
```

---

## InboxStatus

```ts
export type InboxStatus =
  | 'overdue'
  | 'today'
  | 'waiting'
  | 'follow_up'
  | 'completed'
  | 'unknown';
```

---

## ModuleKey

```ts
export type ModuleKey =
  | 'TASK'
  | 'HO_SO'
  | 'FINANCE'
  | 'DOCS'
  | 'INVOICE';
```

---

## RelatedEntity

```ts
export interface RelatedEntity {
  module: ModuleKey;
  id: string;
  label?: string;
  href?: string;
}
```

---

## InboxItem

```ts
export interface InboxItem {
  id: string;
  code?: string;
  title: string;
  summary?: string;

  group: InboxGroup;
  status: InboxStatus;

  priority?: 'low' | 'normal' | 'high' | 'critical';

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
```

---

## TaskCardModel

```ts
export interface TaskCardModel {
  id: string;
  code?: string;
  title: string;
  status: InboxStatus;
  group: InboxGroup;
  priority?: 'low' | 'normal' | 'high' | 'critical';
  assigneeName?: string;
  dueLabel?: string;
  primaryActionLabel: string;
  primaryActionHref: string;
}
```

---

## FocusItem

```ts
export interface FocusItem extends TaskCardModel {
  progressIndex: number;
  progressTotal: number;
  detailHref: string;
  canComplete: boolean;
  canForward: boolean;
  canPause: boolean;
}
```

---

## SearchResult

```ts
export interface SearchResult {
  id: string;
  type: ModuleKey | 'PERSON' | 'VEHICLE';
  title: string;
  subtitle?: string;
  statusLabel?: string;
  href: string;
}
```

---

## API Response Envelope

```ts
export interface ApiEnvelope<T> {
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
```

> **Note:** Live `apps/workboard` uses `warnings` / `errors` arrays — adapter may map both shapes during migration. Do not break existing envelope consumers in Phase A.

---

## Required Endpoints (target)

```text
GET  /api/inbox
GET  /api/inbox?group=need_action
GET  /api/tasks/:id
GET  /api/search?q=
POST /api/tasks/:id/complete
POST /api/tasks/:id/forward
POST /api/tasks/:id/pause
```

Map to existing GAS/worker routes until dedicated inbox API exists.

---

## Adapter Rule

Existing raw task data (`TaskItem`, workspace snapshot) must be mapped into `InboxItem`.

**Do not** render raw backend fields directly in the UI.

---

## Compatibility Rule

If current runtime still exposes `/tasks`, adapter must map it into `/inbox` view model.

Mapping table: `../200_IMPLEMENTATION/016_AS_IS_TO_BE_MAPPING.md`
