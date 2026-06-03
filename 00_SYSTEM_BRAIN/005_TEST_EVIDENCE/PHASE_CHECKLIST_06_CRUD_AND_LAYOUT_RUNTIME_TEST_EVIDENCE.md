# Test Evidence — PHASE_CHECKLIST_06_CRUD_AND_LAYOUT_RUNTIME

**Date:** 2026-06-01

---

## Build

```bash
cd apps/workboard && npm run build
```

---

## Static checks

```bash
npx tsx -e "import { runChecklistCrudLayoutRuntimeChecks } from './src/modules/task/inbox/checklist/checklistCrudLayoutChecks.ts'; console.log(runChecklistCrudLayoutRuntimeChecks());"
```

Regression (optional):

```bash
npx tsx -e "import { runChecklistHistoryRuntimeChecks } from './src/modules/task/inbox/checklist/checklistHistoryChecks.ts'; console.log(runChecklistHistoryRuntimeChecks());"
```

---

## Manual

1. Add step → expand → edit note → save.
2. Move up/down → verify order.
3. Archive → toggle show archived → restore.

---

## Skipped

- E2E browser automation
- Multi-user reorder conflict tests
