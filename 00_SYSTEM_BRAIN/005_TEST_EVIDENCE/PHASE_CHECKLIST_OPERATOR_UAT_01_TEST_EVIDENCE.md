# Test Evidence — PHASE_CHECKLIST_OPERATOR_UAT_01

**Timestamp:** 2026-06-02 (live API session ~85s)  
**Operator actor:** `UAT_OPERATOR` (ADMIN role in POST body)  
**Result:** GO_WITH_WARNINGS

---

## Environment

| Item | Value |
|------|-------|
| Web App | `AKfycbxldVl0LeNYG5J4drQBCqwQRaYZxoZSC11vR6BtQun1ly2HAa_yefH_SHxg64f5kPA` |
| Spreadsheet | `1Jh3gQQKugazSvd24CKZremHjSmTNGrsnYczq4UzK5ZE` |
| Drive root | `19d04jElj8b41HCsy7L1ZBqgHe3vpd37t` |

---

## Live API evidence summary

```json
{
  "taskCreate": { "ok": true, "taskId": "TASK-mpwr16qj-CNBT" },
  "clCreate1": { "ok": true, "id": "TCL-mpwr1eup-48KU" },
  "clCreate2": { "ok": true, "id": "TCL-mpwr1k96-LXZE" },
  "list1": { "ok": true, "count": 2 },
  "toggle": { "ok": true, "isDone": true },
  "feedback": { "ok": true },
  "feedbackRead": { "ok": true, "count": 1 },
  "attachment": { "ok": true },
  "driveFolder": { "ok": true, "folderId": "1OwE_tg941cQRuyETOzR0RcsocmXzDguV" },
  "link": { "ok": true },
  "historyRead": { "ok": true, "count": 4 },
  "list2": { "ok": true, "count": 2, "doneCount": 1 },
  "schema": { "ok": true, "status": "GO" },
  "bridge": { "ok": true, "schema": "GO", "status": "GO_WITH_WARNINGS" }
}
```

---

## Operator flow matrix

| Flow | Live API | Static FE | Browser |
|------|----------|-----------|---------|
| Create task | PASS | — | SKIPPED |
| Create checklist | PASS | — | SKIPPED |
| Open checklist | PASS | — | SKIPPED |
| Tick items | PASS | — | SKIPPED |
| Comment | PASS | — | SKIPPED |
| Attachment | PASS | — | SKIPPED |
| Copy link | Link row PASS | PASS | SKIPPED |
| Deep link | — | PASS | SKIPPED |
| Focus mode | — | PASS | SKIPPED |
| Compact mode | — | PASS | SKIPPED |
| Progress | — | PASS | SKIPPED |
| Dual pane | — | PASS | SKIPPED |
| Persistence | PASS | — | SKIPPED |
| Refresh | PASS | — | SKIPPED |
| Navigation | — | PASS | SKIPPED |

---

## Persistence validation

- After toggle: `list2.doneCount = 1` of 2 items.
- `readFeedback` count = 1 for item `TCL-mpwr1eup-48KU`.
- `readHistory` count = 4 (includes bootstrap/history append chain).

---

## Static commands

```bash
npx tsx 00_SYSTEM_BRAIN/CHECKLIST/checklistRuntimeLockChecks.ts
npx tsx apps/workboard/src/modules/task/inbox/link/stepDeepLinkChecks.ts
npx tsx apps/workboard/src/modules/task/inbox/checklist/checklistDualPaneRuntimeChecks.ts
npx tsx apps/workboard/src/modules/task/inbox/checklist/checklistFocusStepModeChecks.ts
```

---

## Screenshots

None captured in this automated run.

---

## Skipped

- `clasp run` — not used (known blocked).
- Full browser operator walkthrough — required for **PRODUCTION_LOCK**, not completed here.

---

## Conclusion

**Live data-path operator workflow: PASS.**  
**Browser UX operator workflow: NOT EXECUTED — phase result GO_WITH_WARNINGS.**
