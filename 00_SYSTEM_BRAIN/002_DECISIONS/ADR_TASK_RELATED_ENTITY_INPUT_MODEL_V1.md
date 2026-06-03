# ADR: Task Related Entity Input Model V1

**Status:** Accepted  
**Phase:** `PHASE_TASK_RELATED_ENTITY_INPUT_MODEL_V1`  
**Date:** 2026-06-02

---

## Context

Create form exposed **SĐT** and **Biển số** as separate fields; values were appended to DESCRIPTION instead of `RELATED_ENTITY_*` columns.

---

## Decision

1. Introduce `TASK_RELATED_ENTITY_TYPE_CATALOG` and creation input schema.
2. Replace standalone phone/plate inputs with **Đối tượng liên quan** (type + value).
3. Map payload to `relatedEntityType` / `relatedEntityId` → GAS `RELATED_ENTITY_TYPE` / `RELATED_ENTITY_ID`.
4. Display friendly label in task header context and operator detail.
5. Legacy phone/plate and description tags supported for read compatibility.

---

## Consequences

- Correct information model without DB migration.
- Minimal-input/autofill create flow preserved.
- Browser UAT deferred.

---

## Out of scope

CASE runtime, new entity tables, lookup engines.
