# PHASE_TASK_RELATED_ENTITY_INPUT_MODEL_V1 — Handoff

**Result:** GO_WITH_WARNINGS  
**Date:** 2026-06-02

---

## Verify

1. Create dialog — **Đối tượng liên quan** with Loại + Giá trị; no standalone SĐT/Biển số.
2. Select SĐT → enter phone → task creates with related entity.
3. Open task — header/panel shows `SĐT: …` or `Biển số: …`.

---

## Static gate

```bash
cd apps/workboard
npx tsx -e "import { runTaskRelatedEntityInputModelV1Checks } from './src/modules/task/inbox/create/taskRelatedEntityInputModelV1Checks.ts'; console.log(JSON.stringify(runTaskRelatedEntityInputModelV1Checks(), null, 2));"
```

---

## Follow-up

Wire CONTRACT/INVOICE catalog entries when modules ship.
