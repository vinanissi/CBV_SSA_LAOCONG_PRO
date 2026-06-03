# PHASE_TASK_STATUS_DEADLINE_SLA_SEMANTIC_MODEL_V1 — Handoff

**Result:** GO_WITH_WARNINGS  
**Date:** 2026-06-02

---

## What changed

- `TASK_STATUS_SUMMARY_SCHEMA` + `buildTaskSemanticSummaryBag()` separate workflow vs deadline vs SLA vs priority vs owner.
- `CompactTaskHeader` uses `TaskStatusSemanticSummary` (labeled rows); removed mixed status/SLA/priority pills.
- Right panel Chi tiết operator summary reads `workflow_status`, `deadline_state`, `sla_state`, `priority_state`, `owner` from the same bag.

---

## Verify in browser

1. Open focus task with due today — **TRẠNG THÁI** ≠ Hôm nay; **THỜI HẠN** = Hôm nay.
2. Overdue task — **THỜI HẠN** shows Quá hạn; workflow not Quá hạn unless API status says so.
3. Chi tiết tab matches header semantics.
4. Checklist focus/checkbox/tabs/footer unchanged.

---

## Static gate

```bash
cd apps/workboard
npx tsx -e "import { runTaskStatusDeadlineSlaSemanticModelV1Checks } from './src/modules/task/inbox/focusRuntime/taskStatusDeadlineSlaSemanticModelV1Checks.ts'; console.log(JSON.stringify(runTaskStatusDeadlineSlaSemanticModelV1Checks(), null, 2));"
```

---

## Follow-up

`PHASE_CHECKLIST_OPERATOR_BROWSER_UAT` — run full operator smoke including semantic header/panel.

---

## Risks

- Heuristic SLA when `slaStatus` column empty.
- Default workflow **Đang xử lý** may mask true workflow if API status missing.
