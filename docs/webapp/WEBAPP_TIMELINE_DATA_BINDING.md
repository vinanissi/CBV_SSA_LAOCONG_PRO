# WebApp Timeline — Data binding (Phase 91)

> Read-first only. No write mutation. No auto assign / auto resolve / auto escalate / drag-drop save / production claim.

## Source

- Sheet: `HOME_ALERT`
- Function: `CbvWebAppTimelineKanban_getTimelineData(options)` defined in `05_GAS_RUNTIME/991_WEBAPP_TIMELINE_KANBAN_DATA.js`.

## Envelope

```text
{
  ok: boolean,
  data: {
    count: number,
    rows: Array<{
      id, status, assignedTo, moduleCode, priority,
      slaStatus, slaBreachLevel,
      operatorPrimaryText, operatorSecondaryText,
      operatorMetaText, operatorNextAction,
      createdAt, updatedAt, timelineAt
    }>
  },
  warnings: string[],
  errors: string[],
  checkedAt: Date
}
```

## Timeline fields

| Field | Source column(s) | Notes |
|-------|-------------------|-------|
| `id` | `ID` → fallback `ALERT_ID` → `HOME_ALERT_ID` | string-trimmed |
| `status` | `STATUS` | empty string if missing |
| `assignedTo` | `ASSIGNED_TO` | empty if missing |
| `moduleCode` | `MODULE_CODE` → `MODULE` | default `HOME_ALERT` |
| `priority` | `PRIORITY_SCORE` → `PRIORITY` | raw value |
| `slaStatus` | `SLA_STATUS` | empty if missing |
| `slaBreachLevel` | `SLA_BREACH_LEVEL` | numeric coercion; 0 fallback |
| `operatorPrimaryText` | `OPERATOR_PRIMARY_TEXT` | used as card title |
| `operatorSecondaryText` | `OPERATOR_SECONDARY_TEXT` | optional |
| `operatorMetaText` | `OPERATOR_META_TEXT` | optional |
| `operatorNextAction` | `OPERATOR_NEXT_ACTION` | optional |
| `createdAt` | `CREATED_AT` → `CREATEDAT` → `CREATED_DATE` | as-is |
| `updatedAt` | `UPDATED_AT` → `UPDATEDAT` → `UPDATED_DATE` | as-is |
| `timelineAt` | `updatedAt` → fallback `createdAt` | sort/display key |

## Sort rules

1. Primary: `UPDATED_AT` desc.
2. Fallback: `CREATED_AT` desc.
3. If both missing: warning emitted, original sheet order preserved.

## Fallback rules

- Missing recommended column → warning (no crash), affected fields appear empty in the row.
- Missing HOME_ALERT sheet → `ok=false`, `data.count=0`, warning surfaced.
- Default limit: 100 rows (override via `options.limit`).

## Row display rules

- Title: `operatorPrimaryText` → fallback `id` → `(no title)`.
- SLA badge classes:
  - `crit`: `slaBreachLevel > 0`.
  - `warn`: `slaStatus` in `{OVERDUE, BREACHED}`.
  - `ok`: otherwise.
- Show: id, status, assignedTo, moduleCode, operator primary/secondary/meta, optional next-action, and `timelineAt` formatted as ISO string.
- No action buttons, no edit affordances, no drag/drop.

## State handling

- `warning` — `res.ok === false` (sheet missing/error).
- `empty` — `data.rows.length === 0`.
- `partial` — `data.rows.length > 0` and warnings present.
- `ready` — `data.rows.length > 0` and no warnings.
