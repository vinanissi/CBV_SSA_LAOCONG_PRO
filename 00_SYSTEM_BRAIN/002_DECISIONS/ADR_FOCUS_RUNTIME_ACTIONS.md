# ADR — Focus Runtime Actions

- **ID**: ADR_FOCUS_RUNTIME_ACTIONS
- **Date**: 2026-05-30
- **Status**: **ACCEPTED** (implementation phase `PHASE_FOCUS_RUNTIME_FIX`)
- **Related**: `PHASE_FOCUS_RUNTIME_FIX_REPORT.md`, `PHASE_SECURITY_RUNTIME_FIX_REPORT.md`, `ADR_TASK_RUNTIME_SOURCE_OF_TRUTH.md`

---

## Context

Focus Mode V3 and Focus Runtime exposed operator CTAs without calling secured Worker task APIs. List/quick actions were already wired via `useInlineExecution`; Focus layer was stubbed.

---

## Decisions

### 1. Single wiring entry: `useFocusTaskActions`

All Focus mutations originate in `TasksPage`, passed through `WorkInboxGroupsPanel` to Focus Runtime / Focus Mode V3. No duplicate API clients in child components.

### 2. Hoàn thành → `api.completeTask`

Same runtime path as list `handleComplete`. Snapshot refresh after success.

### 3. Tạm dừng → `api.updateTaskStatus('WAITING')`

Note includes focus pause semantics. Appends timeline via GAS `taskDbUpdateTaskStatus_` / `TASK_UPDATE_LOG`.

### 4. Chuyển giao (Focus) → status-only handoff

**No assignee picker in Focus UI** → do **not** call `POST /api/tasks/:id/assign` from Focus.

Use `runHandoff` with target:

- `status: WAITING`
- `pendingNote: Chờ chuyển xử lý`

Operator toast must state **owner/assignee unchanged**. True assignment remains in detail panel (`TaskUpdateForm` / assign flow).

### 5. Bắt đầu xử lý → conditional accept

If task status is `NEW` / `OPEN` / `TODO`:

1. `POST …/status` → `IN_PROGRESS`
2. Open task detail

Otherwise primary label **Mở chi tiết** — open only, no status change.

### 6. Sidebar routes

| Legacy | Canonical |
|--------|-----------|
| `/observe` | `/observation` |
| `/config` | `/plugins` |

---

## Consequences

**Positive**

- Focus and list share secured Worker paths.
- No false “assigned to X” messaging from Focus.

**Negative**

- Operators cannot assign from Focus until assignee UI exists.
- Some right-panel actions still stubbed (non-critical path).

---

## Alternatives considered

| Alternative | Verdict |
|-------------|---------|
| Silent `POST /assign` with placeholder assignee | ❌ Misleading / security risk |
| Keep Phase E disabled buttons | ❌ Blocks operator workflow |
| Direct GAS from FE | ❌ Bypasses Worker security |

---

*Append-only ADR.*
