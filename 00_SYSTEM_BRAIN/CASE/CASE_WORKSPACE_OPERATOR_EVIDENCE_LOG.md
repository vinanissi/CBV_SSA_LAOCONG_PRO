# Case Workspace — Operator Evidence Log

**Phases:** `PHASE_CASE_REFACTOR_04_OPERATOR_UAT` · `PHASE_CASE_REFACTOR_04B_OPERATOR_UAT`  
**Rule:** Do not fabricate metrics. Leave cells blank until a real session is recorded.

---

## Live operator sessions

**Status as of 2026-06-01 (phase 04B agent completion):**

```text
No live operator session completed in this phase run.
Metrics not fabricated.
Operator count: 0
Case count: 0
```

**04B delta:** In-app UAT recorder (`CaseWorkspaceUatRecorder`) added for staging self-report when `VITE_CASE_WORKSPACE_UAT_TELEMETRY=true`. Operators must run sessions and append rows below.

Staging operators must append rows below.

---

## Session template

| Field | Description |
|-------|-------------|
| Session ID | e.g. `UAT-2026-06-02-OP1` |
| Operator | Name or ID |
| Date/Time | ISO or local |
| Environment | staging / dev / prod-pilot |
| Case Count | Cases exercised this session |
| Cases Observed | Brief IDs or types |
| Understanding Success | Y/N per operator self-report |
| Checklist Success | Y/N |
| Document Success | Y/N |
| Timeline/Handoff Success | Y/N |
| Task Action Success | Y/N + count |
| Friction Notes | Free text |
| Feedback | Q1–Q10 summaries |
| Result | PASS / PARTIAL / FAIL session |

---

## Sessions

| Session ID | Operator | Date/Time | Environment | Case Count | Understanding | Checklist | Docs | Timeline/Handoff | Task Actions | Friction | Result |
|------------|----------|-----------|-------------|------------|---------------|-----------|------|------------------|--------------|----------|--------|
| *(none yet)* | — | — | — | 0 | — | — | — | — | — | — | — |

---

## Technical verification only (non-operator)

| Session ID | Operator | Notes |
|------------|----------|-------|
| `TECH-VERIFY-01` | Agent/build (04) | `npm run build` PASS; `runCaseWorkspaceOperatorUatChecks()` readiness; flag paths verified in code. **Not counted toward UAT gates.** |
| `TECH-VERIFY-02` | Agent/build (04B) | `npm run build` PASS; `runCaseWorkspaceOperatorUat04bChecks()` GO_WITH_WARNINGS; `CaseWorkspaceUatRecorder` wired; still **0 live operators**. **Not counted toward UAT gates.** |

---

## Telemetry export attachment

Paste `window.__CASE_WORKSPACE_UAT_EXPORT__()` JSON below when available:

```json
(null — no operator session export yet)
```

---

*Append-only log for real UAT evidence.*
