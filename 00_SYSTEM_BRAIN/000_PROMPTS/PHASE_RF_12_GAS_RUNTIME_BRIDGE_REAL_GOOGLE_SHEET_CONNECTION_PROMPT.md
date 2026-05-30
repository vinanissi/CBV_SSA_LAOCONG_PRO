# PHASE_RF_12 — GAS Runtime Bridge Real Google Sheet Connection — Prompt

READ FIRST:

00_SYSTEM_BRAIN/000_RUNTIME_ENTRYPOINT.md

---

## Phase metadata

| Field | Value |
|-------|-------|
| **Phase** | PHASE_RF_12_GAS_RUNTIME_BRIDGE_REAL_GOOGLE_SHEET_CONNECTION |
| **Branch** | `phase/from-v2.4.1-TASK-FIN-runtime-freeze` |
| **Baseline** | RF_07–RF_11 completed |

## Goal

Connect CBV Runtime to real Google Sheet through safe GAS API bridge.

## Architecture (mandatory)

```
React FE → Cloudflare Worker → GAS API Adapter → Google Sheet
```

**NOT:** FE → Google Sheet directly

## Scope

1. GAS API layer (`gas-runtime-api/`)
2. Google Sheet contracts (TASKS, TASK_TIMELINE, API_AUDIT_LOG)
3. Worker ↔ GAS integration (`gasAdapter.ts`)
4. Safe read/write runtime
5. Append-only timeline + API audit log
6. Production-safe env handling
7. FE → Worker → GAS flow (FE never knows GAS URL)

## GAS contract

- `doGet(e)` / `doPost(e)` — JSON only
- Response envelope: `{ ok, status, data, warnings, errors, traceId }`
- GET actions: health, tasks, task_detail, finance, hoso, coordination, observation, plugins, search
- POST actions: create_task, update_task, append_timeline only

## Worker env

```
CBV_GAS_API_BASE_URL=
CBV_TASK_WRITE_MODE=gas
```

## Acceptance

PASS when GAS deployable, Worker↔GAS integrated, FE↔Worker↔GAS flow correct, append-only writes, permissions enforced, build PASS, docs committed.

## Verdict criteria

- **GO_WITH_WARNINGS:** finance/hoso write not enabled; auth local stub; GAS deploy manual
- **FAIL:** FE calls Sheet/GAS directly; overwrite timeline; permission bypass; fake success
