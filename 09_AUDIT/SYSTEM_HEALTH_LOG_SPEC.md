# SYSTEM_HEALTH_LOG Spec — CBV_SSA_LAOCONG_PRO

Dedicated sheet for health check run summaries.

---

## 1. Sheet Name

`SYSTEM_HEALTH_LOG`

---

## 2. Columns

| Column | Type | Purpose |
|--------|------|---------|
| RUN_ID | Text | Unique run ID (SHL_yyyyMMdd_xxx) |
| RUN_AT | DateTime/Text | ISO timestamp |
| SYSTEM_HEALTH | Text | PASS / WARN / FAIL |
| BOOTSTRAP_SAFE | Text | YES / NO |
| APPSHEET_READY | Text | YES / NO |
| CRITICAL_COUNT | Number | Count of CRITICAL findings |
| HIGH_COUNT | Number | Count of HIGH findings |
| MEDIUM_COUNT | Number | Count of MEDIUM findings |
| LOW_COUNT | Number | Count of LOW findings |
| INFO_COUNT | Number | Count of INFO findings |
| SCHEMA_UPDATED | Text | YES if columns appended |
| APPENDED_COLUMNS_COUNT | Number | Number of columns appended |
| MUST_FIX_NOW | Text | Semicolon-separated critical/high issues |
| WARNINGS | Text | Semicolon-separated medium/low issues |
| SUMMARY_JSON | Text | Compact JSON: systemHealth, bootstrapSafe, appsheetReady, top5 |

---

## 3. Behavior

- Create sheet if missing
- Create headers if missing
- Append one row per audit run
- No per-finding row spam
- Truncate long strings (MUST_FIX_NOW, WARNINGS, SUMMARY_JSON) to ~4000 chars

---

## 4. Creation

`createOrEnsureSystemHealthLogSheet()` — idempotent. Called by `appendSystemHealthLogRow()`.

---

## 5. Write Path

- `selfAuditBootstrap({ writeHealthLog: true, schemaResult: {...} })` → `appendSystemHealthLogRow(healthSummary)`
- Called from `initAll()` flow via `selfAuditBootstrap` with `schemaResult` from `ensureSchema`

---

## 6. GAS Constants

- `SYSTEM_HEALTH_LOG_SHEET` — sheet name
- `SYSTEM_HEALTH_LOG_HEADERS` — column array

Defined in `90_BOOTSTRAP_SCHEMA.gs`.
