# PHASE_RF_12B — Audit and Fix Real DB Connection — Prompt

## Phase metadata

| Field | Value |
|-------|-------|
| **Phase** | PHASE_RF_12B_AUDIT_AND_FIX_REAL_DB_CONNECTION |
| **Branch** | `phase/from-v2.4.1-TASK-FIN-runtime-freeze` |
| **Baseline** | RF_07–RF_12 |

## Goal

Audit and fix full chain: React FE → Worker → GAS → Google Sheet.

## Audit scope

FE env, Worker env, gasAdapter, task read/write, GAS deployment, Sheet bootstrap, create/update/timeline/audit, permissions, error behavior.

## Rules

- No FE → GAS/Sheet direct
- No commit `.dev.vars` or production secrets
- No fake success in GAS runtime mode
- No destructive schema changes

## Verdict

GO / GO_WITH_WARNINGS / FAIL per acceptance criteria in parent prompt.
