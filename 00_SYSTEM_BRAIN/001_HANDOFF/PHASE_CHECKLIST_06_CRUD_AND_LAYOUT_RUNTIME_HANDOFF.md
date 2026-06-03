# Handoff — PHASE_CHECKLIST_06_CRUD_AND_LAYOUT_RUNTIME

**Result:** GO_WITH_WARNINGS  
**Date:** 2026-06-01

---

## Verify

```bash
cd apps/workboard
npm run build
npx tsx -e "import { runChecklistCrudLayoutRuntimeChecks } from './src/modules/task/inbox/checklist/checklistCrudLayoutChecks.ts'; console.log(runChecklistCrudLayoutRuntimeChecks());"
```

Use toolbar: **+ Thêm bước**, **Mở tất cả**, **Thu gọn tất cả**, **Hiện bước lưu trữ**. Per row: **Sửa**, **⋯** (move/archive), **Thu nhỏ**.
