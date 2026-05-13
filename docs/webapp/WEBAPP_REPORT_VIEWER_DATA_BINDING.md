# WebApp Report Viewer — Data Binding (Phase 92, read-first)

## Report row fields

`CbvWebAppObservability_getRecentReports({ limit })` returns `data.rows` of shape:

```json
{
  "reportId": "SHL_1736...",
  "phase": "PHASE_91_WEBAPP_TIMELINE_KANBAN_READ_FIRST_PAGES",
  "status": "GO_WITH_WARNINGS",
  "severity": "WARNING",
  "checkedAt": "<ISO date or Date>",
  "runBy": "<actor id or email>",
  "traceId": "WS91_173681...",
  "summary": "<short summary>",
  "source": "PropertiesService:CBV_WEBAPP_TLK_TC_LAST_REPORT_JSON | SYSTEM_HEALTH_LOG | CBV_TEST_REPORTS"
}
```

Default limit is `50` (`CBV_WEBAPP_OBSERVABILITY_DEFAULT_REPORTS_LIMIT`).

## Report sources (in priority of inclusion)

1. **PropertiesService in-memory reports** — one per phase that ships a Test Console. These are the freshest snapshots and survive across page loads as long as document properties are intact.
2. **`CBV_TEST_REPORTS` sheet** — if present, its rows are added. Phase 92 never creates this sheet.
3. **`SYSTEM_HEALTH_LOG` sheet** — bootstrap audit summaries (Phase 80 lifecycle).

All sources are merged and sorted by `checkedAt` desc. Up to `limit` rows are returned.

### Column adapters

`SYSTEM_HEALTH_LOG` rows are mapped through these candidate columns:

| Output | SYSTEM_HEALTH_LOG column |
|---|---|
| `reportId` | `RUN_ID` |
| `phase` | `TEST_SUITE` (if `PHASE` absent) |
| `status` | `SYSTEM_HEALTH` (if `STATUS` absent) |
| `checkedAt` | `RUN_AT` |
| `summary` | `SUMMARY_JSON` (if `SUMMARY` absent) |

If `CBV_TEST_REPORTS` is added later with a different schema, the adapter looks for `REPORT_ID` / `ID`, `CHECKED_AT` / `CREATED_AT`, `STATUS`, `SEVERITY`, `PHASE`, `RUN_BY` / `ACTOR_ID`, `TRACE_ID`, `SUMMARY` / `SUMMARY_JSON`.

## Detail view behavior

`CbvWebAppObservability_getReportDetail(reportId)`:

1. Looks up in-memory reports by `propKey` or `traceId` match — returns full `reportJson` directly.
2. Falls back to a `SYSTEM_HEALTH_LOG` row lookup by `RUN_ID`. The returned `reportText` is a `JSON.stringify` of the full row.
3. If neither match, returns an envelope with `data.reportId` set but `reportText` empty and a warning `Report not found: <id>`.

Read-first only — no inline editing, no inline deletion. The viewer never modifies any source row.

## No edit / no delete

The Report Viewer page must not render any of the following:

- Edit / Save / Update controls for a report.
- Delete / Remove / Discard controls for a report.
- Auto-heal / auto-resolve / auto-escalate controls.

The safety footer below the report list affirms this:

```
Read-first only. No delete report · No edit report · No auto-heal · No production claim.
```
