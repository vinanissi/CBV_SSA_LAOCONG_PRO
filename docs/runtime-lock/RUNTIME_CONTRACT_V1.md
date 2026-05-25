# CBV Operational Runtime Contract v1

**Lock tag (recommended):** `v2.4.1-RF-RUNTIME-LOCK-V1`  
**Branch baseline:** `phase/from-v2.4.1-TASK-FIN-runtime-freeze`  
**Phases frozen:** RF_02 → RF_06

## Purpose

This document freezes **CBV Operational Workspace Runtime v1** — read-first, manual-first, production-safe operational layer on Google Sheets + Apps Script + AppSheet.

## Runtime layers (frozen)

| Layer | Phase | Responsibility |
|-------|-------|----------------|
| Workboard Core | RF_02 | Task list, detail, timeline, search, notifications, files |
| Operational Coordination | RF_03 | Queue, overdue, workload, manager board, assignment (EXECUTION_LOCKED) |
| Observation Runtime | RF_04 | Health, projections, queues, sync stub, audit, alerts |
| Plugin Runtime | RF_05 | Registry, contract, bindings |
| Finance/HO_SO Activation | RF_06 | ACTIVE_READONLY read projections |

## Semantics (mandatory)

### Read-first
- WebApp workspace routes use `READ_FIRST` mode.
- Projections read from sheets/adapters; no fake record counts.
- Empty states are valid; no synthetic production data.

### Manual-first / human-in-loop
- Operators confirm actions outside WebApp or via locked UI affordances.
- No auto-assign, auto-resolve, auto-escalate, auto-confirm, auto-approve from WebApp.

### ACTIVE_READONLY (plugins)
- FINANCE and HO_SO plugins: read projections, search, alerts, timeline read.
- Write capabilities remain **NOT_CONFIGURED** or **EXECUTION_LOCKED**.

### EXECUTION_LOCKED
- Assignment (RF_03), payment confirm (FINANCE), hồ sơ approval (HO_SO).
- Quick actions may display but must not auto-execute or write TASK_MAIN / FINANCE_TRANSACTION / HO_SO_MASTER from WebApp in v1 lock.

## Out of scope (v1 lock)

- Realtime sync engine
- Plugin marketplace
- AI auto-action
- Schema migration
- Payment / approval automation from WebApp

## Change policy after lock

Allowed without new phase:
- Bug fixes (route, permission, wording, empty state)
- Documentation / test evidence

Requires new RF phase:
- New runtime domains
- Write bridges from WebApp
- Schema changes
- Breaking DTO/route renames
