# ADR Addendum — CBV-RCLA v1.1 Hardening

- **ID**: ADR_RUNTIME_CONTEXT_LOADING_V1_1_ADDENDUM
- **Date**: 2026-05-30
- **Status**: **ACCEPTED** (implementation `PHASE_CBV_RCLA_V1_1_HARDENING`)
- **Supersedes**: none
- **Extends**: `ADR_RUNTIME_CONTEXT_LOADING.md`
- **Related**: `PHASE_CBV_RCLA_V1_1_HARDENING_REPORT.md`

---

## Context

CBV-RCLA v1.0 (`PHASE_CBV_RUNTIME_ENTRYPOINT_IMPLEMENTATION`) exited **GO_WITH_WARNINGS** due to:

1. Missing `003_RUNTIME_STATE.md`
2. Legacy prompts not using entrypoint-only READ FIRST
3. Dual authority trees without a coordination registry

---

## Decision

**CBV-RCLA v1.1** adds:

1. **Runtime State Stub** — `00_SYSTEM_BRAIN/003_RUNTIME_STATE.md` (operator-maintained; default `NOT_WIRED`).
2. **Module Authority Registry** — `00_SYSTEM_BRAIN/006_PHASES/MODULE_AUTHORITY_REGISTRY.md` (Tier 1–4 coordination).
3. **Legacy Prompt Migration Rule** — all prompts in `000_PROMPTS/` declare entrypoint-only READ FIRST; long manual authority lists removed from headers where migrated.

---

## Rules

| Rule | Detail |
|------|--------|
| **Runtime status** | Cannot be inferred without `003_RUNTIME_STATE.md` update or test/deploy evidence |
| **Module authority** | Conditional; subordinate to ecosystem authority unless ADR overrides |
| **New prompts** | Must use entrypoint-only READ FIRST |
| **Runtime state read** | Mandatory when file exists; report `RUNTIME_STATE: NOT_WIRED` when not maintained |

---

## Consequences

**Positive**

- Closes v1.0 warnings with documented conventions.
- Clear module vs ecosystem load order.

**Negative / residual**

- Runtime state remains `NOT_WIRED` until operator fills table.
- Historical prompt bodies may still mention standards inline (non-header); entrypoint is canonical.

---

*Append-only ADR addendum.*
