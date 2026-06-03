# PHASE_OPERATOR_DESIGN_BASELINE_V1 — Test Evidence

**Result:** GO_WITH_WARNINGS  
**Date:** 2026-06-02

---

## Static checks

```powershell
cd apps/workboard
npx tsx -e "import { runOperatorDesignBaselineV1Checks } from './src/modules/task/inbox/focusRuntime/operatorDesignBaselineV1Checks.ts'; const r=runOperatorDesignBaselineV1Checks(); console.log(JSON.stringify(r,null,2));"
```

| Check | Pass |
|-------|------|
| BASELINE_CSS | yes |
| BASELINE_CLASS | yes |
| CSS_IMPORTED | yes |
| TASK_TITLE_TOKEN | yes |
| RIGHT_BODY_MIN | yes |
| COMPACT_COUNTERS | yes |
| DENSITY_PRESERVED | yes |
| PANEL_ORDER | yes |
| TECH_COLLAPSED | yes |
| AUTHORITY | yes |
| ADR | yes |

---

## Build / lint

Not run as blocking gate (prior unrelated TS in checklist upload path may still fail full build).

---

## Browser smoke (manual — pending UAT phase)

| Item | Status |
|------|--------|
| Việc của tôi opens | Not run |
| Task title readable | Not run |
| 4–5 checklist rows visible | Not run |
| Compact counters | Not run |
| Right panel sections readable | Not run |
| Technical metadata hidden | Not run (source: collapsed `<details>`) |
| Footer sync visible | Not run |
| Row focus / checkbox complete | Not run |
| Timeline / Handoff / Hồ sơ tabs | Not run |

**Follow-up:** `PHASE_CHECKLIST_OPERATOR_BROWSER_UAT`
