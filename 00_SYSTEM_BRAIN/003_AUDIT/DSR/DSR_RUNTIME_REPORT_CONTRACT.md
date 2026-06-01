# DSR Runtime Report Contract

**Contract name:** `DSR_RUNTIME_REPORT`  
**Contract version:** `DSR_RUNTIME_REPORT_V1`  
**Phase:** `PHASE_DSR_06_RUNTIME_REPORT`

---

## Scope

Operational aggregation report for **CBV_DATA_SYNC_RUNTIME v1** on the DSR **host** spreadsheet.

---

## Allowed reads

| Source | Limit (tail rows) |
|--------|-------------------|
| `SYNC_CONFIG` | Key/value map |
| `SYNC_LOG` | 100 |
| `SYNC_AUDIT` | 100 |
| `SYNC_REPORT` | 50 |
| `SYNC_PLAN` | 50 |
| `SYNC_BACKUP_INDEX` | 50 |

No SOURCE/DESTINATION business sheet reads required.

---

## Allowed writes (append-only)

| Sheet | Purpose |
|-------|---------|
| `SYNC_REPORT` | New runtime report row |
| `SYNC_LOG` | Report generation log |
| `SYNC_AUDIT` | Governance event |
| `DASHBOARD_SYNC` | Report section labels (column B) |

---

## Forbidden operations

- Sync apply, backup creation, diff mutation  
- Triggers / automation  
- Clear/delete runtime or business sheets  
- SOURCE or DESTINATION business writes  

---

## REPORT_JSON schema (V1)

```json
{
  "contractVersion": "DSR_RUNTIME_REPORT_V1",
  "phase": "PHASE_DSR_06_RUNTIME_REPORT",
  "generatedAt": "ISO-8601",
  "runId": "RUN_DSR_...",
  "result": "READY | READY_WITH_WARNINGS | ATTENTION_REQUIRED | FAILED | NO_RUNTIME_HISTORY",
  "metrics": { },
  "currentStatus": { },
  "runHistory": [ ],
  "warningErrorSummary": { },
  "auditTimeline": [ ],
  "nextStep": "string"
}
```

---

## Result statuses

| Status | Meaning |
|--------|---------|
| `READY` | No blocking errors in recent window |
| `READY_WITH_WARNINGS` | Warnings present, no blocking errors |
| `ATTENTION_REQUIRED` | Review/sync guard/diff issues |
| `FAILED` | Report generation error |
| `NO_RUNTIME_HISTORY` | No log/report history yet |

---

## Append-only rules

Never delete or overwrite prior `SYNC_LOG`, `SYNC_AUDIT`, `SYNC_REPORT`, or `SYNC_PLAN` rows.

---

## Operator verification

1. Menu **8. Generate Runtime Report**  
2. Check `SYNC_REPORT` latest row `REPORT_JSON`  
3. Check `DASHBOARD_SYNC` report labels  
4. Confirm no changes on SOURCE/DEST business tabs  

---

## Implementation

`cbvDsrGenerateRuntimeReport()` — `05_GAS_RUNTIME/84_DATA_SYNC_RUNTIME_REPORT.js`

---

*Contract append-only. Amend via ADR addendum.*
