# PHASE_RF_12 — GAS Runtime Bridge Real Google Sheet Connection — Report

## Phase metadata

| Field | Value |
|-------|-------|
| **Phase** | PHASE_RF_12_GAS_RUNTIME_BRIDGE_REAL_GOOGLE_SHEET_CONNECTION |
| **Branch** | `phase/from-v2.4.1-TASK-FIN-runtime-freeze` |
| **Date** | 2026-05-25 |

---

## Summary

Implemented standalone `gas-runtime-api/` Apps Script Web App bridge with JSON envelope contract, non-destructive sheet bootstrap (`TASKS`, `TASK_TIMELINE`, `API_AUDIT_LOG`), append-only timeline and audit log, and full Worker adapter (`gasHealth`, `gasGetTasks`, `gasGetTaskDetail`, `gasCreateTask`, `gasUpdateTask`). Worker reads/writes route through GAS when `CBV_GAS_API_BASE_URL` is set and `CBV_TASK_WRITE_MODE=gas`; otherwise falls back to RF_11 local projection safely.

---

## Architecture

```
React FE (Worker API only)
    ↓
Cloudflare Worker (permission + validation + traceId)
    ↓
GAS Runtime API (gas-runtime-api/)
    ↓
Google Sheet (TASKS / TASK_TIMELINE / API_AUDIT_LOG)
```

FE does **not** call GAS or Sheet directly.

---

## GAS API

| File | Purpose |
|------|---------|
| `Code.js` | `doGet` / `doPost` entry |
| `Config.js` | Sheet names + headers |
| `Utils.js` | Envelope, bootstrap, validation |
| `Tasks.js` | Read/write tasks |
| `Timeline.js` | Append-only timeline + audit |
| `Permissions.js` | Defense-in-depth role checks |
| `Finance.js` / `HoSo.js` | Read stubs |

Deploy: Web App, Execute as Me, Anyone with link → copy URL to `.dev.vars`.

---

## Worker changes

| Module | Change |
|--------|--------|
| `gasAdapter.ts` | Full GAS contract client |
| `taskWriteAdapter.ts` | `CBV_TASK_WRITE_MODE=gas` → GAS writes |
| `tasks.ts` | GAS read when configured, mock fallback |
| `taskWrite.ts` | GAS task lookup for update permissions |
| `workboard.ts` | RF-12 health + GAS probe |
| `.dev.vars.example` | GAS URL + write mode docs |

---

## Sheets (non-destructive bootstrap)

| Sheet | Headers |
|-------|---------|
| TASKS | task_id, title, description, status, priority, assignee, due_date, related_hoso_id, related_finance_id, created_at, updated_at, created_by, updated_by |
| TASK_TIMELINE | event_id, task_id, actor, action, before_json, after_json, note, trace_id, created_at |
| API_AUDIT_LOG | log_id, trace_id, actor, action, status, source, created_at, detail_json |

Missing columns appended only — no destructive migration.

---

## Permission matrix (Worker + GAS)

| Role | Create | Update |
|------|--------|--------|
| ADMIN | Yes | Yes |
| MANAGER | Yes | Yes / assign |
| STAFF | No | Own tasks only |
| FINANCE | No | Finance-related only |
| HO_SO | No | HoSo-related only |
| VIEW_ONLY | 403 | 403 |

---

## Build

| Target | Result |
|--------|--------|
| Worker typecheck | PASS |
| FE typecheck + build | PASS |

---

## Runtime write mode

| Mode | When |
|------|------|
| **LOCAL** | `CBV_TASK_WRITE_MODE=local` (default dev) |
| **GAS** | `CBV_TASK_WRITE_MODE=gas` + `CBV_GAS_API_BASE_URL` |
| **LOCKED** | unset / `locked` |

Current dev default: **LOCAL ENABLED**. GAS path **ready** pending deploy URL.

---

## Verdict

**GO_WITH_WARNINGS**

- GAS code complete; deploy requires manual `clasp push` + Web App deployment
- Finance/HoSo write not enabled (read stubs only)
- Auth remains Worker local stub (`x-cbv-role`)
- Task runtime GAS bridge active when URL configured

---

## Next phase

**PHASE_RF_13_OPERATOR_WORKFLOW_ACCELERATION** — keyboard-first workflows, command palette, fast search.
