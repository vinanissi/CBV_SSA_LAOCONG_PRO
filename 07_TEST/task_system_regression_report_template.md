# Task System Regression Report

**Run ID:** `{{RUN_ID}}`  
**Run At:** `{{RUN_AT}}`  
**Verdict:** `{{VERDICT}}`

---

## Summary

| Metric | Value |
|--------|-------|
| Overall | {{VERDICT}} |
| HIGH | {{HIGH_COUNT}} |
| MEDIUM | {{MEDIUM_COUNT}} |
| LOW | {{LOW_COUNT}} |
| Total findings | {{TOTAL_COUNT}} |

---

## Must Fix Before Deploy

{{#MUST_FIX}}
- {{.}}
{{/MUST_FIX}}

{{^MUST_FIX}}
None.
{{/MUST_FIX}}

---

## Results by Category

| Category | OK | Finding Count |
|----------|----|---------------|
| SCHEMA | {{SCHEMA_OK}} | {{SCHEMA_COUNT}} |
| SEED | {{SEED_OK}} | {{SEED_COUNT}} |
| ENUM | {{ENUM_OK}} | {{ENUM_COUNT}} |
| REF | {{REF_OK}} | {{REF_COUNT}} |
| HIERARCHY | {{HIERARCHY_OK}} | {{HIERARCHY_COUNT}} |
| WORKFLOW | {{WORKFLOW_OK}} | {{WORKFLOW_COUNT}} |
| FIELD_POLICY | {{FIELD_POLICY_OK}} | {{FIELD_POLICY_COUNT}} |
| APPSHEET | {{APPSHEET_OK}} | {{APPSHEET_COUNT}} |
| MIGRATION | {{MIGRATION_OK}} | {{MIGRATION_COUNT}} |

---

## Findings Detail

### HIGH

{{#HIGH_FINDINGS}}
- **[{{table}}]** {{message}} ({{rowId}} / {{field}})
{{/HIGH_FINDINGS}}

{{^HIGH_FINDINGS}}
None.
{{/HIGH_FINDINGS}}

### MEDIUM

{{#MEDIUM_FINDINGS}}
- **[{{table}}]** {{message}} ({{rowId}} / {{field}})
{{/MEDIUM_FINDINGS}}

{{^MEDIUM_FINDINGS}}
None.
{{/MEDIUM_FINDINGS}}

### LOW

{{#LOW_FINDINGS}}
- **[{{table}}]** {{message}}
{{/LOW_FINDINGS}}

{{^LOW_FINDINGS}}
None.
{{/LOW_FINDINGS}}

---

## Baseline Comparison

| Run | Verdict | HIGH | MEDIUM | LOW |
|-----|---------|------|--------|-----|
| Previous | {{PREV_VERDICT}} | {{PREV_HIGH}} | {{PREV_MEDIUM}} | {{PREV_LOW}} |
| Current | {{VERDICT}} | {{HIGH_COUNT}} | {{MEDIUM_COUNT}} | {{LOW_COUNT}} |
| Regression | {{REGRESSION}} | | | |

---

## Final Verdict

| Status | READY FOR USE / NEEDS FIX BEFORE USE |
|--------|-------------------------------------|
| Condition | 0 HIGH = READY; ≥1 HIGH = NEEDS FIX |

**Action:** {{ACTION}}
