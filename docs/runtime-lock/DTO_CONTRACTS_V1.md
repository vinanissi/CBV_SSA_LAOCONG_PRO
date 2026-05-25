# CBV DTO Contracts v1 (Frozen)

All runtime APIs return safe envelope:

```json
{
  "ok": true,
  "phase": "PHASE_RF_XX_...",
  "contractVersion": "CBV_RFXX_V1",
  "data": {},
  "warnings": [],
  "errors": [],
  "checkedAt": "ISO8601"
}
```

## Task (RF_02)

Task list item: `taskId`, `title`, `status`, `owner`, `dueDate`, `href`, `permissionAllowed`

Search result: `id`, `type`, `title`, `subtitle`, `status`, `module`, `href`, `matchedField`, `permissionAllowed`

Timeline: `time`, `actor`, `action`, `message`, `source`, `resourceId`

## Coordination (RF_03)

Queue/overdue/workload models from HOME_ALERT projection. Assignment options **EXECUTION_LOCKED**.

Coordination event DTO: read-only in RF_03; no WebApp writes.

## Observation (RF_04)

Runtime health row: `module`, `ok`, `status`, `severity`, `message`, `nextStep`, `checkedAt`

Alert: `alertId`, `type`, `severity`, `title`, `message`, `module`, `resourceId`, `href`, `nextStep`, `createdAt` — **`autoResolve: false`, `autoEscalate: false`**

## Plugin (RF_05)

Descriptor: `pluginId`, `module`, `label`, `version`, `status`, `enabled`, `capabilities`, `routes`, `permissions`, `actions`, `observation`, `coordination`

Capability: `capabilityId`, `label`, `type`, `enabled`, `status`, `permission`, `route`

Quick action: `actionId`, `executionMode`, `autoExecute: false` (required)

## Finance / HO_SO (RF_06)

Finance projection: `financeId`, `title`, `type`, `status`, `amount`, `dueDate`, `relatedTaskId`, `relatedHoSoId`, `fileCount`, `source`, `href`, `warnings`

HO_SO projection: `hoSoId`, `personName`, `phone`, `vehiclePlate`, `status`, `missingDocuments`, `documentCompleteness`, `source`, `href`, `warnings`

## Test report (CBV_TCS_V1)

`ok`, `phase`, `status`, `checkedAt`, `runBy`, `traceId`, `testSuite`, `summary`, `checks[]`, `warnings`, `errors`, `nextStep`, `severity`, `reportText`, `reportJson`, `contractVersion`, `envelopeOk`

Check item: `code`, `ok`, `severity`, `message`, `detail`
