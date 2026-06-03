# Handoff — PHASE_CHECKLIST_03_ATTACHMENTS

**Result:** GO_WITH_WARNINGS  
**Date:** 2026-06-01

---

## Done

- 📎 N tài liệu toggle + list (`Tài liệu:` / `- name`)
- + Thêm tài liệu: name, URL, file metadata, task ref pick
- `attachmentCount` from `attachments.length`
- Cleared on checklist item delete
- Feedback runtime preserved

---

## Verify

```bash
cd apps/workboard
npm run build
npx tsx -e "import { runChecklistAttachmentRuntimeChecks } from './src/modules/task/inbox/checklist/checklistAttachmentChecks.ts'; console.log(runChecklistAttachmentRuntimeChecks());"
npx tsx -e "import { runChecklistFeedbackRuntimeChecks } from './src/modules/task/inbox/checklist/checklistFeedbackChecks.ts'; console.log(runChecklistFeedbackRuntimeChecks().status);"
```

---

## Follow-up

`PHASE_CHECKLIST_04_LINKS` — durable attachment API when approved.
