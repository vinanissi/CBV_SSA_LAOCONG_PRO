# CBV_WORK_INBOX_V3 — Design Authority Pack

## Purpose

This folder is the design authority for **CBV_WORK_INBOX_V3**.

It separates:

- `000_CURRENT_RUNTIME/` — **As-Is** implementation baseline
- `100_TARGET_DESIGN/` — **To-Be** Work Inbox target design
- `200_IMPLEMENTATION/` — implementation roadmap and migration plan
- `900_AUTHORITY/` — rules that bind AI/Cursor/FE developers

## Source of Truth Priority

When files conflict, follow this order:

1. `900_AUTHORITY/000_DESIGN_AUTHORITY.md`
2. `100_TARGET_DESIGN/`
3. `200_IMPLEMENTATION/`
4. `000_CURRENT_RUNTIME/`
5. Archived/older reports (`000_REPORTS/*`, `_archive_*`, legacy root copies)

## Critical Decision

CBV_WORK_INBOX_V3 is **Work Inbox-centric**, not Task-centric.

**Default target route:**

```text
/inbox
```

**Legacy/current route:**

```text
/tasks
```

`/tasks` may remain as compatibility alias, but must **not** be treated as the final operator entry.

## Mandatory UX Rule

Operator must answer within **2 seconds**:

1. What do I need to do?
2. Which item is most urgent?
3. Where do I click?

## Forbidden Default Operator UI

- Cognition grouping
- Runtime internals
- Technical SLA internals
- More than 5 primary tabs/filters
- Admin/test/debug panels

## Read order (AI / FE)

See `900_AUTHORITY/001_AUTHORITY_INDEX.md`

## Next Implementation Phase

After this authority pack is complete, continue with:

```text
PHASE_UI_CBV_WORK_INBOX_V3_FRONTEND_IMPLEMENTATION
```

Start: `200_IMPLEMENTATION/017_NEXT_PHASE_PROMPT_FRONTEND_IMPLEMENTATION.md` (Phase A only).

## Legacy paths (not deleted)

| Path | Note |
|------|------|
| Root `001`–`013`, `wireframes/` | Legacy copies — canonical target: `100_TARGET_DESIGN/` |
| `AUTHORITY/` | Legacy v1 governance — superseded by `900_AUTHORITY/` |
| `_archive_runtime_baseline_20260529/` | Historical doc snapshot |
| `LEGACY_ROOT_FILES.md` | Index of root duplicates |

## Reports

| Report | Role |
|--------|------|
| `CBV_WORK_INBOX_V3_DESIGN_CONTRACT_PACK_REPORT.md` | As-Is / runtime baseline (history) |
| `PHASE_UI_CBV_WORK_INBOX_V3_DESIGN_CONTRACT_REPORT.md` | Target design creation (history) |
| `PHASE_UI_CBV_WORK_INBOX_V3_AUTHORITY_PACK_REPORT.md` | Authority pack (this phase) |

## ADR

`00_SYSTEM_BRAIN/002_DECISIONS/ADR_001_CBV_WORK_INBOX_V3_WORK_INBOX_DECISION.md`
