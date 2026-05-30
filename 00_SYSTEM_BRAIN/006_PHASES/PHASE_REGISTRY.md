# CBV Phase Registry

**Purpose:** Index of registered phases and artifact pointers.  
**Maintenance:** Append new rows; do not delete history.  
**Prompt rule:** Load via `000_RUNTIME_ENTRYPOINT.md` — not standalone in prompts.

---

## How to register a phase

1. Copy `PHASE_TEMPLATE.md` → `006_PHASES/<PHASE_NAME>.md`.
2. Fill LOAD / REPORTS / ADR / HANDOFF / MODE / OUTPUT / SUCCESS CRITERIA.
3. Append a row to the table below.
4. Run phase; produce report + handoff per `011_CURSOR_EXECUTION_CONTRACT.md`.

---

## Registry

| Phase ID | Mode | Report | Handoff | ADR | Status |
|----------|------|--------|---------|-----|--------|
| `PHASE_CBV_RUNTIME_ENTRYPOINT_IMPLEMENTATION` | DOC-ONLY | `000_REPORTS/PHASE_CBV_RUNTIME_ENTRYPOINT_IMPLEMENTATION_REPORT.md` | `001_HANDOFF/PHASE_CBV_RUNTIME_ENTRYPOINT_IMPLEMENTATION_HANDOFF.md` | `ADR_RUNTIME_CONTEXT_LOADING.md` | GO_WITH_WARNINGS |
| `PHASE_CBV_RCLA_V1_1_HARDENING` | DOC-ONLY | `000_REPORTS/PHASE_CBV_RCLA_V1_1_HARDENING_REPORT.md` | `001_HANDOFF/PHASE_CBV_RCLA_V1_1_HARDENING_HANDOFF.md` | `ADR_RUNTIME_CONTEXT_LOADING_V1_1_ADDENDUM.md` | GO |
| `PHASE_HOME_ALERT_RUNTIME_BINDING` | IMPLEMENT | `000_REPORTS/PHASE_HOME_ALERT_RUNTIME_BINDING_REPORT.md` | `001_HANDOFF/PHASE_HOME_ALERT_RUNTIME_BINDING_HANDOFF.md` | `ADR_HOME_ALERT_RUNTIME_BINDING.md` | GO_WITH_WARNINGS |
| `PHASE_UI_CBV_WORK_INBOX_V3_AUTHORITY_PACK` | DOC-ONLY | `000_REPORTS/PHASE_UI_CBV_WORK_INBOX_V3_AUTHORITY_PACK_REPORT.md` | — | `ADR_001_CBV_WORK_INBOX_V3_WORK_INBOX_DECISION.md` | GO |

---

## Phase families (reports in folder)

Use `000_REPORTS/` filename prefix search when no row exists yet:

| Family | Prefix | Domain |
|--------|--------|--------|
| Task GS runtime | `PHASE_TASK_GS_` | Google Sheets task operator UI |
| Work Inbox V3 UI | `PHASE_UI_CBV_WORK_INBOX_V3_` | Inbox / Focus / V3 frontend |
| Auth | `PHASE_AUTH_` | User directory / login |
| Dashboard | `PHASE_CBV_DASHBOARD_` | Module launchpad |
| Security / Focus / Home | `PHASE_SECURITY_`, `PHASE_FOCUS_`, `PHASE_HOME_ALERT_` | Runtime fixes |
| RF workspace | `PHASE_RF_` | Modular workspace baseline |

---

## ADR index (cross-cutting)

| ADR | Topic |
|-----|--------|
| `ADR_RUNTIME_CONTEXT_LOADING.md` | Context loading via entrypoint |
| `ADR_RUNTIME_CONTEXT_LOADING_V1_1_ADDENDUM.md` | RCLA v1.1 hardening |
| `ADR_TASK_RUNTIME_SOURCE_OF_TRUTH.md` | TASK_MAIN vs legacy TASKS |
| `ADR_HOME_ALERT_RUNTIME_BINDING.md` | HOME_ALERT projection |
| `ADR_FOCUS_RUNTIME_ACTIONS.md` | Focus mode actions |
| `ADR_001_CBV_WORK_INBOX_V3_WORK_INBOX_DECISION.md` | Work Inbox product |

Full list: `00_SYSTEM_BRAIN/002_DECISIONS/`.

---

## Runtime state

File: `00_SYSTEM_BRAIN/003_RUNTIME_STATE.md` (stub created v1.1; operator-maintained).

Default: **NOT_WIRED** — agents report `RUNTIME_STATE: NOT_WIRED` until operator updates flags.

---

*Append-only registry.*
