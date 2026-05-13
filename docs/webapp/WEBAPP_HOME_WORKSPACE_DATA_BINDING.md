# WebApp Home Workspace — Data Binding (Phase 90)

## Data source

- Sheet: `HOME_ALERT` (read-first)
- Read limit: first 200 rows for pilot

## Output: `CbvWebAppPilotData_getHomeDashboard()`

Returns:

```js
{
  ok,
  data: {
    totals: {
      myQueue,
      unassigned,
      breached,
      escalated,
      blocked,
      resolvedToday
    },
    cards: [...],     // top items from my queue
    warnings: [...]
  },
  warnings,
  errors,
  checkedAt
}
```

## Totals mapping

- **myQueue**: count of rows assigned to current user and not resolved/closed.
- **unassigned**: blank `ASSIGNED_TO` and not resolved/closed.
- **breached**: `SLA_BREACH_LEVEL > 0` OR `SLA_STATUS ∈ {OVERDUE, BREACHED}`.
- **escalated**: if `ESCALATION_STATUS` exists and is `ESCALATED`/`ACKNOWLEDGED`.
- **blocked**: if `IS_BLOCKED` exists and is truthy.
- **resolvedToday**: resolved/closed rows whose `UPDATED_AT` is today (best-effort).

## Warnings behavior

Missing columns do not hard-fail. Function returns warnings such as:

- missing `OPERATOR_PRIMARY_TEXT`
- missing SLA columns
- missing sheet

