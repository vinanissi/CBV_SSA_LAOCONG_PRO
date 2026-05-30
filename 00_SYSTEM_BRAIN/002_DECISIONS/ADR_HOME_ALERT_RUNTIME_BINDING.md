# ADR — HOME_ALERT Runtime Binding

- **ID**: ADR_HOME_ALERT_RUNTIME_BINDING
- **Date**: 2026-05-30
- **Status**: **ACCEPTED** (implementation `PHASE_HOME_ALERT_RUNTIME_BINDING`)
- **Related**: `ADR_TASK_RUNTIME_SOURCE_OF_TRUTH.md`, `PHASE_HOME_ALERT_RUNTIME_BINDING_REPORT.md`

---

## Decision

1. **`HOME_ALERT` = operational alert projection / queue** — not canonical task state.
2. **`TASK_MAIN` remains canonical task runtime** for task mutations (status, complete, assign).
3. **Alert claim/resolve uses HOME_ALERT runtime only** — Worker routes `POST /api/home-alert/:id/claim|resolve` → GAS `claimHomeAlert` / `resolveHomeAlert` → sheet patch on `HOME_ALERT`.
4. **Task complete/status does not resolve HOME_ALERT automatically** unless a future explicit rule/refresh job is added.
5. **`GET /api/today`** reads live `HOME_ALERT` (+ optional TASK_MAIN slice for dashboard tasks) when `google_sheet_existing_db` and GAS Web App are configured.
6. **Production mode must not silently return mock** for `/api/today`.

---

## GAS function mapping (canonical names in repo)

| Operational intent | GAS (05_GAS_RUNTIME) | gas-runtime-api action |
|--------------------|----------------------|-------------------------|
| Claim | `HomeAlert_claimAlert` | `claimHomeAlert` |
| Resolve | `HomeAlert_resolveOperational` | `resolveHomeAlert` |
| Today read | (no prior Web App action) | `getTodaySummary` |

---

## Consequences

**Positive**

- Single operator path for alerts via Worker.
- Aligns with ADR task vs projection split.

**Negative**

- Duplicate claim/resolve logic in gas-runtime-api vs `80_HOME_ALERT_RUNTIME.js` until consolidated.
- HO_SO/Finance sections in today summary still empty.

---

## Alternatives rejected

| Alternative | Verdict |
|-------------|---------|
| Resolve alerts via `POST /api/tasks/:id/complete` | ❌ Wrong source of truth |
| Keep mock `/api/today` in GS_01 mode | ❌ Hides production gap |
| FE calls GAS directly | ❌ Bypasses Worker security |

---

*Append-only ADR.*
