# Test Evidence — CHECKLIST_ACTION_BINDING_FIX

| Field | Value |
|-------|-------|
| **Timestamp** | 2026-06-02T16:00Z |
| **Test actor** | Playwright (automated) + static checks |
| **Runtime URL** | `http://localhost:5178/inbox/TASK-mpwr16qj-CNBT` |
| **Task ID** | `TASK-mpwr16qj-CNBT` |

---

## Static checks

```bash
node apps/workboard/src/modules/task/inbox/checklist/checklistActionBindingFixChecks.ts
```

Result: **GO_WITH_WARNINGS** — all 7 checks pass.

---

## Browser ABF matrix

| ID | Button | Expected | Actual | Pass |
|----|--------|----------|--------|------|
| ABF-01 | Phản hồi | Open feedback panel | `detailSection=feedback`, panel visible | Yes |
| ABF-02 | Tài liệu | Open attachment panel | `detailSection=attachments` | Yes |
| ABF-03 | Liên kết | Open link panel | `detailSection=links` | Yes |
| ABF-04 | Lịch sử | Open history panel | `detailSection=history` | Yes |
| ABF-05 | No silent fail | Operator feedback | No Failed to fetch | Yes |
| ABF-06 | After refresh | Panel still open | Needs re-click | No |
| ABF-09 | Console | No blocking error | Hooks warning only | Yes |

JSON: `phase_tmp/abf_browser_results.json`  
Screenshots: `phase_tmp/abf_screenshots/ABF-*.png`

---

## Network / console

- Intermittent HTTP 400 on background task routes (non-blocking for chip binding).
- React Hooks order warning in `FocusTaskWorkspace` (pre-existing).

---

## Conclusion

**GO_WITH_WARNINGS** — all four action buttons respond and open the correct right-pane runtime. Refresh persistence of open panel is a minor follow-up.
