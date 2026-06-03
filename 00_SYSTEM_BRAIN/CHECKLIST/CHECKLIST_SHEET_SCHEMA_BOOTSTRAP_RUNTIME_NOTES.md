# Checklist Sheet Schema Bootstrap — Runtime Notes

**Phase:** `PHASE_CHECKLIST_09_SHEET_SCHEMA_BOOTSTRAP`

---

## Code locations

| Artifact | Path |
|----------|------|
| GAS bootstrap (clasp) | `05_GAS_RUNTIME/51_CHECKLIST_SHEET_SCHEMA_BOOTSTRAP.js` |
| Task DB mirror | `gas-runtime-api/51_ChecklistSheetSchemaBootstrap.js` |
| Test console | `gas-runtime-api/85_ChecklistSheetSchemaTestConsole.js` |
| Schema manifest (global) | `05_GAS_RUNTIME/90_BOOTSTRAP_SCHEMA.js` |
| Config keys | `05_GAS_RUNTIME/00_CORE_CONFIG.js`, `gas-runtime-api/01_TaskDbConfig.js` |
| Expected columns map | `gas-runtime-api/31_TaskDbSchemaMap.js` |
| TS manifest mirror | `apps/workboard/.../checklistSheetSchemaManifest.ts` |
| Static checks | `apps/workboard/.../checklistSheetSchemaBootstrapChecks.ts` |

**Clasp:** `51_CHECKLIST_SHEET_SCHEMA_BOOTSTRAP.js` listed in `.clasp.json` after `90_BOOTSTRAP_TASK.js`.

---

## Bootstrap report shape (summary)

```javascript
{
  ok: boolean,
  dryRun: boolean,
  spreadsheetId: string,
  startedAt: string,
  tabs: { [sheetName]: { action, missingHeaders, extraHeaders, warnings } },
  errors: string[]
}
```

---

## Integration with existing bootstrap helpers

When `90_BOOTSTRAP_INIT.js` helpers exist (`ensureSheetExists`, `ensureHeadersMatchOrReport`), checklist bootstrap delegates to them; otherwise uses inline `insertSheet` + header write for new tabs only.

---

## FE impact in phase 09

**None.** Workboard checklist continues localStorage for satellites and GAS API for items. Empty satellite tabs do not change operator UX until phase 11 bridge.

---

## Production checklist

1. `clasp push` (or deploy pipeline) includes `51_CHECKLIST_SHEET_SCHEMA_BOOTSTRAP.js`.
2. Dry run → bootstrap → validate on **Task DB** spreadsheet only.
3. Confirm `TASK_CHECKLIST` still has historical rows; new columns empty is OK.
4. Record validation output in operator log before phase 10.

---

## Known warnings

- Existing `TASK_CHECKLIST` may have columns in legacy order; bootstrap appends `SOURCE`, `SCHEMA_VERSION`, `IS_ARCHIVED` at end — not a full reorder.
- `49_WorkInboxChecklist.js` does not yet read/write new columns or satellite tabs.
- CI cannot open Google Sheets; live proof is manual.
