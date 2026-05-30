# CBV — Design Authority (Ecosystem)

## Status

**Accepted Authority** — ecosystem entry; module packs may add detail but must not contradict this layer.

## Scope

This document binds **all CBV phases** (GAS, Worker, WebApp, AppSheet, governance) unless a ratified ADR explicitly scopes a narrower exception.

## Principles

1. **Operator-first** — UI serves daily work, not developer or schema introspection.
2. **Runtime-first** — live code and deployed config beat stale docs; docs capture decisions and handoff.
3. **Single source of truth per domain** — task state, alerts, identity, and projections each have one canonical runtime (see ADRs in `00_SYSTEM_BRAIN/002_DECISIONS/`).
4. **Append-only history** — reports, handoffs, ADRs, and audit logs are never overwritten in place.
5. **Phased change** — no big-bang rewrites; every material change ships with report + handoff.

## Context loading (mandatory)

All AI/Cursor work **must** start from:

```text
00_SYSTEM_BRAIN/000_RUNTIME_ENTRYPOINT.md
```

Do **not** paste long READ FIRST lists into prompts. The entrypoint defines load order.

## Module authority packs

When work touches a bounded product surface, read the module pack **after** the entrypoint chain:

| Module | Authority folder |
|--------|------------------|
| Work Inbox V3 | `00_SYSTEM_BRAIN/UI_UX/CBV_WORK_INBOX_V3/900_AUTHORITY/` |

Module `000_DESIGN_AUTHORITY.md` wins for **that module’s** UI/IA conflicts; ecosystem rules here win for cross-cutting governance (phasing, reports, ADR, loading).

## AI/Cursor — must not

- Skip `000_RUNTIME_ENTRYPOINT.md` or the loading standard.
- Jump phases without a report for the prior phase.
- Change production task/alert schema without manifest + audit schema alignment.
- Treat mock/demo paths as silent production fallback when `google_sheet_existing_db` is active.
- Remove or overwrite prior reports, handoffs, or ADRs.

## Ecosystem standard

`00_SYSTEM_BRAIN/000_STANDARDS/CBV_OPERATIONAL_ECOSYSTEM_STANDARD_V1.md`

## Related ADR

`00_SYSTEM_BRAIN/002_DECISIONS/ADR_RUNTIME_CONTEXT_LOADING.md`

---

*Append-only governance document.*
