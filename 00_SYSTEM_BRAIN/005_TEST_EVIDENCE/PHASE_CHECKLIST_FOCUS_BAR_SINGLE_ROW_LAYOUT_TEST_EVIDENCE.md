# Test Evidence — CHECKLIST_FOCUS_BAR_SINGLE_ROW_LAYOUT

| Field | Value |
|-------|-------|
| **Timestamp** | 2026-06-02T19:15:23Z |
| **URL** | `http://localhost:5173/inbox/TASK-mpwr16qj-CNBT` |
| **Viewport** | 1440×900 |
| **Step title** | UAT Step 1 - Verify persistence |
| **Conclusion** | **GO_WITH_WARNINGS** |

---

## Browser FBS

| ID | Pass | Notes |
|----|------|-------|
| FBS-01..02 | PASS | Tập trung bước visible |
| FBS-03 | PASS | btnY=352, statusY=357 (same row) |
| FBS-04..05 | PASS | Title shown; no TCL-/ID in status text |
| FBS-06..09 | PASS | Bỏ focus + re-focus |
| FBS-11..15 | PASS | Rows + inline chips |
| FBS-16 | PASS | Pre-existing Hooks warn only |
| FBS-17 | PASS | Smoke |
| FBS-10 | N/A | Long-title ellipsis — CSS only |

**Artifacts:** `phase_tmp/fbs_browser_results.json`, `phase_tmp/fbs_screenshots/FBS-focus-bar.png`
