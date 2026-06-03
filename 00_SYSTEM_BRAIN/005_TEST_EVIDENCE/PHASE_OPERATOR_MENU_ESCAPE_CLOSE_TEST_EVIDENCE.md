# Test Evidence — OPERATOR_MENU_ESCAPE_CLOSE

| Field | Value |
|-------|-------|
| **Timestamp** | 2026-06-02T19:05:50Z |
| **URL** | `http://localhost:5173/inbox/TASK-mpwr16qj-CNBT` |
| **Viewport** | 1440×900 |
| **Conclusion** | **GO_WITH_WARNINGS** |

---

## Static

`operatorMenuEscapeCloseChecks.ts` — 12/12 pass

---

## Browser MEC

| ID | Pass | Notes |
|----|------|-------|
| MEC-01 / 01b | PASS | ESC closes |
| MEC-02 | PASS | Focus on trigger after ESC |
| MEC-03 | PASS | Click outside closes |
| MEC-04 | PASS | Menu stable on hover inside |
| MEC-05 | PASS | Item action closes |
| MEC-06 | PASS | ESC idle — no error |
| MEC-07 | PASS | Still above footer |
| MEC-08 | PASS | Items clickable |
| MEC-09 | PASS | No completion toggle |
| MEC-10 | PASS | No focus mode change |
| MEC-11 | PASS | Bar buttons work |
| MEC-12 | PASS | Only pre-existing Hooks warn |
| MEC-13 | PASS | 5× open/ESC cycles |

**Artifacts:** `phase_tmp/mec_browser_results.json`, `phase_tmp/mec_screenshots/MEC-esc-close.png`
