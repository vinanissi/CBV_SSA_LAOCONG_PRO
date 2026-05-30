# PHASE CBV Runtime Entrypoint — AI Handoff

**To:** Next agent (`PHASE_CBV_RUNTIME_ENTRYPOINT_MIGRATION` or any new phase owner)  
**From:** `PHASE_CBV_RUNTIME_ENTRYPOINT_IMPLEMENTATION`  
**Date:** 2026-05-30  
**Report:** `00_SYSTEM_BRAIN/000_REPORTS/PHASE_CBV_RUNTIME_ENTRYPOINT_IMPLEMENTATION_REPORT.md`  
**ADR:** `00_SYSTEM_BRAIN/002_DECISIONS/ADR_RUNTIME_CONTEXT_LOADING.md`  
**Exit:** `GO_WITH_WARNINGS`

---

## What was delivered

1. **Runtime Entrypoint** — `00_SYSTEM_BRAIN/000_RUNTIME_ENTRYPOINT.md` (single READ FIRST for all new prompts).
2. **Repo-root authority** — `900_AUTHORITY/000`, `001`, `010`, `011`.
3. **Ecosystem standard V1** — `000_STANDARDS/CBV_OPERATIONAL_ECOSYSTEM_STANDARD_V1.md`.
4. **Phase system** — `006_PHASES/PHASE_REGISTRY.md`, `PHASE_TEMPLATE.md`, charter for this phase.
5. **ADR** — Runtime context loading architecture accepted.

**Not delivered (by design):** code, schema, AppSheet, runtime state file, prompt migration.

---

## Read first (next agent)

1. `00_SYSTEM_BRAIN/000_RUNTIME_ENTRYPOINT.md`
2. `900_AUTHORITY/010_CURSOR_LOADING_STANDARD.md`
3. `002_DECISIONS/ADR_RUNTIME_CONTEXT_LOADING.md`
4. `000_REPORTS/PHASE_CBV_RUNTIME_ENTRYPOINT_IMPLEMENTATION_REPORT.md`

---

## How to start any new phase

```text
READ FIRST:
00_SYSTEM_BRAIN/000_RUNTIME_ENTRYPOINT.md

PHASE: <NAME>
MODE: <AUDIT|IMPLEMENT|FIX|VERIFY|TEST|DOC-ONLY>
```

1. Copy `006_PHASES/PHASE_TEMPLATE.md` → `006_PHASES/<PHASE_NAME>.md`.
2. Add row to `PHASE_REGISTRY.md`.
3. Execute per `011_CURSOR_EXECUTION_CONTRACT.md`.
4. Close with report + handoff (+ ADR if needed).

---

## Warnings for follow-up

| Item | Action |
|------|--------|
| `003_RUNTIME_STATE.md` missing | Create when deploy flags should be shared across agents |
| Legacy `000_PROMPTS/*` | Batch replace READ FIRST blocks with entrypoint-only header |
| Work Inbox UI phases | Still load `UI_UX/CBV_WORK_INBOX_V3/900_AUTHORITY/` after Tier 3 |

---

## Suggested next phase

**`PHASE_CBV_RUNTIME_ENTRYPOINT_MIGRATION`** (DOC-ONLY)

- Update top N active prompts in `000_PROMPTS/` to entrypoint-only READ FIRST.
- Add `003_RUNTIME_STATE.md` stub with operator-maintained deploy checklist.

---

## Operator actions

None — documentation only. No deploy.

---

*Append-only handoff.*
