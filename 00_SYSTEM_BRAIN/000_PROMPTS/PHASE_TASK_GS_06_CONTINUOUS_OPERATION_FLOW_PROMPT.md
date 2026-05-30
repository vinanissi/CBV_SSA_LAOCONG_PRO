# PHASE_TASK_GS_06 — Continuous Operation Flow — Prompt

READ FIRST:

00_SYSTEM_BRAIN/000_RUNTIME_ENTRYPOINT.md

---

**Phase ID:** `PHASE_TASK_GS_06_CONTINUOUS_OPERATION_FLOW`  
**Baseline:** GS_05 cognition + Dashboard launchpad

## Problem

Operator loses flow on task switch, reload, module change, interruption. Context switching fatigue.

## Goal

Continuous Operational Flow Runtime — local-first continuity without AI/websocket.

## Deliverables

- Resume flow card (`flowResume.ts`, `ResumeFlowCard`)
- Working context persistence (`workingContext.ts`)
- Interruption recovery (`taskContinuation.ts`)
- Dependency awareness (`dependencyRuntime.ts`)
- Rhythm queue modes (`taskRhythm.ts`, `RhythmModeBar`)
- Recent context strip (`RecentContextStrip`)
- Next-step completion loop (`NextStepCompletionPrompt`)
- Observation events extended
- `taskGs06Checks.ts` + docs

## Constraints

No AI, no workflow engine, no websocket, no DB migration.
