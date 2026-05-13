# AppSheet vs WebApp — role split

## AppSheet strengths

- Low-latency CRUD on tabular data with built-in offline/mobile behavior.
- Operational slices, forms, and ref views configured without deploying web code.
- Stable fit for **claim / acknowledge / in progress / resolve** style workflows.

Use AppSheet when operators repeat the same updates many times per day and need predictable UX.

## WebApp strengths

- Custom visualization (timeline, Kanban, dense dashboards).
- Heavy read-only aggregations and cross-sheet joins under explicit GAS control.
- Test consoles, health dashboards, and report viewers that must stay **separate from business menus**.

Use WebApp when layout complexity, charting, or developer-only tooling exceeds AppSheet cost/benefit.

## `CHANNEL` semantics

| Value | Meaning |
|-------|---------|
| `APPSHEET` | Primary or only surface is AppSheet (example: unassigned triage queue during pilot). |
| `WEBAPP` | Primary surface is WebApp (timeline, Kanban, health, QA). |
| `BOTH` | Same logical screen: operators may use AppSheet; advanced users use WebApp over the same `DATA_SOURCE_SHEET` and operator columns. |

## Governance

- Human-in-the-loop remains mandatory: contract rows describe **allowed** actions; they do not auto-execute them.
- No AppSheet Bot; no silent automation from this metadata layer alone.
