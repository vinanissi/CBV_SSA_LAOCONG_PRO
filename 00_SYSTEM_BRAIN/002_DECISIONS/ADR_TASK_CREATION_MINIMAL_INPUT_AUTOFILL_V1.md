# ADR: Task Creation Minimal Input / Autofill V1

**Status:** Accepted  
**Phase:** `PHASE_TASK_CREATION_MINIMAL_INPUT_AUTOFILL_V1`  
**Date:** 2026-06-02

---

## Context

Work Inbox create dialog collected flat fields without formal input/autofill split. Operators could be exposed to technical columns. `taskDbCreateTask_` omitted TASK_CODE, DON_VI_ID, TASK_TYPE_ID, and flag defaults.

---

## Decision

1. Add `TASK_CREATION_*_SCHEMA` configs for input, autofill, validation.
2. `buildTaskCreationPayload` merges user input + operator context + documented defaults.
3. Group create UI: Nội dung việc → Phân loại & phân công → collapsed Hệ thống tự điền.
4. Require DON_VI_ID selection when catalog has multiple units.
5. Extend GAS create path with autofill fields (additive record columns).

---

## Consequences

- Reduced operator burden; technical fields generated server-side.
- Pilot unit/task-type catalogs until snapshot/API wiring.
- Browser UAT deferred.

---

## Out of scope

DB migration, AI suggestions, CASE runtime.
