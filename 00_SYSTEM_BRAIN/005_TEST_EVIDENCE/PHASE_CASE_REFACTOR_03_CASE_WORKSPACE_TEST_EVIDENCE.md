# Test Evidence — CASE_REFACTOR_03 Case Workspace

| Field | Value |
|-------|-------|
| **Phase** | `PHASE_CASE_REFACTOR_03_CASE_WORKSPACE` |
| **Date** | 2026-06-01 |

---

## Build

```
npm run build (apps/workboard) — PASS (tsc + vite)
```

---

## Static checks

```
runCaseWorkspaceChecks() — GO_WITH_WARNINGS (0 failures)
runCaseReadModelChecks() — GO_WITH_WARNINGS (regression)
```

---

## Forbidden artifact check

No `CASE_MAIN`, `CaseService`, `CaseRepository`, new API routes in phase files.

---

## Flag ON/OFF

| State | Expected | Verified |
|-------|----------|------------|
| OFF (default) | Legacy Focus path in code | `CW_LEGACY_PATH` check |
| ON | `CaseWorkspace` branch | `CW_FOCUS_BRANCH` check |

Manual browser UAT deferred to phase 04.

---

## Read-only / no persistence

- CaseWorkspace has no fetch/POST
- Mutations only via existing WorkInboxChecklistSection / Attachments / ActionBar

---

## Unresolved

- Real operator session screenshots — phase 04  
- Staging flag rollout — operator-maintained  

---

*Phase 03 validation complete.*
