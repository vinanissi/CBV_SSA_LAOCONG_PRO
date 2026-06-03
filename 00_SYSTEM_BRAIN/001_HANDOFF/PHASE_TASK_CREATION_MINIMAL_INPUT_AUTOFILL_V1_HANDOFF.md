# PHASE_TASK_CREATION_MINIMAL_INPUT_AUTOFILL_V1 — Handoff

**Result:** GO_WITH_WARNINGS  
**Date:** 2026-06-02

---

## Verify

1. Open Tạo việc — sections Nội dung / Phân loại / Hệ thống tự điền.
2. No ID or TASK_CODE inputs.
3. With 2 pilot units — cannot submit without selecting Đơn vị.
4. Created task STATUS=NEW; opens in focus; checklist intact.

---

## Static gate

```bash
cd apps/workboard
npx tsx -e "import { runTaskCreationMinimalInputAutofillV1Checks } from './src/modules/task/inbox/create/taskCreationMinimalInputAutofillV1Checks.ts'; console.log(JSON.stringify(runTaskCreationMinimalInputAutofillV1Checks(), null, 2));"
```

---

## Follow-up

Wire `TASK_CREATION_UNIT_CATALOG` / task types from snapshot or GAS lookup.
