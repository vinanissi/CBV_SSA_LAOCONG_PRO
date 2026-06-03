# Handoff — PHASE_CHECKLIST_07_TEMPLATE_RUNTIME

**Result:** GO_WITH_WARNINGS  
**Date:** 2026-06-01

---

## Verify

```bash
cd apps/workboard
npm run build
npx tsx -e "import { runChecklistTemplateRuntimeChecks } from './src/modules/task/inbox/checklist/checklistTemplateChecks.ts'; console.log(runChecklistTemplateRuntimeChecks());"
```

**Áp dụng mẫu** → chọn mẫu → xem preview → **Áp dụng vào checklist**.
