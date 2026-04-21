# CBV System — Event-Driven Architecture (Design & Evolution)

**Status:** Design reference. **Companion:** operational detail & repo audit in [`EVENT_DRIVEN_MIGRATION_PLAN.md`](./EVENT_DRIVEN_MIGRATION_PLAN.md).

This document describes the design and evolution of a modular business operating system (**CBV System**) transitioning from a **module-driven** architecture to an **event-driven core** architecture.

---

## 1. Overview

**Primary goal:** Build a system where **business decisions are centralized in a Core Engine**, while modules (**TASK**, **FINANCE**, **HO_SO**) act primarily as **data + UI layers** (and, during migration, persistence adapters).

**This transition enables:**

- Scalability across multiple organizations (HTX / `DON_VI`)
- Config-driven behavior (RULE-based)
- Productization (deployable system instances)
- Reduced dependency on manual logic and one-off developer changes

### Next steps (tóm tắt)

1. Giữ **hybrid** an toàn: module ghi DB + emit; core xử lý rule (chủ yếu `SEND_ALERT`) — xem [`EVENT_DRIVEN_MIGRATION_PLAN.md`](./EVENT_DRIVEN_MIGRATION_PLAN.md) mục **Next steps**.
2. Chuẩn bị **REQUEST events** (một luồng pilot) trước khi core trở thành nguồn quyết định duy nhất.
3. Tránh nhân đôi transition: thống nhất validator vs `RULE_DEF` (overlay hoặc một manifest).

---

## 2. Key Concepts

### 2.1 Module-driven vs Event-driven

| Concept | Description |
|---------|-------------|
| **Module-driven** | Each module contains its own business logic and decisions |
| **Event-driven** | Modules emit events; Core Engine applies rules and decides responses |

### 2.2 Event-driven layers

| Layer | Role |
|-------|------|
| **Event** | Signal that something happened |
| **Rule** | Condition evaluated against event + payload |
| **Action** | System response (alert, status change, create entity, …) |

### 2.3 Core principles (target)

- **Modules do not decide** (target end-state)
- **Core decides** policy that is expressed as **rules + actions**
- **Rules replace duplicated hardcoded logic** where safe and proven
- **Events are the communication contract** between UI/modules and core

### 2.4 Types of events

**State events** (current codebase emits these today)

| EVENT_TYPE (examples) | Notes |
|-------------------------|--------|
| `TASK_STATUS_CHANGED` | After status change via service or sheet sync |
| `FINANCE_STATUS_CHANGED` | After finance status change |
| `HO_SO_STATUS_CHANGED` | After hồ sơ status change |

**Request events** (critical for future — *not yet first-class in GAS*)

| Intent | Example name |
|--------|----------------|
| User/module asks to complete task | `TASK_COMPLETE_REQUESTED` |
| User asks to confirm finance | `FINANCE_CONFIRM_REQUESTED` |
| User asks to change HO_SO status | `HO_SO_STATUS_CHANGE_REQUESTED` |

These support the target flow: **intent → core → rule → action → DB**.

### 2.5 System modes (`CBV_CORE_EVENT_MODE`)

| Mode | Intent | Implementation note (repo) |
|------|--------|----------------------------|
| `off` | No queue rows | `createCoreEvent` returns without append |
| `shadow` | Emit / process without core being “authoritative” | Queue rows are still written; **core observes**; see migration plan for nuance |
| `on` | Core controls behavior | Target: core gates mutations; **not fully realized** until REQUEST flow + real actions |

---

## 3. System architecture / model

### 3.1 Target architecture

```text
MODULE → EVENT → CORE → RULE → ACTION
```

### 3.2 Current architecture (hybrid)

```text
MODULE → WRITE DB → EMIT EVENT → CORE (post-processing)
```

**Core observes but does not control** mutations today — see [`EVENT_DRIVEN_MIGRATION_PLAN.md`](./EVENT_DRIVEN_MIGRATION_PLAN.md) §10.6.

### 3.3 Core components (Google Sheets + GAS)

| Component | Role | Primary artifact |
|-----------|------|------------------|
| **Event queue** | Stores events | Sheet `EVENT_QUEUE` |
| **Rule engine** | Evaluates `CONDITION_JSON` | `04_CORE_RULE_ENGINE.js`, sheet `RULE_DEF` |
| **Event processor** | Runs rules, executes actions | `04_CORE_EVENT_PROCESSOR.js` (`processCoreEvent`) |
| **Action handler** | Side effects | `executeCoreAction_` — today **`SEND_ALERT`** real; **`NOOP`**; others stub |

### 3.4 Module responsibilities (target)

| Module | Responsibility |
|--------|----------------|
| **TASK** | UI + data + emit events |
| **FINANCE** | UI + data + emit events |
| **HO_SO** | UI + data + emit events |

### 3.5 Core responsibilities (target)

- Interpret events
- Apply rules
- Execute actions
- Control system behavior (when mode `on` + REQUEST pipeline exists)

---

## 4. Processes / workflows

### 4.1 Current flow (module-driven)

```text
User Action → Webhook → Service (module) → Validation + DB write → Emit event → Core logs / post-process
```

### 4.2 Target flow (event-driven)

```text
User Action → Webhook → Emit REQUEST EVENT → Core Engine
  → Evaluate rules → Execute action → DB update
```

### 4.3 Example: task completion

| Phase | Flow |
|-------|------|
| **Before** | `taskComplete()` → validate → update status → emit `TASK_STATUS_CHANGED` |
| **After (target)** | `taskComplete()` → emit `TASK_COMPLETE_REQUESTED` → Core evaluates → e.g. `UPDATE_STATUS` / other actions |

### 4.4 Migration phases (conceptual)

| Phase | Description |
|-------|-------------|
| **1 — Event logging** | Emit events; core observes |
| **2 — Parallel validation** | Core validates alongside modules |
| **3 — Core control** | Remove decision logic from modules; core authoritative |

Aligned with phased rollout in [`EVENT_DRIVEN_MIGRATION_PLAN.md`](./EVENT_DRIVEN_MIGRATION_PLAN.md).

---

## 5. Prompts / commands / tools (AI & process)

| Artifact | Use |
|----------|-----|
| **Audit prompt** | Trace flows, find logic in modules vs core, event coverage |
| **Refactor prompt** | Drive real code changes with compatibility (AppSheet, webhooks) |
| **System report prompt** | Maturity: event-driven vs hybrid, gaps, actions |

---

## 6. Best practices

### 6.1 Architecture rules (target)

- Modules → **UI + data + emit** (minimal branching)
- Core → **decision engine** via rules
- Avoid **duplicated** transition rules in both validators and `RULE_DEF` without a documented single source or overlay policy

### 6.2 Event design

- Prefer **semantic, domain-based** event names
- Avoid purely technical names where they obscure business meaning

### 6.3 Migration strategy

- Do **not** rewrite the entire system at once
- Move logic **gradually**; use **shadow** / safe actions first
- **See hybrid trap** (below)

### 6.4 Avoid hybrid trap

| Risk | Mitigation |
|------|------------|
| Module decides **and** core fires side effects for the same fact | Idempotency, clear ownership, feature flags |

**Good end-state:** core-controlled behavior for policy that you intentionally migrate.

### 6.5 Single source of truth

- Align **module validators** with **rule conditions** or document **validator = source, rule = overlay** for alerts only

### 6.6 Action completeness

Core should eventually support real actions where needed, e.g.:

- `UPDATE_STATUS`
- `CREATE_TASK` / `CREATE_FINANCE`
- `SEND_ALERT`

*(Current GAS: `SEND_ALERT` + `NOOP` implemented; `CREATE_*` / `UPDATE_STATUS` in `executeCoreAction_` still stubs — see migration plan.)*

---

## 7. Reusable templates

### 7.1 Event structure (conceptual)

```json
{
  "EVENT_TYPE": "TASK_STATUS_CHANGED",
  "REF_ID": "task_id",
  "SOURCE_MODULE": "TASK",
  "PAYLOAD": {}
}
```

### 7.2 Rule structure (conceptual)

Align with sheet columns `CONDITION_JSON` / `ACTIONS_JSON` and `04_CORE_RULE_ENGINE.js` DSL.

```json
{
  "EVENT_TYPE": "FINANCE_STATUS_CHANGED",
  "CONDITION": { "all": [{ "field": "payload.newStatus", "op": "eq", "value": "CONFIRMED" }] },
  "ACTIONS": [{ "type": "SEND_ALERT", "params": { "message": "FIN_CONFIRMED" } }]
}
```

### 7.3 Core functions (repo names)

| Concept | GAS entry points |
|---------|------------------|
| Create event | `createCoreEvent` / `cbvTryEmitCoreEvent_` (`04_CORE_EVENT_QUEUE.js`) |
| Process event | `processCoreEvent` (`04_CORE_EVENT_PROCESSOR.js`) |
| Execute action | `executeCoreAction_` |

### 7.4 Refactor rule (intent)

| Before | After (target) |
|--------|----------------|
| Module → heavy if/else | Module → emit event; Core → rule → action |

---

## 8. Final structured summary

The system is a **business operating platform** evolving toward an event-driven architecture.

| | |
|--|--|
| **Current state** | Modules control most logic; core processes events **after** writes; event system exists but is **not** fully authoritative |
| **Target state** | Modules emit events (incl. REQUEST events); Core evaluates rules and executes actions; controls behavior in `on` mode |
| **Key transition** | From **Module → decision → write → event** toward **Module → event → Core → decision → action** |
| **Critical next step** | Introduce **REQUEST** events and shift **decision-making** into Core in a controlled, phased way |

**Principle:** *Modules report. Core decides.* (End-state; migration preserves safety.)

---

## 9. Reuse

This document can serve as:

- Architecture guideline
- Refactor blueprint
- AI prompt base
- System design reference

**Implementation truth** (files, triggers, modes, gaps): [`EVENT_DRIVEN_MIGRATION_PLAN.md`](./EVENT_DRIVEN_MIGRATION_PLAN.md).
