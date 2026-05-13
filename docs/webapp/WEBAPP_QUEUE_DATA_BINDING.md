# WebApp My Queue — Data Binding (Phase 90)

## Data source

- Sheet: `HOME_ALERT` (read-first)
- Read limit: first 200 rows; render top 100 cards

## Output: `CbvWebAppPilotData_getQueueCards(userEmail)`

Normalized card shape:

```js
{
  id,
  title,
  status,
  assignedTo,
  moduleCode,
  priority,
  slaStatus,
  slaBreachLevel,
  operatorPrimaryText,
  operatorSecondaryText,
  operatorMetaText,
  operatorNextAction,
  updatedAt
}
```

## Recommended column mapping

- `id`: `ALERT_ID` (fallback `HOME_ALERT_ID` or `ID`)
- `status`: `STATUS`
- `assignedTo`: `ASSIGNED_TO`
- `slaStatus`: `SLA_STATUS`
- `slaBreachLevel`: `SLA_BREACH_LEVEL`
- `updatedAt`: `UPDATED_AT`
- operator texts:
  - `OPERATOR_PRIMARY_TEXT`
  - `OPERATOR_SECONDARY_TEXT`
  - `OPERATOR_META_TEXT`
  - `OPERATOR_NEXT_ACTION`

## Rules

- Read-first only.
- No write buttons (no claim/resolve/escalate).
- SLA badge is visual only.

