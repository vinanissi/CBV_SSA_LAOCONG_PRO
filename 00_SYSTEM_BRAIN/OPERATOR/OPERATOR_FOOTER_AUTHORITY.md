# Operator Footer — UX Authority

**Status:** LOCKED (PHASE_OPERATOR_FOOTER_DEBUG_HINT_REMOVAL)  
**Scope:** AppShell `RuntimeStatusBar` (operator runtime footer)

---

## Allowed footer content (operator runtime)

- TASK_MAIN / connection status
- Queue metrics (việc, quá hạn, cảnh báo)
- Worker status
- Sync clock / runtime telemetry
- Session label
- Quick actions (+ Tạo việc, …)
- Runtime console drawer (when telemetry available)

---

## Forbidden in operator runtime (default)

- Keyboard shortcut hint text (`J/K queue`, `Enter open`, `R resume`)
- Developer cheat sheets or debug-only guidance in the footer

Keyboard shortcuts may continue to work; only **visible hints** are gated.

---

## Developer exception

When `VITE_CBV_DEV_MODE=true`, footer MAY show shortcut hints via `isOperatorDevMode()` in `RuntimeStatusBar`.

---

## Implementation anchor

- `apps/workboard/src/shared/utils/operatorDevMode.ts`
- `apps/workboard/src/components/runtime/RuntimeStatusBar.tsx`

---

## Regression guard

Do not show shortcut hints in production operator builds without `VITE_CBV_DEV_MODE=true`.
