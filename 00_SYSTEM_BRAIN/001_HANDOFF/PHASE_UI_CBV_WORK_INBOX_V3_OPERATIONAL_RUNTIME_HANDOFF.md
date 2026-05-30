# PHASE_UI_CBV_WORK_INBOX_V3_OPERATIONAL_RUNTIME — Handoff

**Status:** GO_WITH_WARNINGS

---

## Deploy steps

1. `clasp push` from `gas-runtime-api/` (includes `workInboxOperational*.js`).
2. Redeploy GAS Web App.
3. Deploy Worker API with new `/api/work-inbox/*` routes.
4. Optional: add sheets `ACTION_AUDIT_LOG`, `TASK_TIMELINE`, `TASK_APPOINTMENTS`, `TASK_NOTES`, `TASK_DOCUMENTS`, or `WORK_INBOX_OP_STORE` to task spreadsheet.

---

## Verify

```bash
cd apps/workboard
npm run build
npx tsx -e "import { runWorkInboxOperationalRuntimeChecks } from './src/modules/task/inbox/operationalRuntime/workInboxOperationalRuntimeChecks.ts'; console.log(runWorkInboxOperationalRuntimeChecks());"
```

### Manual

1. Focus task → Timeline tab shows runtime events (not only comments).
2. **Tạo lịch hẹn** → dialog → appears in Appointment preview.
3. **Lưu ghi chú** → note in bundle / timeline `TASK_NOTE_ADDED`.
4. **Hướng dẫn** → opens SOP URL (or “not found” toast).
5. **Mẫu biểu mẫu** → opens template list.
6. Header shows `N / Total`, `Còn X việc`, `Y%`.
7. OPERATOR role: handoff disabled; ADMIN can handoff.

---

## Docs

- Report: `000_REPORTS/PHASE_UI_CBV_WORK_INBOX_V3_OPERATIONAL_RUNTIME_REPORT.md`
- Evidence: `005_TEST_EVIDENCE/PHASE_UI_CBV_WORK_INBOX_V3_OPERATIONAL_RUNTIME_TEST_EVIDENCE.md`
