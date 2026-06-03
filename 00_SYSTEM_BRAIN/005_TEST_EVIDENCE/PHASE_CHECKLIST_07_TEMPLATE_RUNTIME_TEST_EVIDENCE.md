# Test Evidence — PHASE_CHECKLIST_07_TEMPLATE_RUNTIME

**Date:** 2026-06-01

---

## Build

`npm run build` in `apps/workboard` — run at phase completion.

---

## Static checks

```bash
npx tsx -e "import { runChecklistTemplateRuntimeChecks } from './src/modules/task/inbox/checklist/checklistTemplateChecks.ts'; console.log(runChecklistTemplateRuntimeChecks());"
```

---

## Manual

1. Task with existing checklist items → apply template → count increases, old items remain.
2. Empty checklist → apply **Hồ sơ xã viên** → 5 items appear.
3. History shows template apply lines.

---

## Skipped

- Server-side template CRUD E2E
