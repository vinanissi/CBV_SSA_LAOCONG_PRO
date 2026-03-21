# Bootstrap Flow — CBV_SSA_LAOCONG_PRO

Integrated bootstrap lifecycle with audit-first, safe append, SYSTEM_HEALTH_LOG.

---

## 1. Flow Diagram

```
initAll(options)
  │
  ├── mergeBootstrapOptions(options)
  │
  ├── ensureCoreSheetsExist()
  │     └── Create missing sheets, set headers when empty/extendable
  │
  ├── ensureSchema(options)
  │     └── If appendMissingColumns: append truly missing columns at end only
  │
  ├── ensureEnums()
  │     └── seedEnumDictionary, ensureDisplayTextForEnumRows
  │
  ├── ensureMasterCode()
  │     └── ensureDisplayTextForMasterCodeRows
  │
  ├── initSystemConfig()
  │
  ├── selfAuditBootstrap({
  │       autoFix: false,
  │       appendMissingColumns: false,
  │       writeHealthLog: options.writeHealthLog,
  │       schemaResult: schemaResult
  │     })
  │     └── Full health check; append to SYSTEM_HEALTH_LOG if writeHealthLog
  │
  ├── maybeAbortOnCritical(auditReport)
  │     └── If failOnCritical && critical > 0: return early
  │
  ├── verifyAppSheetReadiness()
  │     └── Uses audit results; returns status, blockers, reasons
  │
  ├── buildBootstrapSummary(...)
  │
  └── return structured result
```

---

## 2. Options

| Option | Default | Meaning |
|--------|---------|---------|
| appendMissingColumns | false | Append missing columns at end; never reorder/rename/delete |
| writeHealthLog | true | Append one row to SYSTEM_HEALTH_LOG per run |
| failOnCritical | false | If true and critical issues exist, abort bootstrap |
| verbose | true | Logger.log summary |

---

## 3. Decision Rules

| Condition | bootstrapSafe | appsheetReady |
|-----------|----------------|---------------|
| Critical issues > 0 | false | false |
| High issues > 0 | false | false |
| Duplicate headers | — | false |
| Blank headers | — | false |
| Missing required columns only | may be true | false |
| Orphan refs | — | false |
| Duplicate keys | false | false |
| All clear | true | true |

---

## 4. Safe Append Rules

When `appendMissingColumns = true`:

- Only append columns in schema but not in sheet
- Append at end only
- Never reorder existing columns
- Never rename columns
- Never delete columns
- Never overwrite header values
- Log every appended column

---

## 5. Usage

```javascript
initAll();

initAll({
  appendMissingColumns: true,
  writeHealthLog: true,
  failOnCritical: false
});

var result = initAll({
  appendMissingColumns: false,
  failOnCritical: true
});
Logger.log(JSON.stringify(result, null, 2));
```

---

## 6. Return Structure

```javascript
{
  ok: true,
  bootstrapSafe: true,
  appsheetReady: true,
  schemaUpdated: false,
  appendedColumns: [],
  appendedColumnsCount: 0,
  auditSummary: { systemHealth, totals, mustFixNow, warnings },
  verifyResult: { status, blockers, reasons },
  nextSteps: [...],
  data: { createdSheets, existingSheets, updatedSheets, warnings },
  code: "INIT_OK",
  message: "Bootstrap completed"
}
```
