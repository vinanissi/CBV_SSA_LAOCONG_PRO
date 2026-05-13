# WebApp Kanban — Data binding (Phase 91)

> Read-first only. No write mutation. No drag-drop save. No auto assign / auto resolve / auto escalate / production claim.

## Source

- Sheet: `HOME_ALERT`
- Function: `CbvWebAppTimelineKanban_getKanbanData(options)` defined in `05_GAS_RUNTIME/991_WEBAPP_TIMELINE_KANBAN_DATA.js`.

## Envelope

```text
{
  ok: boolean,
  data: {
    groupBy: "STATUS",
    total: number,
    columns: Array<{
      status: string,
      count: number,
      cards: Array<{
        id, title, status, assignedTo, priority,
        slaStatus, slaBreachLevel, operatorMetaText, updatedAt
      }>
    }>
  },
  warnings: string[],
  errors: string[],
  checkedAt: Date
}
```

## Grouping

- Group key: `STATUS`.
- Missing `STATUS` column → all cards grouped under `UNKNOWN`, warning emitted.
- Empty `STATUS` value on a row → bucket `UNKNOWN`.
- Column order: discovery order from sheet rows (stable; not reorderable in pilot).

## Card fields

| Field | Source | Notes |
|-------|--------|-------|
| `id` | `ID` → `ALERT_ID` → `HOME_ALERT_ID` | string-trimmed |
| `title` | `OPERATOR_PRIMARY_TEXT` → fallback `id` | `(no title)` last resort |
| `status` | `STATUS` | echoed from column key |
| `assignedTo` | `ASSIGNED_TO` | empty if missing |
| `priority` | `PRIORITY_SCORE` → `PRIORITY` | raw value |
| `slaStatus` | `SLA_STATUS` | empty if missing |
| `slaBreachLevel` | `SLA_BREACH_LEVEL` | numeric, 0 fallback |
| `operatorMetaText` | `OPERATOR_META_TEXT` | optional |
| `updatedAt` | `UPDATED_AT` → `UPDATEDAT` → `UPDATED_DATE` | as-is |

## Column limits

- Default cap: **50 cards per column** (`CBV_WEBAPP_KANBAN_DEFAULT_CARDS_PER_COLUMN`).
- Override via `options.cardsPerColumn` for diagnostics; pilot stays at 50.
- `column.count` always reflects the **total** in that group; `cards` is the **capped** slice.

## In-column card sort

1. `slaBreachLevel` desc (more breached = higher).
2. `updatedAt` desc as tiebreaker.

## No drag-drop writeback

- The UI **MUST NOT** offer drag-drop save.
- The runtime **MUST NOT** expose any mutation function via `CbvWebAppTimelineKanban_*` namespace; the Phase 91 Test Console actively probes for `_save`, `_write`, `_mutate`, `_claim`, `_resolve`, `_escalate`, `_assign`, `_drag` names and surfaces them as errors.

## State handling

- `warning` — `res.ok === false`.
- `empty` — `data.columns.length === 0`.
- `partial` — `data.columns.length > 0` and warnings present.
- `ready` — `data.columns.length > 0` and no warnings.
