# PHASE G — RUNTIME SESSION & GUIDANCE LAYER (execution prompt)

**Archived at:** 2026-05-11T23:02:00+07:00  
**Repo:** `D:\Workspace\projects\CBV_SSA_LAOCONG_PRO`

## Phase intent

Upgrade CBV Test Console Runtime from a “manual runtime console” into a guided operational runtime with:

- Runtime Session Layer
- Runtime State Machine
- Runtime Timeline
- Guidance Layer
- Recovery Runtime
- Runtime Lock
- Operational Memory continuity

This phase must remain:

- memory-first
- runtime-first
- append-only
- production-safe
- manual-first
- guided-operation-first

Do NOT claim production readiness unless live runtime verification passes on deployed GAS WebApp runtime.

## CBV_AI_WORK_BRAIN — SHORT EXECUTION CONTEXT

### CORE RULES

- Memory-first, runtime-first, append-only.
- Khong chi code — phai luu prompt, report, decision, trace, handoff.
- Khong overwrite/xoa audit history.
- Khong fake DONE/PRODUCTION READY.

### REQUIRED FLOW

1. Read existing repo/runtime.
2. Save prompt archive: `00_SYSTEM_BRAIN/000_PROMPTS`
3. Analyze impact/boundaries.
4. Implement.
5. Self-test + runtime verification.
6. Generate append-only report: `00_SYSTEM_BRAIN/000_REPORTS`
7. Git add/commit/push/tag neu can.
8. Create AI handoff summary.

### REQUIRED OUTPUT

- FILES CREATED
- FILES UPDATED
- TEST RESULT
- WARNINGS
- NEXT STEP
- PRODUCTION READINESS
- AI HANDOFF SUMMARY

## TEST STANDARD

Moi runtime/domain lon phai co:

- CBV Test Console
- Test Report
- AI Handoff Dialog
- append-only logs
- self-test
- runtime verification

## ARCHITECTURE PHILOSOPHY

- manual-first
- guided-operation-first
- AI-assisted operation
- production-safe
- auditability
- incremental automation

Khong:

- silent refactor
- uncontrolled mutation
- fake abstraction
- blackbox runtime

## GOAL

Repo phai nho:

- code
- reasoning
- decisions
- reports
- runtime evolution
- AI collaboration history

CBV_AI_WORK_BRAIN = operational memory + engineering runtime brain.

## EXISTING BASELINE TO READ FIRST

Read existing runtime before implementation:

### WebApp Runtime

- `341_CBV_TEST_CONSOLE_WEBAPP_ENTRY.js`
- `342_CBV_TEST_CONSOLE_WEBAPP_API.js`
- `343_CBV_TEST_CONSOLE_WEBAPP_MODEL.js`
- `344_CBV_TEST_CONSOLE_WEBAPP_SELFTEST.js`
- `345_CBV_TEST_CONSOLE_WEBAPP_FE.html`

### Existing Runtime Core

- `323_CBV_TEST_CONSOLE_RUNTIME.js`
- `327_CBV_TEST_CONSOLE_VERIFICATION_RUNTIME.js`
- `318_CBV_TEST_CONSOLE_REPORT_CONTRACT.js`
- `320_CBV_TEST_CONSOLE_DRIVE_EXPORTER.js`
- `321_CBV_TEST_CONSOLE_REPORT_SHEET.js`
- `322_CBV_TEST_CONSOLE_AI_HANDOFF.js`

### Existing WebApp Routing

- `200_MAIN_CONTROL_WEBAPP.js`

### Existing Reports/Prompts

- Phase `025` -> `029`
- Latest Phase F implementation report.

Confirm mirrored parity rules for:

- `apps-script/main-control/src`
- `apps-script/production-core/src`

## PHASE GOAL

Transform the runtime into:

```text
Operational Runtime
-> Guided Operational Runtime
```

Implementation must keep Phase F WebApp as the primary UI and extend it with guided session/state/timeline/recovery behavior without automatic continuous execution.

