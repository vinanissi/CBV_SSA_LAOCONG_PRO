# WebApp SLA Dashboard — Data Binding (Phase 90)

## Data source

- Sheet: `HOME_ALERT` (read-first)
- Read limit: first 200 rows

## Output: `CbvWebAppPilotData_getSlaWidgets()`

```js
{
  ok,
  data: {
    countsBySlaStatus,
    countsByBreachLevel,
    breachedItems,
    resolvedCount,
    warningItems
  },
  warnings,
  errors,
  checkedAt
}
```

## Mapping

- `countsBySlaStatus`: group by `SLA_STATUS` (blank allowed).
- `countsByBreachLevel`: group by numeric `SLA_BREACH_LEVEL` (default 0).
- `breachedItems`: rows where `SLA_BREACH_LEVEL > 0` OR `SLA_STATUS ∈ {OVERDUE, BREACHED}`.
- `resolvedCount`: resolved/closed rows by `STATUS`.

## Fallback behavior

- Missing sheet or missing columns → return warnings, not uncontrolled throw.
- Still renders pilot page with warning state.

