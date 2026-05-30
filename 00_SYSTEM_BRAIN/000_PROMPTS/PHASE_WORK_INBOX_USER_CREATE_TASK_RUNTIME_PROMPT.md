# PHASE_WORK_INBOX_USER_CREATE_TASK_RUNTIME — Prompt (append-only)

**Phase:** PHASE_WORK_INBOX_USER_CREATE_TASK_RUNTIME  
**Mission:** Enable USER role to create own operational tasks during Work Inbox pilot — no admin power, no layout change, RCLA-compliant.

## Constraints

- WorkInboxRuntimeContextProvider / Runtime Context Registry
- Worker → GAS path only (no FE → GAS)
- Network hygiene: selective refresh, no full snapshot by default

## USER permissions

Allowed: CREATE_OWN_TASK, own-task view/edit/basic ops  
Denied: DELETE, VIEW_ALL, ASSIGN_OTHER, cross-team handoff, audit/system field edit

## UX

`+ Việc` / `+ Tạo việc` opens simple dialog: title (required), description, priority, due date, phone, plate.

## Runtime

On success: timeline `TASK_CREATED_BY_USER`, audit `ACTION_USER_CREATE_TASK`, local queue insert, open Focus Runtime, toast.

## Tests

`runWorkInboxUserCreateTaskRuntimeChecks()` — 14 checks
