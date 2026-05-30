# ADR-001 — CBV_WORK_INBOX_V3 Work Inbox Decision

## Status

**Accepted**

## Date

2026-05-29

## Context

Current workboard runtime has task-centric behavior and uses `/tasks` as the main route.

It also contains cognition grouping and runtime-oriented filters that are useful for internal inspection but too complex for normal operators.

CBV needs an operator-first UI where staff can quickly answer:

1. What do I need to do?
2. Which work item is urgent?
3. Where do I click?

## Decision

CBV_WORK_INBOX_V3 will be **Work Inbox-centric**.

**Default operator route:**

```text
/inbox
```

**Legacy route:**

```text
/tasks
```

`/tasks` may remain as alias during migration.

## Required Product Model

```text
Inbox
  ↓
Task Detail
  ↓
Guided Operation
  ↓
Deep Link to module
```

## Required Inbox Groups

- Need Action
- Waiting
- Follow Up
- Completed

## Consequences

- TASK becomes execution engine behind Inbox
- Inbox becomes operational front door
- Cognition grouping moves to advanced/admin/secondary context
- Focus Mode becomes single-task
- Deep-link modules become mandatory

## Affected Modules

- TASK
- HO_SO
- FINANCE
- DOCS
- INVOICE
- ADMIN

## Non-Goals

- No runtime rewrite in this decision
- No database migration in this decision
- No automation-first behavior

## References

- `00_SYSTEM_BRAIN/UI_UX/CBV_WORK_INBOX_V3/900_AUTHORITY/000_DESIGN_AUTHORITY.md`
- `00_SYSTEM_BRAIN/UI_UX/CBV_WORK_INBOX_V3/100_TARGET_DESIGN/`
- `00_SYSTEM_BRAIN/000_REPORTS/PHASE_UI_CBV_WORK_INBOX_V3_AUTHORITY_PACK_REPORT.md`
