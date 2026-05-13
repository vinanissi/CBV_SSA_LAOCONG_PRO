# Decision 022 — FE Architecture Rebalance (WebApp-led hybrid)

## Decision

Chốt kiến trúc FE vận hành:

- **Sheets/GAS = operational database + runtime**
- **WebApp = operational workspace**
- **AppSheet = lightweight operator shell**

Hybrid nhưng **WebApp-led**.

## Context

- Sheets/GAS hiện là runtime tin cậy: data + validation + audit + report + orchestration.
- AppSheet đã có lợi thế cho thao tác nhanh, mobile CRUD, ổn định, và field operations.
- WebApp cần là nơi sở hữu code/UX cho workspace vận hành nâng cao (dashboard/timeline/kanban/monitoring).

## Rationale

- WebApp gives code ownership and UI control.
- AppSheet gives speed/stability for simple mobile operations.
- Sheets/GAS remains the trusted operational runtime.
- Reduces AppSheet lock-in while keeping practical benefits.

## Risks

- WebApp FE debt increases.
- WebApp must own routing, UI state, loading, permissions, responsiveness.
- Need WebApp route registry and FE test standard before large buildout.
- AppSheet remains useful but must not become the hidden main system.

## Rules / constraints (binding)

- Runtime-first
- Memory-first
- Append-only
- Manual-first → Auto-later
- Audit-first
- Human-in-the-loop
- No destructive migration
- **No AppSheet Bot**
- **No auto assign / auto resolve / auto escalate**
- No ENV-A
- No AI runtime
- No queue intelligence
- **No production claim**

## Consequences

- AppSheet scope is constrained to a lightweight shell; advanced UX moves to WebApp.
- Sheets/GAS remains the system-of-record and test console authority.
- Next recommended phase is **Phase 89 — WebApp Operational Workspace Skeleton**.

