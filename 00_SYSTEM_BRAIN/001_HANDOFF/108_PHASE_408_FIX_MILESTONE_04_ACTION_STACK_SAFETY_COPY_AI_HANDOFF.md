# 108 — Phase 408 — AI handoff

## What broke

Milestone 04 full test failed **`ACTION_STACK_SAFETY`** because the scanner treats **`Hoàn tất`** as a forbidden substring anywhere in stack + cockpit HTML. Safety Vietnamese used **`... hoàn tất`** inside longer phrases (`không tự động hoàn tất`, `không tự hoàn tất`), which is a **substring match**, not a real “complete task” button.

## What we changed

1. **`998U`** — Rewrote operator prompt line and cognition safety `<p>` to use **“kết thúc task”** instead of any **“hoàn tất”** contiguous substring while preserving meaning (no auto-close / no WebApp write).
2. **`WEBAPP_OPERATION_FOCUS_MODE.html`** — Focus subtitle aligned the same way.
3. **`998S`** — Daily card micro-footer: `tự hoàn tất` → `tự kết thúc task` (consistency; M03 UI only).
4. **`998V`** — Same banned list; scan split into **`scannedZones`**: `actionStack`, `cockpit`, `focus`; detail adds **`unsafeHits`**, **`snippetSafe`**, **`scannedLen`**. Still **ERROR** on any hit.

## What you should run

🧪 **Run Milestone 04 Operation Execution Flow Test** → expect Drive **`108_MILESTONE_04_OPERATION_EXECUTION_FLOW_*`**, `ACTION_STACK_SAFETY` OK, `REPORT_ENVELOPE` OK when no other failures.

## Do not

- Do not relax the banned list to “whole words only” unless product explicitly decides that (out of scope for 408).
