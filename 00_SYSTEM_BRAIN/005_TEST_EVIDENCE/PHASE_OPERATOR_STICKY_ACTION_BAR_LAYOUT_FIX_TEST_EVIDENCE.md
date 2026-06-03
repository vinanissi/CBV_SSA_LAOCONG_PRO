# Test Evidence — OPERATOR_STICKY_ACTION_BAR_LAYOUT_FIX

| Field | Value |
|-------|-------|
| **Timestamp** | 2026-06-02T18:55:44Z |
| **Actor** | Playwright headless + static checks |
| **URL** | `http://localhost:5173/inbox/TASK-mpwr16qj-CNBT` |
| **Viewport** | 1440×900 |
| **Task** | `TASK-mpwr16qj-CNBT` |
| **Conclusion** | **GO_WITH_WARNINGS** |

---

## Static checks

```
operatorStickyActionBarLayoutFixChecks.ts → GO_WITH_WARNINGS (11/11 pass)
```

---

## Browser — SAB cases

| ID | Result | Notes |
|----|--------|-------|
| SAB-01 | PASS | Menu visible |
| SAB-02 | PASS | Menu bottom y=427, footer y=856 — not covered |
| SAB-03 | PASS | Menu item visible + clickable bbox |
| SAB-04 | PASS | Closes after menu action |
| SAB-04b | N/A | Escape does not dismiss (no handler) |
| SAB-05 | PASS | Sticky bar visible |
| SAB-06 | PASS | Footer present |
| SAB-07 | PASS | Menu above bar/footer |
| SAB-08 | PASS | `data-cbv-more-menu-placement="drop-up"` |
| SAB-09 | PASS | After scroll |
| SAB-10 | PASS | With focused checklist row |
| SAB-11 | PASS | Sao chép link clicked |
| SAB-12 | WARN | Pre-existing React Hooks order in FocusTaskWorkspace |
| SAB-13 | PASS | No document overflow |

**Artifact:** `phase_tmp/sab_browser_results.json`, `phase_tmp/sab_screenshots/SAB-menu-open.png`

---

## Console

Blocking new errors: **none** from this phase. Pre-existing Hooks warning logged.
