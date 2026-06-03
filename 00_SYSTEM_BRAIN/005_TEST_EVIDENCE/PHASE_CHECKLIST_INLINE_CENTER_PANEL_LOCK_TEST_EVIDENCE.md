# Test Evidence — CHECKLIST_INLINE_CENTER_PANEL_LOCK

| Field | Value |
|-------|-------|
| **Timestamp** | 2026-06-02T16:18Z |
| **Actor** | Playwright + static checks |
| **URL** | `http://localhost:5178/inbox/TASK-mpwr16qj-CNBT` |
| **Task ID** | `TASK-mpwr16qj-CNBT` |

---

## Static

`node apps/workboard/src/modules/task/inbox/checklist/checklistInlineCenterPanelLockChecks.ts` → **GO** (7 checks).

---

## Browser ICP

| ID | Expected location | Pass |
|----|-------------------|------|
| ICP-01 Phản hồi | CENTER inline | Yes |
| ICP-02 Tài liệu | CENTER inline | Yes |
| ICP-03 Liên kết | CENTER inline | Yes |
| ICP-04 Lịch sử | CENTER inline | Yes |
| ICP-05 One section | Single active | Yes |
| ICP-06 Switch chips | Switches panel | Yes |
| ICP-07 Attached to row | In-row block | Yes |
| ICP-08 RIGHT does not suppress CENTER | Both visible | Yes |
| ICP-09 Toggle | Checkbox present | Yes |
| ICP-10 Copy link | Controls present | Yes |
| ICP-12 After refresh | Reopen works | Yes |

Evidence: `phase_tmp/icp_browser_results.json`, `phase_tmp/icp_screenshots/`.

---

## Conclusion

**GO** — center inline panel authority locked; regression guard in static checks.
